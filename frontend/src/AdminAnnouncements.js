import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import Layout from "./components/Layout";
import { Bell, AlertTriangle, CheckCircle, Info, Pin, X, Calendar } from "lucide-react";

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

  const handleDeactivate = async (id) => {
    const result = await Swal.fire({
      title: "ปิดประกาศนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ปิดประกาศ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE}/admin/announcements/${id}/deactivate`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "ปิดประกาศไม่สำเร็จ");

      Swal.fire("สำเร็จ", "ปิดประกาศเรียบร้อย", "success");
      fetchAnnouncements();
    } catch (err) {
      Swal.fire("ผิดพลาด", err.message, "error");
    }
  };

  const typeColor = (t) => {
    if (t === "warning") return "bg-amber-50 text-amber-700 border-2 border-amber-200 hover:bg-amber-100";
    if (t === "success") return "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100";
    return "bg-sky-50 text-sky-700 border-2 border-sky-200 hover:bg-sky-100";
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 md:p-8 font-['Kanit']">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                <Bell className="text-white text-2xl" size={28} />
              </div>
              <h1 className="text-4xl font-black text-slate-800">จัดการประกาศแจ้งเตือน</h1>
            </div>
            <p className="text-slate-500 ml-16">สร้างและจัดการประกาศสำคัญสำหรับผู้ลงคะแนน</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 mb-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-500 rounded"></div>
              สร้างประกาศใหม่
            </h2>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="text-emerald-600 text-xs" size={16} />
                หัวข้อประกาศ
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                placeholder="เช่น แจ้งเตือน: ปิดโหวตเวลา 18:00 น."
              />
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Info className="text-emerald-600 text-xs" size={16} />
                รายละเอียด
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
                placeholder="พิมพ์รายละเอียดที่ต้องการแจ้งนักศึกษา"
              />
            </div>

            {/* Type, Date, Pinned Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type Select */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">ประเภท</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all bg-white font-medium text-slate-700"
                >
                  <option value="info">📢 ข้อมูลทั่วไป</option>
                  <option value="warning">⚠️ แจ้งเตือนสำคัญ</option>
                  <option value="success">✅ ประกาศผล/สำเร็จ</option>
                </select>
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="text-sm text-emerald-600" size={16} />
                  วันหมดอายุประกาศ
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Pinned Checkbox */}
              <div className="flex items-end">
                <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 cursor-pointer hover:text-emerald-600 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-200 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <Pin className="text-emerald-600" size={16} />
                    ปักหมุดประกาศนี้
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-center"
            >
              <Bell className="text-lg" size={20} />
              {loading ? "กำลังบันทึก..." : "เผยแพร่ประกาศ"}
            </button>
          </form>

          {/* Announcements List Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-500 rounded"></div>
              รายการประกาศล่าสุด
            </h2>

            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  <Bell className="text-3xl text-slate-400" size={40} />
                </div>
                <p className="text-slate-500 font-medium">ยังไม่มีประกาศ</p>
                <p className="text-slate-400 text-sm mt-1">สร้างประกาศแรกของคุณด้านบน</p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((a) => (
                  <div key={a._id} className="group border-2 border-slate-100 hover:border-emerald-200 rounded-xl p-5 transition-all hover:shadow-md hover:bg-gradient-to-br hover:from-emerald-50 hover:to-transparent">
                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 ${typeColor(a.type)}`}>
                        {a.type === "warning" && <AlertTriangle size={14} />}
                        {a.type === "success" && <CheckCircle size={14} />}
                        {a.type === "info" && <Info size={14} />}
                        {a.type === "warning" && "แจ้งเตือนสำคัญ"}
                        {a.type === "success" && "ประกาศผล/สำเร็จ"}
                        {a.type === "info" && "ข้อมูลทั่วไป"}
                      </span>
                      {a.isPinned && (
                        <span className="text-xs px-3 py-1 rounded-full font-bold border-2 border-purple-200 bg-purple-50 text-purple-700 flex items-center gap-1">
                          <Pin className="text-xs" size={12} />
                          ปักหมุด
                        </span>
                      )}
                      {!a.isActive && (
                        <span className="text-xs px-3 py-1 rounded-full font-bold border-2 border-slate-200 bg-slate-50 text-slate-600 flex items-center gap-1">
                          <X className="text-xs" size={12} />
                          ปิดแล้ว
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <p className="font-bold text-lg text-slate-800 mb-2">{a.title}</p>
                    <p className="text-slate-600 whitespace-pre-wrap text-sm leading-relaxed">{a.message}</p>

                    {/* Meta */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <span>📝 {a.createdBy || "admin"}</span>
                        <span>•</span>
                        <span>{new Date(a.createdAt).toLocaleString("th-TH")}</span>
                      </p>

                      {a.isActive && (
                        <button
                          onClick={() => handleDeactivate(a._id)}
                          className="px-4 py-1.5 rounded-lg text-sm bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-100 hover:border-red-300 font-bold transition-all flex items-center gap-1"
                        >
                          <X size={16} /> ปิดประกาศ
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
