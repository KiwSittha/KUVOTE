require("dotenv").config();
const { ethers } = require("ethers");

if (!process.env.PRIVATE_KEY) {
    console.error("❌ ERROR: ไม่พบ PRIVATE_KEY ในไฟล์ .env");
    process.exit(1);
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ✅ แก้ไข ABI ให้ตรงกับ Smart Contract ตัวใหม่ล่าสุด
const abi = [
  "function addCandidate(uint256 _id, string memory _name) public",
  "function vote(uint256 _candidateId, string memory _emailHash) public",
  "function getVoteCount(uint256 _candidateId) public view returns (uint256)",
  "function checkVoted(string memory _emailHash) public view returns (bool)"
];

const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

console.log("🔗 Blockchain Connector: READY (Sepolia)");

module.exports = { contract };