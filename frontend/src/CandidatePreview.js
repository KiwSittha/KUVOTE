import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";

import { createCandidate } from "./services/candidateService";
// ✅ ลบการนำเข้า Firebase ออก แล้วใช้ Cloudinary แทน
import imageCompression from 'browser-image-compression';

const POSITION_LABELS = {
  OBK: "นายกองค์การบริหารนิสิต",
  REPRESENTATIVE: "สมาชิกผู้แทนนิสิต",
  CLUB: "ประธานสโมสรนิสิต"
};


function CandidatePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { form, policies, profilePreview, weights } = location.state || {};

  const [showSuccess, setShowSuccess] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false); // แก้ไขส่วนที่ตกหล่นไป
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!form) return <Layout><div className="text-center py-20">ไม่พบข้อมูล</div></Layout>;

  // ================= ☁️ ฟังก์ชันอัปโหลดไป Cloudinary (บีบอัด + บอก %) =================
  const uploadImage = async (file) => {
    // 1. บีบอัดรูปภาพก่อนส่ง (เหมือนเดิมเพื่อประหยัดพื้นที่ Cloudinary)
    const options = {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1024,
      useWebWorker: true
    };

    console.log("📦 กำลังบีบอัดรูปภาพ...");
    const compressedFile = await imageCompression(file, options);

    // 2. เตรียมข้อมูลสำหรับ Cloudinary
    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("upload_preset", "kuvote"); // ⚠️ เปลี่ยนเป็น Preset ของคุณ
    formData.append("folder", "candidates");

    // 3. ใช้ XMLHttpRequest เพื่อให้คำนวณ % ได้ (fetch ปกติทำไม่ได้)
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://api.cloudinary.com/v1_1/dz1ofnpvt/image/upload"); // ⚠️ เปลี่ยน YOUR_CLOUD_NAME

      // ติดตามความคืบหน้าการอัปโหลด
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url); // คืนค่า URL รูปภาพ
        } else {
          reject(new Error("อัปโหลดไปยัง Cloudinary ไม่สำเร็จ"));
        }
      };

      xhr.onerror = () => reject(new Error("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย"));
      xhr.send(formData);
    });
  };
  
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      let imageUrl = null;

      if (form.profileImage) {
        imageUrl = await uploadImage(form.profileImage);
        console.log("✅ 1. Uploaded URL:", imageUrl);
      }

      const res = await createCandidate({
        ...form,
        profileImage: imageUrl,
        policies,
        weights
      });
      console.log("🚀 2. Data sending to Backend:", res);
      // ตรวจสอบกรณีสมัครซ้ำจาก Backend
      if (res?.message === "duplicate_email") {
        setShowDuplicate(true);
        setLoading(false);
        return;
      }

      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8 mb-6">

        <h1 className="text-2xl font-bold mb-6">รายละเอียดผู้สมัคร</h1>

        <div className="flex gap-8">

          <img
            src={profilePreview}
            alt="profile"
            className="w-36 h-36 object-cover rounded-xl border"
          />

          <div className="space-y-2 text-slate-700">
            <p><b>ชื่อ:</b> {form.name}</p>
            <p><b>คณะ:</b> {form.faculty}</p>
            <p><b>สาขา:</b> {form.major}</p>
            <p><b>ชั้นปี:</b> {form.year}</p>
            <p><b>ตำแหน่ง:</b> {POSITION_LABELS[form.position]}</p>
            <p><b>เบอร์:</b> {form.phone}</p>
            <p><b>Email:</b> {form.email}</p>
          </div>

        </div>

      </div>
  
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-8">

  <h2 className="text-xl font-bold mb-4">นโยบาย</h2>

  <div className="space-y-4">
    {policies.map((policy, index) => (
      <div
        key={index}
        className="border border-slate-200 rounded-xl p-4 bg-slate-50"
      >
        {index + 1}. {policy}
      </div>
    ))}
  </div>

</div>

      <div className="max-w-[794px] mx-auto flex flex-col gap-4 mt-6 pb-12">
        <div className="flex gap-4">
          <button
            onClick={() =>
              navigate("/add-candidates", {
                state: {
                  form,
                  policies,
                  weights,
                  profilePreview,
                  step: 2,
                  position: form.position
                }
              })
            }
            className="flex-1 bg-slate-200 py-3.5 rounded-xl font-bold"
          >
            กลับไปแก้ไข
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg disabled:bg-emerald-400"
          >
            {loading ? `กำลังบันทึก... ${uploadProgress}%` : "ยืนยันส่งใบสมัคร"}
          </button>
        </div>

        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* ================= SUCCESS OVERLAY ================= */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center w-full max-w-[450px] animate-fade-in-up">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              🎉
            </div>
            <h1 className="text-3xl font-black text-slate-800">
              ส่งใบสมัครสำเร็จ
            </h1>

            <p className="mt-4 text-slate-600 leading-relaxed">
              ระบบได้รับใบสมัครของท่านเรียบร้อยแล้ว<br />
              กรุณารอการตรวจสอบและอนุมัติจากคณะกรรมการ
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-8 w-full bg-gradient-to-r from-emerald-600 to-green-500 text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      )}

      {/* ================= DUPLICATE OVERLAY ================= */}
      {showDuplicate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-10 text-center w-full max-w-[450px] animate-fade-in-up">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              ⚠️
            </div>
            <h1 className="text-3xl font-black text-slate-800">
              ไม่สามารถดำเนินการได้
            </h1>

            <p className="mt-4 text-slate-600 leading-relaxed">
              จากตรวจสอบพบว่าท่านได้ยื่นใบสมัครในตำแหน่งนี้ไว้แล้ว
              ระบบไม่อนุญาตให้สมัครซ้ำครับ
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-8 w-full bg-slate-800 text-white py-3.5 rounded-xl font-bold hover:bg-slate-900 shadow-lg transition-all"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CandidatePreview;