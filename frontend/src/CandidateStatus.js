// import React, { useEffect, useState } from "react";
// import Layout from "./components/Layout";

// function CandidateStatus() {
//   const [candidate, setCandidate] = useState(null);

//   useEffect(() => {
//     // mock ก่อน (เดี๋ยวค่อยดึงจาก API)
//     setCandidate({
//       fullName: "สมชาย ใจดี",
//       position: "OBK",
//       status: "pending"
//     });
//   }, []);

//   const getStatusUI = () => {
//     switch (candidate.status) {
//       case "approved":
//         return (
//           <div className="bg-green-100 text-green-700 p-4 rounded-xl">
//             ✅ ใบสมัครของคุณได้รับการอนุมัติแล้ว
//           </div>
//         );

//       case "rejected":
//         return (
//           <div className="bg-red-100 text-red-700 p-4 rounded-xl">
//             ❌ ใบสมัครไม่ผ่านการอนุมัติ
//           </div>
//         );

//       default:
//         return (
//           <div className="bg-yellow-100 text-yellow-700 p-4 rounded-xl">
//             ⏳ ใบสมัครอยู่ระหว่างการตรวจสอบ
//           </div>
//         );
//     }
//   };

//   if (!candidate) return null;

//   return (
//     <Layout>
//       <div className="max-w-3xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow space-y-6">

//         <h1 className="text-2xl font-bold">
//           สถานะใบสมัคร
//         </h1>

//         <div>
//           <p><b>ชื่อ:</b> {candidate.fullName}</p>
//           <p><b>ตำแหน่ง:</b> {candidate.position}</p>
//         </div>

//         {getStatusUI()}

//       </div>
//     </Layout>
//   );
// }

// export default CandidateStatus;
