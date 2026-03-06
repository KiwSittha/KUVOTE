console.log("🔥 SERVER STARTED: KUVote System with BLOCKCHAIN (SEPOLIA) 🔥");
require("dotenv").config();

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ✅ นำเข้า contract จากไฟล์ blockchain.js ที่แก้ไปก่อนหน้านี้
const { contract } = require("./blockchain"); 

// ✅ นำเข้า Community routes
const {
  getThreads,
  createThread,
  getThread,
  addComment,
  voteOnThread,
  voteOnComment,
  likeComment,
  unlikeComment,
  getCommentLikes
} = require("./routes/community");

const app = express();

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
    
    // Connect Mongoose for community models
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "vote"
    });
    console.log("✅ Mongoose Connected Successfully");
    
    await ensureTTLIndex();
    // ❌ ไม่ต้องโหลด Blockchain แล้ว เพราะข้อมูลอยู่บน Sepolia
  } catch (err) {
    console.error("❌ Database Connection FAILED:", err.message);
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
  res.send("🚀 KUVote API Server with REAL BLOCKCHAIN is Running!");
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
      <div style="font-family: sans-serif; background-color: #f4f4f5; padding: 40px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background-color: #10B981; padding: 20px; text-align: center; color: white;">
            <h1>KU Vote System</h1>
          </div>
          <div style="padding: 30px; text-align: center;">
            <h2>ยืนยันการลงทะเบียน</h2>
            <p>กรุณากดปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ</p>
            <a href="${verifyLink}" style="display: inline-block; background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">ยืนยันอีเมลทันที</a>
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

    res.json({ token, user: { email: user.email, faculty: user.faculty, hasVoted: user.hasVoted } });
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
  // แก้ตรงนี้: ตัด .value ทิ้งไปเลย หรือใส่เผื่อไว้ทั้งสองแบบ
  return result.seq || result.value?.seq; 
}

app.post("/candidate", async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({ message: "Blockchain service is not configured" });
    }

    const { name, faculty, position, policies } = req.body;
    
    console.log(`🚀 Adding candidate: ${name} to Blockchain...`);

    // ==========================================
    // 🔗 1. ส่งคำสั่งไปสร้างบน Blockchain ก่อน
    // ==========================================
    
    // เรียกฟังก์ชัน addCandidate ใน Smart Contract
    const tx = await contract.addCandidate(name);
    
    console.log(`⏳ Transaction sent! Hash: ${tx.hash}`);
    const receipt = await tx.wait(); // รอจนเสร็จ
    
    console.log(`✅ Block confirmed! Candidate added.`);

    // ==========================================
    // 💾 2. บันทึกลง MongoDB
    // ==========================================

    // เราจะใช้ Candidate ID ตามลำดับที่ Blockchain สร้างให้ (หรือใช้ลำดับที่เราจัดการเองก็ได้)
    // แต่เพื่อความง่าย เราจะใช้ getNextCandidateId() เหมือนเดิม
    const candidateId = await getNextCandidateId(); 

    await db.collection("candidates").insertOne({
      candidateId,
      name,
      faculty,
      position,
      policies: policies || [],
      votes: 0,
      createdAt: new Date(),
      txHash: tx.hash // เก็บหลักฐานการสร้างไว้ด้วย
    });

    res.status(201).json({ 
        message: "เพิ่มผู้สมัครสำเร็จทั้งใน Database และ Blockchain", 
        candidateId,
        txHash: tx.hash
    });

  } catch (err) {
    console.error("❌ Add Candidate Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/candidates", async (req, res) => {
  try {
    // 1. ดึงข้อมูลผู้สมัครจาก DB
    const candidates = await db.collection("candidates").find({}).toArray();

    if (!contract) {
      const candidatesNoChain = [...candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      return res.json(candidatesNoChain);
    }
    
    // 2. 🔗 วนลูปเพื่อดึงคะแนนจริงจาก Blockchain (Real-time)
    // ใช้ Promise.all เพื่อดึงข้อมูลพร้อมกันหลายคน (จะได้เร็ว)
    const candidatesWithVotes = await Promise.all(candidates.map(async (c) => {
        try {
            // เรียก Smart Contract: getVoteCount(id)
            const votesBigInt = await contract.getVoteCount(c.candidateId);
            return { ...c, votes: Number(votesBigInt) }; // แปลง BigInt เป็น Number
        } catch (error) {
            console.error(`Error fetching votes for candidate ${c.candidateId}:`, error.message);
            return { ...c, votes: 0 }; // ถ้าดึงไม่ได้ ให้โชว์ 0 ไปก่อน
        }
    }));
    
    // เรียงตามคะแนน
    candidatesWithVotes.sort((a, b) => b.votes - a.votes);
    
    res.json(candidatesWithVotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// 🔗 5. BLOCKCHAIN VOTING SYSTEM (แก้ไขใหม่)
// =======================

app.post("/vote", async (req, res) => {
  try {
    if (!contract) {
      return res.status(503).json({ message: "Blockchain service is not configured" });
    }

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
// Community Forum Routes
// =======================

// GET /api/threads - Get all threads
app.get("/api/threads", getThreads);

// POST /api/threads - Create new thread
app.post("/api/threads", createThread);

// GET /api/threads/:id - Get single thread with comments
app.get("/api/threads/:id", getThread);

// POST /api/threads/:id/comments - Add comment to thread
app.post("/api/threads/:id/comments", addComment);

// POST /api/threads/:id/vote - Vote on thread
app.post("/api/threads/:id/vote", voteOnThread);

// POST /api/comments/:id/vote - Vote on comment
app.post("/api/comments/:id/vote", voteOnComment);

// POST /api/comments/:id/like - Like a comment
app.post("/api/comments/:id/like", likeComment);

// DELETE /api/comments/:id/like - Unlike a comment
app.delete("/api/comments/:id/like", unlikeComment);

// GET /api/comments/:id/likes - Get likes for a comment
app.get("/api/comments/:id/likes", getCommentLikes);

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`⛓️  Blockchain Mode: ONLINE (Sepolia)`);
});