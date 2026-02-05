const crypto = require("crypto");

/**
 * 🧱 Block Class - แทน 1 การโหวต
 */
class Block {
  constructor(index, timestamp, data, previousHash = "") {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data; // { email (hashed), candidateId, faculty }
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0; // สำหรับ Proof of Work (optional)
  }

  /**
   * คำนวณ Hash ของ Block นี้
   */
  calculateHash() {
    return crypto
      .createHash("sha256")
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest("hex");
  }

  /**
   * 🔨 Proof of Work (ขุด Block) - ทำให้แก้ไขยากขึ้น
   * difficulty = จำนวน 0 ที่ต้องขึ้นต้น Hash (เช่น 0000abc...)
   */
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`⛏️  Block mined: ${this.hash}`);
  }
}

/**
 * ⛓️ Blockchain Class - จัดการทั้ง Chain
 */
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2; // ความยาก (2 = ต้องขึ้นต้นด้วย 00)
  }

  /**
   * สร้าง Block แรก (Genesis Block)
   */
  createGenesisBlock() {
    return new Block(0, Date.now(), { info: "Genesis Block - KUVote System" }, "0");
  }

  /**
   * ดึง Block ล่าสุด
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * ✅ เพิ่ม Block ใหม่ (บันทึกการโหวต)
   */
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty); // ขุด Block
    this.chain.push(newBlock);
  }

  /**
   * 🔍 ตรวจสอบความถูกต้องของ Chain ทั้งหมด
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // เช็ค Hash ตัวเอง
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        console.error(`❌ Block ${i} has invalid hash!`);
        return false;
      }

      // เช็คการเชื่อมโยง
      if (currentBlock.previousHash !== previousBlock.hash) {
        console.error(`❌ Block ${i} is not linked to previous block!`);
        return false;
      }
    }
    return true;
  }

  /**
   * 📊 นับคะแนนโหวตจาก Blockchain
   */
  countVotes() {
    const voteCounts = {};
    
    // Skip Genesis Block (index 0)
    for (let i = 1; i < this.chain.length; i++) {
      const candidateId = this.chain[i].data.candidateId;
      if (candidateId) {
        voteCounts[candidateId] = (voteCounts[candidateId] || 0) + 1;
      }
    }
    
    return voteCounts;
  }

  /**
   * 🔎 ตรวจสอบว่า email นี้โหวตแล้วหรือยัง (ใช้ Hash เพื่อความเป็นส่วนตัว)
   */
  hasVoted(emailHash) {
    for (let i = 1; i < this.chain.length; i++) {
      if (this.chain[i].data.emailHash === emailHash) {
        return true;
      }
    }
    return false;
  }

  /**
   * 💾 Export Chain เป็น JSON (สำหรับเก็บใน MongoDB)
   */
  toJSON() {
    return JSON.stringify(this.chain);
  }

  /**
   * 📥 Import Chain จาก JSON
   */
  static fromJSON(chainJSON) {
    const blockchain = new Blockchain();
    const parsedChain = JSON.parse(chainJSON);
    
    blockchain.chain = parsedChain.map((blockData) => {
      const block = new Block(
        blockData.index,
        blockData.timestamp,
        blockData.data,
        blockData.previousHash
      );
      block.hash = blockData.hash;
      block.nonce = blockData.nonce;
      return block;
    });
    
    return blockchain;
  }
}

module.exports = { Block, Blockchain };