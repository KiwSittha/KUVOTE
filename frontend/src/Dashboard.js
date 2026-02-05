import React, { useEffect, useState, useRef } from "react";
import Layout from "./components/Layout";
import html2canvas from "html2canvas";

// ⚠️ สำคัญ: เปลี่ยน URL นี้ให้ตรงกับ Server ของคุณ (เช่น http://localhost:8000 หรือ URL บน Render)
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function Dashboard() {
  // State สำหรับเก็บข้อมูลจริงจาก Server
  const [candidates, setCandidates] = useState([]);
  const [summary, setSummary] = useState({ totalVerified: 0, voted: 0, notVoted: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // เพิ่ม state สำหรับเก็บ error

  const [activeTab, setActiveTab] = useState("automatic");
  const [isGenerating, setIsGenerating] = useState(false);
  const hiddenCaptureRef = useRef(null);

  // ✅ ดึงข้อมูลจริงจาก Server เมื่อ Component โหลด
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. ดึงข้อมูลผู้สมัคร (Candidates)
        const candidatesRes = await fetch(`${API_BASE_URL}/candidates`);
        if (!candidatesRes.ok) throw new Error("Failed to fetch candidates");
        const candidatesData = await candidatesRes.json();

        // 2. ดึงข้อมูลสรุปการโหวต (Summary)
        const summaryRes = await fetch(`${API_BASE_URL}/stats/vote-summary`);
        if (!summaryRes.ok) throw new Error("Failed to fetch vote summary");
        const summaryData = await summaryRes.json();

        // 3. อัปเดต State
        setCandidates(candidatesData);
        setSummary(summaryData);
        setError(null);

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
        // อาจจะใช้ Mock Data ชั่วคราวถ้าจำเป็น หรือแสดง Error State
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Optional: ตั้งเวลาดึงข้อมูลใหม่ทุกๆ 1 นาที (Real-time)
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId); // Cleanup interval

  }, []);

  // --- จัดเรียงและคำนวณข้อมูล (ใช้ candidates ที่ได้จาก API) ---
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const maxVote = sorted[0]?.votes || 1;

  // --------------------------------------------------------
  // 📸 Smart Share Logic (คงเดิม)
  // --------------------------------------------------------
  const handleSmartShare = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
        if (!hiddenCaptureRef.current) throw new Error("Capture element not found");
        await new Promise(r => setTimeout(r, 800));
        const canvas = await html2canvas(hiddenCaptureRef.current, {
            useCORS: true,
            allowTaint: true,
            scale: 2,
            backgroundColor: '#111827',
        });
        canvas.toBlob(async (blob) => {
            if (!blob) {
                alert("เกิดข้อผิดพลาดในการสร้างไฟล์รูป");
                setIsGenerating(false);
                return;
            }
            const file = new File([blob], "kusrc-election.png", { type: "image/png" });
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'ผลการเลือกตั้ง KU SRC',
                        text: 'มาดูผลการเลือกตั้งล่าสุดกัน! #KUSRC #Election',
                    });
                } catch (error) {
                    if (error.name !== 'AbortError') downloadImage(canvas);
                }
            } else {
                downloadImage(canvas);
            }
            setIsGenerating(false);
        }, 'image/png');

    } catch (error) {
        console.error("Error generating image:", error);
        alert("เกิดข้อผิดพลาด: " + error.message);
        setIsGenerating(false);
    }
  };

  const downloadImage = (canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `KU-SRC-Result-${Date.now()}.png`;
      link.click();
      alert("บันทึกรูปเรียบร้อย!");
  };


  // --- COMPONENT: HIDDEN VS CARD (ใช้ข้อมูลจริง sorted[0], sorted[1]) ---
  const VSCardForShare = ({ innerRef }) => {
    // ใช้ข้อมูลจริง ถ้าไม่มีให้แสดง Placeholder
    const p1 = sorted[0] || { number: '?', name: 'รอผลคะแนน', party: '-', votes: 0 };
    const p2 = sorted[1] || { number: '?', name: 'รอผลคะแนน', party: '-', votes: 0 };

    // Helper สร้าง Avatar URL
    const getAvatarUrl = (seed) => seed ? `https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate${seed}` : null;

    return (
        <div ref={innerRef} className="w-[1080px] h-[1920px] bg-[#111827] relative flex flex-col items-center pt-20 pb-20 overflow-hidden text-white font-['Kanit']">
            <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, #333 3px, transparent 3px)', backgroundSize: '50px 50px'}}></div>
            <div className="absolute top-0 w-full h-1/2 bg-gradient-to-b from-emerald-900/60 to-transparent"></div>

            <div className="z-10 text-center space-y-4 mt-16">
                <div className="inline-block bg-[#FACC15] text-black font-black text-3xl px-8 py-2 rounded-full shadow-xl">
                    🔥 REALTIME UPDATE
                </div>
                <h1 className="text-7xl font-black drop-shadow-xl mt-4 tracking-tight">KU SRC ELECTION</h1>
                <p className="text-4xl text-slate-400 font-light">ผลการนับคะแนนล่าสุด (ไม่เป็นทางการ)</p>
            </div>

            <div className="flex-1 w-full flex flex-col justify-center items-center gap-16 relative z-10 scale-110">
                {/* #1 Winner */}
                <div className="flex flex-col items-center">
                      <div className="w-72 h-72 rounded-full border-[12px] border-[#FACC15] overflow-hidden shadow-[0_0_80px_rgba(250,204,21,0.4)] bg-slate-800 relative flex items-center justify-center">
                         {p1.number !== '?' && <img src={getAvatarUrl(p1.number)} className="w-full h-full object-cover" crossOrigin="anonymous" alt="winner" />}
                      </div>
                      <div className="bg-[#FACC15] text-black font-black text-5xl px-10 py-3 rounded-full -mt-10 z-20 shadow-xl border-4 border-[#111827]">
                        #{p1.votes.toLocaleString()}
                      </div>
                      <h2 className="text-6xl font-black mt-8 text-center drop-shadow-md">{p1.name}</h2>
                      <p className="text-3xl text-slate-300 mt-2">{p1.party}</p>
                </div>

                {/* VS Text */}
                <div className="text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-600" style={{ WebkitTextStroke: '3px white' }}>VS</div>

                 {/* #2 Runner up */}
                 <div className="flex flex-col items-center opacity-80 scale-90">
                      <div className="w-60 h-60 rounded-full border-[10px] border-slate-500 overflow-hidden shadow-2xl bg-slate-800 relative flex items-center justify-center">
                         {p2.number !== '?' && <img src={getAvatarUrl(p2.number)} className="w-full h-full object-cover" crossOrigin="anonymous" alt="runnerup" />}
                      </div>
                      <div className="bg-slate-600 text-white font-black text-4xl px-8 py-3 rounded-full -mt-8 z-20 shadow-xl border-4 border-[#111827]">
                        #{p2.votes.toLocaleString()}
                      </div>
                      <h2 className="text-5xl font-bold mt-6 text-center">{p2.name}</h2>
                      <p className="text-2xl text-slate-400 mt-2">{p2.party}</p>
                </div>
            </div>

            <div className="z-10 text-center mb-10">
                 <p className="text-3xl text-slate-500 mb-2">ติดตามผลสดๆ ได้ที่</p>
                 <p className="text-5xl font-bold text-emerald-400">kusrc.election.th</p>
            </div>
        </div>
    );
  };

  // --- COMPONENT: MAP VIEW (Placeholder หรือต้องผูกข้อมูลจริงถ้ามี) ---
  const MapVisualization = () => {
    // ⚠️ ข้อมูล Map อาจจะต้อง Mock ไว้ก่อน หรือออกแบบ API ให้ส่งข้อมูล By Faculty มาด้วย
    const LOCATIONS = [
      { id: 'eng', name: 'วิดวะฯ', fullName: 'คณะวิศวกรรมศาสตร์ศรีราชา', icon: '⚙️', top: '20%', left: '20%', color: '#D12E2E' },
      { id: 'ms', name: 'วิทย์ฯ จัดการ', fullName: 'คณะวิทยาการจัดการ', icon: '📊', top: '55%', left: '15%', color: '#0095D9' },
      { id: 'sci', name: 'วิทยาศาสตร์', fullName: 'คณะวิทยาศาสตร์ ศรีราชา', icon: '🧪', top: '35%', right: '20%', color: '#4B2C84' },
      { id: 'ims', name: 'พาณิชยนาวีฯ', fullName: 'คณะพาณิชยนาวีนานาชาติ', icon: '⚓', top: '50%', left: '48%', color: '#1A5D3A' },
      { id: 'econ', name: 'เศรษฐศาสตร์', fullName: 'คณะเศรษฐศาสตร์ ศรีราชา', icon: '💰', bottom: '20%', right: '30%', color: '#5FB646' },
    ];

    return (
        <div className="lg:col-span-5 relative bg-white rounded-2xl p-4 min-h-[500px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="z-10 text-center mb-2">
                <h3 className="text-slate-800 font-bold text-lg">แผนที่คณะ (KU SRC)</h3>
                <p className="text-slate-400 text-xs">แสดงตำแหน่งที่ตั้งคณะ</p>
            </div>

            <div className="absolute inset-0 top-14 m-4 bg-[#F0F4F8] rounded-xl border-2 border-dashed border-slate-200 overflow-hidden">
                {/* Graphics */}
                <div className="absolute top-[40%] right-[10%] w-24 h-24 bg-blue-100/50 rounded-full blur-xl"></div>
                <div className="absolute top-0 bottom-0 left-[40%] w-3 bg-slate-200/50 -skew-x-12"></div>

                {/* Pins */}
                {LOCATIONS.map((loc) => (
                    <div key={loc.id} className="absolute flex flex-col items-center group cursor-pointer z-20 hover:z-50 transition-all" style={{ top: loc.top, left: loc.left, right: loc.right, bottom: loc.bottom }}>
                        <div className="relative">
                            <div className={`absolute inset-0 rounded-full animate-ping opacity-20`} style={{ backgroundColor: loc.color }}></div>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-lg border-2 p-1 relative z-10 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center" style={{ borderColor: loc.color }}>
                                <span className="text-2xl filter drop-shadow-sm">{loc.icon}</span>
                            </div>
                            <span className="absolute left-1/2 -translate-x-1/2 -bottom-6 bg-white/90 backdrop-blur text-[10px] px-2 py-0.5 rounded-full shadow-md font-bold text-slate-600 whitespace-nowrap border border-slate-100 group-hover:opacity-0 transition-opacity">{loc.name}</span>
                        </div>
                        {/* Tooltip (Simplified) */}
                        <div className="absolute bottom-full mb-3 w-auto bg-slate-800 text-white rounded-lg shadow-2xl p-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none transform origin-bottom z-50 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                                <span>{loc.icon}</span>
                                <span className="text-xs font-bold">{loc.fullName}</span>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };


  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-800 text-white font-sans text-xl">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="h-screen flex items-center justify-center bg-slate-800 text-red-400 font-sans text-xl">{error}</div>;


  return (
    <Layout>
      <div className={`font-['Kanit'] min-h-screen pb-20 transition-colors duration-500 ${activeTab === 'faculty' ? 'bg-[#F3F4F6]' : 'bg-[#1A5D3A]'}`}>

        {/* HIDDEN SECTION */}
        <div style={{ position: "fixed", top: "0", left: "-9999px", zIndex: -1 }}>
            <VSCardForShare innerRef={hiddenCaptureRef} />
        </div>

        {/* --- HEADER --- */}
        <div className="relative w-full bg-gradient-to-r from-[#1A5D3A] to-[#2E8B57] pb-10">
            <div className="pt-8 pb-72 text-center relative z-10">
                <h3 className="text-white/90 text-xl font-light tracking-[0.2em] mb-1">STUDENT COUNCIL</h3>
                <h3 className="text-white/90 text-xl font-light tracking-[0.2em]">KU SRC ELECTION</h3>
                <h1 className="text-white text-3xl md:text-5xl font-bold mt-2 drop-shadow-md">
                    ผลการเลือกตั้งประธานนิสิต <br /> มก. วิทยาเขตศรีราชา
                </h1>
            </div>
            {/* Candidate Avatars Header (ใช้ข้อมูลจริง) */}
            <div className="absolute bottom-14 left-0 right-0 flex justify-center items-end px-4 gap-2 md:gap-4 z-20">
                {candidates.map((c) => (
                    <div key={c._id || c.candidateId} className="relative group cursor-pointer transition-transform hover:-translate-y-2">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Candidate${c.candidateId || c.number}`} className="h-32 md:h-52 object-contain drop-shadow-xl filter" alt={`candidate ${c.name}`} />
                        <div className="absolute -top-2 -right-2 bg-white text-[#1A5D3A] font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-[#1A5D3A]">
                            {c.candidateId || c.number}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- CONTROL BAR (ใช้ข้อมูลจริง summary) --- */}
        <div className="bg-[#1E293B] text-white py-3 px-4 shadow-lg sticky top-0 z-40 border-b-4 border-emerald-500">
             <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6 md:gap-12 text-sm md:text-base">
                    <div><span className="block text-slate-400 text-xs">นับคะแนนแล้ว</span><span className="font-bold text-pink-500 text-lg md:text-xl">{summary.voted.toLocaleString()}</span></div>
                    <div><span className="block text-slate-400 text-xs">ผู้มีสิทธิ์เลือกตั้ง</span><span className="font-bold text-emerald-400 text-lg md:text-xl">{summary.totalVerified.toLocaleString()}</span></div>
                    <div className="hidden md:block"><span className="block text-slate-400 text-xs">ยังไม่ใช้สิทธิ์</span><span className="font-bold text-slate-300 text-lg md:text-xl">{summary.notVoted.toLocaleString()}</span></div>
                </div>
                <div className="flex items-center gap-2 bg-slate-700/50 p-1 rounded-lg">
                    <button onClick={() => setActiveTab('automatic')} className={`px-3 py-1 rounded text-xs transition-all font-bold ${activeTab === 'automatic' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-300 hover:bg-slate-600'}`}>Automatic</button>
                    <button onClick={() => setActiveTab('faculty')} className={`px-3 py-1 rounded text-xs transition-all font-bold ${activeTab === 'faculty' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-300 hover:bg-slate-600'}`}>By Faculty</button>
                </div>
            </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="max-w-7xl mx-auto mt-8 px-4">

            {/* 🅰️ AUTOMATIC VIEW */}
            {activeTab === 'automatic' && (
                <div className="flex flex-col items-center animate-fade-in-up space-y-8">
                    {/* Winner Strip (ใช้ข้อมูลจริง sorted) */}
                    <div className="w-full flex rounded-2xl overflow-hidden shadow-2xl h-24 md:h-32 mt-4 bg-[#1e293b]">
                        {sorted.length > 0 ? sorted.map((c, idx) => {
                            const isTop3 = idx < 3;
                            // กำหนดสี Bar แบบ Hardcode หรือเพิ่ม field color ใน DB ก็ได้
                            const barColors = ["bg-yellow-500", "bg-red-500", "bg-blue-500", "bg-purple-500", "bg-green-500"];
                            const bgBar = barColors[idx] || "bg-slate-500";

                            return (
                                <div key={c._id || c.candidateId} className={`${bgBar} flex flex-col justify-center items-center text-white border-r border-white/10 last:border-0 relative transition-all`} style={{ flex: isTop3 ? 2 : 1 }}>
                                    {isTop3 ? (
                                        <div className="flex items-center gap-2 md:gap-4">
                                            <div className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-lg md:text-2xl shadow-lg ${idx === 0 ? "bg-yellow-400 text-yellow-900" : "bg-white/90 text-slate-800"}`}>
                                                {c.candidateId || c.number}
                                            </div>
                                            <span className="text-2xl md:text-5xl font-bold drop-shadow-md">{c.votes.toLocaleString()}</span>
                                        </div>
                                    ) : (
                                        <span className="text-lg md:text-3xl font-bold opacity-90">{c.votes.toLocaleString()}</span>
                                    )}
                                </div>
                            );
                        }) : (
                             <div className="w-full h-full flex items-center justify-center text-slate-400">ไม่มีข้อมูลผู้สมัคร</div>
                        )}
                    </div>

                    {/* ✅ SHARE BUTTONS */}
                    <div className="w-full max-w-4xl bg-[#1E293B]/60 backdrop-blur-md rounded-3xl p-6 border border-slate-600/50 flex flex-col items-center justify-center text-center">
                        <h3 className="text-white text-lg font-medium mb-6">แชร์ผลการเลือกตั้ง (Realtime)</h3>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <button
                                onClick={handleSmartShare}
                                disabled={isGenerating || candidates.length < 2}
                                className="flex items-center gap-2 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:scale-105 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        กำลังสร้างรูป...
                                    </span>
                                ) : (
                                    <>📸 แชร์ลง IG Story / Facebook</>
                                )}
                            </button>
                            <button
                                onClick={handleSmartShare}
                                disabled={isGenerating || candidates.length < 2}
                                className="flex items-center gap-2 bg-[#45D166] hover:scale-105 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50"
                            >
                                ⬇️ บันทึกรูปภาพ
                            </button>
                        </div>
                        <p className="text-slate-400 text-xs mt-4">* ระบบจะสร้างรูปขนาด 9:16 (แนวตั้ง) ให้โดยอัตโนมัติ</p>
                    </div>
                </div>
            )}

            {/* 🅾️ BY FACULTY VIEW (ใช้ข้อมูลจริง sorted) */}
            {activeTab === 'faculty' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in-up">
                    <MapVisualization />
                    <div className="lg:col-span-7 space-y-3">
                        {sorted.length > 0 ? sorted.map((c, idx) => {
                             // กำหนดสี Bar แบบ Hardcode
                             const barColors = ["bg-yellow-500", "bg-red-500", "bg-blue-500", "bg-purple-500", "bg-green-500"];
                             const bgBar = barColors[idx] || "bg-slate-500";
                             const rankColor = idx === 0 ? "text-yellow-500" : "text-slate-300";

                             return (
                                <div key={c._id || c.candidateId} className="bg-white rounded-xl p-3 flex items-center shadow-sm border border-slate-100">
                                    <span className={`text-3xl font-black italic mr-4 ${rankColor}`}>{idx + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <div>
                                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                                    {c.name}
                                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-normal">#{c.candidateId || c.number}</span>
                                                </h4>
                                                <p className="text-xs text-slate-500">{c.faculty} | {c.position}</p>
                                            </div>
                                            <span className="text-sm text-slate-700 font-bold">{c.votes.toLocaleString()} คะแนน</span>
                                        </div>
                                        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mt-2">
                                            <div className={`${bgBar} h-full transition-all duration-500`} style={{ width: `${(c.votes / maxVote) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center text-slate-500 py-10">ยังไม่มีข้อมูลผู้สมัคร</div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;