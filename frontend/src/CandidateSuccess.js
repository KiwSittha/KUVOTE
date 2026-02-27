// import React from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// function CandidateSuccess() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const type = location.state?.type;
//   const isAlready = type === "already";

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black/40 backdrop-blur-sm">
//       <div className="bg-white shadow-2xl rounded-2xl p-10 text-center w-[450px]">

//         <h1 className={`text-2xl font-bold ${isAlready ? "text-red-600" : "text-green-600"}`}>
//           {isAlready ? "ไม่สามารถดำเนินการได้" : "สมัครสำเร็จ 🎉"}
//         </h1>

//         <p className="mt-4 text-gray-600">
//           {isAlready
//             ? "จากการตรวจสอบพบว่าท่านได้ยื่นใบสมัครไว้แล้ว ระบบไม่อนุญาตให้สมัครซ้ำ"
//             : "ขอบคุณสำหรับการสมัคร กรุณารอการตรวจสอบจากระบบ"}
//         </p>

//         <button
//           onClick={() => navigate("/")}
//           className={`mt-6 px-6 py-2 rounded text-white ${
//             isAlready ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
//           }`}
//         >
//           กลับหน้าแรก
//         </button>

//       </div>
//     </div>
//   );
// }

// export default CandidateSuccess;