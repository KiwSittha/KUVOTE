import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Layout from "./components/Layout";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AdminAnnouncements() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [isPinned, setIsPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  const token = localStorage.getItem("token");

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "โหลดประกาศไม่สำเร็จ");
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณากรอกหัวข้อและรายละเอียดประกาศ", "warning");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/announcements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          type,
          isPinned,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "สร้างประกาศไม่สำเร็จ");

      Swal.fire("สำเร็จ", "ประกาศถูกเผยแพร่แล้ว", "success");
      setTitle("");
      setMessage("");
      setType("info");
      setIsPinned(false);
      setExpiresAt("");
      fetchAnnouncements();
    } catch (err) {
      Swal.fire("ผิดพลาด", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ เปลี่ยนจากปิดประกาศ เป็นลบประกาศออกจาก Database
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "ลบประกาศนี้?",
      text: "ประกาศนี้จะถูกลบออกจากระบบอย่างถาวร!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/admin/announcements/${id}`, {
        method: "DELETE", // ✅ เปลี่ยนเป็น DELETE
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ลบประกาศไม่สำเร็จ");

      Swal.fire("สำเร็จ", "ลบประกาศเรียบร้อย", "success");
      fetchAnnouncements();
    } catch (err) {
      Swal.fire("ผิดพลาด", err.message, "error");
    }
  };

  const typeColor = (t) => {
    if (t === "warning") return "bg-amber-100 text-amber-700 border-amber-200";
    if (t === "success") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-sky-100 text-sky-700 border-sky-200";
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 md:p-8 font-['Kanit']">
        <h1 className="text-3xl font-black text-slate-800 mb-6">จัดการประกาศแจ้งเตือน</h1>

        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-4">
          {/* ส่วนฟอร์มเหมือนเดิมทุกประการ... */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">หัวข้อประกาศ</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="เช่น แจ้งเตือน: ปิดโหวตเวลา 18:00 น."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">รายละเอียด</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="พิมพ์รายละเอียดที่ต้องการแจ้งนักศึกษา"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ประเภท</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5"
              >
                <option value="info">ข้อมูลทั่วไป</option>
                <option value="warning">แจ้งเตือนสำคัญ</option>
                <option value="success">ประกาศผล/สำเร็จ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">วันหมดอายุประกาศ</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5"
              />
            </div>

            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4"
                />
                ปักหมุดประกาศนี้
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-60"
          >
            {loading ? "กำลังบันทึก..." : "เผยแพร่ประกาศ"}
          </button>
        </form>

        <div className="mt-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6">
          <h2 className="text-xl font-black text-slate-800 mb-4">รายการประกาศล่าสุด</h2>

          {announcements.length === 0 ? (
            <p className="text-slate-500">ยังไม่มีประกาศ</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a._id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${typeColor(a.type)}`}>
                      {a.type || "info"}
                    </span>
                    {a.isPinned && (
                      <span className="text-xs px-2 py-1 rounded-full border border-purple-200 bg-purple-100 text-purple-700 font-semibold">
                        ปักหมุด
                      </span>
                    )}
                    {/* ✅ เอาเงื่อนไขที่เช็คว่าปิดแล้วออก เพราะลบถาวรไปเลย */}
                  </div>

                  <p className="font-bold text-slate-800">{a.title}</p>
                  <p className="text-slate-600 mt-1 whitespace-pre-wrap">{a.message}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    สร้างโดย {a.createdBy || "admin"} · {new Date(a.createdAt).toLocaleString("th-TH")}
                  </p>

                  {/* ✅ เปลี่ยนปุ่มเป็น ลบประกาศ และลบเงื่อนไข a.isActive ออก */}
                  <button
                    onClick={() => handleDelete(a._id)}
                    className="mt-3 px-3 py-1.5 rounded-lg text-sm bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 flex items-center gap-1"
                  >
                    🗑️ ลบประกาศ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}