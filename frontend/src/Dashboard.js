import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [summary, setSummary] = useState({ 
    totalVerified: 0, 
    voted: 0, 
    notVoted: 0,
    votersByYear: {},
    votersByFaculty: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const candidatesRes = await fetch(`${API_BASE_URL}/candidates`);
        const candidatesData = await candidatesRes.json();
        const summaryRes = await fetch(`${API_BASE_URL}/stats/vote-summary`);
        const summaryData = await summaryRes.json();

        setCandidates(candidatesData);
        setSummary(summaryData);
        setError(null);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลได้");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // เรียงลำดับจากคะแนนมากไปน้อย
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const maxFacultyVoters = Math.max(...Object.values(summary.votersByFaculty || { a: 1 }));

  // สร้าง Array จัดลำดับโพเดียม (ซ้าย=อันดับ2, กลาง=อันดับ1, ขวา=อันดับ3)
  const top3 = sorted.slice(0, 3);
  const podiumDisplay = [];
  if (top3[1]) podiumDisplay.push({ c: top3[1], rank: 2, badgeColor: 'bg-white text-slate-500 border-2 border-slate-300' });
  if (top3[0]) podiumDisplay.push({ c: top3[0], rank: 1, badgeColor: 'bg-yellow-400 text-slate-900 border-none' });
  if (top3[2]) podiumDisplay.push({ c: top3[2], rank: 3, badgeColor: 'bg-white text-orange-600 border-2 border-orange-500' });

  const FACULTIES_INFO = [
    { id: 'eng', name: 'คณะวิศวกรรมศาสตร์ศรีราชา', icon: '⚙️', color: '#D12E2E' },
    { id: 'ms', name: 'คณะวิทยาการจัดการ', icon: '📊', color: '#0095D9' },
    { id: 'sci', name: 'คณะวิทยาศาสตร์ ศรีราชา', icon: '🧪', color: '#4B2C84' },
    { id: 'ims', name: 'คณะพาณิชยนาวีนานาชาติ', icon: '⚓', color: '#1A5D3A' },
    { id: 'econ', name: 'คณะเศรษฐศาสตร์ ศรีราชา', icon: '💰', color: '#5FB646' },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#1A5D3A] text-white">กำลังโหลด...</div>;

  return (
    <Layout>
      {/* ✅ เปลี่ยนพื้นหลังหน้าเว็บทั้งหมดเป็นสีเขียวเข้ม #1A5D3A */}
      <div className="font-['Kanit'] min-h-screen pb-20 bg-[#1A5D3A]">
        
        {/* HEADER & PODIUM */}
        <div className="relative w-full bg-gradient-to-b from-[#154a2e] to-[#1A5D3A] pb-10">
            <div className="pt-8 pb-80 md:pb-96 text-center text-white">
                <h3 className="text-xl font-light tracking-[0.2em] text-emerald-200">KU SRC ELECTION</h3>
                <h1 className="text-3xl md:text-5xl font-bold mt-2 font-['Kanit'] text-white drop-shadow-lg">ผลการเลือกตั้งประธานนิสิต <br /> มก. วิทยาเขตศรีราชา</h1>
            </div>
            
            <div className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center items-end gap-4 md:gap-8">
                {podiumDisplay.map(({ c, rank, badgeColor }) => (
                    <div key={c._id} className="relative flex flex-col items-center group">
                        <img 
                            src={c.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate${c.candidateId || c.number}`} 
                            className={`object-cover rounded-3xl shadow-2xl bg-white transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 ${rank === 1 ? 'w-40 h-40 md:w-56 md:h-56 z-20 border-4 border-yellow-400' : 'w-32 h-32 md:w-44 md:h-44 opacity-95 hover:opacity-100 z-10'}`} 
                            alt={c.name} 
                        />
                        <div className={`absolute -top-4 -right-4 font-black w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg text-lg md:text-2xl z-30 ${badgeColor}`}>
                            {c.candidateId || c.number}
                        </div>
                        <div className={`mt-4 bg-black/50 backdrop-blur-md text-white px-4 py-1.5 rounded-full font-medium border border-white/20 truncate shadow-lg ${rank === 1 ? 'text-sm md:text-base max-w-[150px] md:max-w-[200px]' : 'text-xs md:text-sm max-w-[120px] md:max-w-[150px]'}`}>
                            {c.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* CONTROL BAR (สถิติผู้มาใช้สิทธิ์) */}
        <div className="bg-[#1E293B] text-white py-4 px-4 shadow-2xl sticky top-0 z-40 border-b-4 border-emerald-500">
             <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                <div className="flex w-full justify-between items-center px-2 md:px-10">
                    <div className="text-center"><span className="block text-slate-400 text-[10px] md:text-xs uppercase font-bold mb-1">ผู้มีสิทธิ์ทั้งหมด</span><span className="font-bold text-emerald-400 text-xl md:text-3xl">{summary.totalVerified.toLocaleString()}</span></div>
                    <div className="w-px h-10 bg-slate-600"></div>
                    <div className="text-center"><span className="block text-slate-400 text-[10px] md:text-xs uppercase font-bold mb-1">มาใช้สิทธิ์แล้ว</span><span className="font-bold text-pink-400 text-xl md:text-3xl drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]">{summary.voted.toLocaleString()}</span></div>
                    <div className="w-px h-10 bg-slate-600"></div>
                    <div className="text-center"><span className="block text-slate-400 text-[10px] md:text-xs uppercase font-bold mb-1">ยังไม่ใช้สิทธิ์</span><span className="font-bold text-slate-300 text-xl md:text-3xl">{summary.notVoted.toLocaleString()}</span></div>
                </div>
            </div>
        </div>

        {/* MAIN CONTENT SCROLL */}
        <div className="max-w-4xl mx-auto mt-12 px-4 space-y-16">
            
            {/* ================= 1. คะแนนผู้สมัครทั้งหมด ================= */}
            <div className="flex flex-col items-center space-y-6 w-full animate-fade-in-up">
                {/* ✅ เปลี่ยนสีหัวข้อเป็นสีขาวให้ตัดกับพื้นหลังสีเขียว */}
                <h2 className="text-2xl font-black text-white text-center border-b-2 border-emerald-400 pb-2 inline-block drop-shadow-md">สรุปผลคะแนนเรียงตามลำดับ</h2>
                
                {/* แถบ Realtime Bar 3 อันดับแรก */}
                <div className="w-full flex rounded-2xl overflow-hidden shadow-2xl h-24 md:h-32 bg-[#0f3822] border border-white/10">
                    {sorted.slice(0, 3).map((c, idx) => (
                        <div key={c._id} className={`${["bg-[#FACC15]", "bg-[#EF4444]", "bg-[#3B82F6]"][idx]} flex items-center justify-center text-white relative flex-1 border-r border-black/20 last:border-0 shadow-inner`}>
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/20 text-white backdrop-blur-sm flex items-center justify-center font-black text-sm md:text-xl shadow-inner border border-white/40">
                                    <span>{c.candidateId || c.number}</span>
                                </div>
                                <span className="text-3xl md:text-5xl font-black drop-shadow-md">{c.votes.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ตารางพรรคที่เหลือ */}
                {sorted.length > 3 && (
                    <div className="w-full flex flex-col gap-3 mt-4">
                        {sorted.slice(3).map((c) => (
                            <div key={c._id} className="bg-white p-3 md:p-4 rounded-xl shadow-lg border-b-4 border-emerald-600 flex items-center gap-4 hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-800 text-white flex items-center justify-center font-black text-lg shadow-inner">
                                    {c.candidateId || c.number}
                                </div>
                                <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between min-w-0">
                                    <div className="text-sm md:text-base font-bold text-slate-800 truncate mb-1 md:mb-0">
                                        {c.name}
                                    </div>
                                    <div className="text-emerald-700 font-black text-xl md:text-2xl">
                                        {c.votes.toLocaleString()} <span className="text-xs font-bold text-slate-400">คะแนน</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ================= 2. สถิติแบ่งตามชั้นปี ================= */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-b-8 border-emerald-600 max-w-4xl mx-auto animate-fade-in-up delay-100">
                <h2 className="text-2xl font-black text-slate-800 mb-8 text-center border-b-2 border-slate-100 pb-4">สถิติผู้มาใช้สิทธิ์แยกตามชั้นปี</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(year => {
                        const voters = summary.votersByYear?.[year] || 0;
                        const percentage = summary.voted > 0 ? ((voters / summary.voted) * 100).toFixed(1) : 0;
                        
                        // แสดงเฉพาะชั้นปีที่มีคนโหวต (ซ่อนปี 5-8 ถ้าเป็น 0 เพื่อความสวยงาม)
                        if (year > 4 && voters === 0) return null;

                        return (
                            <div key={year} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group hover:border-emerald-300 transition-colors shadow-sm hover:shadow-md">
                                <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                <h3 className="text-sm font-bold text-slate-500 z-10 uppercase tracking-wider">ชั้นปีที่ {year}</h3>
                                <div className="text-4xl font-black text-emerald-600 my-2 z-10 drop-shadow-sm">{voters.toLocaleString()}</div>
                                <div className="w-full bg-slate-200 h-2 rounded-full mt-1 z-10">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                </div>
                                <div className="text-[10px] text-slate-500 mt-2 font-bold z-10">{percentage}% ของทั้งหมด</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ================= 3. สถิติแบ่งตามคณะ ================= */}
            <div className="bg-white p-8 rounded-3xl shadow-2xl border-b-8 border-emerald-600 max-w-4xl mx-auto animate-fade-in-up delay-200">
                <h2 className="text-2xl font-black text-slate-800 mb-8 text-center border-b-2 border-slate-100 pb-4">จำนวนผู้มาใช้สิทธิ์แต่ละคณะ</h2>
                <div className="space-y-5">
                    {FACULTIES_INFO.map((faculty) => {
                        const voters = summary.votersByFaculty?.[faculty.id] || 0;
                        return (
                            <div key={faculty.id} className="flex flex-col sm:flex-row sm:items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all gap-4 shadow-sm hover:shadow-md">
                                <div className="flex items-center gap-4 w-full sm:w-1/3">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-white shadow-md shrink-0" style={{ backgroundColor: faculty.color }}>
                                        {faculty.icon}
                                    </div>
                                    <span className="font-bold text-slate-700 text-sm md:text-base leading-tight">{faculty.name}</span>
                                </div>
                                
                                <div className="flex-1 flex items-center gap-4 w-full">
                                    <div className="flex-1 h-5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className="h-full transition-all duration-1000 ease-out" 
                                            style={{ width: `${(voters / (maxFacultyVoters || 1)) * 100}%`, backgroundColor: faculty.color }}
                                        ></div>
                                    </div>
                                    <div className="w-24 text-right flex flex-col items-end">
                                        <span className="text-2xl font-black text-slate-800 leading-none">{voters.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">คน</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;