import { useState , useEffect} from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ResetPassword() {
  useEffect(() => {
      document.title = "ตั้งรหัสผ่านใหม่ | KUVote";
    }, []);  
  const { id, token } = useParams(); // รับค่าจาก URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ State สำหรับปุ่มดูรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ 1. ตรวจสอบเงื่อนไขรหัสผ่าน (Regex)
    // ^ = เริ่มต้น
    // (?=.*[a-z]) = ต้องมีตัวเล็กอย่างน้อย 1
    // (?=.*[A-Z]) = ต้องมีตัวใหญ่อย่างน้อย 1
    // .{8,} = ความยาวรวมต้อง 8 ตัวขึ้นไป
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return Swal.fire({
        icon: 'warning',
        title: 'รหัสผ่านไม่ปลอดภัย',
        text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และต้องมีตัวพิมพ์ใหญ่ (A-Z) และตัวพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว',
        confirmButtonColor: '#f59e0b' // สีส้ม warning
      });
    }

    if (password !== confirmPassword) {
      return Swal.fire("ข้อผิดพลาด", "รหัสผ่านใหม่ไม่ตรงกัน", "error");
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/reset-password/${id}/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'สำเร็จ!',
          text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว กรุณาเข้าสู่ระบบใหม่',
          confirmButtonColor: '#10b981'
        });
        navigate("/login");
      } else {
        Swal.fire('ผิดพลาด', data.message || 'ลิงก์หมดอายุหรือใช้งานไม่ได้', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'ไม่สามารถเชื่อมต่อ Server ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-200">
        
        <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">ตั้งรหัสผ่านใหม่</h1>
            <p className="text-slate-500 text-sm mt-2">กรุณากรอกรหัสผ่านใหม่ของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* รหัสผ่านใหม่ */}
            <div>
                <label className="text-sm font-semibold text-slate-700">รหัสผ่านใหม่</label>
                <div className="relative group">
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 mt-1 pr-10"
                        placeholder="ขั้นต่ำ 8 ตัว (A-Z, a-z)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {/* ปุ่มดูรหัส */}
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 focus:outline-none mt-1"
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" /><path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" /><path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.702 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" /></svg>
                        )}
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-1">ต้องมีตัวพิมพ์ใหญ่ (A-Z) และเล็ก (a-z) อย่างน้อย 1 ตัว</p>
            </div>
            
            {/* ยืนยันรหัสผ่าน */}
            <div>
                <label className="text-sm font-semibold text-slate-700">ยืนยันรหัสผ่านใหม่</label>
                <div className="relative group">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 mt-1 pr-10"
                        placeholder="กรอกให้ตรงกัน"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {/* ปุ่มดูรหัส */}
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-600 focus:outline-none mt-1"
                    >
                         {showConfirmPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" /><path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" /><path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.702 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" /></svg>
                        )}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg mt-4 transition-all"
            >
                {loading ? "กำลังบันทึก..." : "ยืนยันการเปลี่ยนรหัส"}
            </button>
        </form>
      </div>
    </div>
  );
}