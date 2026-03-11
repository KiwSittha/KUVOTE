import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "./components/Layout";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [status, setStatus] = useState("loading"); // loading, waiting, normal, urgent, critical, ended
  const [times, setTimes] = useState({ start: null, end: null });
  
  const [displayDateText, setDisplayDateText] = useState("กำลังโหลดข้อมูล...");
  const [dateLabel, setDateLabel] = useState("");

  // ==============================
  // 1. ดึงวันที่จาก Backend
  // ==============================
  useEffect(() => {
    const fetchElectionConfig = async () => {
      try {
        const res = await fetch("http://localhost:8000/election-status"); 
        const data = await res.json();
        
        if (data.startTime || data.endTime) {
          setTimes({ start: data.startTime, end: data.endTime });
        } else {
          setStatus("ended");
          setDisplayDateText("ยังไม่ได้กำหนดวันเวลา");
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        setStatus("ended");
        setDisplayDateText("ไม่สามารถดึงข้อมูลเวลาได้");
      }
    };
    fetchElectionConfig();
  }, []);

  // ฟังก์ชันแปลงเวลาเป็นภาษาไทย
  const formatThaiDate = (isoString) => {
    if (!isoString) return "ไม่ได้ระบุ";
    const d = new Date(isoString);
    const thaiDate = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
    const thaiTime = d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return `${thaiDate} เวลา ${thaiTime} น.`;
  };

  // ==============================
  // 🕒 2. Logic นับถอยหลัง (2 จังหวะ)
  // ==============================
  useEffect(() => {
    if (!times.start && !times.end) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const startMs = times.start ? new Date(times.start).getTime() : 0;
      const endMs = times.end ? new Date(times.end).getTime() : Infinity;

      // จังหวะที่ 1: ยังไม่ถึงเวลาเปิด (นับถอยหลังไปหา Start)
      if (now < startMs) {
        setStatus("waiting");
        setDateLabel("เปิดรับลงคะแนน");
        setDisplayDateText(formatThaiDate(times.start));
        updateTimer(startMs - now);
      } 
      // จังหวะที่ 2: เปิดแล้ว แต่งยังไม่ปิด (นับถอยหลังไปหา End)
      else if (now >= startMs && now < endMs) {
        setDateLabel("ปิดรับลงคะแนน");
        setDisplayDateText(formatThaiDate(times.end));
        
        const distance = endMs - now;
        updateTimer(distance);

        const oneHour = 1000 * 60 * 60;
        const oneDay = oneHour * 24;

        if (distance < oneHour) setStatus("critical");
        else if (distance < oneDay) setStatus("urgent");
        else setStatus("normal");
      } 
      // จังหวะที่ 3: หมดเวลาแล้ว
      else {
        setStatus("ended");
        setDateLabel("ปิดรับลงคะแนนไปเมื่อ");
        setDisplayDateText(formatThaiDate(times.end));
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [times]); 

  const updateTimer = (distance) => {
    setTimeLeft({
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000),
    });
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[85vh] py-8 md:py-10 animate-fade-in-up">
        <main className="w-full max-w-5xl px-4">

          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight mb-2">
              ระบบเลือกตั้ง<span className="block md:inline text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-400">ประธานนิสิต</span>
            </h1>
            <h2 className="text-lg md:text-2xl font-medium text-slate-500 mt-2">มหาวิทยาลัยเกษตรศาสตร์</h2>
          </div>

          <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-6 md:p-12 text-center max-w-3xl mx-auto">
            
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r 
              ${status === 'critical' ? 'from-red-500 via-orange-500 to-red-600' : 
                status === 'urgent' ? 'from-orange-400 via-yellow-500 to-orange-600' :
                status === 'ended' ? 'from-gray-400 to-slate-600' :
                status === 'waiting' ? 'from-blue-400 via-indigo-500 to-purple-600' : // สีตอนรอเปิด
                status === 'loading' ? 'from-slate-200 to-slate-300' :
                'from-emerald-400 via-green-500 to-emerald-600'
              }`}>
            </div>
            
            {/* 🚨 ALERT BANNER */}
            <div className="mb-6 md:mb-8 flex justify-center h-8">
              {status === "waiting" && (
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs md:text-sm font-bold">
                    ⏳ กำลังจะเปิดรับลงคะแนนในอีก...
                 </div>
              )}
              {status === "normal" && (
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs md:text-sm font-bold">
                    <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span></span>
                    ระบบกำลังเปิดให้ลงคะแนน
                 </div>
              )}
              {status === "urgent" && (
                 <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-orange-50 text-orange-600 border border-orange-200 text-xs md:text-sm font-bold animate-pulse text-center">
                    ⚠️ เหลือเวลาลงคะแนนน้อยกว่า 24 ชั่วโมง!
                 </div>
              )}
              {status === "critical" && (
                 <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs md:text-sm font-bold animate-bounce text-center">
                    🔥 โค้งสุดท้าย! รีบใช้สิทธิ์ด่วน
                 </div>
              )}
              {status === "ended" && (
                 <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 text-gray-500 border border-gray-300 text-xs md:text-sm font-bold">
                    🔒 ปิดหีบเลือกตั้งแล้ว
                 </div>
              )}
            </div>

            {/* Date Badge */}
            <div className="mb-6 md:mb-8">
              <span className="text-slate-500 text-xs md:text-sm font-medium">{dateLabel}</span><br/>
              <strong className="text-slate-800 text-lg md:text-xl block mt-1">
                {displayDateText}
              </strong>
            </div>

            {/* Countdown Timer */}
            <div className="grid grid-cols-4 gap-2 md:gap-6 mb-8 md:mb-10 max-w-lg mx-auto opacity-100 transition-opacity">
               <TimeBox value={timeLeft.days} label="วัน" isUrgent={status === 'urgent' || status === 'critical'} isWaiting={status === 'waiting'} />
               <TimeBox value={timeLeft.hours} label="ชั่วโมง" isUrgent={status === 'urgent' || status === 'critical'} isWaiting={status === 'waiting'} />
               <TimeBox value={timeLeft.minutes} label="นาที" isUrgent={status === 'critical'} isWaiting={status === 'waiting'} />
               <TimeBox value={timeLeft.seconds} label="วินาที" isUrgent={status === 'critical'} isWaiting={status === 'waiting'} />
            </div>

            {/* CTA Button */}
            {status === "waiting" ? (
              <button disabled className="w-full md:w-auto bg-blue-100 text-blue-500 px-8 md:px-12 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg cursor-not-allowed border border-blue-200">
                โปรดรอเวลาเปิดหีบ
              </button>
            ) : status !== "ended" && status !== "loading" ? (
              <Link
                to="/candidates"
                className={`group relative inline-flex items-center justify-center w-full md:w-auto px-8 md:px-12 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg shadow-lg hover:scale-105 transition-all duration-300 text-white
                  ${status === 'critical' ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:shadow-red-200' : 
                    status === 'urgent' ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:shadow-orange-200' :
                    'bg-gradient-to-r from-emerald-600 to-green-500 hover:shadow-emerald-200'
                  }
                `}
              >
                <span>ไปหน้าคูหาเลือกตั้ง</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            ) : (
              <button disabled className="w-full md:w-auto bg-gray-300 text-gray-500 px-8 md:px-12 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg cursor-not-allowed">
                {status === "loading" ? "กำลังโหลด..." : "หมดเวลาการลงคะแนน"}
              </button>
            )}
            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 max-w-4xl mx-auto pb-10">
            <QuickCard title="ตรวจสอบรายชื่อ" desc="ดูรายชื่อผู้สมัครและนโยบาย" link="/candidates" color="bg-blue-50 text-blue-600" />
            <QuickCard title="ผลคะแนน Real-time" desc="ติดตามสถานการณ์ล่าสุด" link="/dashboard" color="bg-purple-50 text-purple-600" />
            <QuickCard title="วิธีการลงคะแนน" desc="ขั้นตอนการใช้สิทธิ์" link="/voteguide" color="bg-orange-50 text-orange-600" />
          </div>

        </main>
      </div>
    </Layout>
  );
}

function TimeBox({ value, label, isUrgent, isWaiting }) {
  return (
    <div className={`
      rounded-xl p-2 md:p-4 shadow-lg flex flex-col items-center justify-center min-w-[60px] md:min-w-[70px] transition-colors duration-500
      ${isUrgent ? 'bg-red-600 animate-pulse' : isWaiting ? 'bg-blue-600' : 'bg-slate-800'}
    `}>
      <div className="text-xl md:text-4xl font-bold font-mono text-white">
        {String(value).padStart(2, '0')}
      </div>
      <div className={`text-[10px] md:text-xs uppercase tracking-wide mt-0.5 md:mt-1 ${isUrgent ? 'text-red-100' : isWaiting ? 'text-blue-200' : 'text-slate-400'}`}>
        {label}
      </div>
    </div>
  );
}

function QuickCard({ title, desc, link, color }) {
  return (
    <Link to={link} className="group bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-start gap-3 md:gap-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
         <div className="w-5 h-5 bg-current rounded-full opacity-50"></div>
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">{title}</h3>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">{desc}</p>
      </div>
    </Link>
  );
}