import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; 
import Layout from "./components/Layout";

export default function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ 1. เพิ่ม State ควบคุมการกดโหวต เพื่อกันกดเบิ้ล
  const [isVoting, setIsVoting] = useState(false); 
  
  const navigate = useNavigate();

  // ดึงข้อมูลผู้ใช้จาก localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. เช็คสถานะการเลือกตั้ง & ดึงข้อมูลผู้สมัครตอนโหลดหน้าเว็บ
  useEffect(() => {
    checkElectionStatus();
  }, []);

  // ✅ ฟังก์ชันตรวจสอบว่าเปิดให้โหวตหรือไม่
  const checkElectionStatus = async () => {
    try {
      const res = await fetch("http://localhost:8000/election-status");
      if (!res.ok) throw new Error("ไม่สามารถดึงสถานะระบบได้");
      
      const data = await res.json();
      const now = new Date().getTime();
      const startMs = data.startTime ? new Date(data.startTime).getTime() : 0;
      const endMs = data.endTime ? new Date(data.endTime).getTime() : Infinity;

      // เงื่อนไขโดนเตะออก: แอดมินปิดสวิตช์ (isOpen=false) หรือ ยังไม่ถึงเวลาเปิด หรือ หมดเวลาปิดหีบแล้ว
      if (!data.isOpen || now < startMs || now > endMs) {
        await Swal.fire({
          icon: "warning",
          title: "ระบบปิดรับลงคะแนน",
          text: "ขณะนี้ไม่อยู่ในช่วงเวลาที่เปิดให้ลงคะแนนเสียง",
          confirmButtonColor: "#ef4444"
        });
        navigate("/"); // พากลับหน้าหลัก
        return; 
      }

      // ถ้าระบบเปิดอยู่ ให้ไปดึงรายชื่อผู้สมัครต่อ
      fetchCandidates();

    } catch (error) {
      console.error("Status Check Error:", error);
      Swal.fire("ข้อผิดพลาด", "ไม่สามารถตรวจสอบสถานะระบบได้", "error");
      navigate("/");
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await fetch("http://localhost:8000/candidates");
      if (!response.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");
      const data = await response.json();

      // เรียงลำดับตามหมายเลข (candidateId) จากน้อยไปมาก (1 -> 2 -> 3)
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
    // ✅ 2. เช็คว่ากำลังบันทึกข้อมูลอยู่หรือไม่ ถ้าใช่ให้หยุดทำงานทันที
    if (selectedId === null || isVoting) return;

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
        setIsVoting(true); // ✅ 3. ล็อคปุ่มโหวตทันที
        
        // ✅ ป้องกันไม่ให้คลิกด้านนอกแล้วกล่องหาย
        Swal.fire({ 
          title: 'กำลังบันทึกคะแนนลง Blockchain...', 
          allowOutsideClick: false, 
          didOpen: () => Swal.showLoading() 
        });

        const token = localStorage.getItem("token");
        
        const response = await fetch("http://localhost:8000/vote", {
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
            text: 'ข้อมูลของคุณถูกบันทึกลง Blockchain เรียบร้อยแล้ว',
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
        Swal.fire("Error", "เชื่อมต่อ Server ไม่ได้ กรุณาลองใหม่อีกครั้ง", "error");
      } finally {
        setIsVoting(false); // ✅ 4. ปลดล็อคปุ่มเมื่อทำงานเสร็จ (ไม่ว่าจะสำเร็จหรือพัง)
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto pb-48"> 
        
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
            <p className="animate-pulse font-medium">กำลังตรวจสอบสถานะระบบ...</p>
          </div>
        ) : (
          <>
            {/* === Grid แสดงรายชื่อผู้สมัคร === */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate.candidateId}
                  onClick={() => !isVoting && setSelectedId(candidate.candidateId)} // ✅ ห้ามเปลี่ยนเบอร์ตอนระบบกำลังโหลด
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
                    {candidate.profileImage ? (
                      <img 
                        src={candidate.profileImage} 
                        alt={candidate.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
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

            {/* === ปุ่มงดออกเสียง (No Vote) === */}
            <div className="flex justify-center mt-12 px-4">
              <button
                onClick={() => !isVoting && setSelectedId(0)} // ✅ ห้ามเปลี่ยนใจตอนกำลังโหลด
                className={`
                  flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all duration-300
                  ${selectedId === 0 
                    ? "bg-slate-800 border-slate-800 text-white shadow-[0_10px_40px_-10px_rgba(30,41,59,0.5)] ring-4 ring-slate-100 scale-[1.03] z-10" 
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:bg-slate-50 shadow-sm hover:shadow-xl hover:-translate-y-1"}
                `}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedId === 0 ? "border-white" : "border-slate-300"}`}>
                   {selectedId === 0 && <div className="w-3 h-3 bg-white rounded-full"></div>}
                </div>
                <span className="font-bold text-lg md:text-xl">ไม่ประสงค์ลงคะแนน (งดออกเสียง)</span>
              </button>
            </div>
          </>
        )}

        {/* === ปุ่มลอย (Floating Action Button) === */}
        <div 
          className={`fixed bottom-8 left-0 right-0 flex justify-center z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            ${selectedId !== null ? "translate-y-0 opacity-100" : "translate-y-32 opacity-0 pointer-events-none"}
          `}
        >
          <button
            onClick={handleVote}
            disabled={isVoting} // ✅ ปิดปุ่มเมื่อกำลังโหลด
            className={`
              group flex items-center gap-4 pl-8 pr-2 py-2 text-white rounded-full shadow-2xl transition-all duration-300 ring-4 ring-white border
              ${selectedId === 0 
                ? "bg-slate-800 shadow-slate-500/40 border-slate-700" 
                : "bg-slate-900 shadow-emerald-500/40 border-slate-800/50"} 
              ${isVoting ? "opacity-75 cursor-not-allowed" : "hover:bg-emerald-600 hover:scale-105"}
            `}
          >
            <div className="flex flex-col text-left">
               <span className="text-[10px] text-slate-400 group-hover:text-emerald-100 font-bold uppercase tracking-wider">
                 {isVoting ? "กรุณารอสักครู่..." : (selectedId === 0 ? "ยืนยันเลือก" : "ยืนยันเลือกเบอร์")}
               </span>
               <span className={`font-black leading-none ${selectedId === 0 ? "text-xl" : "text-2xl"}`}>
                 {isVoting ? "กำลังบันทึก" : (selectedId === 0 ? "งดออกเสียง" : selectedId)}
               </span>
            </div>
            
            <div className="bg-white text-slate-900 w-14 h-14 rounded-full flex items-center justify-center ml-2 group-hover:scale-110 group-active:scale-95 transition-transform shadow-lg">
               {isVoting ? (
                  // SVG ตัวหมุน Loading
                  <svg className="animate-spin h-6 w-6 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
               ) : (
                  // SVG ลูกศรปกติ
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
               )}
            </div>
          </button>
        </div>

      </div>
    </Layout>
  );
}