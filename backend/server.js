console.log("🔥 SERVER STARTED: KUVote System with BLOCKCHAIN (SEPOLIA) 🔥");
require("dotenv").config();

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ✅ นำเข้า module สำหรับทำระบบแชท (Socket.io) 
const http = require("http");
const { Server } = require("socket.io");

// ✅ นำเข้า contract จากไฟล์ blockchain.js ที่แก้ไปก่อนหน้านี้
const { contract } = require("./blockchain"); 

const app = express();

// ✅ สร้าง HTTP server และกำหนด Socket.io (เพิ่มใหม่สำหรับระบบแชท)
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // หรือใส่ URL ของ Frontend เช่น "http://localhost:3000"
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

// =======================
// MongoDB Connection
// =======================
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function writeAuditLog({
  actorEmail = "system",
  actorRole = "system",
  action,
  targetType = null,
  targetId = null,
  status = "success",
  details = {},
}) {
  try {
    if (!db) return;

    await db.collection("audit_logs").insertOne({
      actorEmail,
      actorRole,
      action,
      targetType,
      targetId,
      status,
      details,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("⚠️ Write Audit Log Error:", error.message);
  }
}

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
    console.error("❌ [MAIL ERROR] ไม่สามารถเชื่อมต่อกับ Gmail ได้:", error.message);
  } else {
    console.log("✅ [MAIL READY] ระบบส่งอีเมลพร้อมใช้งาน");
  }
});

// =======================
// Routes
// =======================

app.get("/", (req, res) => {
  res.send("🚀 KUVote API Server with REAL BLOCKCHAIN and CHAT is Running!");
});

