import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Layout({ children }) {
  const [open, setOpen] = useState(window.innerWidth > 768);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    fetchUser();

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setOpen(true);
      } else {
        setOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [location.pathname]);

  useEffect(() => {
    if (window.innerWidth <= 768) {
      setOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 md:hidden 
          ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      ></div>

      {/* ================= Sidebar ================= */}
      <aside
        className={`
          fixed md:relative z-40 h-full flex flex-col text-white shadow-2xl transition-all duration-300 ease-in-out
          bg-gradient-to-b from-emerald-800 to-green-600
          ${open ? "translate-x-0 w-72" : "-translate-x-full w-72 md:translate-x-0 md:w-20"}
        `}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${!open && "md:w-0 md:opacity-0"}`}>
            <span className="text-2xl font-bold tracking-wide whitespace-nowrap drop-shadow-md">
              KUVote
            </span>
          </div>
          
          <button
            onClick={() => setOpen(!open)}
            className="hidden md:block p-2 rounded-lg hover:bg-white/10 transition-colors text-emerald-100 ml-auto"
          >
            {open ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              </svg>
            )}
          </button>
          
          <button onClick={() => setOpen(false)} className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-emerald-100 ml-auto">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <MenuItem open={open} to="/" icon="🏠" text="หน้าหลัก" active={location.pathname === "/"} />
          <MenuItem open={open} to={user ? "/candidates" : "/login"} icon="👥" text="ผู้สมัคร" active={location.pathname === "/candidates"} />
          <MenuItem open={open} to={user ? "/vote" : "/login"} icon="🗳️" text="ลงคะแนนเสียง" active={location.pathname === "/vote"} />
          <MenuItem open={open} to={user ? "/dashboard" : "/login"} icon="📊" text="ผลการเลือกตั้ง" active={location.pathname === "/dashboard"} />
        </nav>

        {/* Footer Credit */}
        <div className={`p-6 text-xs text-emerald-100/60 text-center transition-all duration-500 shrink-0 ${!open && "md:opacity-0 md:translate-y-10"}`}>
            <p>© 2026 KU Vote System</p>
        </div>
      </aside>

      {/* ================= Main Content Area ================= */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative bg-slate-50">
        
        {/* Header */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 border-b border-slate-100 shrink-0">
          
          {/* Left Side: Hamburger & Logo */}
          <div className="flex items-center gap-3 md:gap-4">
             <button 
                onClick={() => setOpen(true)}
                className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
             >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
             </button>

             <div className={`transition-all duration-500 ease-in-out transform ${!open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none md:opacity-0"}`}>
                <Link to="/" className="flex items-center gap-2">
                   <span className="text-xl md:text-2xl font-black tracking-tight text-slate-700">
                      <span className="text-emerald-600">KU</span>Vote
                   </span>
                </Link>
             </div>
          </div>

          {/* Right Side: User Info & Status */}
          <div className="flex items-center gap-3 md:gap-6 animate-fade-in">
            {user ? (
                <div className="flex items-center gap-3 md:gap-4">
                    
                    {/* ✅ ส่วนแสดงสถานะ: ปรับให้โชว์ตลอด (ลบ hidden) และปรับขนาดให้ใหญ่ขึ้น */}
                    <div className="flex flex-col items-end md:items-end">
                         {/* สถานะการโหวต */}
                        <div className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm font-bold transition-all
                            ${user.hasVoted 
                                ? "bg-slate-100 text-slate-500 border-slate-200" 
                                : "bg-amber-100 text-amber-700 border-amber-200 ring-2 ring-amber-50"
                            }
                        `}>
                             <span className={`w-2 h-2 rounded-full ${user.hasVoted ? "bg-slate-400" : "bg-amber-500 animate-pulse"}`}></span>
                             <span className="text-xs md:text-sm whitespace-nowrap">
                                {user.hasVoted ? "ใช้สิทธิ์แล้ว" : "ยังไม่ใช้สิทธิ์"}
                             </span>
                        </div>

                        {/* ชื่ออีเมล/คณะ: ซ่อนในมือถือ เพื่อประหยัดที่ (hidden md:block) */}
                        <div className="hidden md:flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500">{user.email}</span>
                            <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                {user.faculty}
                            </span>
                        </div>
                    </div>
                    
                    <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                    {/* ปุ่ม Logout: มือถือโชว์แค่ไอคอน, คอมโชว์ข้อความ */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-2 py-2 md:px-4 md:py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 
                                   hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200 
                                   transition-all duration-300 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        <span className="hidden md:inline font-medium text-sm">Logout</span>
                    </button>
                </div>
            ) : (
                <Link
                  to="/login"
                  className="group relative px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/60 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-400 group-hover:scale-105 transition-transform duration-500"></div>
                  <div className="relative flex items-center gap-2">
                    <span>เข้าสู่ระบบ</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function MenuItem({ open, to, icon, text, active }) {
  return (
    <Link
      to={to}
      className={`
        flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden
        ${active 
            ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/10" 
            : "text-emerald-100 hover:bg-white/5 hover:text-white"}
        ${open ? "justify-start gap-4" : "justify-center md:justify-center"}
      `}
    >
      {active && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.8)]"></div>
      )}

      <span className={`text-xl transition-transform duration-300 z-10 ${active ? "scale-110 drop-shadow-md" : "group-hover:scale-110"}`}>
        {icon}
      </span>
      
      <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 z-10 
          ${open ? "w-auto opacity-100" : "w-0 opacity-0 md:w-0 md:opacity-0"}`}>
        {text}
      </span>

      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
    </Link>
  );
}