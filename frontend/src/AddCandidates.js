import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import StepBar from "./components/StepBar";
import { useLocation, useNavigate } from "react-router-dom";
import { checkCandidateEmail } from "./services/candidateService";

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
  CLUB: "ประธานสโมสรนิสิต"
};
const FACULTY_MAJORS = {
  "วิศวกรรมศาสตร์": [
    "วิศวกรรมไฟฟ้า",
    "วิศวกรรมโยธา",
    "วิศวกรรมอุตสาหการ",
    "วิศวกรรมเครื่องกล",
    "วิศวกรรมคอมพิวเตอร์"
  ],
  "วิทยาศาสตร์": [
    "ทรัพยากรและสิ่งแวดล้อม",
    "วิทยาศาสตร์พื้นฐานและพลศึกษา",
    "วิทยาการคอมพิวเตอร์และสารสนเทศ"
  ],
  "วิทยาการจัดการ": [
    "การจัดการ",
    "ธุรกิจระหว่างประเทศ",
    "การจัดการอุตสาหกรรมการบริการ",
    "การบัญชี",
    "การตลาดดิจิทัลและการสร้างตรา",
    "การจัดการโลจิสติกส์",
    "การเงินและการลงทุน"

  ],
  "เศรษฐศาสตร์": [
    "เศรษฐศาสตร์",
    "เศรษฐศาสตร์ประยุกต์"
  ],
  "พาณิชยนาวีนานาชาติ": [
    "วิทยาการเดินเรือและโลจิสติกส์ทางทะเล",
    "วิศวกรรมทางทะเล"
  ]
};
const dropdownClass = `
w-full
border border-slate-300
rounded-xl
px-4 py-3 pr-10
bg-white
text-slate-700
shadow-sm
focus:ring-2 focus:ring-emerald-500
focus:border-emerald-500
outline-none
transition
appearance-none
`;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// ตรวจว่าข้อความดูเป็นคำจริง ไม่ใช่พิมพ์มั่ว
const isValidText = (text, min = 5) => {
  const trimmed = text.trim();

  if (trimmed.length < min) return false;

  // ห้ามตัวอักษรซ้ำ เช่น aaaaa หรือ กกกกก
  if (/^(.)\1+$/.test(trimmed)) return false;

  // ห้ามตัวเลขล้วน
  if (/^\d+$/.test(trimmed)) return false;

  // ต้องมีตัวอักษรไทยหรืออังกฤษ
  if (!/[a-zA-Zก-๙]/.test(trimmed)) return false;

  // ห้ามคำที่ซ้ำ pattern เช่น testtest
  if (/(\w{2,})\1+/.test(trimmed)) return false;

  return true;
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
    if (location.state?.form) {
      setForm(location.state.form);
    }

    if (location.state?.policies) {
      setPolicies(location.state.policies);
    }

    if (location.state?.weights) {
      const w = location.state.weights;

      setCorePolicyRanks({
        study: w.study !== undefined ? Math.round(w.study * 4 + 1) : null,
        skill_workshop: w.skill_workshop !== undefined ? Math.round(w.skill_workshop * 4 + 1) : null,
        equipment_borrow: w.equipment_borrow !== undefined ? Math.round(w.equipment_borrow * 4 + 1) : null,
        swap_market: w.swap_market !== undefined ? Math.round(w.swap_market * 4 + 1) : null
      });
    }

    if (location.state?.profilePreview) {
      setProfilePreview(location.state.profilePreview);
    }

  }, [location.state]);

