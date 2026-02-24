import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    faculty: "",
    loginPassword: "",
    votePin: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "votePin" && !/^\d*$/.test(value)) return;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const validateForm = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!passwordRegex.test(form.loginPassword)) {
      return "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และมี A-Z และ a-z";
    }

    if (!/^\d{6}$/.test(form.votePin)) {
      return "รหัสโหวตต้องเป็นตัวเลข 6 หลักเท่านั้น";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/register/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "สมัครไม่สำเร็จ");
        setLoading(false);
        return;
      }

      setSuccess("สมัครสำเร็จ! กรุณายืนยันตัวตนผ่านอีเมล");
      setError("");
      
      setTimeout(() => {
        navigate("/login");
      }, 5000);

    } catch {
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      if(!success) setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-green-700 via-emerald-600 to-teal-700 relative overflow-hidden font-sans py-6 px-4">
      
      {/* ================= Background Decoration ================= */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-emerald-400 rounded-full blur-[100px] md:blur-[150px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-green-300 rounded-full blur-[100px] md:blur-[150px] opacity-20 animate-pulse delay-1000"></div>

      {/* ================= Main Card ================= */}
      <div className="relative z-10 bg-white/95 w-full max-w-[500px] p-6 md:p-10 rounded-3xl shadow-2xl shadow-green-900/20 border border-white/50 backdrop-blur-xl animate-fade-in-up">
        
        {/* ปุ่มย้อนกลับหน้าแรก */}
        <Link to="/" className="absolute top-4 left-4 text-slate-400 hover:text-emerald-600 transition-colors p-2 rounded-full hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </Link>

        {/* Header */}
        <div className="text-center mb-6 md:mb-8 mt-4">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">
            ลงทะเบียน <span className="text-emerald-600">สมาชิกใหม่</span>
          </h1>
          <p className="text-slate-500 text-xs md:text-sm">กรอกข้อมูลเพื่อสร้างบัญชีสำหรับใช้สิทธิ์เลือกตั้ง</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center text-center animate-bounce-in">
             <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-2">
                🎉
             </div>
             <h3 className="text-emerald-800 font-bold text-lg">ลงทะเบียนสำเร็จ!</h3>
             <p className="text-emerald-600 text-sm mt-1">{success}</p>
             <p className="text-slate-400 text-xs mt-3">กำลังพาไปหน้าเข้าสู่ระบบ...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 md:p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-sm text-red-600 font-medium">{error}</span>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Email */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">อีเมลมหาวิทยาลัย (@ku.th)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ex. somchai.j@ku.th"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm md:text-base"
                />
              </div>
            </div>

            {/* 2. Faculty */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">คณะสังกัด</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
                <select
                  name="faculty"
                  value={form.faculty}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 appearance-none text-sm md:text-base"
                >
                  <option value="">กรุณาเลือกคณะ</option>
                  <option value="เศรษฐศาสตร์">คณะเศรษฐศาสตร์</option>
                  <option value="พาณิชยนาวีนานาชาติ">คณะพาณิชยนาวีนานาชาติ</option>
                  <option value="วิทยาการจัดการ">คณะวิทยาการจัดการ</option>
                  <option value="วิทยาศาสตร์">คณะวิทยาศาสตร์</option>
                  <option value="วิศวกรรมศาสตร์">คณะวิศวกรรมศาสตร์</option>
                </select>
                {/* Custom Arrow Icon */}
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
              </div>
            </div>

            {/* 3. Password */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">ตั้งรหัสผ่านเข้าสู่ระบบ</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 4.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <input
                  name="loginPassword"
                  type="password"
                  placeholder="ขั้นต่ำ 8 ตัวอักษร (A-Z, a-z)"
                  value={form.loginPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400 text-sm md:text-base"
                />
              </div>
              <p className="text-xs text-slate-400 ml-1">* ต้องมีตัวพิมพ์ใหญ่และพิมพ์เล็กอย่างน้อย 1 ตัว</p>
            </div>

            {/* 4. Vote Pin */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 ml-1">ตั้งรหัส Vote PIN (6 หลัก)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <input
                  name="votePin"
                  type="text"
                  maxLength={6}
                  placeholder="สำหรับใช้ยืนยันตอนกดโหวต"
                  value={form.votePin}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400 tracking-widest text-sm md:text-base"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-3.5 px-4 mt-4 rounded-xl text-white font-bold text-base md:text-lg shadow-lg shadow-emerald-200/50
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
                    กำลังบันทึกข้อมูล...
                </span>
              ) : "สมัครสมาชิก"}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="mt-6 md:mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-500 text-sm">
            มีบัญชีอยู่แล้ว?{" "}
            <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-all">
              เข้าสู่ระบบ
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

export default Register;