// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Layout from "../components/Layout";

// function AdminCandidateDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [candidate, setCandidate] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`http://localhost:8000/candidates/${id}`)
//       .then((res) => res.json())
//       .then((data) => {
//   console.log("🔥 candidate data:", data);
//   setCandidate(data);
// })
//       .catch(() => alert("โหลดข้อมูลไม่สำเร็จ"))
//       .finally(() => setLoading(false));
//   }, [id]);
  

//   if (loading) {
//     return (
//       <Layout>
//         <div className="p-10 text-center text-gray-400">
//           กำลังโหลดข้อมูล...
//         </div>
//       </Layout>
//     );
//   }

//   if (!candidate) {
//     return (
//       <Layout>
//         <div className="p-10 text-center text-red-500">
//           ไม่พบข้อมูลผู้สมัคร
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="p-8 max-w-5xl mx-auto space-y-8">

//         {/* HEADER */}
//         <div className="flex justify-between items-center">
//           <h1 className="text-3xl font-bold">รายละเอียดผู้สมัคร</h1>

//           <span
//             className={`px-4 py-1 rounded-full text-sm font-semibold
//               ${
//                 candidate.status === "approved"
//                   ? "bg-green-100 text-green-700"
//                   : candidate.status === "pending"
//                   ? "bg-yellow-100 text-yellow-700"
//                   : "bg-red-100 text-red-700"
//               }`}
//           >
//             {candidate.status}
//           </span>
//         </div>

//         {/* PROFILE SECTION */}
//         <div className="bg-white rounded-2xl shadow p-8 flex flex-col md:flex-row gap-8">

//           {/* IMAGE */}
//           <div className="flex-shrink-0">
//             {candidate.profileImage ? (
//               <img
//                 src={candidate.profileImage}
//                 alt="profile"
//                 className="w-56 h-56 object-cover rounded-2xl shadow"
//               />
//             ) : (
//               <div className="w-56 h-56 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
//                 ไม่มีรูปภาพ
//               </div>
//             )}
//           </div>

//           {/* INFO */}
//           <div className="space-y-3 text-gray-700">
//             <p><b>ชื่อ:</b> {candidate.name}</p>
//             <p><b>คณะ:</b> {candidate.faculty}</p>
//             <p><b>สาขา:</b> {candidate.major}</p>
//             <p><b>ชั้นปี:</b> {candidate.year}</p>
//             <p><b>ตำแหน่ง:</b> {candidate.position}</p>
//             <p><b>พรรค:</b> {candidate.partyName}</p>
//             <p><b>สโลแกน:</b> {candidate.slogan}</p>
//             <p><b>เบอร์โทร:</b> {candidate.phone}</p>
//             <p><b>อีเมล:</b> {candidate.email}</p>
//           </div>
//         </div>

//         {/* POLICIES */}
//         <div className="bg-white rounded-2xl shadow p-8">
//           <h2 className="text-xl font-bold mb-6">นโยบาย</h2>

//           {candidate.policies && candidate.policies.length > 0 ? (
            
//             <ul className="space-y-4">
//               {candidate.policies.map((policy, index) => (
//                 <li
//                   key={index}
//                   className="p-4 bg-gray-50 rounded-xl border"
//                 >
//                   <span className="font-semibold mr-2">
//                     {index + 1}.
//                   </span>
//                   {policy}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p className="text-gray-400">ไม่มีนโยบาย</p>
//           )}
//         </div>

//         {/* BACK BUTTON */}
//         <div>
//           <button
//             onClick={() => navigate(-1)}
//             className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
//           >
//             ← กลับ
//           </button>
//         </div>

//       </div>
//     </Layout>
//   );
// }

// export default AdminCandidateDetail;