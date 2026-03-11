import React, { useState, useEffect, useCallback } from "react";
import Layout from "./components/Layout";

function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [direction, setDirection] = useState("next"); // เพื่อทำ Animation สไลด์ซ้าย/ขวา

  // ==========================
  // ดึงข้อมูล
  // ==========================
  useEffect(() => {
    fetch("http://localhost:8000/candidates")
      .then((res) => res.json())
      .then((data) => {
        // เรียงตามเบอร์
        const sortedData = data.sort((a, b) => a.candidateId - b.candidateId);
        setCandidates(sortedData);
      })
      .catch((err) => console.error("Error fetching candidates:", err));
  }, []);

  // ==========================
  // Logic การเลื่อน (ใช้ useCallback เพื่อให้ใช้ใน useEffect ได้)
  // ==========================
  const nextCandidate = useCallback(() => {
    setDirection("next");
    setCurrentIndex((prev) => (prev + 1) % candidates.length);
  }, [candidates.length]);

  const prevCandidate = useCallback(() => {
    setDirection("prev");
    setCurrentIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
  }, [candidates.length]);

  // ==========================
  // Keyboard Listener (กดลูกศรเพื่อเลื่อน)
  // ==========================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showPolicyModal) return; // ถ้าเปิด Modal อยู่ ห้ามเลื่อน
      if (e.key === "ArrowRight") nextCandidate();
      if (e.key === "ArrowLeft") prevCandidate();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextCandidate, prevCandidate, showPolicyModal]);

  // ดึงข้อมูลคนปัจจุบันมาแสดง
  const currentCandidate = candidates[currentIndex];

  return (
    <Layout>
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        
        {candidates.length > 0 ? (
          <div className="relative w-full max-w-5xl group">
            
            {/* ================= ปุ่มเลื่อนซ้าย ================= */}
            <button
              onClick={prevCandidate}
              className="absolute left-2 md:-left-16 top-1/2 -translate-y-1/2 z-20
                         w-10 h-10 md:w-14 md:h-14 bg-white/80 md:bg-white backdrop-blur-sm rounded-full shadow-lg text-slate-600 
                         hover:bg-emerald-50 hover:text-emerald-600 hover:scale-110 transition-all flex items-center justify-center border border-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* ================= การ์ดแสดงผลหลัก (Big Card) ================= */}
            {/* ใส่ key={currentIndex} เพื่อให้ React รู้ว่า Element เปลี่ยน และเล่น Animation ใหม่ */}
            <div 
                key={currentIndex}
                className={`bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[500px] flex flex-col md:flex-row relative
                            ${direction === 'next' ? 'animate-fade-in-right' : 'animate-fade-in-left'}`}
            >
              
              {/* ส่วนรูปภาพ (ซ้าย) */}
              <div className="md:w-5/12 bg-slate-50 flex flex-col items-center justify-center p-8 md:p-10 border-b md:border-b-0 md:border-r border-slate-100 relative overflow-hidden">
                 
                 {/* Decorative Background */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl -mr-10 -mt-10"></div>
                 <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -ml-10 -mb-10"></div>

                 {/* เบอร์ผู้สมัคร */}
                 <div className="absolute top-6 left-6 bg-emerald-600 text-white w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-2xl md:text-3xl font-bold shadow-lg z-10 ring-4 ring-white">
                    {currentCandidate.candidateId}
                 </div>

                 <div className="relative z-0 group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-emerald-300 rounded-full blur-2xl opacity-20"></div>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
                        alt="candidate"
                        className="w-56 h-56 md:w-64 md:h-64 object-cover relative drop-shadow-2xl"
                    />
                 </div>
              </div>

              {/* ส่วนข้อมูล (ขวา) */}
              <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
                  
                  <div className="mb-6">
                      <h3 className="text-emerald-600 font-bold text-sm tracking-widest uppercase mb-2">
                        ผู้สมัครรับเลือกตั้ง
                      </h3>
                      <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-2 leading-tight">
                        {currentCandidate.name}
                      </h1>
                      <div className="h-1.5 w-20 bg-emerald-500 rounded-full mx-auto md:mx-0"></div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-10">
                      <div className="bg-slate-100 text-slate-700 px-5 py-2 rounded-lg font-medium border border-slate-200">
                        🎓 คณะ{currentCandidate.faculty}
                      </div>
                      {/* ถ้ามีตำแหน่ง position ก็แสดงตรงนี้ได้ */}
                  </div>

                  {/* ปุ่มดูนโยบาย */}
                  <button
                    onClick={() => setShowPolicyModal(true)}
                    className="group bg-gradient-to-r from-emerald-600 to-green-500 text-white text-lg py-4 px-8 rounded-2xl font-bold shadow-lg shadow-emerald-200
                               hover:shadow-emerald-300 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 w-full md:w-fit"
                  >
                    <span>อ่านวิสัยทัศน์ & นโยบาย</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </button>
              </div>
            </div>

            {/* ================= ปุ่มเลื่อนขวา ================= */}
            <button
              onClick={nextCandidate}
              className="absolute right-2 md:-right-16 top-1/2 -translate-y-1/2 z-20
                         w-10 h-10 md:w-14 md:h-14 bg-white/80 md:bg-white backdrop-blur-sm rounded-full shadow-lg text-slate-600 
                         hover:bg-emerald-50 hover:text-emerald-600 hover:scale-110 transition-all flex items-center justify-center border border-slate-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-8">
                {candidates.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => {
                            setDirection(idx > currentIndex ? 'next' : 'prev');
                            setCurrentIndex(idx);
                        }}
                        className={`h-3 rounded-full transition-all duration-300 
                            ${idx === currentIndex ? 'w-8 bg-emerald-500 shadow-emerald-200 shadow-md' : 'w-3 bg-slate-300 hover:bg-slate-400'}`}
                    />
                ))}
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
             <div className="text-xl text-gray-400 animate-pulse">กำลังโหลดข้อมูลผู้สมัคร...</div>
          </div>
        )}

        {/* ================= Modal นโยบาย ================= */}
        {showPolicyModal && currentCandidate && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
            {/* คลิกพื้นหลังเพื่อปิด */}
            <div className="absolute inset-0" onClick={() => setShowPolicyModal(false)}></div>
            
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in relative z-10">
              
              <div className="bg-gradient-to-r from-emerald-700 to-green-600 p-6 text-white flex justify-between items-center shadow-md">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold backdrop-blur-sm">
                        {currentCandidate.candidateId}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold leading-tight">{currentCandidate.name}</h3>
                        <p className="opacity-90 text-sm">คณะ{currentCandidate.faculty}</p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setShowPolicyModal(false)} 
                    className="text-white/70 hover:text-white hover:bg-white/20 rounded-full p-1 transition"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
              </div>

              <div className="p-8 overflow-y-auto bg-slate-50 flex-1">
                 <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 pb-3 border-b border-slate-200">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                    นโยบายการบริหาร
                 </h4>
                 
                 {currentCandidate.policies && currentCandidate.policies.length > 0 ? (
                     <ul className="space-y-4">
                        {currentCandidate.policies.map((policy, index) => (
                            <li key={index} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <span className="flex-shrink-0 w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold border border-emerald-100">
                                    {index + 1}
                                </span>
                                <span className="text-slate-700 text-base leading-relaxed">{policy}</span>
                            </li>
                        ))}
                     </ul>
                 ) : (
                     <div className="flex flex-col items-center justify-center text-gray-400 py-10 gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 opacity-50">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <p>ยังไม่มีข้อมูลนโยบาย</p>
                     </div>
                 )}
              </div>
              
              {/* Footer Modal */}
              <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                  <button 
                    onClick={() => setShowPolicyModal(false)}
                    className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                  >
                    ปิดหน้าต่าง
                  </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default Candidates;