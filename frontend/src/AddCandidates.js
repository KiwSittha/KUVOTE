import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import StepBar from "./components/StepBar";
import { useLocation, useNavigate } from "react-router-dom";
// import { getStudentById } from "./services/studentService";

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
  // const [loading, setLoading] = useState(false);

  const [profilePreview, setProfilePreview] = useState(null);
  // const [autoFilled, setAutoFilled] = useState(false);

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
    vision: "",
    teamSize: "",
    zone: "",
    clubName: ""
  });

  const [policies, setPolicies] = useState([
    { title: "", description: "" }
  ]);
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

    // setAutoFilled(true); // 👈 เพิ่มบรรทัดนี้
  }
}, []);
  /* ================= PROTECT ROUTE ================= */
  useEffect(() => {
    if (!position) {
      navigate("/select-position");
    }
  }, [position, navigate]);

  if (!position) return null;

  /* ================= SEARCH STUDENT ================= */
//   const handleSearchStudent = async (e) => {
//     e.preventDefault();

//     if (!form.studentId) return alert("กรุณากรอกรหัสนิสิต");

//     try {
//       setLoading(true);

//       const data = await getStudentById(form.studentId);

//       setForm(prev => ({
//   ...prev,
//   fullName: data.name?.th || "",
//   faculty: data.faculty?.th || "",
//   major: data.department?.th || "",
//   year: data.year || "",
//   email: data.email || ""
// }));


//     } catch {
//       alert("ไม่พบรหัสนิสิต");
//     } finally {
//       setLoading(false);
//     }โ
//   };



  /* ================= POLICY ================= */
  const addPolicy = () =>
    setPolicies([...policies, { title: "", description: "" }]);

  const updatePolicy = (index, field, value) => {
    const updated = [...policies];
    updated[index][field] = value;
    setPolicies(updated);
  };

  /* ================= UI ================= */
  return (
    <Layout>
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-[1200px] mx-auto space-y-10">

          {/* HEADER */}
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

              {/* Student ID */}
              {/* <div className="space-y-1">
                <label className="text-sm font-medium">
                  รหัสนิสิต <span className="text-red-500">*</span>
                </label>

                <form onSubmit={handleSearchStudent} className="flex gap-3">
                  <input
                    className="flex-1 border rounded-xl p-3"
                    value={form.studentId}
                    onChange={(e) =>
                      setForm({ ...form, studentId: e.target.value })
                    }
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald-600 text-white px-6 rounded-xl"
                  >
                    {loading ? "กำลังค้นหา..." : "ค้นหา"}
                  </button>
                </form>
              </div> */}
              {/* Readonly Info */}
              {["name", "faculty", "major", "year", "email"].map((field, i) => (
                <div key={i} className="space-y-1">
                  <label className="text-sm font-medium">
                    {field === "name" && "ชื่อ–นามสกุล"}
                    {field === "faculty" && "คณะ"}
                    {field === "major" && "สาขาวิชา"}
                    {field === "year" && "ชั้นปี"}
                    {field === "email" && "Email"}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
  value={form[field]}
  onChange={(e) =>
    setForm({ ...form, [field]: e.target.value })
  }
  className="border p-3 rounded-xl w-full"
/>
                </div>
              ))}

              {/* Nickname */}
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  ชื่อเล่น <span className="text-red-500">*</span>
                </label>
                <input
                  className="border p-3 rounded-xl w-full"
                  value={form.nickname}
                  onChange={(e) =>
                    setForm({ ...form, nickname: e.target.value })
                  }
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
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

              {/* Profile Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  รูปโปรไฟล์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onloadend = () => {
    setProfilePreview(reader.result);

    setForm(prev => ({
      ...prev,
      profileImage: reader.result
    }));
  };

  reader.readAsDataURL(file);
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
onClick={() => {
  if (
    !form.name ||
    !form.nickname ||
    !form.phone ||
    !form.profileImage
  ) {
    return alert("กรุณากรอกข้อมูลให้ครบก่อนดำเนินการต่อ");
  }

  setStep(2);
}}
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

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  ชื่อพรรค / ทีม <span className="text-red-500">*</span>
                </label>
                <input
                  className="border p-3 rounded-xl w-full"
                  value={form.partyName}
                  onChange={(e) =>
                    setForm({ ...form, partyName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  สโลแกน <span className="text-red-500">*</span>
                </label>
                <input
                  className="border p-3 rounded-xl w-full"
                  value={form.slogan}
                  onChange={(e) =>
                    setForm({ ...form, slogan: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-4 pt-4">

  <button
    onClick={() => setStep(1)}
    className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
  >
    กลับ
  </button>
                 <button
    onClick={() => {
      if (!form.partyName || !form.slogan) {
        return alert("กรุณากรอกข้อมูลให้ครบก่อนดำเนินการต่อ");
      }
      setStep(3);
    }}
    className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
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

              {policies.map((p, i) => (
                <div key={i} className="border p-4 rounded-xl space-y-3">
                  <input
                    className="border p-3 rounded-xl w-full"
                    placeholder="หัวข้อนโยบาย"
                    value={p.title}
                    onChange={(e) =>
                      updatePolicy(i, "title", e.target.value)
                    }
                  />
                  <textarea
                    className="border p-3 rounded-xl w-full"
                    placeholder="รายละเอียด"
                    value={p.description}
                    onChange={(e) =>
                      updatePolicy(i, "description", e.target.value)
                    }
                  />
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

    const hasEmptyPolicy = policies.some(
      p => !p.title || !p.description
    );

    if (hasEmptyPolicy) {
      return alert("กรุณากรอกนโยบายให้ครบ");
    }

    navigate("/candidate-preview", {
      state: { form, policies }
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