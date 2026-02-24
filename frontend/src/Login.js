import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, loginPassword: password }),
      });

      const data = await res.json();

      if (res.status === 404) setError("ไม่พบอีเมลนี้ในระบบ");
      else if (res.status === 403) setError("กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
      else if (res.status === 401) setError("รหัสผ่านไม่ถูกต้อง");
      else if (!res.ok) setError("เข้าสู่ระบบไม่สำเร็จ");
      else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      }
    } catch (err) {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ ปรับพื้นหลัง: ไล่เฉดสีเขียวเข้มไปเขียวมรกต
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-teal-700 relative overflow-hidden font-sans p-4">
      
      {/* ================= Background Decoration ================= */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-emerald-400 rounded-full blur-[100px] md:blur-[150px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-green-300 rounded-full blur-[100px] md:blur-[150px] opacity-20 animate-pulse delay-1000"></div>

      {/* ================= Main Card ================= */}
      <div className="relative z-10 bg-white/95 w-full max-w-[420px] p-6 md:p-10 rounded-3xl shadow-2xl shadow-green-900/20 border border-white/50 backdrop-blur-xl animate-fade-in-up">
        
        {/* ปุ่มย้อนกลับหน้าแรก (เพิ่มใหม่) */}
        <Link to="/" className="absolute top-4 left-4 text-slate-400 hover:text-emerald-600 transition-colors p-2 rounded-full hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </Link>

        {/* Header: Logo & Title */}
        <div className="text-center mb-6 md:mb-8 mt-2">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-emerald-50 rounded-2xl mb-4 shadow-sm text-2xl md:text-3xl border border-emerald-100">
            🗳️
          </div>
          
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-1">
            <span className="text-emerald-600">KU</span>Vote
          </h1>
          
          <p className="text-slate-500 text-xs md:text-sm font-medium">ระบบเลือกตั้งประธานนิสิต มก.</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 md:p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-sm text-red-600 font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          
          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">อีเมลมหาวิทยาลัย</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400 text-sm md:text-base"
                placeholder="ex. somchai.j@ku.th"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 ml-1">รหัสผ่าน</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 4.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400 text-sm md:text-base"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3.5 px-4 rounded-xl text-white font-bold text-base md:text-lg shadow-lg shadow-emerald-200/50
              transition-all duration-300 transform
              ${loading 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 hover:-translate-y-1 hover:shadow-xl"
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 md:mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm">
            ยังไม่มีบัญชีผู้ใช้งาน?{" "}
            <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-all">
              ลงทะเบียนใหม่
            </Link>
          </p>
        </div>
      </div>
      
      {/* Footer Credit */}
      <div className="absolute bottom-4 text-xs text-green-100/60 text-center w-full">
        © 2026 KU Vote System. Kasetsart University.
      </div>

    </div>
  );
}