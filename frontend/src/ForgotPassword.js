import { useState , useEffect} from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function ForgotPassword() {
  useEffect(() => {
      document.title = "ลืมรหัสผ่าน | KUVote";
    }, []);  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 1. ตรวจสอบอีเมล @ku.th ก่อน
    const emailValue = email.trim().toLowerCase();
    if (!emailValue.endsWith("@ku.th")) {
      Swal.fire({
        icon: 'warning',
        title: 'รูปแบบอีเมลไม่ถูกต้อง',
        text: 'กรุณาใช้อีเมลมหาวิทยาลัย (@ku.th) เท่านั้น',
        confirmButtonColor: '#ef4444'
      });
      return; // หยุดการทำงาน ไม่ส่งไป Server
    }

    setLoading(true);

    try {
      // ✅ ส่ง emailValue ที่ตัดช่องว่างและทำตัวเล็กแล้วไป
      const res = await fetch("http://localhost:8000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'ตรวจสอบอีเมล',
          text: 'เราได้ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปที่อีเมลของคุณแล้ว (หากไม่เจอโปรดเช็คใน Junk Mail)',
          confirmButtonColor: '#10b981'
        });
      } else {
        Swal.fire('Error', data.message || 'เกิดข้อผิดพลาด', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-teal-700 p-4 font-sans">
      <div className="bg-white/95 w-full max-w-[420px] p-8 rounded-3xl shadow-2xl backdrop-blur-xl animate-fade-in-up">
        
        <Link to="/login" className="text-slate-400 hover:text-emerald-600 flex items-center gap-1 mb-6 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </Link>

        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-50 rounded-full mb-4 shadow-sm text-2xl border border-amber-100">
                🔑
            </div>
            <h1 className="text-2xl font-bold text-slate-800">ลืมรหัสผ่าน?</h1>
            <p className="text-slate-500 text-sm mt-2">กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="text-sm font-semibold text-slate-700 ml-1">อีเมลมหาวิทยาลัย</label>
                <div className="relative">
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mt-1 pl-10"
                        placeholder="example@ku.th"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                     <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                    </div>
                </div>
                {/* ข้อความช่วยเตือน */}
                <p className="text-[10px] text-slate-400 ml-1 mt-1">ต้องลงท้ายด้วย @ku.th เท่านั้น</p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:bg-slate-400"
            >
                {loading ? "กำลังส่งข้อมูล..." : "ส่งลิงก์รีเซ็ต"}
            </button>
        </form>
      </div>
    </div>
  );
}