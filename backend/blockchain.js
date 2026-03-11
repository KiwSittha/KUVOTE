require("dotenv").config();
const { ethers } = require("ethers");


if (!process.env.PRIVATE_KEY) {
    console.error("❌ ERROR: ไม่พบ PRIVATE_KEY ในไฟล์ .env");
    process.exit(1);
}
// 1. ตั้งค่า Provider (ประตูเชื่อมต่อ)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// 2. ตั้งค่า Wallet (คนจ่ายค่า Gas)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// 3. ระบุฟังก์ชันของ Smart Contract (ABI)
// ต้องตรงกับชื่อฟังก์ชันใน Solidity ที่คุณ Deploy ไป
const abi = [
  "function vote(uint256 _candidateId, string memory _emailHash) public",
  "function getVoteCount(uint256 _candidateId) public view returns (uint256)",
  "function hasVoted(string memory _emailHash) public view returns (bool)",
  // 👇 เพิ่มบรรทัดนี้เข้าไปครับ
  "function addCandidate(string memory _name) public"
];

// 4. สร้าง Object สัญญาเพื่อเรียกใช้
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

console.log("🔗 Blockchain Connector: READY (Sepolia)");

module.exports = { contract };