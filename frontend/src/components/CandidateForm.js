// // import React, { useState } from "react";
// // import Layout from "./Layout";
// // import StepBar from "./StepBar";

// // import { getStudentById } from "../services/studentService";
// // import { createCandidate } from "../services/candidateService";
// // import { useNavigate } from "react-router-dom";


// // function CandidateForm({ position }) {

// //   const [step, setStep] = useState(1);
// //   const [loading, setLoading] = useState(false);
// //   const navigate = useNavigate();


// //   const [profilePreview, setProfilePreview] = useState(null);
// //   const [partyLogoPreview, setPartyLogoPreview] = useState(null);

// //   const [form, setForm] = useState({
// //     studentId: "",
// //     fullName: "",
// //     nickname: "",
// //     faculty: "",
// //     major: "",
// //     year: "",
// //     gpax: "",
// //     position: position,
// //     partyName: "",
// //     partyLogo: null,
// //     profileImage: null,
// //     slogan: "",
// //     videoUrl: "",
// //     facebook: "",
// //     instagram: "",
// //     lineId: "",
// //     phone: ""
// //   });

// //   const [policies, setPolicies] = useState([
// //     { title: "", description: "" }
// //   ]);

// //   /* ===== Search Student ===== */
// //   const handleSearchStudent = async (e) => {
// //     e.preventDefault();
// //     try {
// //       setLoading(true);
// //       const data = await getStudentById(form.studentId);
// //       setForm(prev => ({
// //         ...prev,
// //         fullName: data.fullName,
// //         faculty: data.faculty,
// //         major: data.major || "",
// //         year: data.year || "",
// //         gpax: data.gpax || ""
// //       }));
// //     } catch {
// //       alert("ไม่พบรหัสนิสิตนี้");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   /* ===== Policy ===== */
// //   const addPolicy = () =>
// //     setPolicies([...policies, { title: "", description: "" }]);

// //   const updatePolicy = (i, field, value) => {
// //     const next = [...policies];
// //     next[i][field] = value;
// //     setPolicies(next);
// //   };

// //   const removePolicy = (i) =>
// //     setPolicies(policies.filter((_, index) => index !== i));

// //   /* ===== Submit ===== */
// //   const handleSubmit = async () => {
// //     try {
// //       setLoading(true);

// //       // save database ตรงนี้
// //       // await createCandidate(...)

// //       navigate("/candidate-success");

// //     } catch (err) {
// //       alert("บันทึกข้อมูลไม่สำเร็จ");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Layout>
// //       <div className="min-h-screen px-6 py-8">
// //         <div className="w-full max-w-[1400px] mx-auto space-y-10">

// //           {/* Header */}
// //           <div>
// //             <h1 className="text-3xl font-bold text-slate-800">
// //               เพิ่มผู้สมัครรับเลือกตั้ง
// //             </h1>
// //             <p className="text-slate-500 mt-1">
// //               ตำแหน่ง : {position}
// //             </p>
// //           </div>

// //           <StepBar step={step} />

// //           {/* STEP 1 */}
// //           {step === 1 && (
// //             <div className="bg-white rounded-2xl shadow p-10 space-y-8">

// //               <h2 className="text-xl font-semibold">
// //                 ข้อมูลระบุตัวตนผู้สมัคร
// //               </h2>

// //               <form onSubmit={handleSearchStudent}>
// //                 <input
// //                   className="border p-3 rounded-xl w-full"
// //                   placeholder="รหัสนิสิต"
// //                   value={form.studentId}
// //                   onChange={(e) =>
// //                     setForm({ ...form, studentId: e.target.value })
// //                   }
// //                 />
// //               </form>

// //               <input
// //                 readOnly
// //                 value={form.fullName}
// //                 className="w-full bg-slate-100 p-3 rounded-xl"
// //                 placeholder="ชื่อ-นามสกุล"
// //               />

// //               <button
// //                 onClick={() => setStep(2)}
// //                 className="w-full bg-emerald-600 text-white py-3 rounded-xl"
// //               >
// //                 ถัดไป →
// //               </button>

// //             </div>
// //           )}

// //           {/* STEP 2 */}
// //           {step === 2 && (
// //             <div className="bg-white rounded-2xl shadow p-10">
// //               <h2 className="text-xl font-semibold">
// //                 ข้อมูลการสมัคร
// //               </h2>

// //               <input
// //                 value={form.position}
// //                 readOnly
// //                 className="w-full bg-slate-100 p-3 rounded-xl"
// //               />

// //               <button
// //                 onClick={() => setStep(3)}
// //                 className="w-full bg-emerald-600 text-white py-3 rounded-xl mt-4"
// //               >
// //                 ถัดไป →
// //               </button>
// //             </div>
// //           )}

// //           {/* STEP 3 */}
// //           {step === 3 && (
// //             <div className="bg-white rounded-2xl shadow p-10">
// //               <h2 className="text-xl font-semibold">
// //                 นโยบาย
// //               </h2>

// //               {policies.map((p, i) => (
// //                 <div key={i}>
// //                   <input
// //                     placeholder="หัวข้อ"
// //                     value={p.title}
// //                     onChange={(e) =>
// //                       updatePolicy(i, "title", e.target.value)
// //                     }
// //                   />
// //                 </div>
// //               ))}

// //               <button onClick={addPolicy}>
// //                 + เพิ่มนโยบาย
// //               </button>

