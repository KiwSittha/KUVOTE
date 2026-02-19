import React, { useEffect, useState, useRef } from "react";
import Layout from "./components/Layout";
import html2canvas from "html2canvas";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function Dashboard() {
  const [candidates, setCandidates] = useState([]);
  const [summary, setSummary] = useState({ totalVerified: 0, voted: 0, notVoted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("automatic");
  const [isGenerating, setIsGenerating] = useState(false);
  const hiddenCaptureRef = useRef(null);

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

  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const maxVote = sorted[0]?.votes || 1;

  // Logic การแชร์กลาง (ใช้ร่วมกันทุกปุ่มแชร์)
  const handleSmartShare = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
        const canvas = await html2canvas(hiddenCaptureRef.current, { 
            useCORS: true, 
            scale: 2, 
            backgroundColor: '#111827' 
        });
        canvas.toBlob(async (blob) => {
            const file = new File([blob], "KU-Election-Result.png", { type: "image/png" });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'ผลการเลือกตั้ง KU SRC',
                });
            } else {
                downloadImage(canvas);
            }
            setIsGenerating(false);
        }, 'image/png');
    } catch (e) { 
        console.error(e);
        setIsGenerating(false); 
    }
  };

  const downloadImage = (canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `KUSRC-Result-${Date.now()}.png`;
      link.click();
  };

  // --- ส่วนของ Layout ย่อยๆ (Map, Card แชร์) ยังคงเดิมเพื่อให้ UI นิ่ง ---
  const MapVisualization = () => {
    const LOCATIONS = [
      { id: 'eng', name: 'วิดวะฯ', icon: '⚙️', top: '20%', left: '20%', color: '#D12E2E' },
      { id: 'ms', name: 'วิทย์ฯ จัดการ', icon: '📊', top: '55%', left: '15%', color: '#0095D9' },
      { id: 'sci', name: 'วิทยาศาสตร์', icon: '🧪', top: '35%', right: '20%', color: '#4B2C84' },
      { id: 'ims', name: 'พาณิชยนาวีฯ', icon: '⚓', top: '50%', left: '48%', color: '#1A5D3A' },
      { id: 'econ', name: 'เศรษฐศาสตร์', icon: '💰', bottom: '20%', right: '30%', color: '#5FB646' },
    ];
    return (
      <div className="lg:col-span-5 relative bg-white rounded-2xl p-4 min-h-[400px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="z-10 text-center mb-2 font-bold text-slate-800">แผนที่คณะ (KU SRC)</div>
          <div className="absolute inset-0 top-12 m-4 bg-[#F0F4F8] rounded-xl border-2 border-dashed border-slate-200">
              {LOCATIONS.map((loc) => (
                  <div key={loc.id} className="absolute flex flex-col items-center" style={{ top: loc.top, left: loc.left, right: loc.right, bottom: loc.bottom }}>
                      <div className="w-10 h-10 bg-white rounded-xl shadow border-2 flex items-center justify-center" style={{ borderColor: loc.color }}><span className="text-xl">{loc.icon}</span></div>
                      <span className="text-[10px] font-bold text-slate-500 mt-1">{loc.name}</span>
                  </div>
              ))}
          </div>
      </div>
    );
  };

  const VSCardForShare = ({ innerRef }) => {
    const p1 = sorted[0] || { number: '?', name: 'รอผลคะแนน', votes: 0 };
    const p2 = sorted[1] || { number: '?', name: 'รอผลคะแนน', votes: 0 };
    return (
      <div ref={innerRef} className="w-[1080px] h-[1920px] bg-[#111827] flex flex-col items-center pt-32 text-white font-['Kanit']">
          <div className="bg-yellow-400 text-black font-black text-3xl px-10 py-2 rounded-full mb-10">🔥 REALTIME UPDATE</div>
          <h1 className="text-8xl font-black italic">KU SRC ELECTION</h1>
          <div className="flex-1 w-full flex flex-col justify-center items-center gap-20">
              <div className="flex flex-col items-center">
                  <div className="w-80 h-80 rounded-full border-[15px] border-yellow-400 bg-slate-800 flex items-center justify-center text-[150px] font-black">{p1.candidateId || p1.number}</div>
                  <h2 className="text-7xl font-black mt-10">{p1.name}</h2>
                  <div className="text-5xl text-yellow-400 font-bold mt-4">{p1.votes.toLocaleString()} คะแนน</div>
              </div>
              <div className="text-9xl font-black opacity-20 italic">VS</div>
              <div className="flex flex-col items-center opacity-70">
                  <div className="w-64 h-64 rounded-full border-[10px] border-slate-500 bg-slate-800 flex items-center justify-center text-[100px] font-black">{p2.candidateId || p2.number}</div>
                  <h2 className="text-5xl font-bold mt-8">{p2.name}</h2>
                  <div className="text-4xl font-bold mt-2">{p2.votes.toLocaleString()} คะแนน</div>
              </div>
          </div>
      </div>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#1A5D3A] text-white">กำลังโหลด...</div>;

  return (
    <Layout>
      <div className={`font-['Kanit'] min-h-screen pb-20 transition-colors ${activeTab === 'automatic' ? 'bg-[#1A5D3A]' : 'bg-[#F3F4F6]'}`}>
        <div style={{ position: "fixed", top: "0", left: "-9999px" }}><VSCardForShare innerRef={hiddenCaptureRef} /></div>
        
        {/* HEADER */}
        <div className="relative w-full bg-gradient-to-r from-[#1A5D3A] to-[#2E8B57] pb-10">
            <div className="pt-8 pb-72 text-center text-white">
                <h3 className="text-xl font-light tracking-[0.2em]">KU SRC ELECTION</h3>
                <h1 className="text-3xl md:text-5xl font-bold mt-2 font-['Kanit']">ผลการเลือกตั้งประธานนิสิต <br /> มก. วิทยาเขตศรีราชา</h1>
            </div>
            <div className="absolute bottom-14 left-0 right-0 flex justify-center items-end gap-4">
                {candidates.slice(0, 3).map((c) => (
                    <div key={c._id} className="relative">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate${c.candidateId || c.number}`} className="h-32 md:h-52" alt="" />
                        <div className="absolute -top-2 -right-2 bg-white text-[#1A5D3A] font-black w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#1A5D3A]">{c.candidateId || c.number}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* CONTROL BAR */}
        <div className="bg-[#1E293B] text-white py-3 px-4 shadow-lg sticky top-0 z-40 border-b-4 border-emerald-500">
             <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6 md:gap-12">
                    <div><span className="block text-slate-400 text-[10px] uppercase font-bold">นับคะแนนแล้ว</span><span className="font-bold text-pink-500 text-lg md:text-xl">{summary.voted.toLocaleString()}</span></div>
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
                <div className="flex flex-col items-center space-y-8">
                    {/* Realtime Bar */}
                    <div className="w-full flex rounded-2xl overflow-hidden shadow-2xl h-24 md:h-32 bg-[#1e293b]">
                        {sorted.slice(0, 3).map((c, idx) => (
                            <div key={c._id} className={`${["bg-[#FACC15]", "bg-[#EF4444]", "bg-[#3B82F6]"][idx]} flex items-center justify-center text-white relative flex-1 border-r border-white/10 last:border-0`}>
                                <div className="flex items-center gap-2 md:gap-4">
                                    <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white text-slate-800 flex items-center justify-center font-black text-sm md:text-xl">
                                        {c.candidateId || c.number}
                                    </div>
                                    <span className="text-2xl md:text-5xl font-black">{c.votes.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ✅ แก้ไขส่วนปุ่มแชร์ใหม่ให้มี FB และ X */}
                    <div className="w-full max-w-4xl bg-[#1E293B]/60 backdrop-blur-md rounded-3xl p-8 border border-slate-600/50 text-center shadow-2xl">
                        <h3 className="text-white text-lg font-medium mb-8">แชร์คู่พรรคที่มีคะแนนล่าสุด (VS MODE)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            {/* Instagram Button */}
                            <button onClick={handleSmartShare} className="flex items-center justify-center gap-3 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white px-6 py-4 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                                <span className="text-xl">📷</span> Add to story
                            </button>
                            {/* Facebook Button */}
                            <button onClick={handleSmartShare} className="flex items-center justify-center gap-3 bg-[#1877F2] text-white px-6 py-4 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                                <span className="text-xl">📘</span> Facebook
                            </button>
                            {/* X Button */}
                            <button onClick={handleSmartShare} className="flex items-center justify-center gap-3 bg-black text-white px-6 py-4 rounded-full font-bold shadow-lg border border-slate-700 transition-transform hover:scale-105 active:scale-95">
                                <span className="text-xl">𝕏</span> add to X
                            </button>
                        </div>
                        {/* Download Button */}
                        <button onClick={handleSmartShare} className="flex items-center justify-center gap-3 bg-[#10B981] text-white px-12 py-4 rounded-full font-bold shadow-[0_0_20px_rgba(16,185,129,0.4)] mx-auto transition-all hover:scale-105 hover:bg-[#059669]">
                             <span className="text-xl">📥</span> Download Result
                        </button>
                    </div>
                </div>
            )}

            {/* ส่วน By Year และ By Faculty คงเดิมเพื่อความสมบูรณ์ของไฟล์ */}
            {activeTab === 'year' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sorted.map((c, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white ${["bg-[#FACC15]", "bg-[#EF4444]", "bg-[#3B82F6]"][idx] || "bg-emerald-500"}`}>{c.candidateId || c.number}</div>
                                <div className="font-bold text-slate-800 text-lg truncate">{c.name}</div>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(y => (
                                    <div key={y}>
                                        <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1"><span>ปี {y}</span><span>{(c.votesByYear?.[y] || 0).toLocaleString()}</span></div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full ${["bg-[#FACC15]", "bg-[#EF4444]", "bg-[#3B82F6]"][idx] || "bg-emerald-500"}`} style={{ width: `${((c.votesByYear?.[y] || 0) / (c.votes || 1)) * 100}%` }}></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'faculty' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <MapVisualization />
                    <div className="lg:col-span-7 space-y-3">
                        {sorted.map((c, idx) => (
                            <div key={c._id} className="bg-white rounded-xl p-4 flex items-center shadow-sm border border-slate-100">
                                <span className={`text-3xl font-black italic mr-4 ${idx === 0 ? 'text-yellow-400' : 'text-slate-200'}`}>{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                                        <span className="truncate">{c.name} <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full ml-1 font-normal">#{c.candidateId || c.number}</span></span>
                                        <span>{c.votes.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full transition-all duration-700" style={{ width: `${(c.votes / maxVote) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;