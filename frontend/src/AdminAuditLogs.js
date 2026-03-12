import { useEffect, useState } from "react";
import Layout from "./components/Layout";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [actorFilter, setActorFilter] = useState("");

  const token = localStorage.getItem("token");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      if (actionFilter.trim()) params.set("action", actionFilter.trim());
      if (actorFilter.trim()) params.set("actor", actorFilter.trim());

      const res = await fetch(`${API_BASE}/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "โหลด Audit Log ไม่สำเร็จ");
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch audit logs error:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

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
    if (!logs.length) return;

    const headers = [
      "createdAt",
      "actorEmail",
      "actorRole",
      "action",
      "targetType",
      "targetId",
      "status",
      "details",
    ];

    const rows = logs.map((log) => {
      const d = log.createdAt ? new Date(log.createdAt) : null;
      return [
      d && !isNaN(d) ? d.toISOString() : "",
      log.actorEmail || "",
      log.actorRole || "",
      log.action || "",
      log.targetType || "",
      log.targetId || "",
      log.status || "",
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Filter Action</label>
              <input
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5"
                placeholder="เช่น admin.toggle_election"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Filter Actor (email)</label>
              <input
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2.5"
                placeholder="เช่น @ku.th"
              />
            </div>

            <button
              type="button"
              onClick={fetchLogs}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              ค้นหา
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={!logs.length}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">ยังไม่มี Audit Log</div>
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
                  {logs.map((log) => (
                    <tr key={log._id} className="border-b border-slate-100 align-top hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{log.actorEmail || "-"}</div>
                        <div className="text-xs text-slate-500">{log.actorRole || "-"}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{log.action || "-"}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <div>{log.targetType || "-"}</div>
                        <div className="text-xs text-slate-500">{log.targetId || "-"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                            log.status === "success"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.status || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 max-w-[420px]">{formatDetails(log.details)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
