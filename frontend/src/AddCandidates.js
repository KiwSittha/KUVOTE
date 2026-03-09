import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import StepBar from "./components/StepBar";
import { useLocation, useNavigate } from "react-router-dom";

// ✅ ข้อมูลนโยบายหลักที่บังคับให้จัดอันดับ (มี 4 ข้อเหมือนเดิม)
const policiesData = [
  { id: 'study', label: 'การศึกษา', icon: '📚' },
  { id: 'skill_workshop', label: 'อัปสกิล/ฝึกงาน', icon: '💡' },
  { id: 'equipment_borrow', label: 'ตู้ยืมอุปกรณ์ฉุกเฉิน (สายชาร์จ/ร่ม)', icon: '☂️' },
  { id: 'swap_market', label: 'ตลาดนัดส่งต่อของมือสอง (ประหยัดเงิน)', icon: '♻️' }
];

const POSITION_LABELS = {
  OBK: "นายกองค์การบริหารนิสิต (อบก.)",
  REPRESENTATIVE: "สมาชิกสภานิสิต",
  AddClubPresident: "นายกสโมสรนิสิต",
  CLUB: "นายกสโมสรนิสิต"
};

function AddCandidates() {
  const location = useLocation();
  const navigate = useNavigate();

  const position = location.state?.position;

  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState(null);

  const [form, setForm] = useState({
    studentId: "",
    name: "",
    nickname: "",
    faculty: "",
    major: "",
    year: "",
    email: "",
    position: position || "",
    partyName: "",
    slogan: "",
    phone: "",
    profileImage: null
  });

  // ✅ State สำหรับเก็บการให้คะแนน 1-5 (เริ่มต้นเป็น null)
  const [corePolicyRanks, setCorePolicyRanks] = useState({
    study: null,
    skill_workshop: null,
    equipment_borrow: null,
    swap_market: null
  });

  const [policies, setPolicies] = useState([""]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setForm(prev => ({
        ...prev,
        name: storedUser.name || "",
        faculty: storedUser.faculty || "",
        major: storedUser.major || "",
        year: storedUser.year || "",
        email: storedUser.email || ""
      }));
    }
  }, []);

  useEffect(() => {
    if (!position) {
      navigate("/select-position");
    }
  }, [position, navigate]);

  if (!position) return null;

  const addPolicy = () => setPolicies([...policies, ""]);
  const updatePolicy = (index, value) => {
    const updated = [...policies];
    updated[index] = value;
    setPolicies(updated);
  };
  const deletePolicy = (index) => {
    if (index === 0) return;
    const updated = policies.filter((_, i) => i !== index);
    setPolicies(updated);
  };

  const handleRankChange = (policyId, scoreValue) => {
    setCorePolicyRanks(prev => {
      const newRanks = { ...prev };
      if (newRanks[policyId] === scoreValue) {
        newRanks[policyId] = null;
        return newRanks;
      }
      Object.keys(newRanks).forEach(key => {
        if (newRanks[key] === scoreValue) {
          newRanks[key] = null;
        }
      });
      newRanks[policyId] = scoreValue;
      return newRanks;
    });
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

  // ✅ ดักจับ Step 1
  const handleNextStep1 = () => {
    const requiredFields = ["name", "faculty", "major", "year", "email", "nickname", "phone"];
    const hasEmptyField = requiredFields.some(field => !form[field] || form[field].trim() === "");
    
    if (hasEmptyField) {
      return alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    }
    if (!form.profileImage) {
      return alert("กรุณาอัปโหลดรูปโปรไฟล์");
    }
    if (form.phone.length < 9) {
      return alert("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
    }
    setStep(2);
  };

  // ✅ ดักจับ Step 2
  const handleNextStep2 = () => {
    if (!form.partyName.trim() || !form.slogan.trim()) {
      return alert("กรุณากรอกชื่อพรรคและสโลแกนให้ครบถ้วน");
    }
    setStep(3);
  };

  return (
    <Layout>
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-[1200px] mx-auto space-y-10">

          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              สมัครรับเลือกตั้ง
            </h1>
            <p className="text-slate-500 mt-1">
              ตำแหน่ง: {POSITION_LABELS[position] || position}
            </p>
          </div>

          <StepBar step={step} />

          {/* ================= STEP 1 ================= */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow p-10 space-y-6 animate-fade-in-up">
              <h2 className="text-xl font-semibold">ข้อมูลผู้สมัคร</h2>

              {["name", "faculty", "major", "year", "email"].map((field, i) => {
                const isLocked = field === "faculty" || field === "email";

                return (
                  <div key={i} className="space-y-1">
                    <label className="text-sm font-medium">
                      {field === "name" && "ชื่อ–นามสกุล"}
                      {field === "faculty" && "คณะ"}
                      {field === "major" && "สาขาวิชา"}
                      {field === "year" && "ชั้นปี"}
                      {field === "email" && "Email"}
                      <span className="text-red-500 ml-1">*</span>
                    </label>

                    <input
                      value={form[field]}
                      readOnly={isLocked}
                      onChange={(e) =>
                        !isLocked &&
                        setForm({ ...form, [field]: e.target.value })
                      }
                      className={`border p-3 rounded-xl w-full ${
                        isLocked ? "bg-gray-100 cursor-not-allowed text-slate-500" : "focus:ring-2 focus:ring-emerald-500 outline-none"
                      }`}
                    />
                  </div>
                );
              })}
              
              <div className="space-y-1">
                <label className="text-sm font-medium">ชื่อเล่น <span className="text-red-500">*</span></label>
                <input
                  className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={form.nickname}
                  onChange={(e) =>
                    setForm({ ...form, nickname: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">เบอร์โทรศัพท์ <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  maxLength={10}
                  className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={form.phone}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    if (onlyNumbers.length <= 10) {
                      setForm({ ...form, phone: onlyNumbers });
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">รูปโปรไฟล์ <span className="text-red-500">*</span></label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setProfilePreview(URL.createObjectURL(file));
                    setForm(prev => ({ ...prev, profileImage: file }));
                  }}
                />
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="preview"
                    className="w-40 h-40 rounded-xl object-cover mt-2 shadow-sm border border-slate-200"
                  />
                )}
              </div>

              <button
                onClick={handleNextStep1} // ✅ เรียกฟังก์ชันตรวจจับ
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
              >
                ถัดไป →
              </button>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow p-10 space-y-6 animate-fade-in-up">
              <h2 className="text-xl font-semibold">ข้อมูลการลงสมัคร</h2>

              <div>
                <label className="text-sm font-medium mb-1 block">ชื่อพรรค / ทีม <span className="text-red-500">*</span></label>
                <input
                  className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="เช่น พรรคก้าวใหม่"
                  value={form.partyName}
                  onChange={(e) =>
                    setForm({ ...form, partyName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">สโลแกน <span className="text-red-500">*</span></label>
                <input
                  className="border p-3 rounded-xl w-full focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="เช่น เปลี่ยนเพื่อสิ่งที่ดีกว่า"
                  value={form.slogan}
                  onChange={(e) =>
                    setForm({ ...form, slogan: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl bg-slate-200 font-bold hover:bg-slate-300 transition"
                >
                  กลับ
                </button>
                <button
                  onClick={handleNextStep2} // ✅ เรียกฟังก์ชันตรวจจับ
                  className="flex-1 py-3 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
                >
                  ถัดไป →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow p-10 space-y-8 animate-fade-in-up">
              
              {/* ✅ ส่วนที่ 1: ให้คะแนนนโยบายหลัก (1-5) */}
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-800">1. ระดับความสำคัญนโยบายพรรค (มีผลต่อการเลือก)</h2>
                  <p className="text-sm text-red-500 font-medium">
                    * ให้คะแนน 1-5 ตามความสำคัญ (5 = เน้นมากที่สุด, 1 = น้อยที่สุด) 
                    <br/>** ห้ามให้คะแนนซ้ำกันเด็ดขาด (คะแนน 1 ค่า ใช้ได้ 1 นโยบายเท่านั้น)
                  </p>
                </div>
                
                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  {policiesData.map(policy => (
                    <div key={policy.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">{policy.icon}</span>
                        {policy.label}
                      </div>
                      
                      <div className="flex justify-between items-center gap-2 md:gap-4">
                        <span className="text-xs font-bold text-gray-400 hidden sm:block w-16 text-right">น้อยที่สุด</span>
                        
                        {/* ✅ ปุ่มให้คะแนน 1 ถึง 5 */}
                        {[1, 2, 3, 4, 5].map(score => {
                          const isSelected = corePolicyRanks[policy.id] === score;
                          const isUsedByOthers = Object.entries(corePolicyRanks).some(([k, v]) => v === score && k !== policy.id);

                          return (
                            <button
                              key={score}
                              onClick={() => handleRankChange(policy.id, score)}
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
                        
                        <span className="text-xs font-bold text-gray-400 hidden sm:block w-16 text-left">มากที่สุด</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* ส่วนที่ 2: นโยบายเพิ่มเติม */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-800">2. นโยบายเพิ่มเติม (พิมพ์เอง)</h2>
                
                {policies.map((policy, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input
                      className="border border-slate-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none p-3 rounded-xl w-full transition"
                      placeholder={`นโยบายเพิ่มเติมข้อที่ ${i + 1}`}
                      value={policy}
                      onChange={(e) => updatePolicy(i, e.target.value)}
                    />

                    {i !== 0 && (
                      <button
                        type="button"
                        onClick={() => deletePolicy(i)}
                        className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-600 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addPolicy}
                  className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  เพิ่มนโยบาย
                </button>
              </div>

              <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-slate-200 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-300 transition"
                >
                  กลับ
                </button>

                <button
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition hover:-translate-y-0.5"
                  onClick={() => {
                    // 1. เช็คว่ามีข้อไหนไม่ได้ให้คะแนนไหม?
                    const hasEmptyRanks = Object.values(corePolicyRanks).some(val => val === null);
                    if (hasEmptyRanks) {
                      return alert("กรุณาให้คะแนนนโยบายหลักพรรคให้ครบทุกข้อ");
                    }

                    // 2. เช็คนโยบายเพิ่มเติม (ถ้าพิมพ์ค้างไว้แล้วว่าง ให้เตือน)
                    const hasEmptyPolicies = policies.some(p => !p.trim());
                    if (hasEmptyPolicies) {
                      return alert("กรุณากรอกนโยบายเพิ่มเติมให้ครบ (หากไม่ต้องการ ให้ลบช่องว่างออก)");
                    }

                    const formattedWeights = {
                       study: (corePolicyRanks.study - 1) / 4,
                       skill_workshop: (corePolicyRanks.skill_workshop - 1) / 4,
                       equipment_borrow: (corePolicyRanks.equipment_borrow - 1) / 4,
                       swap_market: (corePolicyRanks.swap_market - 1) / 4,
                    };

                    navigate("/candidate-preview", {
                      state: { 
                        form, 
                        policies,
                        weights: formattedWeights,
                        profilePreview: profilePreview
                      }
                    });
                  }}
                >
                  ตรวจสอบข้อมูล →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}

export default AddCandidates;