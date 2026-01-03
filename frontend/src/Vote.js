import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 
import Layout from "../components/Layout"; // ✅ เช็ค path ให้ถูกนะครับ (ปกติถ้าไฟล์อยู่ใน pages ต้องถอย 1 ชั้นไป components)

export default function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ดึงข้อมูลผู้ใช้จาก localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. ดึงข้อมูลผู้สมัครตอนโหลดหน้าเว็บ
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch("https://vote-webapp.onrender.com/candidates");
      if (!response.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");
      const data = await response.json();

      // ✅ เรียงลำดับตามหมายเลข (candidateId) จากน้อยไปมาก (1 -> 2 -> 3)
      // เพราะ Server อาจจะส่งแบบเรียงตามคะแนนโหวตมา เราต้องมาจัดใหม่ที่นี่
      const sortedData = data.sort((a, b) => a.candidateId - b.candidateId);

      setCandidates(sortedData);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถดึงรายชื่อผู้สมัครได้", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. ฟังก์ชันกดโหวต
  const handleVote = async () => {
    if (!selectedId) return;

    // เช็คว่า Login หรือยัง
    if (!user || !user.email) {
      Swal.fire("แจ้งเตือน", "กรุณาเข้าสู่ระบบก่อนลงคะแนน", "warning");
      navigate("/login");
      return;
    }

    // ถาม PIN Code
    const { value: pin } = await Swal.fire({
      title: 'ยืนยันตัวตน',
      text: 'กรุณากรอกรหัส PIN 6 หลักเพื่อยืนยันสิทธิ์',
      input: 'password',
      inputLabel: 'PIN Code',
      inputPlaceholder: 'กรอกรหัส PIN',
      inputAttributes: { maxlength: 6, autocapitalize: 'off', autocorrect: 'off' },
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'ยืนยันการโหวต',
      cancelButtonText: 'ยกเลิก',
      inputValidator: (value) => {
        if (!value || value.length !== 6) return 'รหัส PIN ต้องมี 6 หลัก';
      }
    });

    if (pin) {
      try {
        Swal.fire({ title: 'กำลังบันทึกคะแนน...', didOpen: () => Swal.showLoading() });

        const token = localStorage.getItem("token");
        
        const response = await fetch("https://vote-webapp.onrender.com/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ 
            email: user.email, 
            votePin: pin, 
            candidateId: selectedId 
          })
        });

        const data = await response.json();

        if (response.ok) {
          const updatedUser = { ...user, hasVoted: true };
          localStorage.setItem("user", JSON.stringify(updatedUser));

          await Swal.fire({
            icon: 'success',
            title: 'โหวตสำเร็จ!',
            text: 'ขอบคุณที่ใช้สิทธิ์เลือกตั้ง',
            confirmButtonColor: '#10b981'
          });
          navigate("/dashboard");
        } else {
          Swal.fire({
            icon: 'error',
            title: 'ไม่สำเร็จ',
            text: data.message || 'รหัส PIN ไม่ถูกต้อง หรือคุณใช้สิทธิ์ไปแล้ว',
            confirmButtonColor: '#ef4444'
          });
        }
      } catch (error) {
        Swal.fire("Error", "เชื่อมต่อ Server ไม่ได้", "error");
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-32"> {/* pb-32 กันพื้นที่ให้ปุ่มลอย */}
        
        {/* === หัวข้อหน้าเว็บ === */}
        <div className="text-center py-8 mb-8 relative animate-fade-in-down">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
             <span className="text-[10rem] font-bold text-emerald-900 hidden md:block">VOTE</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 relative z-10 drop-shadow-sm">
            ลงคะแนน<span className="text-emerald-600">เลือกตั้ง</span>
          </h1>
          <p className="text-slate-500 mt-3 text-sm md:text-lg relative z-10 font-medium">
            เลือกคนที่ใช่ กาคนที่ชอบ (เลือกได้เพียง 1 ท่าน)
          </p>
        </div>

        {/* === Loading State === */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 text-emerald-600">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="animate-pulse font-medium">กำลังโหลดรายชื่อ...</p>
          </div>
        ) : (
          /* === Grid แสดงรายชื่อผู้สมัคร === */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.candidateId}
                onClick={() => setSelectedId(candidate.candidateId)}
                className={`
                  group relative cursor-pointer rounded-3xl p-5 transition-all duration-300 border-2 bg-white flex flex-col h-full
                  ${selectedId === candidate.candidateId 
                    ? "border-emerald-500 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] ring-4 ring-emerald-50 scale-[1.03] z-10" 
                    : "border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 hover:border-emerald-200"}
                `}
              >
                {/* Badge ติ๊กถูก (แสดงเมื่อเลือก) */}
                <div className={`
                  absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-20 shadow-md
                  ${selectedId === candidate.candidateId ? "bg-emerald-500 scale-100 rotate-0" : "bg-slate-100 scale-0 rotate-45"}
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* ส่วนรูปภาพ */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-100 relative shadow-inner group-hover:shadow-md transition-all">
                  {candidate.image ? (
                    <img src={candidate.image} alt={candidate.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                       <span className="text-4xl mb-2">👤</span>
                       <span className="text-xs font-medium">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                  
                  {/* เบอร์ผู้สมัคร */}
                  <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">เบอร์</span>
                    <span className="text-2xl font-black text-emerald-600 leading-none">{candidate.candidateId}</span>
                  </div>
                </div>

                {/* รายละเอียด */}
                <div className="flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                    {candidate.name}
                  </h3>
                  <div className="mt-2 mb-4">
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                      {candidate.faculty}
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wide">วิสัยทัศน์</p>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                       {Array.isArray(candidate.policies) ? candidate.policies.join(", ") : (candidate.policies || "-")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === ปุ่มลอย (Floating Action Button) === */}
        <div 
          className={`fixed bottom-8 left-0 right-0 flex justify-center z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            ${selectedId ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0 pointer-events-none"}
          `}
        >
          <button
            onClick={handleVote}
            className="group flex items-center gap-4 pl-8 pr-2 py-2 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-emerald-600 hover:shadow-emerald-500/40 transition-all duration-300 ring-4 ring-white border border-slate-800/50"
          >
            <div className="flex flex-col text-left">
               <span className="text-[10px] text-slate-400 group-hover:text-emerald-100 font-bold uppercase tracking-wider">ยืนยันเลือกเบอร์</span>
               <span className="text-2xl font-black leading-none">{selectedId}</span>
            </div>
            
            <div className="bg-white text-slate-900 w-14 h-14 rounded-full flex items-center justify-center ml-2 group-hover:scale-110 group-active:scale-95 transition-transform shadow-lg">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
               </svg>
            </div>
          </button>
        </div>

      </div>
    </Layout>
  );
}