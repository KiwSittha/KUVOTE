import React, { useState } from 'react';
import Layout from './components/Layout'; // ปรับ Path ให้ตรงกับโปรเจกต์คุณ

const policiesData = [
  { id: 'study', label: 'การศึกษา', icon: '📚' },
  { id: 'skill_workshop', label: 'อัปสกิล/ฝึกงาน', icon: '💡' },
  { id: 'equipment_borrow', label: 'ตู้ยืมอุปกรณ์ฉุกเฉิน (สายชาร์จ/ร่ม)', icon: '☂️' },
  { id: 'swap_market', label: 'ตลาดนัดส่งต่อของมือสอง (ประหยัดเงิน)', icon: '♻️' }
];

export default function Recommend() {
  // ✅ 1. แก้ไข key ตรงนี้ให้ตรงกับ id ใน policiesData ('study' ไม่ใช่ 'academic_review')
  const [ratings, setRatings] = useState({
    study: null,
    skill_workshop: null,
    equipment_borrow: null,
    swap_market: null
  });
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (id, value) => {
    setRatings(prev => {
      const newRatings = { ...prev };

      if (newRatings[id] === value) {
        newRatings[id] = null;
        return newRatings;
      }

      Object.keys(newRatings).forEach(key => {
        if (newRatings[key] === value) {
          newRatings[key] = null;
        }
      });

      newRatings[id] = value;
      return newRatings;
    });
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings })
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
    setLoading(false);
  };

  const resetSelection = () => {
    // ✅ 2. แก้ไข key ตรงนี้เวลา Reset ด้วย
    setRatings({ study: null, skill_workshop: null, equipment_borrow: null, swap_market: null });
    setResults([]);
  };

  const getScoreColor = (score, isSelected) => {
    const colors = {
      1: isSelected ? 'bg-red-500 text-white border-red-500 shadow-md scale-110' : 'bg-white text-gray-400 border-gray-200 hover:border-red-300 hover:bg-red-50',
      2: isSelected ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-110' : 'bg-white text-gray-400 border-gray-200 hover:border-orange-300 hover:bg-orange-50',
      3: isSelected ? 'bg-yellow-500 text-white border-yellow-500 shadow-md scale-110' : 'bg-white text-gray-400 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50',
      4: isSelected ? 'bg-green-500 text-white border-green-500 shadow-md scale-110' : 'bg-white text-gray-400 border-gray-200 hover:border-green-300 hover:bg-green-50',
      5: isSelected ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-110' : 'bg-white text-gray-400 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50',
    };
    return colors[score];
  };

  // เช็คว่าให้คะแนนครบทุกข้อหรือยัง? (ถ้ามีค่า null แปลว่ายังไม่ครบ)
  const isFormIncomplete = Object.values(ratings).some(value => value === null);

  return (
    <Layout>
      <div className="py-8 px-4 md:px-8 max-w-4xl mx-auto w-full font-sans text-gray-800 animate-fade-in">
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-emerald-700 mb-2">
          ค้นหาผู้สมัครที่ใช่สำหรับคุณ 🎓
        </h1>
        <p className="text-center text-gray-500 mb-8 font-medium">KUVote Recommendation System</p>
        
        {!results.length > 0 ? (
          <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg text-sm md:text-base text-emerald-800 shadow-sm">
              💡 <strong>คำแนะนำ:</strong> เรียงลำดับความสำคัญของนโยบาย (5 = สำคัญที่สุด, 1 = น้อยที่สุด) 
              <br/><span className="text-red-500 font-bold">* แต่ละคะแนนจะเลือกได้แค่หัวข้อเดียวเท่านั้น ห้ามซ้ำกัน</span>
            </div>
            
            <div className="space-y-5 md:space-y-6">
              {policiesData.map(policy => (
                <div key={policy.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                  <div className="text-base md:text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                    <span className="text-2xl">{policy.icon}</span>
                    {policy.label}
                  </div>
                  
                  <div className="flex justify-between items-center gap-2 md:gap-4">
                    <span className="text-xs font-bold text-gray-400 hidden md:block w-16 text-right">น้อยที่สุด</span>
                    {[1, 2, 3, 4, 5].map(score => {
                      const isSelected = ratings[policy.id] === score;
                      
                      // เช็คว่าคะแนนนี้โดนหัวข้ออื่นแย่งไปหรือยัง (เพื่อให้ปุ่มมันดูทึบลงนิดหน่อยถ้าถูกคนอื่นใช้ไปแล้ว)
                      const isUsedByOthers = Object.entries(ratings).some(([k, v]) => v === score && k !== policy.id);

                      return (
                        <button
                          key={score}
                          onClick={() => handleRatingChange(policy.id, score)}
                          className={`
                            flex-1 h-12 md:h-14 rounded-xl border-2 font-bold text-lg md:text-xl transition-all duration-200 ease-in-out transform
                            ${getScoreColor(score, isSelected)}
                            ${isUsedByOthers && !isSelected ? 'opacity-30 border-dashed border-gray-300' : 'opacity-100'}
                          `}
                        >
                          {score}
                        </button>
                      );
                    })}
                    <span className="text-xs font-bold text-gray-400 hidden md:block w-16 text-left">สำคัญที่สุด</span>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={fetchRecommendations} 
              // ปุ่มจะกดไม่ได้ถ้ายังจัดอันดับไม่ครบ (4 ข้อ)
              disabled={loading || isFormIncomplete}
              className={`
                w-full mt-4 py-4 rounded-2xl font-bold text-xl text-white transition-all shadow-lg
                ${(loading || isFormIncomplete)
                  ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:-translate-y-1'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังประมวลผล...
                </span>
              ) : isFormIncomplete ? (
                'กรุณาให้คะแนนให้ครบทุกข้อ'
              ) : '🔍 วิเคราะห์ผู้สมัครที่เหมาะสม'}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-gray-800">ผลการจับคู่ของคุณ 📊</h2>
              <button 
                onClick={resetSelection}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-4 py-2 rounded-full transition-colors"
              >
                🔄 ทำใหม่
              </button>
            </div>
            
            <div className="grid gap-6">
              {results.map((cand, index) => (
                <div key={cand.id} className={`
                  p-6 rounded-3xl border-2 transition-all relative overflow-hidden
                  ${index === 0 
                    ? 'border-emerald-400 bg-emerald-50 shadow-emerald-100/50 shadow-xl' 
                    : 'border-slate-200 bg-white shadow-sm'}
                `}>
                  {index === 0 && (
                     <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                       ตรงใจที่สุด ⭐
                     </div>
                  )}
                  
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">{cand.name}</h3>
                      <p className="text-sm font-medium text-emerald-600 mt-1">{cand.faculty}</p>
                    </div>
                    
                    <div className="text-center md:text-right bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100">
                      <div className={`text-4xl font-black ${index === 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                        {cand.matchScore}%
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Match Score</span>
                    </div>
                  </div>
                  
                  <div className="mt-5 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-slate-100 text-sm text-slate-700">
                    <strong className="text-slate-900 block mb-2">นโยบายเด่น:</strong>
                    <div className="flex flex-wrap gap-2">
                      {cand.policies.map((p, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}