// =======================
// 1. Register Users
// =======================
app.post("/register/users", async (req, res) => {
  let insertedId = null;

  try {
    const { email, faculty, year, loginPassword, votePin } = req.body;
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
      year: parseInt(year) || 1, 
      loginPassword: hashedPassword,
      votePin: hashedPin,
      isVerified: false,
      hasVoted: false,
      createdAt: new Date(),
    });

    insertedId = result.insertedId;
    
    const verifyToken = jwt.sign(
      { userId: insertedId },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "http://localhost:3000";
    const verifyLink = `${frontendUrl}/verify-email/${verifyToken}`;

    const emailHtml = `
      <div style="background-color: #f0fdf4; padding: 40px 15px; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <div style="background-color: #047857; padding: 35px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 1px;">
              KU<span style="color: #6ee7b7;">Vote</span>
            </h1>
            <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 14px;">ระบบเลือกตั้งประธานนิสิต</p>
          </div>

          <div style="padding: 40px 30px; text-align: center; color: #334155;">
            <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
            <h2 style="margin-top: 0; color: #0f172a; font-size: 24px;">ยินดีต้อนรับสู่ KUVote</h2>
            
            <p style="font-size: 16px; color: #475569; margin-bottom: 30px;">
              ขอบคุณสำหรับการสมัครใช้งานระบบเลือกตั้ง<br>
              เพื่อให้การลงทะเบียนของคุณเสร็จสมบูรณ์ กรุณายืนยันตัวตนโดยคลิกที่ปุ่มด้านล่าง
            </p>

            <a href="${verifyLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);">
              ยืนยันอีเมลทันที
            </a>

            <p style="font-size: 14px; color: #ef4444; margin-top: 25px; font-weight: bold;">
              ⏳ ลิงก์นี้จะหมดอายุภายใน 10 นาที
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0 25px;">

            <p style="font-size: 13px; color: #64748b; margin: 0; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px;">
              <strong>⚠️ หากคุณไม่ได้เป็นผู้ลงทะเบียน:</strong><br>
              กรุณาละเว้นอีเมลฉบับนี้ ข้อมูลการสมัครที่ยังไม่ยืนยันจะถูกลบออกจากระบบโดยอัตโนมัติเมื่อลิงก์หมดอายุ
            </p>
          </div>

          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
              © 2026 KU Vote System. Kasetsart University.<br>
              อีเมลฉบับนี้เป็นการแจ้งเตือนอัตโนมัติ กรุณาอย่าตอบกลับ
            </p>
          </div>

        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"KUVote System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "ยืนยันอีเมลของคุณ - KUVote",
      html: emailHtml,
    });

    res.status(201).json({ message: "สมัครสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน" });

  } catch (err) {
    console.error("❌ [REGISTER ERROR]:", err.message);
    if (insertedId) await db.collection("users").deleteOne({ _id: insertedId });
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก", details: err.message });
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
    if (result.matchedCount === 0) return res.status(400).send("<h1>❌ ไม่สำเร็จ</h1><p>ลิงก์นี้ถูกใช้ไปแล้ว หรือหมดอายุ</p>");
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
    if (!user.isVerified) return res.status(403).json({ message: "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ" });

    const isPasswordCorrect = await bcrypt.compare(loginPassword, user.loginPassword);
    if (!isPasswordCorrect) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });

    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ 
      token, 
      user: { 
        email: user.email, 
        faculty: user.faculty, 
        hasVoted: user.hasVoted, 
        role: user.role || "user"
      } 
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
    { upsert: true, returnDocument: "after" }
  );
  return result.seq || result.value?.seq; 
}

app.post("/candidates", async (req, res) => {
  try {
    const { 
      studentId, name, nickname, faculty, major, year, email, 
      position, partyName, slogan, phone, policies, weights, status,
      profileImage
    } = req.body;

    const candidateId = await getNextCandidateId(); 

    await db.collection("candidates").insertOne({
      candidateId,
      studentId, name, nickname, faculty, major, year, email,
      position, partyName, slogan, phone,
      profileImage,
      policies: policies || [],
      weights: weights || {},
      votes: 0,
      status: status || "pending",
      rejectReason: "",
      createdAt: new Date(),
      txHash: null 
    });

    res.status(201).json({ 
        message: "บันทึกข้อมูลการสมัครสำเร็จ กรุณารอแอดมินตรวจสอบ", 
        candidateId
    });

  } catch (err) {
    console.error("❌ Add Candidate Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/candidates", async (req, res) => {
  try {
    const candidates = await db.collection("candidates").find({}).toArray();
    
    const candidatesWithVotes = await Promise.all(candidates.map(async (c) => {
        try {
            if (c.status === "approved" && c.txHash) {
                const votesBigInt = await contract.getVoteCount(c.candidateId);
                return { ...c, votes: Number(votesBigInt) };
            }
            return { ...c, votes: 0 }; 
        } catch (error) {
            console.error(`Error fetching votes for candidate ${c.candidateId}:`, error.message);
            return { ...c, votes: 0 };
        }
    }));
    
    candidatesWithVotes.sort((a, b) => b.votes - a.votes);
    res.json(candidatesWithVotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ⚙️ 5. System Settings (Admin Control: เปิด-ปิด ระบบเลือกตั้ง) 🔥 (ใหม่)
// =======================

// 📌 5.1 ดูสถานะระบบ (เพิ่มส่งค่า endTime กลับไปให้ Frontend)
app.get("/election-status", async (req, res) => {
  try {
    const setting = await db.collection("settings").findOne({ _id: "electionState" });
    res.json({ 
      isOpen: setting ? setting.isOpen : false,
      startTime: setting ? setting.startTime : null, // ✅ เพิ่มเวลาเปิด
      endTime: setting ? setting.endTime : null // ✅ เพิ่มบรรทัดนี้
    }); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🛡️ Middleware: ด่านตรวจจับเฉพาะ Admin (ย้ายมาไว้ข้างบนเพื่อให้ใช้ได้หลายที่)
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) return res.status(401).json({ message: "Access Denied: ไม่พบ Token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: สิทธิ์ถูกปฏิเสธ (เฉพาะ Admin)" });
    }

    req.user = {
      id: decoded.userId,
      email: user.email,
      role: user.role || "user",
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token: เซสชั่นหมดอายุ" });
  }
};

// =======================
// 📣 Announcement System
// =======================

app.post("/admin/announcements", verifyAdmin, async (req, res) => {
  try {
    const { title, message, type, isPinned, expiresAt } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "กรุณาระบุหัวข้อและรายละเอียดประกาศ" });
    }

    const announcement = {
      title: String(title).trim(),
      message: String(message).trim(),
      type: ["info", "warning", "success"].includes(type) ? type : "info",
      isPinned: Boolean(isPinned),
      isActive: true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdAt: new Date(),
      createdBy: req.user?.email || "admin",
    };

    const result = await db.collection("announcements").insertOne(announcement);
    await writeAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: "admin.create_announcement",
      targetType: "announcement",
      targetId: result.insertedId.toString(),
      details: {
        title: announcement.title,
        type: announcement.type,
        isPinned: announcement.isPinned,
      },
    });

    res.status(201).json({ message: "สร้างประกาศสำเร็จ", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/announcements/active", async (req, res) => {
  try {
    const now = new Date();
    const announcements = await db
      .collection("announcements")
      .find({
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5)
      .toArray();

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/announcements", verifyAdmin, async (req, res) => {
  try {
    const announcements = await db
      .collection("announcements")
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/announcements/:id/deactivate", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.collection("announcements").updateOne(
      { _id: new ObjectId(id) },
      { $set: { isActive: false, deactivatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "ไม่พบประกาศที่ต้องการปิด" });
    }

    await writeAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: "admin.deactivate_announcement",
      targetType: "announcement",
      targetId: id,
    });

    res.json({ message: "ปิดประกาศสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 5.2 แอดมินตั้งค่าระบบ (รับค่า endTime มาบันทึก)
app.post("/admin/toggle-election", verifyAdmin, async (req, res) => {
  try {
    const { isOpen, startTime, endTime } = req.body; // ✅ รับ startTime มาด้วย

    await db.collection("settings").updateOne(
      { _id: "electionState" },
      { $set: { 
          isOpen: Boolean(isOpen), 
          startTime: startTime || null, // ✅ บันทึกเวลาเปิด
          endTime: endTime || null 
        } 
      },
      { upsert: true }
    );

    await writeAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: "admin.toggle_election",
      targetType: "settings",
      targetId: "electionState",
      details: { isOpen: Boolean(isOpen), startTime: startTime || null, endTime: endTime || null },
    });

    res.json({ message: "อัปเดตการตั้งค่าสำเร็จ", isOpen, startTime, endTime });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 🔗 6. BLOCKCHAIN VOTING SYSTEM
// =======================

app.post("/vote", async (req, res) => {
  try {
    // 🔥 0. เช็คสวิตช์ก่อนเลยว่า แอดมินเปิดให้โหวตหรือยัง (ใหม่)
    const electionState = await db.collection("settings").findOne({ _id: "electionState" });
    if (!electionState || !electionState.isOpen) {
      return res.status(403).json({ message: "ขณะนี้ระบบปิดรับการลงคะแนนแล้ว" });
    }

    const { email, votePin, candidateId } = req.body;
    
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    if (user.hasVoted) return res.status(403).json({ message: "คุณใช้สิทธิ์ไปแล้ว" });

    const isPinCorrect = await bcrypt.compare(votePin, user.votePin);
    if (!isPinCorrect) return res.status(401).json({ message: "รหัสโหวตไม่ถูกต้อง" });

    const emailHash = crypto.createHash("sha256").update(email).digest("hex");

    console.log(`🚀 Sending vote to Blockchain... (Email: ${email} -> Candidate: ${candidateId})`);

    const tx = await contract.vote(candidateId, emailHash);
    
    console.log(`⏳ Transaction sent! Hash: ${tx.hash}`);
    const receipt = await tx.wait(); 
    console.log(`✅ Block confirmed: Block #${receipt.blockNumber}`);

    await db.collection("users").updateOne(
      { email },
      { $set: { hasVoted: true, transactionHash: tx.hash } }
    );

    await db.collection("candidates").updateOne(
        { candidateId: parseInt(candidateId) },
        { $inc: { votes: 1 } }
    );

    res.json({ 
      message: "โหวตสำเร็จ! ข้อมูลถูกบันทึกลง Blockchain เรียบร้อยแล้ว",
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      explorerLink: `https://sepolia.etherscan.io/tx/${tx.hash}`
    });

  } catch (err) {
    console.error("❌ Vote Error:", err);
    if (err.reason) return res.status(400).json({ message: "Blockchain Error: " + err.reason });
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
});

