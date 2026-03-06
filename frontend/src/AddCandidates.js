import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import StepBar from "./components/StepBar";
import { useLocation, useNavigate } from "react-router-dom";

const POSITION_LABELS = {
  OBK: "นายกองค์การบริหารนิสิต (อบก.)",
  REPRESENTATIVE: "สมาชิกสภานิสิต",
  // AddClubPresident: "นายกสโมสรนิสิต",
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

  // ✅ policies เป็น string array เท่านั้น
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

  // ================= POLICY FUNCTIONS =================
  const addPolicy = () => {
    setPolicies([...policies, ""]);
  };

  const updatePolicy = (index, value) => {
    const updated = [...policies];
    updated[index] = value;
    setPolicies(updated);
  };
  const deletePolicy = (index) => {
  if (index === 0) return; // กันช่องแรก

  const updated = policies.filter((_, i) => i !== index);
  setPolicies(updated);
};;

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
            <div className="bg-white rounded-2xl shadow p-10 space-y-6">
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
      </label>

      <input
        value={form[field]}
        readOnly={isLocked}
        onChange={(e) =>
          !isLocked &&
          setForm({ ...form, [field]: e.target.value })
        }
        className={`border p-3 rounded-xl w-full ${
          isLocked ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
})}
              <div className="space-y-1">
                <label className="text-sm font-medium">ชื่อเล่น</label>
                <input
                  className="border p-3 rounded-xl w-full"
                  value={form.nickname}
                  onChange={(e) =>
                    setForm({ ...form, nickname: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  maxLength={10}
                  className="border p-3 rounded-xl w-full"
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
                <label className="text-sm font-medium">รูปโปรไฟล์</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    setProfilePreview(URL.createObjectURL(file));

                    setForm(prev => ({
                      ...prev,
                      profileImage: file
                    }));
                  }}
                />
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="preview"
                    className="w-40 h-40 rounded-xl object-cover"
                  />
                )}
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl"
              >
                ถัดไป →
              </button>
            </div>
          )}

          {/* ================= STEP 2 ================= */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow p-10 space-y-6">
              <h2 className="text-xl font-semibold">ข้อมูลการลงสมัคร</h2>

              <input
                className="border p-3 rounded-xl w-full"
                placeholder="ชื่อพรรค / ทีม"
                value={form.partyName}
                onChange={(e) =>
                  setForm({ ...form, partyName: e.target.value })
                }
              />

              <input
                className="border p-3 rounded-xl w-full"
                placeholder="สโลแกน"
                value={form.slogan}
                onChange={(e) =>
                  setForm({ ...form, slogan: e.target.value })
                }
              />

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl bg-gray-200"
                >
                  กลับ
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 text-white"
                >
                  ถัดไป →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3 ================= */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow p-10 space-y-6">
              <h2 className="text-xl font-semibold">นโยบาย</h2>

              {policies.map((policy, i) => (
  <div key={i} className="flex gap-2 items-center">
    <input
      className="border p-3 rounded-xl w-full"
      placeholder={`นโยบายที่ ${i + 1}`}
      value={policy}
      onChange={(e) => updatePolicy(i, e.target.value)}
    />

    {i !== 0 && (
      <button
        type="button"
        onClick={() => deletePolicy(i)}
        className="w-10 h-10 flex items-center justify-center 
                   bg-red-100 text-red-600 rounded-xl 
                   hover:bg-red-200 transition"
      >
        −
      </button>
    )}
  </div>
))}

              <button
                onClick={addPolicy}
                className="text-emerald-600 font-medium"
              >
                + เพิ่มนโยบาย
              </button>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 py-3 rounded-xl"
                >
                  กลับ
                </button>

                <button
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl"
                  onClick={() => {
                    const hasEmpty = policies.some(p => !p);
                    if (hasEmpty) {
                      return alert("กรุณากรอกนโยบายให้ครบ");
                    }

                    navigate("/candidate-preview", {
  state: {
    form,
    policies,
    profilePreview
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