console.log("🔥 SERVER STARTED: KUVote System 🔥");
require("dotenv").config();

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const app = express();

// อนุญาต CORS (ให้ Frontend ยิงเข้ามาได้)
app.use(cors());
app.use(express.json());

// =======================
// MongoDB Connection
// =======================
const client = new MongoClient(process.env.MONGO_URI);
let db;

// ✅ Ensure TTL index (ลบ User ที่ไม่ยืนยันตัวตนภายใน 10 นาที)
async function ensureTTLIndex() {
  try {
    const collection = db.collection("users");
    const indexes = await collection.indexes();

    const ttlIndex = indexes.find(
      (i) =>
        i.name === "createdAt_1" &&
        i.partialFilterExpression?.isVerified === false
    );

    if (ttlIndex) {
      if (ttlIndex.expireAfterSeconds !== 600) {
        await collection.dropIndex("createdAt_1");
        console.log("🗑 Dropped old TTL index");
      } else {
        console.log("✅ TTL index status: OK");
        return;
      }
    }

    await collection.createIndex(
      { createdAt: 1 },
      {
        expireAfterSeconds: 600,
        partialFilterExpression: { isVerified: false },
      }
    );
    console.log("⏳ TTL index created (10 minutes expire)");
  } catch (error) {
    console.error("⚠️ TTL Index Error:", error.message);
  }
}

async function connectDB() {
  try {
    await client.connect();
    db = client.db("vote");
    console.log("✅ MongoDB Connected Successfully");
    await ensureTTLIndex();
  } catch (err) {
    console.error("❌ MongoDB Connection FAILED:", err.message);
    process.exit(1); // ปิด Server ถ้าต่อ DB ไม่ได้
  }
}
connectDB();

// =======================
// Mail Configuration (FIXED for Render)
// =======================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // ✅ ระบุ Host ตรงๆ
  port: 587,              // ✅ ใช้ Port 587 (TLS) มาตรฐานสำหรับ Cloud
  secure: false,          // ✅ ต้องเป็น false สำหรับ port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // ต้องเป็น App Password 16 หลัก
  },
  tls: {
    ciphers: 'SSLv3'      // ✅ ช่วยแก้ปัญหา Handshake ในบาง Server
  }
});

// 🔥 [DEBUG] ตรวจสอบการเชื่อมต่อ Gmail ทันทีที่เริ่ม Server
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ [MAIL ERROR] ไม่สามารถเชื่อมต่อกับ Gmail ได้:", error.message);
  } else {
    console.log("✅ [MAIL READY] ระบบส่งอีเมลพร้อมใช้งาน (Port 587)");
  }
});

// =======================
// Routes
// =======================

// ✅ เพิ่ม Route นี้เพื่อให้ Render Health Check ผ่าน
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.send("🚀 KUVote API Server is Running!");
});

