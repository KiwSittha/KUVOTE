import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import StepBar from "./components/StepBar";
import { useLocation, useNavigate } from "react-router-dom";

const POSITION_LABELS = {
  OBK: "นายกองค์การบริหารนิสิต (อบก.)",
  REPRESENTATIVE: "สมาชิกผู้แทนนิสิต",
  CLUB: "นายกสโมสรนิสิต"
};

const CLUB_POSITIONS = [
  "นายกสโมสร",
  "รองนายก",
  "เลขานุการ",
  "เหรัญญิก",
  "ฝ่ายกิจกรรม",
  "ฝ่ายประชาสัมพันธ์"
];
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

const isReadableText = (text) => {
  if (!text) return false;

  const clean = text.trim();

  // ความยาวขั้นต่ำ
  if (clean.length < 2) return false;

  // ต้องเป็นไทยหรืออังกฤษเท่านั้น
  if (!/^[a-zA-Zก-๙\s]+$/.test(clean)) return false;

  // กันตัวอักษรซ้ำ เช่น aaaa / กกกก
  if (/(.)\1{3,}/.test(clean)) return false;

  return true;
};

const isReadableSentence = (text) => {
  if (!text) return false;

  const clean = text.trim();

  if (clean.length < 5) return false;

  if (!/^[a-zA-Zก-๙0-9\s.,!?()-]+$/.test(clean)) return false;

  if (/(.)\1{4,}/.test(clean)) return false;

  return true;
};
function AddCandidates() {
  const location = useLocation();
  const navigate = useNavigate();

  const position = location.state?.position;
  const [step, setStep] = useState(1);
  const [profilePreview, setProfilePreview] = useState(null);

  // ============ State สำหรับ OBK (Team) ============
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    teamLogo: null,
    slogan: "",
    logoPreview: null,
    leaderName: "",
    leaderFaculty: "",
    leaderMajor: "",
    leaderYear: "",
    leaderProfileImage: null,
    leaderProfilePreview: null,
    members: [],
    policies: [""]
  });

  // ============ State สำหรับ CLUB & REPRESENTATIVE ============
  const [form, setForm] = useState({
    name: "",
    nickname: "",
    faculty: "",
    major: "",
    year: "",
    email: "",
    phone: "",
    position: position || "",
    profileImage: null
  });

  const [policies, setPolicies] = useState([""]);
  const [developmentPlan, setDevelopmentPlan] = useState("");
  const [reason, setReason] = useState("");
  const [ideas, setIdeas] = useState("");
  const [studentCard, setStudentCard] = useState(null);

  useEffect(() => {
    if (!position) {
      navigate("/select-position");
    }
  }, [position, navigate]);

  if (!position) return null;


  // ================================
  // ===== OBK (Team) FUNCTIONS =====
  // ================================

  const handleTeamInputChange = (field, value) => {
    // ตรวจสอบ input ตัวอักษรที่ถูกต้องเท่านั้น
    if (field === "teamName" || field === "slogan") {
      const validText = /^[a-zA-Zก-๙0-9\s-()]*$/.test(value);
      if (!validText && value) return;
    }
    setTeamForm({ ...teamForm, [field]: value });
  };

  const addTeamMember = () => {
    setTeamForm({
      ...teamForm,
      members: [...teamForm.members, { name: "", position: "", faculty: "", major: "" }]
    });
  };

  const updateTeamMember = (index, field, value) => {
    // ตรวจสอบ name ให้มีเฉพาะตัวอักษรที่อ่านได้
    if (field === "name") {
      const validText = /^[a-zA-Zก-๙\s]*$/.test(value);
      if (!validText && value) return;
    }
    const updated = [...teamForm.members];
    // หากเปลี่ยนคณะ ให้เคลียร์สาขาเดิม
    if (field === "faculty") {
      updated[index] = { ...updated[index], faculty: value, major: "" };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setTeamForm({ ...teamForm, members: updated });
  };

  const removeTeamMember = (index) => {
    const updated = teamForm.members.filter((_, i) => i !== index);
    setTeamForm({ ...teamForm, members: updated });
  };

  const handleOBKStep1Next = () => {

  if (!teamForm.teamName.trim() || !teamForm.slogan.trim()) {
    return alert("กรุณากรอกชื่อทีมและสโลแกนให้ครบถ้วน");
  }

  // ใช้ระบบกันพิมพ์มั่ว
  if (!isReadableText(teamForm.teamName)) {
    return alert("ชื่อทีมต้องเป็นคำที่อ่านได้จริง");
  }

  if (!isReadableSentence(teamForm.slogan)) {
    return alert("สโลแกนต้องเป็นข้อความที่อ่านได้");
  }

  if (!teamForm.teamLogo) {
    return alert("กรุณาอัปโหลดโลโก้ทีม");
  }

  setStep(2);
};

  const handleOBKStep2Next = () => {

  if (!teamForm.leaderName.trim() || !teamForm.leaderFaculty || !teamForm.leaderYear) {
    return alert("กรุณากรอกข้อมูลหัวหน้าทีมให้ครบถ้วน");
  }

  if (!isReadableText(teamForm.leaderName)) {
    return alert("ชื่อหัวหน้าทีมต้องเป็นคำที่อ่านได้");
  }

  if (!teamForm.leaderProfileImage) {
    return alert("กรุณาอัปโหลดรูปหัวหน้าทีม");
  }

  setStep(3);
};
  const handleOBKStep3Next = () => {
    if (teamForm.members.length === 0) {
      return alert("กรุณาเพิ่มสมาชิกทีมอย่างน้อย 1 คน");
    }
    const allMembersComplete = teamForm.members.every(
      m => m.name.trim() && m.position && m.faculty && m.major
    );
    if (!allMembersComplete) {
      return alert("กรุณากรอกข้อมูลสมาชิกทั้งหมดให้ครบถ้วน");
    }
    const invalidMember = teamForm.members.some(
      m => !isReadableText(m.name)
    );

    if (invalidMember) {
      return alert("ชื่อสมาชิกต้องเป็นคำที่อ่านได้");
    }
    // ตรวจสอบชื่อสมาชิก - ความยาวและประเภท
    const hasInvalidLength = teamForm.members.some(
      m => m.name.trim().length < 2
    );
    if (hasInvalidLength) {
      return alert("ชื่อสมาชิกต้องมีความยาวอย่างน้อย 2 ตัวอักษร");
    }
    const hasInvalidName = teamForm.members.some(
      m => !/^[a-zA-Zก-๙\s]*$/.test(m.name)
    );
    if (hasInvalidName) {
      return alert("ชื่อสมาชิกต้องเป็นตัวอักษรเท่านั้น (ไม่รับตัวเลข สัญลักษณ์พิเศษ เช่น @#$%^)");
    }
    setStep(4);
  };

  const handleOBKStep4Next = () => {
    const invalidPolicy = teamForm.policies.some(
      p => !isReadableSentence(p)
    );

    if (invalidPolicy) {
      return alert("กรุณากรอกนโยบายที่อ่านได้");
    }

    setStep(5);
  };

  const handleOBKStep5Submit = () => {
    alert("ส่งข้อมูล นายก OBK สำเร็จ!");
  };

  // ================================
  // ==== INDIVIDUAL FUNCTIONS ======
  // ================================

  const handleInputChange = (field, value) => {
    // ตรวจสอบ input ตัวอักษรที่อ่านได้เท่านั้น
    if (field === "name" || field === "nickname") {
      const validText = /^[a-zA-Zก-๙\s]*$/.test(value);
      if (!validText && value) return;
    }

    setForm({ ...form, [field]: value });
  };

  const handleNextStep1 = () => {

  const requiredFields = ["name","faculty","year"];

  if (position === "CLUB") {
    requiredFields.push("nickname","major","email","phone");
  }

  const hasEmptyField = requiredFields.some(
    f => !form[f] || form[f].toString().trim() === ""
  );

  if (hasEmptyField) {
    return alert("กรุณากรอกข้อมูลให้ครบทุกช่อง");
  }

  if (!isReadableText(form.name)) {
    return alert("กรุณากรอกชื่อ–นามสกุลให้ถูกต้อง");
  }

  if (position === "CLUB" && !isReadableText(form.nickname)) {
    return alert("ชื่อเล่นต้องเป็นคำที่อ่านได้");
  }

  if (position === "CLUB") {

    if (!emailRegex.test(form.email)) {
      return alert("รูปแบบ Email ไม่ถูกต้อง");
    }

    if (!/^0\d{9}$/.test(form.phone)) {
      return alert("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
    }

  }

  if (!form.profileImage) {
    return alert("กรุณาอัปโหลดรูปโปรไฟล์");
  }

  setStep(2);
};

  const handleClubStep2Next = () => {
    if (!developmentPlan.trim()) {
      return alert("กรุณากรอกนโยบายพัฒนาคณะ");
    }
    if (policies.some(p => p.trim().length === 0)) {
      return alert("กรุณากรอกเป้าหมายทั้งหมด");
    }
    setStep(3);
  };

  const handleRepresentativeStep2Next = () => {
    if (!isReadableSentence(reason)) {
      return alert("กรุณากรอกเหตุผลที่อ่านได้");
    }

    if (!isReadableSentence(ideas)) {
      return alert("กรุณากรอกแนวคิดที่อ่านได้");
    }

    setStep(3);
  };

  const handleRepresentativeStep3Submit = () => {
    alert("ส่งข้อมูล สมาชิกผู้แทนนิสิต สำเร็จ!");
  };
  const handleClubStep3Next = () => {
    if (!studentCard) {
      return alert("กรุณาอัปโหลดบัตรนิสิต");
    }
    setStep(4);
  };

  const handleClubStep4Submit = () => {
    alert("ส่งข้อมูล นายกสโมสร สำเร็จ!");
  };

  // ================================
  // ====== RENDER OBK FORM =========
  // ================================

  const renderOBKForm = () => {
    return (
      <>
        <StepBar step={step} maxSteps={5} />

        {/* STEP 1: ข้อมูลทีม */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">STEP 1: ข้อมูลทีม</h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  ชื่อทีม / ชื่อพรรค <span className="text-red-500">*</span>
                </label>
                <input
                  value={teamForm.teamName}
                  onChange={(e) => handleTeamInputChange("teamName", e.target.value)}
                  placeholder="เช่น พรรคก้าวใหม่"
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  สโลแกน <span className="text-red-500">*</span>
                </label>
                <input
                  value={teamForm.slogan}
                  onChange={(e) => handleTeamInputChange("slogan", e.target.value)}
                  placeholder="เช่น เปลี่ยนเพื่อสิ่งที่ดีกว่า"
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  โลโก้ทีม <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mt-2"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setTeamForm({
                      ...teamForm,
                      teamLogo: file,
                      logoPreview: URL.createObjectURL(file)
                    });
                  }}
                />
                {teamForm.logoPreview && (
                  <img src={teamForm.logoPreview} alt="โลโก้" className="w-32 h-32 object-cover rounded-xl mt-4" />
                )}
              </div>
            </div>

            <button
              onClick={handleOBKStep1Next}
              className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
            >
              ถัดไป →
            </button>
          </div>
        )}

        {/* STEP 2: หัวหน้าทีม */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">STEP 2: หัวหน้าทีม</h2>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-600">
                    ชื่อ–นามสกุล <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={teamForm.leaderName}
                    onChange={(e) => handleTeamInputChange("leaderName", e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                  />
                </div>

                <div className="relative">
                  <label className="text-sm font-semibold text-slate-600">
                    คณะ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={teamForm.leaderFaculty}
                    onChange={(e) => handleTeamInputChange("leaderFaculty", e.target.value)}
                    className={dropdownClass + " mt-2"}
                  >
                    <option value="" disabled hidden>เลือกคณะ</option>
                    {Object.keys(FACULTY_MAJORS).map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="text-sm font-semibold text-slate-600">
                    สาขาวิชา <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={teamForm.leaderMajor}
                    disabled={!teamForm.leaderFaculty}
                    onChange={(e) => handleTeamInputChange("leaderMajor", e.target.value)}
                    className={dropdownClass + " mt-2 disabled:bg-gray-100"}
                  >
                    <option value="" disabled hidden>เลือกสาขา</option>
                    {teamForm.leaderFaculty && FACULTY_MAJORS[teamForm.leaderFaculty]?.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <label className="text-sm font-semibold text-slate-600">
                    ชั้นปี <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={teamForm.leaderYear}
                    onChange={(e) => handleTeamInputChange("leaderYear", e.target.value)}
                    className={dropdownClass + " mt-2"}
                  >
                    <option value="" disabled hidden>เลือกชั้นปี</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  รูปหัวหน้าทีม <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mt-2"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setTeamForm({
                      ...teamForm,
                      leaderProfileImage: file,
                      leaderProfilePreview: URL.createObjectURL(file)
                    });
                  }}
                />
                {teamForm.leaderProfilePreview && (
                  <img src={teamForm.leaderProfilePreview} alt="รูป" className="w-44 h-44 object-cover rounded-2xl mt-4" />
                )}
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                ← กลับ
              </button>
              <button
                onClick={handleOBKStep2Next}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: สมาชิกทีม */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">STEP 3: สมาชิกทีม</h2>

            <div className="space-y-6">
              {teamForm.members.map((member, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-slate-700">สมาชิกคนที่ {idx + 1}</h3>
                    {idx > 0 && (
                      <button
                        onClick={() => removeTeamMember(idx)}
                        className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg"
                      >
                        ลบ
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-4 gap-4">
                    <input
                      placeholder="ชื่อ"
                      value={member.name}
                      onChange={(e) => updateTeamMember(idx, "name", e.target.value)}
                      className="border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <select
                      value={member.position}
                      onChange={(e) => updateTeamMember(idx, "position", e.target.value)}
                      className={dropdownClass}
                    >
                      <option value="" disabled hidden>ตำแหน่ง</option>
                      {CLUB_POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                    <select
                      value={member.faculty}
                      onChange={(e) => updateTeamMember(idx, "faculty", e.target.value)}
                      className={dropdownClass}
                    >
                      <option value="" disabled hidden>คณะ</option>
                      {Object.keys(FACULTY_MAJORS).map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                    <select
                      value={member.major}
                      disabled={!member.faculty}
                      onChange={(e) => updateTeamMember(idx, "major", e.target.value)}
                      className={dropdownClass + " disabled:bg-gray-100"}
                    >
                      <option value="" disabled hidden>สาขาวิชา</option>
                      {member.faculty && FACULTY_MAJORS[member.faculty]?.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <button
                onClick={addTeamMember}
                className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg transition"
              >
                <span>+ เพิ่มสมาชิก</span>
              </button>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                ← กลับ
              </button>
              <button
                onClick={handleOBKStep3Next}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: นโยบายทีม */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">STEP 4: นโยบายทีม</h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-600">นโยบายหลัก</label>
                {teamForm.policies.map((policy, i) => (
                  <div key={i} className="flex gap-2 mt-2">
                    <input
                      placeholder={`นโยบายข้อที่ ${i + 1}`}
                      value={policy}
                      onChange={(e) => {
                        const updated = [...teamForm.policies];
                        updated[i] = e.target.value;
                        setTeamForm({ ...teamForm, policies: updated });
                      }}
                      className="flex-1 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    {i > 0 && (
                      <button
                        onClick={() => {
                          const updated = teamForm.policies.filter((_, idx) => idx !== i);
                          setTeamForm({ ...teamForm, policies: updated });
                        }}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setTeamForm({ ...teamForm, policies: [...teamForm.policies, ""] })}
                  className="mt-2 text-emerald-600 font-bold hover:text-emerald-700"
                >
                  + เพิ่มนโยบาย
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                ← กลับ
              </button>
              <button
                onClick={handleOBKStep4Next}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ตรวจสอบข้อมูล */}
        {step === 5 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">✓ ตรวจสอบข้อมูลทีม</h2>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">ข้อมูลทีม</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-slate-600">ชื่อทีม:</p><p className="font-semibold">{teamForm.teamName}</p></div>
                  <div><p className="text-sm text-slate-600">สโลแกน:</p><p className="font-semibold">{teamForm.slogan}</p></div>
                  {teamForm.logoPreview && <div><img src={teamForm.logoPreview} alt="Logo" className="w-24 h-24 object-cover rounded" /></div>}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">หัวหน้าทีม</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-slate-600">ชื่อ:</p><p className="font-semibold">{teamForm.leaderName}</p></div>
                  <div><p className="text-sm text-slate-600">คณะ:</p><p className="font-semibold">{teamForm.leaderFaculty}</p></div>
                  <div><p className="text-sm text-slate-600">สาขา:</p><p className="font-semibold">{teamForm.leaderMajor}</p></div>
                  <div><p className="text-sm text-slate-600">ชั้นปี:</p><p className="font-semibold">{teamForm.leaderYear}</p></div>
                  {teamForm.leaderProfilePreview && <div><img src={teamForm.leaderProfilePreview} alt="Profile" className="w-24 h-24 object-cover rounded" /></div>}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">สมาชิกทีม ({teamForm.members.length} คน)</h3>
                <div className="space-y-2">
                  {teamForm.members.map((m, i) => (
                    <div key={i} className="text-sm"><span className="font-semibold">{i + 1}. {m.name}</span> - {m.position} ({m.faculty} / {m.major})</div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">นโยบาย</h3>
                <ul className="space-y-2">
                  {teamForm.policies.map((p, i) => (
                    <li key={i} className="text-sm">• {p}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                ← แก้ไข
              </button>
              <button
                onClick={handleOBKStep5Submit}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                ส่งข้อมูล ✓
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  // ================================
  // ==== CLUB FORM ==================
  // ================================

  const renderClubForm = () => {
    return (
      <>
        <StepBar step={step} maxSteps={4} />

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">ข้อมูลผู้สมัคร</h2>

            <div className="grid md:grid-cols-2 gap-6 space-y-6 md:space-y-0">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">
                  ชื่อ–นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  ชื่อเล่น <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.nickname}
                  onChange={(e) => handleInputChange("nickname", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  คณะ <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.faculty}
                  onChange={(e) => handleInputChange("faculty", e.target.value)}
                  className={dropdownClass + " mt-2"}
                >
                  <option value="" disabled hidden>เลือกคณะ</option>
                  {Object.keys(FACULTY_MAJORS).map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="text-sm font-semibold text-slate-600">
                  สาขาวิชา <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.major}
                  disabled={!form.faculty}
                  onChange={(e) => handleInputChange("major", e.target.value)}
                  className={dropdownClass + " mt-2 disabled:bg-gray-100"}
                >
                  <option value="" disabled hidden>เลือกสาขา</option>
                  {form.faculty && FACULTY_MAJORS[form.faculty]?.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="text-sm font-semibold text-slate-600">
                  ชั้นปี <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  className={dropdownClass + " mt-2"}
                >
                  <option value="" disabled hidden>เลือกชั้นปี</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/\D/g, "");
                    handleInputChange("phone", onlyNumbers);
                  }}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                />
              </div>
            </div>

            <div className="mt-8">
              <label className="text-sm font-semibold text-slate-600">
                รูปโปรไฟล์ <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mt-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setProfilePreview(URL.createObjectURL(file));
                  handleInputChange("profileImage", file);
                }}
              />
              {profilePreview && (
                <img src={profilePreview} alt="รูป" className="w-44 h-44 object-cover rounded-2xl mt-4" />
              )}
            </div>

            <button
              onClick={handleNextStep1}
              className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
            >
              ถัดไป →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">นโยบายพัฒนาคณะ</h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-600">นโยบายพัฒนาคณะ</label>
                <textarea
                  value={developmentPlan}
                  onChange={(e) => setDevelopmentPlan(e.target.value)}
                  placeholder="บอกเกี่ยวกับแผนพัฒนาคณะ"
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2 h-32"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">เป้าหมาย</label>
                {policies.map((policy, i) => (
                  <div key={i} className="flex gap-2 mt-2">
                    <input
                      placeholder={`เป้าหมายข้อที่ ${i + 1}`}
                      value={policy}
                      onChange={(e) => {
                        const updated = [...policies];
                        updated[i] = e.target.value;
                        setPolicies(updated);
                      }}
                      className="flex-1 border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    {i > 0 && (
                      <button
                        onClick={() => setPolicies(policies.filter((_, idx) => idx !== i))}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setPolicies([...policies, ""])}
                  className="mt-2 text-emerald-600 font-bold"
                >
                  + เพิ่มเป้าหมาย
                </button>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                ← กลับ
              </button>
              <button
                onClick={handleClubStep2Next}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">เอกสาร</h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  บัตรนิสิต <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mt-2"
                  onChange={(e) => setStudentCard(e.target.files[0])}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                ← กลับ
              </button>
              <button
                onClick={handleClubStep3Next}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: ตรวจสอบข้อมูล */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">✓ ตรวจสอบข้อมูล</h2>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">ข้อมูลส่วนตัว</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-slate-600">ชื่อ:</p><p className="font-semibold">{form.name}</p></div>
                  <div><p className="text-sm text-slate-600">ชื่อเล่น:</p><p className="font-semibold">{form.nickname}</p></div>
                  <div><p className="text-sm text-slate-600">คณะ:</p><p className="font-semibold">{form.faculty}</p></div>
                  <div><p className="text-sm text-slate-600">สาขา:</p><p className="font-semibold">{form.major}</p></div>
                  <div><p className="text-sm text-slate-600">ชั้นปี:</p><p className="font-semibold">{form.year}</p></div>
                  <div><p className="text-sm text-slate-600">Email:</p><p className="font-semibold">{form.email}</p></div>
                  <div><p className="text-sm text-slate-600">เบอร์โทร:</p><p className="font-semibold">{form.phone}</p></div>
                  {profilePreview && <div><img src={profilePreview} alt="Profile" className="w-24 h-24 object-cover rounded" /></div>}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">นโยบายพัฒนาคณะ</h3>
                <p className="text-sm">{developmentPlan}</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">เป้าหมาย</h3>
                <ul className="space-y-2">
                  {policies.map((p, i) => (
                    <li key={i} className="text-sm">• {p}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                ← แก้ไข
              </button>
              <button
                onClick={handleClubStep4Submit}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                ส่งข้อมูล ✓
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  // ================================
  // ==== REPRESENTATIVE FORM =======
  // ================================

  const renderRepresentativeForm = () => {
    return (
      <>
        <StepBar step={step} maxSteps={3} />

        {/* STEP 1 */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">ข้อมูลผู้สมัคร</h2>

            <div className="grid md:grid-cols-2 gap-6 space-y-6 md:space-y-0">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">
                  ชื่อ–นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2"
                />
              </div>

              <div className="relative">
                <label className="text-sm font-semibold text-slate-600">
                  คณะ <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.faculty}
                  onChange={(e) => handleInputChange("faculty", e.target.value)}
                  className={dropdownClass + " mt-2"}
                >
                  <option value="" disabled hidden>เลือกคณะ</option>
                  {Object.keys(FACULTY_MAJORS).map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="text-sm font-semibold text-slate-600">
                  สาขาวิชา <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.major}
                  disabled={!form.faculty}
                  onChange={(e) => handleInputChange("major", e.target.value)}
                  className={dropdownClass + " mt-2 disabled:bg-gray-100"}
                >
                  <option value="" disabled hidden>เลือกสาขา</option>
                  {form.faculty && FACULTY_MAJORS[form.faculty]?.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="text-sm font-semibold text-slate-600">
                  ชั้นปี <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  className={dropdownClass + " mt-2"}
                >
                  <option value="" disabled hidden>เลือกชั้นปี</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>

            </div>

            <div className="mt-8">
              <label className="text-sm font-semibold text-slate-600">
                รูปโปรไฟล์ <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 mt-2"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setProfilePreview(URL.createObjectURL(file));
                  handleInputChange("profileImage", file);
                }}
              />
              {profilePreview && (
                <img src={profilePreview} alt="รูป" className="w-44 h-44 object-cover rounded-2xl mt-4" />
              )}
            </div>

            <button
              onClick={handleNextStep1}
              className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
            >
              ถัดไป →
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">แนวคิด</h2>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-600">
                  เหตุผลที่สมัคร <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="บอกเหตุผลที่คุณสมัครสมาชิกผู้แทนนิสิต"
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2 h-32"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600">
                  แนวคิดในการทำงาน <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={ideas}
                  onChange={(e) => setIdeas(e.target.value)}
                  placeholder="บอกแนวคิดของคุณในการทำงานในสภา"
                  className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none mt-2 h-32"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                ← กลับ
              </button>
              <button
                onClick={handleRepresentativeStep2Next}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                ถัดไป →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ตรวจสอบข้อมูล */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">✓ ตรวจสอบข้อมูล</h2>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">ข้อมูลส่วนตัว</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-sm text-slate-600">ชื่อ:</p><p className="font-semibold">{form.name}</p></div>
                  <div><p className="text-sm text-slate-600">คณะ:</p><p className="font-semibold">{form.faculty}</p></div>
                  <div><p className="text-sm text-slate-600">สาขา:</p><p className="font-semibold">{form.major}</p></div>
                  <div><p className="text-sm text-slate-600">ชั้นปี:</p><p className="font-semibold">{form.year}</p></div>
                  {profilePreview && <div><img src={profilePreview} alt="Profile" className="w-24 h-24 object-cover rounded" /></div>}
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">เหตุผลที่สมัคร</h3>
                <p className="text-sm">{reason}</p>
              </div>

              <div className="bg-slate-50 p-6 rounded-xl">
                <h3 className="font-bold text-slate-700 mb-4">แนวคิดในการทำงาน</h3>
                <p className="text-sm">{ideas}</p>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-slate-200 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                ← แก้ไข
              </button>
              <button
                onClick={handleRepresentativeStep3Submit}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
              >
                ส่งข้อมูล ✓
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-[1200px] mx-auto space-y-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">สมัครรับเลือกตั้ง</h1>
            <p className="text-slate-500 mt-1">ตำแหน่ง: {POSITION_LABELS[position] || position}</p>
          </div>

          {/* Render ตามตำแหน่ง */}
          {position === "OBK" && renderOBKForm()}
          {position === "CLUB" && renderClubForm()}
          {position === "REPRESENTATIVE" && renderRepresentativeForm()}
        </div>
      </div>
    </Layout>
  );
}

export default AddCandidates;