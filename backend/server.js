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

// ❌ ลบ let voteBlockchain ออก (ไม่ใช้ Local Chain แล้ว)

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

// ❌ ลบ function loadBlockchain() และ saveBlockchain() ออกทั้งหมด

async function connectDB() {
  try {
    await client.connect();
    db = client.db("vote");
    console.log("✅ MongoDB Connected Successfully");
    await ensureTTLIndex();
    // ❌ ไม่ต้องโหลด Blockchain แล้ว เพราะข้อมูลอยู่บน Sepolia
  } catch (err) {
    console.error("❌ MongoDB Connection FAILED:", err.message);
    process.exit(1);
  }
}
connectDB();

// =======================
// Mail Configuration (เหมือนเดิม)
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
// 1. Register Users (เหมือนเดิม)
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
// 2. Verify Email (เหมือนเดิม)
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
// 3. Login (เหมือนเดิม)
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
    role: user.role || "user" // ✅ เพิ่มบรรทัดนี้ เพื่อส่ง role กลับไปด้วย (ถ้าไม่มีให้ถือว่าเป็น user)
  } 
});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// =======================
// 4. Candidates (อัปเดตเพิ่ม Weights)
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
      position, partyName, slogan, phone, policies, weights, status ,
      profileImage
    } = req.body;

    // 🔴 เช็ค email ซ้ำก่อนบันทึก
    const exist = await db.collection("candidates").findOne({
      email: email
    });

    if (exist) {
      return res.status(400).json({
        message: "duplicate"
      });
    }

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
      message: "success",
      candidateId
    });

  } catch (err) {
    console.error("❌ Add Candidate Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ====================================================
// 📌 นำโค้ดนี้ไปวางต่อจาก app.post("/candidates") จบ
// ====================================================

app.get("/candidates", async (req, res) => {
  try {
    const candidates = await db.collection("candidates").find({}).toArray();
    
    // วนลูปเพื่อดึงคะแนนจริงจาก Blockchain
    const candidatesWithVotes = await Promise.all(candidates.map(async (c) => {
        try {
            // 🛑 ดึงคะแนนจาก Blockchain เฉพาะคนที่ "ผ่านการอนุมัติ (approved)" แล้วเท่านั้น
            if (c.status === "approved" && c.txHash) {
                const votesBigInt = await contract.getVoteCount(c.candidateId);
                return { ...c, votes: Number(votesBigInt) };
            }
            return { ...c, votes: 0 }; // ถ้ายังไม่ approved คะแนนโชว์เป็น 0 ไปก่อน
        } catch (error) {
            console.error(`Error fetching votes for candidate ${c.candidateId}:`, error.message);
            return { ...c, votes: 0 };
        }
    }));
    
    // เรียงลำดับจากคะแนนสูงสุดไปต่ำสุด
    candidatesWithVotes.sort((a, b) => b.votes - a.votes);
    
    res.json(candidatesWithVotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 🔗 5. BLOCKCHAIN VOTING SYSTEM (โค้ดเดิมของคุณอยู่ตรงนี้)
// =======================

// =======================
// 🔗 5. BLOCKCHAIN VOTING SYSTEM (เหมือนเดิม)
// =======================

app.post("/vote", async (req, res) => {
  try {
    const { email, votePin, candidateId } = req.body;
    
    // 1. ตรวจสอบ User ใน MongoDB
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    if (user.hasVoted) return res.status(403).json({ message: "คุณใช้สิทธิ์ไปแล้ว" });

    // 2. ตรวจสอบ PIN
    const isPinCorrect = await bcrypt.compare(votePin, user.votePin);
    if (!isPinCorrect) return res.status(401).json({ message: "รหัสโหวตไม่ถูกต้อง" });

    // 3. Hash อีเมล
    const emailHash = crypto.createHash("sha256").update(email).digest("hex");

    console.log(`🚀 Sending vote to Blockchain... (Email: ${email} -> Candidate: ${candidateId})`);

    // ==========================================
    // 🔥 ส่ง Transaction ขึ้น Blockchain จริง
    // ==========================================
    
    // เรียก Smart Contract: vote(candidateId, emailHash)
    // Admin Wallet จะเป็นคนจ่าย Gas
    const tx = await contract.vote(candidateId, emailHash);
    
    console.log(`⏳ Transaction sent! Hash: ${tx.hash}`);
    
    // รอ Mining (ยืนยัน Block)
    const receipt = await tx.wait(); 
    
    console.log(`✅ Block confirmed: Block #${receipt.blockNumber}`);

    // ==========================================

    // 4. อัปเดตสถานะใน MongoDB
    await db.collection("users").updateOne(
      { email },
      { $set: { hasVoted: true, transactionHash: tx.hash } }
    );

    // (Option) อัปเดตคะแนนใน DB ด้วยก็ได้ เพื่อเป็น Cache
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
    
    // ดัก Error จาก Blockchain
    if (err.reason) {
        return res.status(400).json({ message: "Blockchain Error: " + err.reason });
    }
    // ดัก Error ทั่วไป
    res.status(500).json({ error: err.message || "Unknown error occurred" });
  }
});

// =======================
// 📊 Statistics (เหมือนเดิม)
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

    res.json({ 
      voted, 
      notVoted, 
      totalVerified: voted + notVoted,
      blockchainStatus: "Active (Sepolia)"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 💬 Socket.io Chat System (แก้ไขให้บันทึกและดึงข้อมูลได้)
// =======================

// 1. สร้าง API ให้ฝั่ง Frontend ดึงประวัติแชทเก่าไปแสดง
app.get("/chat/history/:email", async (req, res) => {
  try {
    const email = req.params.email;
    // ดึงข้อความของ email นี้จาก MongoDB เรียงตามเวลา
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

  // 2. เมื่อมีการส่งข้อความ ให้บันทึกลง MongoDB ด้วย
  socket.on('send_message', async (data) => {
    try {
      // บันทึกลง Collection ชื่อ "messages"
      await db.collection("messages").insertOne({
        room: data.room,
        author: data.author,
        message: data.message,
        time: data.time,
        timestamp: new Date() // เก็บเวลาจริงไว้เรียงลำดับ
      });

      // กระจายข้อความให้ทุกคนในห้อง
      io.to(data.room).emit('receive_message', data);
    } catch (error) {
      console.error("❌ Save Message Error:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User Disconnected from Chat: ${socket.id}`);
  });
});

// 3. API สำหรับดึงรายชื่อผู้ใช้ทั้งหมดที่เคยแชทเข้ามา (สำหรับ Admin)
app.get("/chat/users", async (req, res) => {
  try {
    // ใช้ .distinct() เพื่อดึงชื่อ room (อีเมล) ที่ไม่ซ้ำกันทั้งหมดจาก collection messages
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

    // ตรวจสอบรูปแบบอีเมล
    if (!email || !email.trim().toLowerCase().endsWith("@ku.th")) {
        return res.status(400).json({ message: "กรุณาใช้อีเมลมหาวิทยาลัย (@ku.th) เท่านั้น" });
    }

    const user = await db.collection("users").findOne({ email: email.trim().toLowerCase() });

    // ถ้าไม่เจอ แจ้ง Error
    if (!user) {
      console.log(`⚠️ FORGOT_PASS_FAILED: ${email} (Not Found)`); // ✅ เปลี่ยน saveLog เป็น console.log
      return res.status(404).json({ message: "ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบความถูกต้อง" });
    }

    const secret = process.env.JWT_SECRET + user.loginPassword;
    const token = jwt.sign({ userId: user._id, email: user.email }, secret, { expiresIn: "15m" });
    
    const frontendUrl = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, "") : "http://localhost:3000";
    const resetLink = `${frontendUrl}/reset-password/${user._id}/${token}`;

    // ✅ เปลี่ยน sendEmailViaBrevo มาใช้ transporter.sendMail ที่เรามีอยู่ด้านบน
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
    
    console.log(`✅ FORGOT_PASS_REQ: ${user.email}`); // ✅ เปลี่ยน saveLog เป็น console.log
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

    console.log(`✅ RESET_PASS_SUCCESS: ${user.email}`); // ✅ เปลี่ยน saveLog
    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// เปลี่ยนรหัสผ่าน (Change Password - สำหรับคนที่ล็อกอินอยู่แล้ว)
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
      console.log(`⚠️ CHANGE_PASS_FAILED: ${user.email} (Wrong Current Password)`); // ✅ เปลี่ยน saveLog
      return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await db.collection("users").updateOne({ _id: new ObjectId(decoded.userId) }, { $set: { loginPassword: hashedNewPassword } });

    console.log(`✅ CHANGE_PASS_SUCCESS: ${user.email}`); // ✅ เปลี่ยน saveLog
    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 🎯 ระบบแนะนำผู้สมัคร (แบบให้คะแนนความสำคัญ 1-5)
// =======================
app.post("/api/recommend", async (req, res) => {
  try {
    // รับค่าจาก Frontend เป็น Object ที่เก็บคะแนน 1-5
    // ตัวอย่าง: { "academic_review": 5, "skill_workshop": 3, "equipment_borrow": 1, "swap_market": 4 }
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

      // วนลูปคำนวณคะแนนตามที่ผู้ใช้ให้ Rating มาทีละหัวข้อ
      for (const [policyKey, userRating] of Object.entries(ratings)) {
        
        // ดึงน้ำหนักนโยบายของผู้สมัคร (0.0 - 1.0) ถ้าผู้สมัครไม่มีข้อมูลให้ถือเป็น 0
        const candWeight = (cand.weights && cand.weights[policyKey] !== undefined)
          ? parseFloat(cand.weights[policyKey])
          : 0.0;

        // เอาความสำคัญที่ผู้ใช้เลือก (1-5) คูณกับ ความเข้มข้นนโยบายผู้สมัคร (0.0-1.0)
        totalScore += (userRating * candWeight);
        
        // คำนวณคะแนนเต็มที่เป็นไปได้ (ถ้าผู้สมัครคนนั้นมีน้ำหนัก 1.0 ในข้อนี้)
        maxPossibleScore += (userRating * 1.0); 
      }

      // แปลงเป็นเปอร์เซ็นต์
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

    // เรียงลำดับจากคะแนนตรงใจสูงสุดไปต่ำสุด
    results.sort((a, b) => b.matchScore - a.matchScore);

    res.json(results);
  } catch (err) {
    console.error("❌ Recommend Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 👥 ระบบจัดการผู้ใช้ (Admin: User Management) แบบปลอดภัย 🔒
// =======================

// 🛡️ Middleware: ด่านตรวจจับเฉพาะ Admin
const verifyAdmin = async (req, res, next) => {
  try {
    // 1. ดึง Token จาก Header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Access Denied: ไม่พบ Token ยืนยันตัวตน" });
    }

    // 2. ถอดรหัส Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. ไปค้นหา User ใน Database ว่ามีอยู่จริงไหม และเป็น Admin ไหม
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: สิทธิ์การเข้าถึงถูกปฏิเสธ (เฉพาะ Admin เท่านั้น)" });
    }

    // ผ่านด่านตรวจ -> อนุญาตให้ไปทำงานต่อได้
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token: เซสชั่นหมดอายุหรือไม่ถูกต้อง" });
  }
};

// 1. ดึงข้อมูลผู้ใช้ทั้งหมด (🔐 เพิ่ม verifyAdmin เข้าไปตรงนี้)
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

// 2. อัปเดตข้อมูลผู้ใช้ (ล็อกให้แก้ได้แค่ คณะ กับ บทบาท เท่านั้น)
app.put("/admin/users/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // ✅ รับมาแค่ faculty และ role เท่านั้น ไม่สนใจ isVerified และ hasVoted
    const { faculty, role } = req.body;

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          faculty, 
          role 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ต้องการแก้ไข" });
    }

    res.json({ message: "อัปเดตข้อมูลคณะและบทบาทสำเร็จ" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 👤 ระบบจัดการผู้สมัครรายบุคคล (Approve / Reject)
// =======================

// 📌 4.3 ดึงข้อมูลผู้สมัคร "รายบุคคล" (สำหรับหน้า Detail)
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

// 📌 4.4 แอดมินอัปเดตสถานะ (Approve / Reject)
app.put("/candidates/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { status, rejectReason } = req.body;
    let query = id.length === 24 ? { _id: new ObjectId(id) } : { candidateId: parseInt(id) };

    const candidate = await db.collection("candidates").findOne(query);
    if (!candidate) return res.status(404).json({ message: "ไม่พบผู้สมัครที่ต้องการอัปเดต" });

    let txHash = candidate.txHash;

    // 🔥 KEY LOGIC: ถ้าแอดมินกด "Approve" และยังไม่เคยมีบน Blockchain
    if (status === "approved" && !txHash) {
       console.log(`🚀 Admin Approved: Adding [${candidate.name}] to Blockchain...`);
       
       const tx = await contract.addCandidate(candidate.name);
       console.log(`⏳ Transaction sent! Hash: ${tx.hash}`);
       
       await tx.wait(); // รอจนกว่า Blockchain จะยืนยันการเพิ่มข้อมูล
       console.log(`✅ Block confirmed! Candidate added to Blockchain.`);
       
       txHash = tx.hash; // เก็บหลักฐาน Transaction ไว้ในตัวแปร
    }

    // อัปเดตสถานะ (และ TxHash) ลงใน MongoDB
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

    res.json({ message: `อัปเดตสถานะเป็น ${status} สำเร็จ!`, txHash });
  } catch (err) {
    console.error("PUT Candidate Status Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 8000;

// ✅ เปลี่ยนจาก app.listen เป็น server.listen เพื่อให้ Socket.io ทำงานคู่กับ Express ได้
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`⛓️  Blockchain Mode: ONLINE (Sepolia)`);
  console.log(`💬 Chat System: ONLINE (Socket.io)`);
});