useEffect(() => {
  if (location.state?.form) {
    setForm(location.state.form);
  }

  if (location.state?.policies) {
    setPolicies(location.state.policies);
  }

  if (location.state?.weights) {
    const w = location.state.weights;

    setCorePolicyRanks({
      study: w.study !== undefined ? Math.round(w.study * 4 + 1) : null,
      skill_workshop: w.skill_workshop !== undefined ? Math.round(w.skill_workshop * 4 + 1) : null,
      equipment_borrow: w.equipment_borrow !== undefined ? Math.round(w.equipment_borrow * 4 + 1) : null,
      swap_market: w.swap_market !== undefined ? Math.round(w.swap_market * 4 + 1) : null
    });
  }

  if (location.state?.profilePreview) {
    setProfilePreview(location.state.profilePreview);
  }

  // ⭐ เพิ่มบรรทัดนี้
  if (location.state?.step) {
    setStep(location.state.step);
  }

}, [location.state]);

  useEffect(() => {
    if (form.profileImage) {
      const preview = URL.createObjectURL(form.profileImage);
      setProfilePreview(preview);
    }
  }, [form.profileImage]);

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
 const handleNextStep1 = async () => {

  const requiredFields = ["name", "faculty", "major", "year", "email", "phone"];
  const hasEmptyField = requiredFields.some(
    field => !form[field] || form[field].trim() === ""
  );

  if (hasEmptyField) {
    return alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
  }

  if (!emailRegex.test(form.email)) {
    return alert("รูปแบบ Email ไม่ถูกต้อง");
  }

  if (!form.profileImage) {
    return alert("กรุณาอัปโหลดรูปโปรไฟล์");
  }

  try {
    const result = await checkCandidateEmail(form.email.toLowerCase());

    if (result.exists) {
      alert("อีเมลนี้มีผู้สมัครใช้ไปแล้ว");
      return;
    }

  } catch (error) {
    alert("ไม่สามารถตรวจสอบอีเมลได้ กรุณาลองใหม่");
    return;
  }

  setStep(2);
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

          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">

              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                ข้อมูลผู้สมัคร
              </h2>

              <div className="grid md:grid-cols-2 gap-6">

                {/* ชื่อ */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-600">
                    ชื่อ–นามสกุล <span className="text-red-500">*</span>
                  </label>

                  <input
  autoComplete="off"
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  className="w-full border border-slate-300 rounded-xl p-3"
/>
                </div>
                <div className="space-y-1 relative">

                  <label className="text-sm font-semibold text-slate-600">
                    คณะ <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={form.faculty}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        faculty: e.target.value,
                        major: ""
                      })
                    }
                    className={dropdownClass}
                  >

                    <option value="" disabled hidden className="text-gray-400">
                      เลือกคณะ
                    </option>

                    {Object.keys(FACULTY_MAJORS).map((faculty) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}

                  </select>

                  <div className="absolute right-4 top-10 pointer-events-none text-slate-400">
                    ▼
                  </div>

                </div>



                <div className="space-y-1 relative">

                  <label className="text-sm font-semibold text-slate-600">
                    สาขาวิชา <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={form.major}
                    disabled={!form.faculty}
                    onChange={(e) => setForm({ ...form, major: e.target.value })}
                    className={`${dropdownClass} disabled:bg-gray-100`}
                  >

                    <option value="" disabled hidden>
                      เลือกสาขา
                    </option>

                    {form.faculty &&
                      FACULTY_MAJORS[form.faculty]?.map((major) => (
                        <option key={major} value={major}>
                          {major}
                        </option>
                      ))}

                  </select>

                  <div className="absolute right-4 top-10 pointer-events-none text-slate-400">
                    ▼
                  </div>

                </div><div className="space-y-1 relative">

                  <label className="text-sm font-semibold text-slate-600">
                    ชั้นปี <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className={dropdownClass}
                  >

                    <option value="" disabled hidden>
                      เลือกชั้นปี
                    </option>

                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>

                  </select>

                  <div className="absolute right-4 top-10 pointer-events-none text-slate-400">
                    ▼
                  </div>

                </div>
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">
                    Email <span className="text-red-500">*</span>
                  </label>

                  <input
  value={form.email}
  onChange={(e) =>
    setForm({ ...form, email: e.target.value.toLowerCase() })
  }
  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
/>

                </div>

                {/* โทร */}
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-600">
                    เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "")
                      setForm({ ...form, phone: onlyNumbers })
                    }}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500"
                  />

                </div>

              </div>

              {/* Upload รูป */}
              <div className="mt-8 space-y-3">

                <label className="text-sm font-semibold text-slate-600">
                  รูปโปรไฟล์ <span className="text-red-500">*</span>
                </label>

                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    const preview = URL.createObjectURL(file);

                    setProfilePreview(preview);
                    setForm(prev => ({
                      ...prev,
                      profileImage: file,
                    }));
                  }}
                />

                {profilePreview && (
                  <div className="flex justify-center mt-4">
                    <img
                      src={profilePreview}
                      alt="รูปโปรไฟล์ผู้สมัคร"
                      className="w-44 h-44 object-cover rounded-2xl border shadow"
                    />
                  </div>
                )}

              </div>

              <button
                onClick={handleNextStep1}
                className="mt-8 w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"

              >
                ถัดไป →
              </button>

            </div>
          )}



          {/* ================= STEP 3 ================= */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow p-10 space-y-8 animate-fade-in-up">

              {/* ✅ ส่วนที่ 1: ให้คะแนนนโยบายหลัก (1-5) */}
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-800">1. ระดับความสำคัญนโยบายพรรค (มีผลต่อการเลือก)</h2>
                  <p className="text-sm text-red-500 font-medium">
                    * ให้คะแนน 1-5 ตามความสำคัญ (5 = เน้นมากที่สุด, 1 = น้อยที่สุด)
                    <br />** ห้ามให้คะแนนซ้ำกันเด็ดขาด (คะแนน 1 ค่า ใช้ได้ 1 นโยบายเท่านั้น)
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
                  onClick={() => setStep(1)}
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
                    const hasInvalidPolicies = policies.some(p => p.trim() !== "" && !isValidText(p, 5));

                    if (hasInvalidPolicies) {
                      return alert("นโยบายต้องมีความหมายและยาวอย่างน้อย 5 ตัวอักษร");
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
    profilePreview,
    step: 2
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