import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function getResultImage(candidate) {
    return candidate?.mediaImages?.result || candidate?.mediaImages?.campaign || candidate?.mediaImages?.profile || candidate?.profileImage || "";
}

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

  const [activeTab, setActiveTab] = useState("automatic");

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
      <div className={`font-['Kanit'] min-h-screen pb-20 transition-colors ${activeTab === 'automatic' ? 'bg-[#1A5D3A]' : 'bg-[#F3F4F6]'}`}>
        
        {/* HEADER */}
        <div className="relative w-full bg-gradient-to-r from-[#1A5D3A] to-[#2E8B57] pb-10">
            {/* เพิ่ม pb-80 (มือถือ) และ pb-96 (หน้าจอใหญ่) เพื่อดันพื้นสีเขียวลงมา ให้มีที่ว่างมากขึ้น */}
            <div className="pt-8 pb-80 md:pb-96 text-center text-white">
                <h3 className="text-xl font-light tracking-[0.2em]">KU SRC ELECTION</h3>
                <h1 className="text-3xl md:text-5xl font-bold mt-2 font-['Kanit']">ผลการเลือกตั้งประธานนิสิต <br /> มก. วิทยาเขตศรีราชา</h1>
            </div>
            
            {/* เปลี่ยนจาก bottom-14 เป็น bottom-6 md:bottom-10 เพื่อขยับรูปให้ต่ำลงมาอีก */}
            <div className="absolute bottom-6 md:bottom-10 left-0 right-0 flex justify-center items-end gap-4 md:gap-8">
                {podiumDisplay.map(({ c, rank, badgeColor }) => (
                    <div key={c._id} className="relative flex flex-col items-center group">
                        <img 
                            src={getResultImage(c) || `https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate${c.candidateId || c.number}`} 
                            className={`object-cover rounded-3xl shadow-2xl bg-white transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2 ${rank === 1 ? 'w-40 h-40 md:w-56 md:h-56 z-20 border-4 border-yellow-400' : 'w-32 h-32 md:w-44 md:h-44 opacity-95 hover:opacity-100 z-10'}`} 
                            alt={c.name} 
                        />
                        <div className={`absolute -top-4 -right-4 font-black w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-lg text-lg md:text-2xl z-30 ${badgeColor}`}>
                            {c.candidateId || c.number}
                        </div>
                        <div className={`mt-4 bg-black/40 backdrop-blur-sm text-white px-4 py-1.5 rounded-full font-medium border border-white/20 truncate ${rank === 1 ? 'text-sm md:text-base max-w-[150px] md:max-w-[200px]' : 'text-xs md:text-sm max-w-[120px] md:max-w-[150px]'}`}>
                            {c.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* CONTROL BAR */}
        <div className="bg-[#1E293B] text-white py-3 px-4 shadow-lg sticky top-0 z-40 border-b-4 border-emerald-500">
             <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6 md:gap-12">
                    <div><span className="block text-slate-400 text-[10px] uppercase font-bold">มาใช้สิทธิ์แล้ว</span><span className="font-bold text-pink-500 text-lg md:text-xl">{summary.voted.toLocaleString()}</span></div>
                    <div><span className="block text-slate-400 text-[10px] uppercase font-bold">ผู้มีสิทธิ์เลือกตั้ง</span><span className="font-bold text-emerald-400 text-lg md:text-xl">{summary.totalVerified.toLocaleString()}</span></div>
                    <div><span className="block text-slate-400 text-[10px] uppercase font-bold">ยังไม่ใช้สิทธิ์</span><span className="font-bold text-slate-300 text-lg md:text-xl">{summary.notVoted.toLocaleString()}</span></div>
                </div>
                <div className="flex items-center gap-1 bg-slate-700/50 p-1 rounded-lg font-['Kanit']">
                    <button onClick={() => setActiveTab('automatic')} className={`px-4 py-1 rounded text-xs font-bold transition-all ${activeTab === 'automatic' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300'}`}>Automatic</button>
                    <button onClick={() => setActiveTab('year')} className={`px-4 py-1 rounded text-xs font-bold transition-all ${activeTab === 'year' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300'}`}>By Year</button>
                    <button onClick={() => setActiveTab('faculty')} className={`px-4 py-1 rounded text-xs font-bold transition-all ${activeTab === 'faculty' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300'}`}>By Faculty</button>
                </div>
            </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 px-4 font-['Kanit']">
            {activeTab === 'automatic' && (
                <div className="flex flex-col items-center space-y-6 w-full max-w-4xl mx-auto">
                    {/* ส่วนที่ 1: แถบ Realtime Bar 3 อันดับแรก */}
                    <div className="w-full flex rounded-2xl overflow-hidden shadow-xl h-24 md:h-32 bg-[#1e293b]">
                        {sorted.slice(0, 3).map((c, idx) => (
                            <div key={c._id} className={`${["bg-[#FACC15]", "bg-[#EF4444]", "bg-[#3B82F6]"][idx]} flex items-center justify-center text-white relative flex-1 border-r border-white/10 last:border-0`}>
                                <div className="flex items-center gap-2 md:gap-4">
                                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white text-slate-800 flex items-center justify-center font-black text-sm md:text-xl shadow-inner border border-slate-200">
                                        <span>{c.candidateId || c.number}</span>
                                    </div>
                                    <span className="text-2xl md:text-5xl font-black">{c.votes.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ส่วนที่ 2: ตารางพรรคที่เหลือ */}
                    {sorted.length > 3 && (
                        <div className="w-full flex flex-col gap-3 mt-4">
                            {sorted.slice(3).map((c) => (
                                <div key={c._id} className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-700 text-white flex items-center justify-center font-black text-lg shadow-inner">
                                        {c.candidateId || c.number}
                                    </div>
                                    <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between min-w-0">
                                        <div className="text-sm md:text-base font-bold text-slate-800 truncate mb-1 md:mb-0">
                                            {c.name}
                                        </div>
                                        <div className="text-emerald-600 font-black text-lg md:text-xl">
                                            {c.votes.toLocaleString()} <span className="text-xs font-normal text-slate-500">คะแนน</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* แสดงสถิติการมาใช้สิทธิ์แบ่งตาม "ชั้นปี" */}
            {activeTab === 'year' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 text-center">สถิติผู้มาใช้สิทธิ์แยกตามชั้นปี</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(year => {
                            const voters = summary.votersByYear?.[year] || 0;
                            const percentage = summary.voted > 0 ? ((voters / summary.voted) * 100).toFixed(1) : 0;
                            return (
                                <div key={year} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-100 rounded-full opacity-50"></div>
                                    <h3 className="text-xl font-bold text-slate-600 z-10">นิสิตชั้นปีที่ {year}</h3>
                                    <div className="text-5xl font-black text-emerald-600 my-4 z-10">{voters.toLocaleString()} <span className="text-lg text-slate-400 font-normal">คน</span></div>
                                    <div className="w-full bg-slate-200 h-2 rounded-full mt-2 z-10">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2 font-bold z-10">{percentage}% ของผู้มาใช้สิทธิ์ทั้งหมด</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* แสดงสถิติการมาใช้สิทธิ์แบ่งตาม "คณะ" */}
            {/* ✅ อัปเดต: เอาแผนที่ออก และจัดให้กล่องคะแนนอยู่ตรงกลาง */}
            {activeTab === 'faculty' && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
                    <h2 className="text-2xl font-black text-slate-800 mb-6 text-center border-b pb-4">จำนวนผู้มาใช้สิทธิ์แต่ละคณะ</h2>
                    <div className="space-y-4">
                        {FACULTIES_INFO.map((faculty, idx) => {
                            const voters = summary.votersByFaculty?.[faculty.id] || 0;
                            return (
                                <div key={faculty.id} className="flex items-center p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mr-4 text-white shadow-sm shrink-0" style={{ backgroundColor: faculty.color }}>
                                        {faculty.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between font-bold text-slate-800 mb-1">
                                            <span className="truncate text-sm md:text-base">{faculty.name}</span>
                                            <span className="text-emerald-600 text-sm md:text-base whitespace-nowrap ml-2">{voters.toLocaleString()} คน</span>
                                        </div>
                                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full transition-all duration-700" 
                                                style={{ width: `${(voters / (maxFacultyVoters || 1)) * 100}%`, backgroundColor: faculty.color }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;