// =======================
// 📊 Statistics
// =======================

app.get("/stats/vote-summary", async (req, res) => {
  try {
    const users = await db.collection("users").find({ isVerified: true }).toArray();
    
    let voted = 0;
    let notVoted = 0;
    let votersByYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
    let votersByFaculty = {};

    const currentThaiYear = 68; 

    users.forEach((user) => {
      if (user.hasVoted) {
        voted++;
        
        if (user.faculty) {
          let mappedFaculty = user.faculty; 
          const facStr = user.faculty.toLowerCase();

          if (facStr.includes("วิศว") || facStr === "eng") {
            mappedFaculty = "eng";
          } else if (facStr.includes("จัดการ") || facStr === "ms") {
            mappedFaculty = "ms";
          } else if (facStr.includes("วิทยาศาสตร์") || facStr === "sci") {
            mappedFaculty = "sci";
          } else if (facStr.includes("พาณิชยนาวี") || facStr === "ims") {
            mappedFaculty = "ims";
          } else if (facStr.includes("เศรษฐศาสตร์") || facStr === "econ") {
            mappedFaculty = "econ";
          }

          votersByFaculty[mappedFaculty] = (votersByFaculty[mappedFaculty] || 0) + 1;
        }

        let year = user.year ? parseInt(user.year) : null;

        if (!year) {
          const match = user.email.match(/\D?(\d{2})/); 
          if (match) {
            const studentYearPrefix = parseInt(match[1]); 
            year = currentThaiYear - studentYearPrefix + 1;
          }
        }

        if (year) {
          if (year > 8) year = 8; 
          if (year < 1) year = 1; 
          votersByYear[year] = (votersByYear[year] || 0) + 1;
        }
      } else {
        notVoted++;
      }
    });

    res.json({ 
      voted, 
      notVoted, 
      totalVerified: voted + notVoted,
      votersByYear,
      votersByFaculty,
      blockchainStatus: "Active (Sepolia)"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 💬 Socket.io Chat System 
// =======================

app.get("/chat/history/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const messages = await db.collection("messages").find({ room: email }).sort({ timestamp: 1 }).toArray();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', (socket) => {
  console.log(`💬 User Connected to Chat: ${socket.id}`);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`💬 User ID: ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send_message', async (data) => {
    try {
      await db.collection("messages").insertOne({
        room: data.room,
        author: data.author,
        message: data.message,
        time: data.time,
        timestamp: new Date()
      });

      io.to(data.room).emit('receive_message', data);
    } catch (error) {
      console.error("❌ Save Message Error:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User Disconnected from Chat: ${socket.id}`);
  });
});

app.get("/chat/users", async (req, res) => {
  try {
    const users = await db.collection("messages").distinct("room");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ลืมรหัสผ่าน (Forgot Password)
// =======================
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim().toLowerCase().endsWith("@ku.th")) {
        return res.status(400).json({ message: "กรุณาใช้อีเมลมหาวิทยาลัย (@ku.th) เท่านั้น" });
    }

    const user = await db.collection("users").findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      console.log(`⚠️ FORGOT_PASS_FAILED: ${email} (Not Found)`); 
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบความถูกต้อง" });
    }

    const secret = process.env.JWT_SECRET + user.loginPassword;
    const token = jwt.sign({ userId: user._id, email: user.email }, secret, { expiresIn: "15m" });
    
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password/${user._id}/${token}`;

    await transporter.sendMail({
      from: `"KUVote System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔒 รีเซ็ตรหัสผ่าน - KUVote",
      html: `
        <div style="background-color: #f0fdf4; padding: 40px 15px; font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            
            <div style="background-color: #047857; padding: 35px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: 1px;">
                KU<span style="color: #6ee7b7;">Vote</span>
              </h1>
              <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 14px;">ระบบเลือกตั้งประธานนิสิต</p>
            </div>

            <div style="padding: 40px 30px; text-align: center; color: #334155;">
              <div style="font-size: 48px; margin-bottom: 20px;">🔐</div>
              <h2 style="margin-top: 0; color: #0f172a; font-size: 24px;">คำขอรีเซ็ตรหัสผ่าน</h2>
              
              <p style="font-size: 16px; color: #475569; margin-bottom: 30px;">
                สวัสดีครับ,<br><br>
                เราได้รับคำขอให้ตั้งรหัสผ่านใหม่สำหรับบัญชี <strong>${user.email}</strong><br>
                กรุณาคลิกที่ปุ่มด้านล่างนี้เพื่อดำเนินการต่อ
              </p>

              <a href="${resetLink}" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);">
                ตั้งรหัสผ่านใหม่
              </a>

              <p style="font-size: 14px; color: #ef4444; margin-top: 25px; font-weight: bold;">
                ⏳ ลิงก์นี้จะหมดอายุภายใน 15 นาที
              </p>

              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0 25px;">

              <p style="font-size: 13px; color: #64748b; margin: 0; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px;">
                <strong>⚠️ หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน:</strong><br>
                คุณสามารถละเว้นและลบอีเมลฉบับนี้ได้เลย รหัสผ่านของคุณจะยังคงปลอดภัยและไม่มีการเปลี่ยนแปลงใดๆ
              </p>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                © 2026 KU Vote System. Kasetsart University.<br>
                อีเมลฉบับนี้เป็นการแจ้งเตือนอัตโนมัติ กรุณาอย่าตอบกลับ
              </p>
            </div>

          </div>
        </div>
      `,
    });
    
    console.log(`✅ FORGOT_PASS_REQ: ${user.email}`); 
    res.json({ message: "ส่งลิงก์รีเซ็ตรหัสผ่านเรียบร้อยแล้ว" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ตั้งรหัสผ่านใหม่ (Reset Password)
// =======================
app.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = process.env.JWT_SECRET + user.loginPassword;
    try { 
        jwt.verify(token, secret); 
    } catch (err) { 
        return res.status(400).json({ message: "ลิงก์หมดอายุ หรือไม่ถูกต้อง" }); 
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { loginPassword: hashedPassword } });

    console.log(`✅ RESET_PASS_SUCCESS: ${user.email}`); 
    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// เปลี่ยนรหัสผ่าน (Change Password)
// =======================
app.put("/user/change-password", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.loginPassword);
    if (!isMatch) {
      console.log(`⚠️ CHANGE_PASS_FAILED: ${user.email} (Wrong Current Password)`); 
      return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { loginPassword: hashedNewPassword } });

    console.log(`✅ CHANGE_PASS_SUCCESS: ${user.email}`); 
    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 🎯 ระบบแนะนำผู้สมัคร 
