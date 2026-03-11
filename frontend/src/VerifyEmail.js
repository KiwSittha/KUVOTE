import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    // 1. ส่ง Token ไปตรวจสอบที่ Server
    fetch(`http://localhost:8000/verify-email/${token}`)
      .then((res) => {
        if (res.ok) {
          setStatus("success");
          // 2. ถ้าสำเร็จ รอ 3 วินาที แล้วเด้งไปหน้า Login
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-teal-700 p-4 font-sans relative overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400 rounded-full blur-[150px] opacity-30 animate-pulse"></div>
      
      <div className="relative z-10 bg-white/95 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-xl text-center">
        
        {/* === สถานะ: กำลังโหลด === */}
        {status === "loading" && (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-slate-800">กำลังตรวจสอบข้อมูล...</h2>
            <p className="text-slate-500 mt-2 text-sm">กรุณารอสักครู่ ระบบกำลังยืนยันตัวตนของคุณ</p>
          </div>
        )}

        {/* === สถานะ: สำเร็จ === */}
        {status === "success" && (
          <div className="animate-bounce-in">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-emerald-200">
              🎉
            </div>
            <h2 className="text-2xl font-bold text-emerald-700 mb-2">ยืนยันอีเมลสำเร็จ!</h2>
            <p className="text-slate-600 mb-6 text-sm">
              บัญชีของคุณพร้อมใช้งานแล้ว<br />
              <span className="text-emerald-500 text-xs">(กำลังพากลับไปหน้าเข้าสู่ระบบ...)</span>
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              เข้าสู่ระบบทันที
            </button>
          </div>
        )}

        {/* === สถานะ: ล้มเหลว === */}
        {status === "error" && (
          <div className="animate-shake">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-red-200">
              ❌
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">ยืนยันไม่สำเร็จ</h2>
            <p className="text-slate-600 mb-6 text-sm">
              ลิงก์อาจหมดอายุ หรือบัญชีถูกยืนยันไปแล้ว<br />
              กรุณาลองใหม่อีกครั้ง
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
            >
              กลับหน้าหลัก
            </button>
          </div>
        )}

      </div>
      
      {/* Footer Credit */}
      <div className="absolute bottom-4 text-xs text-green-100/60 text-center w-full">
        © 2026 KU Vote System. Kasetsart University.
      </div>
    </div>
  );
}

export default VerifyEmail;