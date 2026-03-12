import { useEffect, useState } from "react";
import Layout from "./components/Layout";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]); // ✅ เพิ่ม state สำหรับเก็บข้อมูลที่กรองแล้ว
  const [loading, setLoading] = useState(true);
  
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // ✅ เพิ่ม state สำหรับกรอง User/Admin

  const token = localStorage.getItem("token");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // ✅ เปลี่ยน API Endpoint เป็นอันใหม่ที่เพิ่งสร้าง
      const res = await fetch(`${API_BASE}/admin/logs?limit=500`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "โหลด Audit Log ไม่สำเร็จ");
      
      // ✅ ดึงข้อมูลจาก data.logs 
      const fetchedLogs = Array.isArray(data.logs) ? data.logs : [];
      setLogs(fetchedLogs);
      setFilteredLogs(fetchedLogs);
    } catch (error) {
      console.error("Fetch audit logs error:", error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // ✅ ฟังก์ชันสำหรับกรองข้อมูลเมื่อกดปุ่ม "ค้นหา"
  const handleFilter = () => {
    let result = logs;

    if (actionFilter.trim()) {
      result = result.filter((log) => 
        log.action && log.action.toLowerCase().includes(actionFilter.toLowerCase())
      );
    }

    if (actorFilter.trim()) {
      result = result.filter((log) => 
        log.actorEmail && log.actorEmail.toLowerCase().includes(actorFilter.toLowerCase())
      );
    }

    if (roleFilter) {
      result = result.filter((log) => log.actorRole === roleFilter);
    }

    setFilteredLogs(result);
  };

  const formatDetails = (details) => {
    if (!details || typeof details !== "object") return "-";
    const entries = Object.entries(details);
    if (entries.length === 0) return "-";

    return entries
      .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
      .join(" | ");
  };

  const escapeCsv = (value) => {
    const str = value == null ? "" : String(value);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = () => {
    if (!filteredLogs.length) return;

    const headers = [
      "timestamp",
      "actorEmail",
      "actorRole",
      "action",
      "targetType",
      "targetId",
      "status",
      "details",
    ];

    const rows = filteredLogs.map((log) => {
      // ✅ เปลี่ยนจาก createdAt เป็น timestamp
      const d = log.timestamp ? new Date(log.timestamp) : null;
      
      // คำนวณสถานะคร่าวๆ จากชื่อ Action
      const isFailed = log.action && (log.action.includes("FAILED") || log.action.includes("ERROR"));
      const displayStatus = isFailed ? "failed" : "success";

      return [
        d && !isNaN(d) ? d.toISOString() : "",
        log.actorEmail || "",
        log.actorRole || "",
        log.action || "",
        log.targetType || "",
        log.targetId || "",
        displayStatus,
        formatDetails(log.details),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateTag = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `audit-logs-${dateTag}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 font-['Kanit']">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-800">Audit Log</h1>
          <p className="text-slate-500 mt-1">บันทึกการใช้งานเพื่อการตรวจสอบย้อนหลัง</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 mb-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Filter Action</label>
              <input
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                placeholder="เช่น USER_LOGIN"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Filter Actor (Email)</label>
              <input
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                placeholder="เช่น @ku.th"
              />
            </div>

            {/* ✅ เพิ่ม Dropdown เลือก Role */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">สิทธิ์ (Role)</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white"
              >
                <option value="">ทั้งหมด</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="md:col-span-1 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleFilter}
                className="w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
              >
                ค้นหา
              </button>
            </div>
          </div>
          
          <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
             <button
                type="button"
                onClick={handleExportCsv}
                disabled={!filteredLogs.length}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                📥 Export CSV
              </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">ยังไม่มี Audit Log หรือไม่พบข้อมูลที่ค้นหา</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-slate-700">เวลา</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-700">ผู้กระทำ</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-700">Action</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-700">Target</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-700">Status</th>
                    <th className="text-left px-4 py-3 font-bold text-slate-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => {
                    const isFailed = log.action && (log.action.includes("FAILED") || log.action.includes("ERROR"));
                    
                    return (
                    <tr key={log._id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString("th-TH") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{log.actorEmail || "-"}</div>
                        <div className={`text-xs font-bold inline-block px-2 py-0.5 rounded-full mt-1 ${log.actorRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                          {log.actorRole ? log.actorRole.toUpperCase() : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700 font-bold">{log.action || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-semibold">{log.targetType || "-"}</div>
                        <div className="text-[10px] text-slate-400 max-w-[120px] truncate" title={log.targetId}>{log.targetId || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            !isFailed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {!isFailed ? "SUCCESS" : "FAILED"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[300px] whitespace-pre-wrap break-words">{formatDetails(log.details)}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}