// =======================
// 1. Register Users (With Rollback System)
// =======================
app.post("/register/users", async (req, res) => {
  let insertedId = null; // เก็บ ID ไว้ลบถ้ายิงเมลไม่ผ่าน

  try {
    const { email, faculty, loginPassword, votePin } = req.body;
    
    // 1. เช็ค User ซ้ำ
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
        if (!existingUser.isVerified) {
             return res.status(409).json({ message: "อีเมลนี้ลงทะเบียนแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน" });
        }
        return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(loginPassword, 10);
    const hashedPin = await bcrypt.hash(votePin, 10);

    // 3. Insert ลง DB
    const result = await db.collection("users").insertOne({
      email,
      faculty,
      loginPassword: hashedPassword,
      votePin: hashedPin,
      isVerified: false,
      hasVoted: false,
      createdAt: new Date(),
    });

    insertedId = result.insertedId; // ✅ จำ ID ไว้
    console.log(`✅ [DB] User inserted: ${email}`);

    // 4. สร้าง Link (ตัด Slash ท้าย URL ออกกันเหนียว)
    const verifyToken = jwt.sign(
      { userId: insertedId },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "http://localhost:3000";
    const verifyLink = `${frontendUrl}/verify-email/${verifyToken}`;

    // 5. HTML Email Template
    const emailHtml = `
      <div style="font-family: sans-serif; background-color: #f4f4f5; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background-color: #10B981; padding: 20px; text-align: center; color: white;">
            <h1>KU Vote System</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
            <h2>ยืนยันการลงทะเบียน</h2>
            <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ (ลิงก์หมดอายุใน 10 นาที)</p>
            <a href="${verifyLink}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">ยืนยันอีเมลทันที</a>
          </div>
        </div>
      </div>
    `;

    // 6. ส่งเมล
    await transporter.sendMail({
      from: `"KUVote System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "ยืนยันอีเมลของคุณ - KUVote",
      html: emailHtml,
    });

    console.log("✅ [MAIL] Email sent successfully!");
    res.status(201).json({ message: "สมัครสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน" });

  } catch (err) {
    console.error("❌ [REGISTER ERROR]:", err.message);

    // 🔥 ROLLBACK SYSTEM: ลบ User ทิ้งถ้าส่งเมลไม่ผ่าน
    if (insertedId) {
        console.log("🧹 [ROLLBACK] Deleting user due to error...");
        await db.collection("users").deleteOne({ _id: insertedId });
    }

    res.status(500).json({ 
        error: "การสมัครล้มเหลว (ระบบอีเมลขัดข้อง)",
        details: err.message 
    });
  }
});

// =======================
// 2. Verify Email
// =======================
app.get("/verify-email/:token", async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(decoded.userId), isVerified: false },
      { $set: { isVerified: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(400).send("<h1>❌ ไม่สำเร็จ</h1><p>บัญชีนี้ยืนยันไปแล้ว หรือลิงก์หมดอายุ</p>");
    }

    res.send("<h1>🎉 ยืนยันสำเร็จ!</h1><p>คุณสามารถกลับไปหน้า Login ได้เลย</p>");
  } catch (err) {
    res.status(400).send("<h1>❌ ลิงก์ไม่ถูกต้อง หรือหมดอายุ</h1>");
  }
});

// =======================
// 3. Login
// =======================
app.post("/login", async (req, res) => {
  try {
    let { email, loginPassword } = req.body;
    email = email?.trim().toLowerCase();

    const user = await db.collection("users").findOne({ email });

    if (!user) return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ" });
    }

    const isPasswordCorrect = await bcrypt.compare(loginPassword, user.loginPassword);
    if (!isPasswordCorrect) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        email: user.email,
        faculty: user.faculty,
        hasVoted: user.hasVoted,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 4. Candidates & Voting
// =======================
async function getNextCandidateId() {
  const result = await db.collection("counters").findOneAndUpdate(
    { _id: "candidateId" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return result.value.seq;
}

app.post("/candidate", async (req, res) => {
  try {
    const { name, faculty, position, policies } = req.body;
    const candidateId = await getNextCandidateId();
    await db.collection("candidates").insertOne({
      candidateId,
      name,
      faculty,
      position,
      policies: policies || [],
      votes: 0,
      createdAt: new Date(),
    });
    res.status(201).json({ message: "เพิ่มผู้สมัครสำเร็จ", candidateId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/candidates", async (req, res) => {
  try {
    const candidates = await db.collection("candidates").find({}).sort({ votes: -1 }).toArray();
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/vote", async (req, res) => {
  try {
    const { email, votePin, candidateId } = req.body;
    
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    if (user.hasVoted) return res.status(403).json({ message: "คุณใช้สิทธิ์ไปแล้ว" });

    const isPinCorrect = await bcrypt.compare(votePin, user.votePin);
    if (!isPinCorrect) return res.status(401).json({ message: "รหัสโหวตไม่ถูกต้อง" });

    const candidate = await db.collection("candidates").findOne({ candidateId });
    if (!candidate) return res.status(404).json({ message: "ไม่พบผู้สมัคร" });

    await db.collection("users").updateOne(
      { email },
      { $set: { hasVoted: true, votedCandidate: candidateId } }
    );
    await db.collection("candidates").updateOne(
      { candidateId },
      { $inc: { votes: 1 } }
    );

    res.json({ message: "โหวตสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/stats/vote-summary", async (req, res) => {
  try {
    const result = await db.collection("users").aggregate([
      { $match: { isVerified: true } },
      { $group: { _id: "$hasVoted", count: { $sum: 1 } } },
    ]).toArray();

    let voted = 0;
    let notVoted = 0;
    result.forEach((item) => {
      if (item._id === true) voted = item.count;
      if (item._id === false) notVoted = item.count;
    });

    res.json({ voted, notVoted, totalVerified: voted + notVoted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});