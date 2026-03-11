import React, { useState, useEffect, useCallback } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import Layout from "./components/Layout";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

const CANDIDATE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#e11d48",
  "#0ea5e9",
];

const FACULTIES_INFO = [
  { id: "eng", name: "วิศวกรรมศาสตร์ ศรีราชา", icon: "⚙️", color: "#D12E2E" },
  { id: "ms", name: "วิทยาการจัดการ", icon: "📊", color: "#0095D9" },
  { id: "sci", name: "วิทยาศาสตร์ ศรีราชา", icon: "🧪", color: "#4B2C84" },
  { id: "ims", name: "พาณิชยนาวีนานาชาติ", icon: "⚓", color: "#1A5D3A" },
  { id: "econ", name: "เศรษฐศาสตร์ ศรีราชา", icon: "💰", color: "#5FB646" },
];

// ======== Circular Gauge for Turnout ========
function TurnoutGauge({ pct }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" className="rotate-[-90deg]">
        {/* track */}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="18"
        />
        {/* progress */}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-4xl font-black text-emerald-600">{pct}%</p>
        <p className="text-xs text-slate-500 font-semibold mt-1">Voter Turnout</p>
      </div>
    </div>
  );
}

export default function ElectionResults() {
  const [candidates, setCandidates] = useState([]);
  const [summary, setSummary] = useState({
    totalVerified: 0,
    voted: 0,
    notVoted: 0,
    votersByYear: {},
    votersByFaculty: {},
  });
  const [electionStatus, setElectionStatus] = useState({ isOpen: false, endTime: null });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [activeChart, setActiveChart] = useState("bar"); // 'bar' | 'pie'

  const fetchData = useCallback(async () => {
    try {
      const [candRes, summRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/candidates`),
        fetch(`${API_BASE}/stats/vote-summary`),
        fetch(`${API_BASE}/election-status`),
      ]);
      const candData = await candRes.json();
      const summData = await summRes.json();
      const statusData = await statusRes.json();

      const approved = candData
        .filter((c) => c.status === "approved")
        .sort((a, b) => b.votes - a.votes);

      setCandidates(approved);
      setSummary(summData);
      setElectionStatus(statusData);
      setLastUpdated(new Date());
      setCountdown(30);
    } catch (e) {
      console.error("ElectionResults fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Countdown ticker
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const totalVotes = candidates.reduce((s, c) => s + (c.votes || 0), 0);
  const turnoutPct =
    summary.totalVerified > 0
      ? parseFloat(((summary.voted / summary.totalVerified) * 100).toFixed(1))
      : 0;
  const maxFaculty = Math.max(1, ...Object.values(summary.votersByFaculty || {}));

  // ---- Chart Data ----
  const barData = {
    labels: candidates.map((c) => `เบอร์ ${c.candidateId}`),
    datasets: [
      {
        label: "คะแนนเสียง",
        data: candidates.map((c) => c.votes || 0),
        backgroundColor: candidates.map(
          (_, i) => CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]
        ),
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.raw || 0;
            const pct = totalVotes > 0 ? ((v / totalVotes) * 100).toFixed(1) : 0;
            return ` ${v.toLocaleString()} คะแนน (${pct}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { font: { family: "Kanit" } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: "Kanit", weight: "bold" } },
      },
    },
  };

  const doughnutData = {
    labels: candidates.map((c) => `เบอร์ ${c.candidateId} ${c.name}`),
    datasets: [
      {
        data: candidates.map((c) => c.votes || 0),
        backgroundColor: candidates.map(
          (_, i) => CANDIDATE_COLORS[i % CANDIDATE_COLORS.length]
        ),
        borderWidth: 3,
        borderColor: "#fff",
        hoverOffset: 12,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { family: "Kanit", size: 13 },
          padding: 16,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = ctx.raw || 0;
            const pct = totalVotes > 0 ? ((v / totalVotes) * 100).toFixed(1) : 0;
            return ` ${v.toLocaleString()} คะแนน — ${pct}%`;
          },
        },
      },
    },
  };

  const turnoutDoughnut = {
    datasets: [
      {
        data: [summary.voted, Math.max(0, summary.notVoted)],
        backgroundColor: ["#10b981", "#e2e8f0"],
        borderWidth: 0,
        hoverOffset: 0,
      },
    ],
  };

  const turnoutDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#1A5D3A] text-white gap-4">
        <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-semibold tracking-widest">กำลังโหลดผลการเลือกตั้ง...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="font-['Kanit'] min-h-screen bg-slate-50 pb-20">

        {/* ===== HERO HEADER ===== */}
        <div className="bg-gradient-to-br from-[#1A5D3A] via-[#1e7049] to-[#0f4a2e] text-white">
          <div className="max-w-7xl mx-auto px-4 py-12 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <span className={`inline-block w-2 h-2 rounded-full ${electionStatus.isOpen ? "bg-green-400 animate-pulse" : "bg-slate-400"}`} />
              {electionStatus.isOpen ? "กำลังนับคะแนน Live" : "ปิดหีบเลือกตั้งแล้ว"}
              <span className="text-white/60 ml-2">· รีเฟรชใน {countdown}s</span>
            </div>

            <p className="text-emerald-300 text-sm tracking-[0.3em] font-medium uppercase mb-2">
              Kasetsart University Sriracha Campus
            </p>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              ผลการเลือกตั้ง <br className="md:hidden" />
              <span className="text-emerald-300">ประธานนิสิต</span>
            </h1>
            <p className="text-sm text-white/60 mt-3">
              อัปเดตล่าสุด:{" "}
              {lastUpdated
                ? lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                : "—"}
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="border-t border-white/10 bg-black/20">
            <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-3 divide-x divide-white/10 text-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-300 mb-1">ผู้มีสิทธิ์</p>
                <p className="text-2xl md:text-3xl font-black">{summary.totalVerified.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-300 mb-1">ใช้สิทธิ์แล้ว</p>
                <p className="text-2xl md:text-3xl font-black text-emerald-400">{summary.voted.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-300 mb-1">Turnout</p>
                <p className="text-2xl md:text-3xl font-black text-yellow-300">{turnoutPct}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div className="max-w-7xl mx-auto px-4 mt-8 space-y-8">

          {/* === ROW 1: Turnout + Chart Toggle === */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Voter Turnout Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center">
              <h2 className="text-lg font-bold text-slate-700 mb-4">Voter Turnout</h2>

              {/* Custom Gauge SVG */}
              <TurnoutGauge pct={turnoutPct} />

              <div className="w-full mt-6 space-y-3">
                {/* Mini doughnut */}
                <div className="relative h-32">
                  <Doughnut data={turnoutDoughnut} options={turnoutDoughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-emerald-600">{summary.voted.toLocaleString()}</span>
                    <span className="text-xs text-slate-400">คน</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-slate-600">ใช้สิทธิ์ {summary.voted.toLocaleString()} คน</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-200 inline-block" />
                    <span className="text-slate-400">ยังไม่ใช้ {summary.notVoted.toLocaleString()} คน</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                    style={{ width: `${turnoutPct}%` }}
                  />
                </div>
                <p className="text-center text-xs text-slate-500">
                  จากผู้มีสิทธิ์ทั้งหมด {summary.totalVerified.toLocaleString()} คน
                </p>
              </div>
            </div>

            {/* Vote Distribution Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-700">สัดส่วนคะแนนเสียง</h2>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveChart("bar")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeChart === "bar" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
                  >
                    📊 Bar
                  </button>
                  <button
                    onClick={() => setActiveChart("pie")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeChart === "pie" ? "bg-white shadow text-slate-900" : "text-slate-500"}`}
                  >
                    🥧 Pie
                  </button>
                </div>
              </div>

              {candidates.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
                  ยังไม่มีข้อมูลผู้สมัครที่ได้รับการอนุมัติ
                </div>
              ) : (
                <div className="h-72 md:h-80">
                  {activeChart === "bar" ? (
                    <Bar data={barData} options={barOptions} />
                  ) : (
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                  )}
                </div>
              )}

              {totalVotes > 0 && (
                <p className="text-center text-xs text-slate-400 mt-3">
                  คะแนนรวมทั้งหมด {totalVotes.toLocaleString()} คะแนน
                </p>
              )}
            </div>
          </div>

          {/* === ROW 2: Candidate Ranking === */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🏆</span>
              <h2 className="text-xl font-black text-slate-800">ผลคะแนนรายผู้สมัคร</h2>
              <span className="ml-auto text-xs text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                เรียงตามคะแนน
              </span>
            </div>

            {candidates.length === 0 ? (
              <p className="text-center text-slate-400 py-10">ยังไม่มีข้อมูลผู้สมัคร</p>
            ) : (
              <div className="space-y-4">
                {candidates.map((c, idx) => {
                  const pct = totalVotes > 0 ? ((c.votes || 0) / totalVotes) * 100 : 0;
                  const color = CANDIDATE_COLORS[idx % CANDIDATE_COLORS.length];
                  const isWinner = idx === 0 && (c.votes || 0) > 0 && !electionStatus.isOpen;
                  const rankLabel = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;

                  return (
                    <div
                      key={c._id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        isWinner
                          ? "border-yellow-300 bg-yellow-50 shadow-md"
                          : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      {/* Rank */}
                      <div className="text-xl w-8 text-center shrink-0">{rankLabel}</div>

                      {/* Photo */}
                      <img
                        src={
                          c.profileImage ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate${c.candidateId}`
                        }
                        alt={c.name}
                        className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-xs font-black text-white px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: color }}
                          >
                            เบอร์ {c.candidateId}
                          </span>
                          <span className="font-bold text-slate-800 text-sm md:text-base truncate">
                            {c.name}
                          </span>
                          {c.partyName && (
                            <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                              พรรค {c.partyName}
                            </span>
                          )}
                          {isWinner && (
                            <span className="text-xs font-bold text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full">
                              ✨ ชนะการเลือกตั้ง
                            </span>
                          )}
                        </div>

                        {/* Progress bar */}
                        <div className="mt-2.5 flex items-center gap-3">
                          <div className="flex-1 h-3 bg-white border border-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-500 w-12 text-right whitespace-nowrap">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Vote count */}
                      <div className="text-right shrink-0">
                        <p className="text-2xl md:text-3xl font-black" style={{ color }}>
                          {(c.votes || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">คะแนน</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total votes summary */}
            {totalVotes > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap justify-between items-center gap-4 text-sm text-slate-500">
                <span>คะแนนรวม: <strong className="text-slate-800">{totalVotes.toLocaleString()} คะแนน</strong></span>
                <div className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
                  <span>🔗</span>
                  <span>Verified by Sepolia Blockchain</span>
                </div>
              </div>
            )}
          </div>

          {/* === ROW 3: Voter Turnout by Year === */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl font-black text-slate-800">ผู้ใช้สิทธิ์แยกตามชั้นปี</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((year) => {
                const v = summary.votersByYear?.[year] || 0;
                const pct = summary.voted > 0 ? ((v / summary.voted) * 100).toFixed(1) : 0;
                return (
                  <div
                    key={year}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-60" />
                    <p className="text-xs text-slate-500 font-semibold relative z-10">ชั้นปีที่ {year}</p>
                    <p className="text-3xl font-black text-emerald-700 my-2 relative z-10">
                      {v.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400 relative z-10 mb-2">คน</p>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden relative z-10">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 relative z-10">{pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* === ROW 4: Voter Turnout by Faculty === */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🏛️</span>
              <h2 className="text-xl font-black text-slate-800">ผู้ใช้สิทธิ์แยกตามคณะ</h2>
            </div>
            <div className="space-y-4">
              {FACULTIES_INFO.map((fac) => {
                const v = summary.votersByFaculty?.[fac.id] || 0;
                const barPct = maxFaculty > 0 ? (v / maxFaculty) * 100 : 0;
                return (
                  <div key={fac.id} className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xl text-white shadow-sm"
                      style={{ backgroundColor: fac.color }}
                    >
                      {fac.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm font-semibold text-slate-700 mb-1.5">
                        <span className="truncate mr-2">{fac.name}</span>
                        <span className="shrink-0 font-black" style={{ color: fac.color }}>
                          {v.toLocaleString()} คน
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${barPct}%`, backgroundColor: fac.color }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* === FOOTER NOTE === */}
          <div className="text-center text-xs text-slate-400 pb-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span>🔗</span>
              <span>
                ข้อมูลคะแนนเสียงทั้งหมดถูกบันทึกบน{" "}
                <a
                  href="https://sepolia.etherscan.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 underline"
                >
                  Sepolia Blockchain
                </a>{" "}
                เพื่อความโปร่งใสและตรวจสอบได้
              </span>
            </div>
            <p>© 2026 KUVote — Kasetsart University Sriracha Campus Election System</p>
          </div>

        </div>
      </div>
    </Layout>
  );
}
