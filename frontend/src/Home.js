import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "./components/Layout";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [status, setStatus] = useState("normal");

  // ✅ 1. กำหนดวันหมดเขต
  const TARGET_ISO_DATE = "2026-01-01T16:00:00"; 
  
  // ✅ 2. แปลงเป็นรูปแบบภาษาไทย
  const targetDateObj = new Date(TARGET_ISO_DATE);
  const thaiDate = targetDateObj.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const thaiTime = targetDateObj.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const displayDateText = `${thaiDate} เวลา ${thaiTime} น.`;

  // ==============================
  // 🕒 Logic นับถอยหลัง
  // ==============================
  useEffect(() => {
    const targetDate = new Date(TARGET_ISO_DATE).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setStatus("ended");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });

        const oneHour = 1000 * 60 * 60;
        const oneDay = oneHour * 24;

        if (distance < oneHour) setStatus("critical");
        else if (distance < oneDay) setStatus("urgent");
        else setStatus("normal");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [TARGET_ISO_DATE]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[85vh] py-8 md:py-10 animate-fade-in-up">
        
        <main className="w-full max-w-5xl px-4">

          {/* ================= Header Title ================= */}
          <div className="text-center mb-8 md:mb-12">
            {/* ปรับขนาดตัวอักษร: มือถือ 3xl, จอใหญ่ 6xl */}
            <h1 className="text-3xl md:text-6xl font-extrabold text-slate-800 tracking-tight leading-tight mb-2">
              ระบบเลือกตั้ง<span className="block md:inline text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-400">ประธานนิสิต</span>
            </h1>
            <h2 className="text-lg md:text-2xl font-medium text-slate-500 mt-2">
              มหาวิทยาลัยเกษตรศาสตร์
            </h2>
          </div>

          {/* ================= Status Card ================= */}
          {/* ปรับ Padding: มือถือ p-6, จอใหญ่ p-12 */}
          <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-6 md:p-12 text-center max-w-3xl mx-auto">
            
            {/* Background Decoration */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r 
              ${status === 'critical' ? 'from-red-500 via-orange-500 to-red-600' : 
                status === 'urgent' ? 'from-orange-400 via-yellow-500 to-orange-600' :
                status === 'ended' ? 'from-gray-400 to-slate-600' :
                'from-emerald-400 via-green-500 to-emerald-600'
              }`}>
            </div>
            
            {/* 🚨 ALERT BANNER */}
            <div className="mb-6 md:mb-8 flex justify-center">
              {status === "normal" && (
                 <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs md:text-sm font-bold">
                    <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
                    </span>
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
              <span className="text-slate-500 text-xs md:text-sm font-medium">วันปิดรับลงคะแนน</span><br/>
              <strong className="text-slate-800 text-lg md:text-xl block mt-1">
                {displayDateText}
              </strong>
            </div>

            {/* Countdown Timer */}
            {/* ปรับ Gap: มือถือ gap-2, จอใหญ่ gap-6 */}
            <div className="grid grid-cols-4 gap-2 md:gap-6 mb-8 md:mb-10 max-w-lg mx-auto">
               <TimeBox value={timeLeft.days} label="วัน" isUrgent={status === 'urgent' || status === 'critical'} />
               <TimeBox value={timeLeft.hours} label="ชั่วโมง" isUrgent={status === 'urgent' || status === 'critical'} />
               <TimeBox value={timeLeft.minutes} label="นาที" isUrgent={status === 'critical'} />
               <TimeBox value={timeLeft.seconds} label="วินาที" isUrgent={status === 'critical'} />
            </div>

            {/* CTA Button */}
            {/* ปรับปุ่ม: มือถือ w-full (เต็มจอ), จอใหญ่ w-auto */}
            {status !== "ended" ? (
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
                หมดเวลาการลงคะแนน
              </button>
            )}
            
          </div>

          {/* ================= Quick Menu Cards ================= */}
          {/* Grid Cards: มือถือ 1 แถว, จอใหญ่ 3 แถว */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 max-w-4xl mx-auto pb-10">
            <QuickCard 
              title="ตรวจสอบรายชื่อ" 
              desc="ดูรายชื่อผู้สมัครและนโยบาย" 
              link="/candidates" 
              color="bg-blue-50 text-blue-600"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>} 
            />
            <QuickCard 
              title="ผลคะแนน Real-time" 
              desc="ติดตามสถานการณ์ล่าสุด" 
              link="/dashboard" 
              color="bg-purple-50 text-purple-600"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>} 
            />
            <QuickCard 
              title="วิธีการลงคะแนน" 
              desc="ขั้นตอนการใช้สิทธิ์" 
              link="#" 
              color="bg-orange-50 text-orange-600"
              icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>} 
            />
          </div>

        </main>
      </div>
    </Layout>
  );
}

// Component กล่องเวลา: ปรับขนาดตัวอักษรให้ responsive
function TimeBox({ value, label, isUrgent }) {
  return (
    <div className={`
      rounded-xl p-2 md:p-4 shadow-lg flex flex-col items-center justify-center min-w-[60px] md:min-w-[70px] transition-colors duration-500
      ${isUrgent ? 'bg-red-600 animate-pulse' : 'bg-slate-800'}
    `}>
      <div className="text-xl md:text-4xl font-bold font-mono text-white">
        {String(value).padStart(2, '0')}
      </div>
      <div className={`text-[10px] md:text-xs uppercase tracking-wide mt-0.5 md:mt-1 ${isUrgent ? 'text-red-100' : 'text-slate-400'}`}>
        {label}
      </div>
    </div>
  );
}

// Quick Card: ปรับ Padding และ Text size
function QuickCard({ title, desc, icon, link, color }) {
  return (
    <Link
      to={link}
      className="group bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 
                 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-start gap-3 md:gap-4"
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">
            {title}
        </h3>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5 md:mt-1">{desc}</p>
      </div>
    </Link>
  );
}