import React, { useState, useEffect } from "react";
import Layout from "./components/Layout"; 
import Swal from "sweetalert2"; 

const AdminDashboard = () => {
  const [electionOpen, setElectionOpen] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const token = localStorage.getItem("token");
  const API_URL = "http://localhost:8000"; 

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchElectionStatus();
  }, []);

  const fetchElectionStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/election-status`);
      const data = await res.json();
      setElectionOpen(data.isOpen);
      if (data.startTime) setStartTime(data.startTime);
      if (data.endTime) setEndTime(data.endTime);
    } catch (err) {
      console.error("Error fetching status:", err);
    } finally {
      setInitialLoad(false);
    }
  };

  const toggleElection = async () => {
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
      const res = await fetch(`${API_URL}/admin/toggle-election`, {
        method: "POST",
        headers,
        body: JSON.stringify({ isOpen: electionOpen, startTime, endTime }), 
      });
      const data = await res.json();
      
      if (res.ok) {
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

  // ✅ ฟังก์ชันใหม่: เรียกใช้ API รีเซ็ตระบบ ( Reset System )
  const handleResetSystem = async () => {
    const result = await Swal.fire({
      title: '⚠️ รีเซ็ตระบบเลือกตั้งใหม่?',
      html: `
        <div class="text-left text-sm space-y-2">
          <p class="text-red-600 font-bold">การกระทำนี้ไม่สามารถย้อนคืนได้!</p>
          <ul class="list-disc pl-5">
            <li>คืนสิทธิ์ให้นิสิตทุกคนกลับมาโหวตได้ใหม่</li>
            <li>ลบรายชื่อผู้สมัครเดิมทั้งหมด</li>
            <li>รีเซ็ตเบอร์ผู้สมัครกลับไปเริ่มที่ 1</li>
          </ul>
          <p class="mt-2 text-slate-500 font-semibold text-center">** อย่าลืม Deploy Contract ใหม่หลังกดปุ่มนี้ **</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ยืนยัน ล้างข้อมูลทั้งหมด!',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      Swal.fire({ title: 'กำลังล้างข้อมูล...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

      const res = await fetch(`${API_URL}/admin/reset-election`, {
        method: "POST",
        headers
      });

      const data = await res.json();
      if (res.ok) {
        await Swal.fire({
          title: 'รีเซ็ตสำเร็จ!',
          text: data.message,
          icon: 'success'
        });
        window.location.reload(); // รีเฟรชเพื่ออัปเดตสถานะหน้าจอ
      } else {
        Swal.fire('ผิดพลาด', data.error, 'error');
      }
    } catch (error) {
      Swal.fire('ผิดพลาด', 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 px-4 pb-24 animate-fade-in-up">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">ตั้งค่าระบบเลือกตั้ง</h1>
          <p className="text-slate-500 mt-2">จัดการเวลาเปิด-ปิด และสวิตช์ควบคุมระบบโหวต</p>
        </div>

        {initialLoad ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🗓️</span> กำหนดเวลาทำการ
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
                  </div>

                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 relative overflow-hidden group hover:border-rose-300 transition-colors">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                    <label className="block text-sm font-bold text-rose-700 uppercase tracking-wide mb-2">
                      เวลาปิดหีบ (End Time)
                    </label>
                    <input 
                      type="datetime-local" 
                      value={endTime} 
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-10">
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="text-2xl">⚙️</span> สวิตช์ควบคุมระบบฉุกเฉิน
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
                  </div>

                  <button
                    onClick={() => setElectionOpen(!electionOpen)}
                    className={`relative inline-flex h-12 w-24 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none shadow-inner
                      ${electionOpen ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`pointer-events-none inline-block h-10 w-10 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out
                        ${electionOpen ? 'translate-x-6' : '-translate-x-6'}`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
                <button 
                  onClick={toggleElection}
                  disabled={loading}
                  className="group relative inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all duration-300 bg-slate-800 rounded-xl hover:bg-slate-900 shadow-lg shadow-slate-900/20 w-full md:w-auto"
                >
                  {loading ? "กำลังบันทึกข้อมูล..." : "บันทึกการตั้งค่าระบบ"}
                </button>
              </div>
            </div>

            {/* ✅ ส่วนที่เพิ่มใหม่: Dangerous Zone (รีเซ็ตสำหรับการเลือกตั้งใหม่) */}
            <div className="bg-white rounded-3xl shadow-xl border border-red-100 overflow-hidden mt-12">
               <div className="bg-red-50 p-4 border-b border-red-100">
                  <h2 className="text-red-700 font-black flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.401 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                    DANGEROUS ZONE: เตรียมการเลือกตั้งรอบใหม่
                  </h2>
               </div>
               <div className="p-6 md:p-8 space-y-4">
                  <p className="text-slate-600 text-sm md:text-base">
                    หากคุณต้องการล้างฐานข้อมูลเดิมเพื่อเริ่มการเลือกตั้งใหม่ (Reset ทุกอย่างใน MongoDB) กรุณาใช้ปุ่มด้านล่าง 
                    <br/><span className="text-red-500 font-bold">* ข้อมูลผู้สมัครและสถานะการโหวตของนิสิตจะถูกลบทิ้งทั้งหมด *</span>
                  </p>
                  
                  <div className="flex justify-center">
                    <button 
                      onClick={handleResetSystem}
                      disabled={loading}
                      className="px-8 py-3 bg-white text-red-600 border-2 border-red-600 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all duration-300 shadow-md flex items-center gap-2"
                    >
                      🔄 รีเซ็ตสิทธิ์และลบข้อมูลเดิมทั้งหมด
                    </button>
                  </div>
               </div>
               <div className="bg-slate-50 p-3 text-center">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    KU VOTE MANAGEMENT SYSTEM v2.0
                  </p>
               </div>
            </div>

          </div>
        )}

      </div>
    </Layout>
  );
};

export default AdminDashboard;