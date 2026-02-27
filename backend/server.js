console.log("🔥 SERVER STARTED: KUVote System with BLOCKCHAIN 🔥");
require("dotenv").config();

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Block, Blockchain } = require("./blockchain"); // 🔗 Import Blockchain

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

// app.use("/upload", require("./routes/upload"));



// =======================
// MongoDB Connection
// =======================
const client = new MongoClient(process.env.MONGO_URI);
let db;
let studentDB;

// 🔗 Blockchain Instance (จะโหลดจาก DB ตอน start)
let voteBlockchain = new Blockchain();

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

/**
 * 🔗 โหลด Blockchain จาก Database
 */
async function loadBlockchain() {
  try {
    const savedChain = await db.collection("blockchain").findOne({ _id: "voteChain" });

    if (savedChain && savedChain.chain) {
      voteBlockchain = Blockchain.fromJSON(savedChain.chain);
      console.log("✅ Blockchain loaded from database");
      console.log(`   -> Total blocks: ${voteBlockchain.chain.length}`);

      // ✅ Verify Blockchain Integrity
      if (voteBlockchain.isChainValid()) {
        console.log("✅ Blockchain integrity verified!");
      } else {
        console.error("❌ Blockchain is CORRUPTED! Creating new chain...");
        voteBlockchain = new Blockchain();
      }
    } else {
      console.log("📦 No blockchain found. Created new genesis block.");
      await saveBlockchain(); // บันทึก Genesis Block
    }
  } catch (err) {
    console.error("⚠️ Error loading blockchain:", err.message);
    voteBlockchain = new Blockchain();
  }
}

/**
 * 💾 บันทึก Blockchain ลง Database
 */
async function saveBlockchain() {
  try {
    await db.collection("blockchain").updateOne(
      { _id: "voteChain" },
      { $set: { chain: voteBlockchain.toJSON(), updatedAt: new Date() } },
      { upsert: true }
    );
    console.log("💾 Blockchain saved to database");
  } catch (err) {
    console.error("❌ Error saving blockchain:", err.message);
  }
}

async function connectDB() {
  try {
    await client.connect();
    db = client.db("vote");
    studentDB = client.db("students");
    console.log("✅ MongoDB Connected Successfully");
    await ensureTTLIndex();
    await loadBlockchain(); // 🔗 โหลด Blockchain
  } catch (err) {
    console.error("❌ MongoDB Connection FAILED:", err.message);
    process.exit(1);
  }
}
connectDB();

// =======================
// Mail Configuration
// =======================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error("---------------------------------------------------");
    console.error("❌ [MAIL ERROR] ไม่สามารถเชื่อมต่อกับ Gmail ได้");
    console.error("สาเหตุ:", error.message);
    console.error("---------------------------------------------------");
  } else {
    console.log("✅ [MAIL READY] ระบบส่งอีเมลพร้อมใช้งาน");
  }
});

// =======================
// Routes
// =======================

app.get("/", (req, res) => {
  res.send("🚀 KUVote API Server with BLOCKCHAIN is Running!");
});