// //               <button
// //                 onClick={handleSubmit}
// //                 className="w-full bg-emerald-600 text-white py-3 rounded-xl mt-4"
// //               >
// //                 บันทึกผู้สมัคร
// //               </button>
// //             </div>
// //           )}

// //         </div>
// //       </div>
// //     </Layout>
// //   );
// // }

// // export default CandidateForm;
// import React, { useState } from "react";
// import Layout from "./Layout";
// import StepBar from "./StepBar";
// import { useNavigate } from "react-router-dom";
// import { getStudentById } from "../services/studentService";

// function CandidateForm({ position }) {

//   const navigate = useNavigate();
//   const [step, setStep] = useState(1);
//   const [loading, setLoading] = useState(false);

//   const [profilePreview, setProfilePreview] = useState(null);

//   const [form, setForm] = useState({
//     studentId: "",
//     fullName: "",
//     nickname: "",
//     faculty: "",
//     major: "",
//     year: "",
//     gpax: "",
//     position: position,
//     partyName: "",
//     slogan: "",
//     phone: ""
//   });

//   const [policies, setPolicies] = useState([
//     { title: "", description: "" }
//   ]);

//   /* ===== Search Student ===== */
//   const handleSearchStudent = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       const data = await getStudentById(form.studentId);

//       setForm(prev => ({
//         ...prev,
//         fullName: data.fullName,
//         faculty: data.faculty,
//         major: data.major || "",
//         year: data.year || "",
//         gpax: data.gpax || ""
//       }));

//     } catch {
//       alert("ไม่พบรหัสนิสิต");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ===== Policy ===== */
//   const addPolicy = () =>
//     setPolicies([...policies, { title: "", description: "" }]);

//   const updatePolicy = (i, field, value) => {
//     const next = [...policies];
//     next[i][field] = value;
//     setPolicies(next);
//   };

//   return (
//     <Layout>
//       <div className="min-h-screen px-6 py-8">
//         <div className="max-w-[1200px] mx-auto space-y-8">

//           <h1 className="text-3xl font-bold">
//             สมัครรับเลือกตั้ง ({position})
//           </h1>

//           <StepBar step={step} />

//           {/* STEP 1 */}
//           {step === 1 && (
//             <div className="bg-white p-8 rounded-xl shadow space-y-4">

//               <form onSubmit={handleSearchStudent}>
//                 <input
//                   className="border p-3 rounded-xl w-full"
//                   placeholder="รหัสนิสิต"
//                   value={form.studentId}
//                   onChange={(e) =>
//                     setForm({ ...form, studentId: e.target.value })
//                   }
//                 />
//               </form>

//               <input
//                 readOnly
//                 value={form.fullName}
//                 className="bg-slate-100 p-3 rounded-xl w-full"
//                 placeholder="ชื่อ-นามสกุล"
//               />

//               <button
//                 onClick={() => setStep(2)}
//                 className="w-full bg-emerald-600 text-white py-3 rounded-xl"
//               >
//                 ถัดไป →
//               </button>

//             </div>
//           )}

//           {/* STEP 2 */}
//           {step === 2 && (
//             <div className="bg-white p-8 rounded-xl shadow space-y-4">

//               <input
//                 value={form.position}
//                 readOnly
//                 className="bg-slate-100 p-3 rounded-xl w-full"
//               />

//               <input
//                 placeholder="ชื่อพรรค"
//                 value={form.partyName}
//                 onChange={(e) =>
//                   setForm({ ...form, partyName: e.target.value })
//                 }
//                 className="border p-3 rounded-xl w-full"
//               />

//               <button
//                 onClick={() => setStep(3)}
//                 className="w-full bg-emerald-600 text-white py-3 rounded-xl"
//               >
//                 ถัดไป →
//               </button>

//               <button
//                 onClick={() => setStep(1)}
//                 className="w-full bg-gray-200 py-3 rounded-xl"
//               >
//                 กลับ
//               </button>

//             </div>
//           )}

//           {/* STEP 3 */}
//           {step === 3 && (
//             <div className="bg-white p-8 rounded-xl shadow space-y-4">

//               {policies.map((p, i) => (
//                 <div key={i} className="space-y-2">
//                   <input
//                     placeholder="หัวข้อนโยบาย"
//                     value={p.title}
//                     onChange={(e) =>
//                       updatePolicy(i, "title", e.target.value)
//                     }
//                     className="border p-3 rounded-xl w-full"
//                   />
//                   <textarea
//                     placeholder="รายละเอียด"
//                     value={p.description}
//                     onChange={(e) =>
//                       updatePolicy(i, "description", e.target.value)
//                     }
//                     className="border p-3 rounded-xl w-full"
//                   />
//                 </div>
//               ))}

//               <button onClick={addPolicy}>
//                 + เพิ่มนโยบาย
//               </button>

//               <button
//                 onClick={() =>
//                   navigate("/candidate-preview", {
//                     state: { form, policies, profilePreview }
//                   })
//                 }
//                 className="w-full bg-emerald-600 text-white py-3 rounded-xl"
//               >
//                 ตรวจสอบข้อมูล →
//               </button>

//               <button
//                 onClick={() => setStep(2)}
//                 className="w-full bg-gray-200 py-3 rounded-xl"
//               >
//                 กลับ
//               </button>

//             </div>
//           )}

//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default CandidateForm;
