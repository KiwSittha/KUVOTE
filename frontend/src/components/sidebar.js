import { Link, useNavigate } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ล้างข้อมูล login
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // ปิด sidebar (มือถือ)
    setOpen(false);

    // ไปหน้า login
    navigate("/login");
  };

  return (
    <>
      {/* Overlay (มือถือ) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:static z-50
          w-64 h-full bg-green-500 text-white
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo */}        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <MenuItem open={open} to="/" icon="🏠" text="หน้าหลัก" active={location.pathname === "/"} />
          <MenuItem open={open} to={user ? "/candidates" : "/login"} icon="👥" text="ผู้สมัคร" active={location.pathname === "/candidates"} />
          <MenuItem open={open} to={user ? "/vote" : "/login"} icon="🗳️" text="ลงคะแนนเสียง" active={location.pathname === "/vote"} />
          <MenuItem open={open} to={user ? "/dashboard" : "/login"} icon="📊" text="ผลการเลือกตั้ง" active={location.pathname === "/dashboard"} />
          {/* ADD THIS LINE: */}
          <MenuItem open={open} to="/community" icon="💬" text="ชุมชน" active={location.pathname === "/community"} />
        </nav>        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          <MenuItem open={open} to="/" icon="🏠" text="หน้าหลัก" active={location.pathname === "/"} />
          <MenuItem open={open} to={user ? "/candidates" : "/login"} icon="👥" text="ผู้สมัคร" active={location.pathname === "/candidates"} />
          <MenuItem open={open} to={user ? "/vote" : "/login"} icon="🗳️" text="ลงคะแนนเสียง" active={location.pathname === "/vote"} />
          <MenuItem open={open} to={user ? "/dashboard" : "/login"} icon="📊" text="ผลการเลือกตั้ง" active={location.pathname === "/dashboard"} />
          {/* ADD THIS LINE: */}
          <MenuItem open={open} to="/community" icon="💬" text="ชุมชน" active={location.pathname === "/community"} />
        </nav>
        <div className="p-6 font-bold text-xl border-b border-green-400">
          KUVote
        </div>

        {/* Menu */}
        <nav className="px-4 py-4 space-y-2 flex-1">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 rounded hover:bg-green-600"
          >
            🏠 Home
          </Link>

          <Link
            to="/vote"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 rounded hover:bg-green-600"
          >
            🗳 Vote
          </Link>

          <Link
            to="/Dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 rounded hover:bg-green-600"
          >
            📊 Live Results
          </Link>
          <Link
  to="/community"
  onClick={() => setOpen(false)}
  className="block px-4 py-2 rounded hover:bg-green-600"
>
  💬 ชุมชน
</Link>
        </nav>

        {/* Logout */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2
                       px-4 py-2 rounded bg-red-500 hover:bg-red-600
                       transition font-semibold"
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}