// =======================
// 1. Register Users
// =======================
app.post("/register/users", async (req, res) => {
  let insertedId = null;

  try {
    const { email, faculty, loginPassword, votePin } = req.body;
    console.log(`📥 [REGISTER] New request: ${email}`);

    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      if (!existingUser.isVerified) {
        return res.status(409).json({ message: "อีเมลนี้ลงทะเบียนแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน" });
      }
      return res.status(409).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });
    }

    const hashedPassword = await bcrypt.hash(loginPassword, 10);
    const hashedPin = await bcrypt.hash(votePin, 10);

    const result = await db.collection("users").insertOne({
      email,
      faculty,
      loginPassword: hashedPassword,
      votePin: hashedPin,
      isVerified: false,
      hasVoted: false,
      createdAt: new Date(),
    });

    insertedId = result.insertedId;
    console.log(`✅ [DB] User inserted with ID: ${insertedId}`);

    const verifyToken = jwt.sign(
      { userId: insertedId },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "http://localhost:3000";
    const verifyLink = `${frontendUrl}/verify-email/${verifyToken}`;

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
            <p style="font-size: 12px; color: #666;">หากคลิกปุ่มไม่ได้ ให้คลิกลิงก์นี้: <a href="${verifyLink}">${verifyLink}</a></p>
          </div>
        </div>
      </div>
    `;

    console.log("⏳ [MAIL] Sending email...");
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

    if (insertedId) {
      console.log("🧹 [ROLLBACK] Deleting user due to registration failure...");
      await db.collection("users").deleteOne({ _id: insertedId });
      console.log("   -> User deleted. Can try again.");
    }

    res.status(500).json({
      error: "เกิดข้อผิดพลาดในการสมัครสมาชิก",
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
      return res.status(400).send("<h1>❌ ไม่สำเร็จ</h1><p>ลิงก์นี้ถูกใช้ไปแล้ว หรือหมดอายุ</p>");
    }

    res.send("<h1>🎉 ยืนยันสำเร็จ!</h1><p>กลับไปหน้า Login ได้เลย</p>");
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
      { userId: user._id, email: user.email, role: user.role }, // ✅ เพิ่ม role ใน token ด้วย
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        email: user.email,
        faculty: user.faculty,
        hasVoted: user.hasVoted,
        role: user.role || "user"
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =======================
// 4. Candidates
// =======================

async function getNextCandidateId() {
  const result = await db.collection("counters").findOneAndUpdate(
    { _id: "candidateId" },
    { $inc: { seq: 1 } },
    {
      upsert: true,
      returnDocument: "after"
    }
  );

  // MongoDB driver ใหม่ return document ตรง ๆ
  return result.seq;
}

app.post("/candidates", async (req, res) => {
  try {
    const {
      name,
      faculty,
      position,
      policies,
      profileImage,
      partyName,
      slogan,
      phone,
      major,
      year,
      email
    } = req.body;

    // 🔥 เช็คว่ามี email นี้สมัครแล้วหรือยัง
    const existing = await db.collection("candidates").findOne({ email });

    if (existing) {
      return res.status(400).json({
        message: "คุณเคยสมัครไปแล้ว ไม่สามารถสมัครซ้ำได้"
      });
    }

    const candidateId = await getNextCandidateId();

    // ทำความสะอาดนโยบายก่อนบันทึก
const cleanPolicies = policies
  ?.map(p => p.trim())
  .filter(p => p !== "");

const candidate = {
  candidateId,
  name,
  faculty,
  position,
  policies: cleanPolicies,   // 👈 ใช้อันนี้แทน
  profileImage,
  partyName,
  slogan,
  phone,
  major,
  year,
  email,
  status: "pending",
  rejectReason: null,
  votes: 0,
  createdAt: new Date()
};

    await db.collection("candidates").insertOne(candidate);

    res.status(201).json({ message: "สมัครสำเร็จ" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/candidates", async (req, res) => {
  try {
    const status = req.query.status;

    // ถ้ามี query ?status=approved ก็กรอง
    const query = status ? { status } : {};

    const candidates = await db.collection("candidates").find(query).toArray();

    // 🔗 นับคะแนนจาก Blockchain
    const voteCounts = voteBlockchain.countVotes();

    // รวมคะแนนเข้าไป
    const candidatesWithVotes = candidates.map(c => ({
      ...c,
      votes: voteCounts[c.candidateId] || 0
    }));

    // เรียงตามคะแนน
    candidatesWithVotes.sort((a, b) => b.votes - a.votes);

    res.json(candidatesWithVotes);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/candidates/:id", async (req, res) => {
  try {
    const { status, rejectReason } = req.body;

    await db.collection("candidates").updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          status,
          rejectReason: rejectReason || null,
          updatedAt: new Date()
        }
      }
    );

    res.json({ message: "อัปเดตสถานะสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =======================
// 🔗 5. BLOCKCHAIN VOTING SYSTEM
// =======================

app.post("/vote", async (req, res) => {
  try {
    const { email, votePin, candidateId } = req.body;

    // 1. ตรวจสอบ User
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    if (user.hasVoted) return res.status(403).json({ message: "คุณใช้สิทธิ์ไปแล้ว" });

    // 2. ตรวจสอบ PIN
    const isPinCorrect = await bcrypt.compare(votePin, user.votePin);
    if (!isPinCorrect) return res.status(401).json({ message: "รหัสโหวตไม่ถูกต้อง" });

    // 3. ตรวจสอบผู้สมัคร
    const candidate = await db.collection("candidates").findOne({ candidateId });
    if (!candidate) return res.status(404).json({ message: "ไม่พบผู้สมัคร" });

    // 4. 🔐 Hash อีเมล (เพื่อความเป็นส่วนตัว)
    const emailHash = crypto.createHash("sha256").update(email).digest("hex");

    // 5. ✅ ตรวจสอบซ้ำจาก Blockchain (Double Check)
    if (voteBlockchain.hasVoted(emailHash)) {
      return res.status(403).json({ message: "คุณโหวตในระบบแล้ว (ตรวจพบใน Blockchain)" });
    }

    // 6. 🔗 สร้าง Block ใหม่และเพิ่มลง Blockchain
    const newBlock = new Block(
      voteBlockchain.chain.length,
      Date.now(),
      {
        emailHash: emailHash, // ไม่เก็บอีเมลจริง
        candidateId: candidateId,
        faculty: user.faculty,
        timestamp: new Date().toISOString()
      }
    );

    voteBlockchain.addBlock(newBlock);
    console.log(`✅ Vote recorded in blockchain: Block #${newBlock.index}`);

    // 7. 💾 บันทึก Blockchain ลง MongoDB
    await saveBlockchain();

    // 8. ✅ Update User Status
    await db.collection("users").updateOne(
      { email },
      { $set: { hasVoted: true, votedAt: new Date() } }
    );

    res.json({
      message: "โหวตสำเร็จ",
      blockIndex: newBlock.index,
      blockHash: newBlock.hash
    });

  } catch (err) {
    console.error("❌ [VOTE ERROR]:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/candidates/:id", async (req, res) => {
  const candidate = await db.collection("candidates").findOne({
    _id: new ObjectId(req.params.id)
  });

  res.json(candidate);
});


// =======================
// 📊 Statistics
// =======================

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

    // 🔗 นับจาก Blockchain ด้วย (เผื่อเทียบ)
    const blockchainVotes = voteBlockchain.chain.length - 1; // ลบ Genesis Block

    res.json({
      voted,
      notVoted,
      totalVerified: voted + notVoted,
      blockchainVotes: blockchainVotes,
      blockchainValid: voteBlockchain.isChainValid()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔗 ดู Blockchain ทั้งหมด (สำหรับ Admin / Debug)
app.get("/blockchain", async (req, res) => {
  try {
    res.json({
      totalBlocks: voteBlockchain.chain.length,
      isValid: voteBlockchain.isChainValid(),
      chain: voteBlockchain.chain
    });
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
  console.log(`⛓️  Blockchain Mode: ENABLED`);
});