// =======================
app.post("/api/recommend", async (req, res) => {
  try {
    const { ratings } = req.body; 

    if (!ratings || Object.keys(ratings).length === 0) {
      return res.status(400).json({ error: "กรุณาให้คะแนนความสำคัญของนโยบาย" });
    }

    const candidates = await db.collection("candidates").find({}).toArray();

    if (!candidates || candidates.length === 0) {
       return res.status(404).json({ message: "ยังไม่มีข้อมูลผู้สมัครในระบบ" });
    }

    const results = candidates.map(cand => {
      let totalScore = 0;
      let maxPossibleScore = 0;

      for (const [policyKey, userRating] of Object.entries(ratings)) {
        
        const candWeight = (cand.weights && cand.weights[policyKey] !== undefined)
          ? parseFloat(cand.weights[policyKey])
          : 0.0;

        totalScore += (userRating * candWeight);
        maxPossibleScore += (userRating * 1.0); 
      }

      let matchPercentage = 0;
      if (maxPossibleScore > 0) {
        matchPercentage = ((totalScore / maxPossibleScore) * 100).toFixed(2);
      }

      return {
        candidateId: cand.candidateId,
        name: cand.name,
        faculty: cand.faculty,
        policies: cand.policies || [],
        matchScore: parseFloat(matchPercentage)
      };
    });

    results.sort((a, b) => b.matchScore - a.matchScore);
    res.json(results);
  } catch (err) {
    console.error("❌ Recommend Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 👥 ระบบจัดการผู้ใช้ (Admin)
// =======================

app.get("/admin/users", verifyAdmin, async (req, res) => {
  try {
    const users = await db.collection("users").find({}).sort({ createdAt: -1 }).toArray();
    const safeUsers = users.map(u => ({
      _id: u._id,
      email: u.email,
      faculty: u.faculty,
      role: u.role || "user",
      isVerified: u.isVerified,
      hasVoted: u.hasVoted,
      createdAt: u.createdAt
    }));
    res.json(safeUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/admin/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty, role } = req.body;

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { faculty, role } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });
    }

    await writeAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: "admin.update_user",
      targetType: "user",
      targetId: id,
      details: { faculty, role },
    });

    res.json({ message: "อัปเดตข้อมูลคณะและบทบาทสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 👤 ระบบจัดการผู้สมัครรายบุคคล 
// =======================

app.get("/candidates/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let query = id.length === 24 ? { _id: new ObjectId(id) } : { candidateId: parseInt(id) };

    const candidate = await db.collection("candidates").findOne(query);
    if (!candidate) return res.status(404).json({ message: "ไม่พบข้อมูลผู้สมัครนี้" });

    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/candidates/:id",verifyAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { status, rejectReason } = req.body;
    let query = id.length === 24 ? { _id: new ObjectId(id) } : { candidateId: parseInt(id) };

    const candidate = await db.collection("candidates").findOne(query);
    if (!candidate) return res.status(404).json({ message: "ไม่พบผู้สมัครที่ต้องการอัปเดต" });

    let txHash = candidate.txHash;

    if (status === "approved" && !txHash) {
       console.log(`🚀 Admin Approved: Adding [${candidate.name}] to Blockchain...`);
       
       const tx = await contract.addCandidate(candidate.name);
       console.log(`⏳ Transaction sent! Hash: ${tx.hash}`);
       
       await tx.wait(); 
       console.log(`✅ Block confirmed! Candidate added to Blockchain.`);
       
       txHash = tx.hash; 
    }

    const result = await db.collection("candidates").updateOne(
      query,
      { 
        $set: { 
          status: status, 
          rejectReason: rejectReason || "",
          txHash: txHash
        } 
      }
    );

    await writeAuditLog({
      actorEmail: req.user?.email,
      actorRole: req.user?.role,
      action: "admin.update_candidate_status",
      targetType: "candidate",
      targetId: id,
      details: { status, rejectReason: rejectReason || "", txHash: txHash || null },
    });

    res.json({ message: `อัปเดตสถานะเป็น ${status} สำเร็จ!`, txHash });
  } catch (err) {
    console.error("PUT Candidate Status Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/audit-logs", verifyAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
    const action = req.query.action?.trim();
    const actor = req.query.actor?.trim();

    const filter = {};
    if (action) filter.action = action;
    if (actor) filter.actorEmail = { $regex: actor, $options: "i" };

    const logs = await db
      .collection("audit_logs")
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`⛓️  Blockchain Mode: ONLINE (Sepolia)`);
  console.log(`💬 Chat System: ONLINE (Socket.io)`);
});