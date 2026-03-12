import React, { useState, useEffect } from "react";
import Layout from "./components/Layout"; 
import Swal from "sweetalert2"; // ✅ ใช้ SweetAlert เพื่อความสวยงาม

const AdminDashboard = () => {
  const [electionOpen, setElectionOpen] = useState(false);
  const [savedElectionOpen, setSavedElectionOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // ดึง Token จาก LocalStorage
  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:8000"; 

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ==========================================
  // โหลดข้อมูลเริ่มต้นตอนเปิดหน้า
  // ==========================================
  useEffect(() => {
    fetchElectionStatus();
  }, []);

  const fetchElectionStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/election-status`);
      const data = await res.json();
      setElectionOpen(data.isOpen);
      setSavedElectionOpen(data.isOpen);
      if (data.startTime) setStartTime(data.startTime);
      if (data.endTime) setEndTime(data.endTime);
    } catch (err) {
      console.error("Error fetching status:", err);
    } finally {
      setInitialLoad(false);
    }
  };

  const getElectionStatus = () => {
    const now = new Date();
    if (!electionOpen) return { label: "ระงับโดย Admin", color: "bg-slate-100 text-slate-600 border-slate-300" };
    if (!startTime || !endTime) return { label: "ยังไม่ตั้งค่าเวลา", color: "bg-yellow-100 text-yellow-700 border-yellow-300" };
    if (now < new Date(startTime)) return { label: "ยังไม่เริ่ม", color: "bg-blue-100 text-blue-700 border-blue-300" };
    if (now > new Date(endTime)) return { label: "สิ้นสุดแล้ว", color: "bg-rose-100 text-rose-700 border-rose-300" };
    return { label: "กำลังดำเนินการ 🗳️", color: "bg-emerald-100 text-emerald-700 border-emerald-300" };
  };

  // ==========================================
  // บันทึกการตั้งค่าลง Database
  // ==========================================
  const toggleElection = async () => {
    if (!startTime || !endTime) {
      Swal.fire('กรุณากรอกข้อมูล', 'โปรดระบุเวลาเปิดและปิดหีบก่อนบันทึก', 'warning');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      Swal.fire('เวลาไม่ถูกต้อง', 'เวลาปิดหีบต้องมากกว่าเวลาเปิดหีบ', 'warning');
      return;
    }
    const result = await Swal.fire({
      title: 'ยืนยันการตั้งค่า?',
      text: "ระบบจะใช้เวลาและสถานะที่คุณกำหนดในการเปิด-ปิดหีบเลือกตั้ง",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#047857',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'ใช่, บันทึกเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });

      const res = await fetch(`${API_URL}/admin/toggle-election`, {
        method: "POST",
        headers,
        body: JSON.stringify({ isOpen: electionOpen, startTime, endTime }), 
      });
      const data = await res.json();
      
      if (res.ok) {
        setSavedElectionOpen(electionOpen);
        Swal.fire('สำเร็จ!', data.message, 'success');
      } else {
        Swal.fire('เกิดข้อผิดพลาด', data.message, 'error');
      }
    } catch (err) {
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI Components
  // ==========================================
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 px-4 pb-24 animate-fade-in-up">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">ตั้งค่าระบบเลือกตั้ง</h1>
          <p className="text-slate-500 mt-2">จัดการเวลาเปิด-ปิด และสวิตช์ควบคุมระบบโหวต</p>
          {!initialLoad && (
            <div className="mt-4 inline-flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border ${getElectionStatus().color}`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
                สถานะ: {getElectionStatus().label}
              </span>
            </div>
          )}
        </div>

        {initialLoad ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            
            {/* โซนตั้งเวลา */}
            <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">🗓️</span> กำหนดเวลาทำการ
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* กล่องเวลาเปิด */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 relative overflow-hidden group hover:border-emerald-300 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <label className="block text-sm font-bold text-emerald-700 uppercase tracking-wide mb-2">
                    เวลาเปิดหีบ (Start Time)
                  </label>
                  <input 
                    type="datetime-local" 
                    value={startTime} 
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-2">* ระบบจะเริ่มเปิดให้โหวตเมื่อถึงเวลานี้</p>
                </div>

                {/* กล่องเวลาปิด */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 relative overflow-hidden group hover:border-rose-300 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                  <label className="block text-sm font-bold text-rose-700 uppercase tracking-wide mb-2">
                    เวลาปิดหีบ (End Time)
                  </label>
                  <input 
                    type="datetime-local" 
                    value={endTime} 
                    min={startTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-2">* ระบบจะตัดสิทธิ์การโหวตอัตโนมัติเมื่อถึงเวลานี้</p>
                </div>
              </div>
            </div>

            {/* โซน Manual Switch */}
            <div className="p-6 md:p-10">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">⚙️</span> สวิตช์ควบคุมระบบฉุกเฉิน (Manual Override)
              </h2>
              
              <div className={`p-6 rounded-2xl border-2 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6
                ${electionOpen ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}
              >
                <div className="text-center md:text-left">
                  <h3 className={`text-lg font-bold mb-1 ${electionOpen ? "text-emerald-800" : "text-rose-800"}`}>
                    {electionOpen ? "ระบบเปิดใช้งานตามปกติ" : "ระบบถูกระงับชั่วคราว!"}
                  </h3>
                  <p className={`text-sm ${electionOpen ? "text-emerald-600" : "text-rose-600"}`}>
                    {electionOpen 
                      ? "นิสิตสามารถลงคะแนนได้ตามเวลาทำการที่กำหนดไว้ด้านบน" 
                      : "นิสิตทุกคนไม่สามารถลงคะแนนได้ แม้จะอยู่ในเวลาทำการก็ตาม"}
                  </p>
                  {electionOpen !== savedElectionOpen && (
                    <p className="text-xs text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                      <span>⚠️</span> มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
                    </p>
                  )}
                </div>

                {/* ปุ่ม Toggle */}
                <button
                  onClick={() => setElectionOpen(!electionOpen)}
                  className={`relative inline-flex h-12 w-24 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 shadow-inner
                    ${electionOpen ? 'bg-emerald-500' : 'bg-slate-300'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
                >
                  <span className="sr-only">Toggle Election Status</span>
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-10 w-10 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out
                      ${electionOpen ? 'translate-x-6' : '-translate-x-6'}`}
                  />
                </button>
              </div>
            </div>

            {/* ปุ่ม Save */}
            <div className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
              <button 
                onClick={toggleElection}
                disabled={loading}
                className={`group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-slate-800 rounded-xl focus:outline-none focus:ring-4 focus:ring-slate-300 shadow-lg shadow-slate-900/20 w-full md:w-auto
                  ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-900'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {loading ? "กำลังบันทึกข้อมูล..." : "บันทึกการตั้งค่าระบบ"}
              </button>
            </div>

          </div>
        )}

      </div>
    </Layout>
  );
};

export default AdminDashboard;