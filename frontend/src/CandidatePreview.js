import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import CandidateA4Preview from "./components/CandidateA4Preview";
import { createCandidate } from "./services/candidateService";

function CandidatePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { form, policies, profilePreview } = location.state || {};

  const [showSuccess, setShowSuccess] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!form) {
    return (
      <Layout>
        <div className="text-center py-20">
          ไม่พบข้อมูล กรุณากรอกใหม่
        </div>
      </Layout>
    );
  }

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await createCandidate({
        ...form,
        policies
      });

      // กรณีสมัครซ้ำ
      if (res?.message === "duplicate") {
        setShowDuplicate(true);
        setLoading(false);
        return;
      }

      // สมัครสำเร็จ
      setShowSuccess(true);
      setLoading(false);

    } catch (err) {
      console.error(err);
      alert("ส่งใบสมัครไม่สำเร็จ");
      setLoading(false);
    }
  };

  return (
    <Layout>
      <CandidateA4Preview
        form={form}
        policies={policies}
        profilePreview={profilePreview}
      />

      <div className="max-w-[794px] mx-auto flex gap-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-200 py-3 rounded-xl"
        >
          กลับไปแก้ไข
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {loading ? "กำลังส่ง..." : "ยืนยันส่งใบสมัคร"}
        </button>
      </div>

      {/* ================= SUCCESS OVERLAY ================= */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center w-[450px] animate-fade-in">
            <h1 className="text-2xl font-bold text-green-600">
              ส่งใบสมัครสำเร็จ 🎉
            </h1>

            <p className="mt-4 text-gray-700">
              ระบบได้รับใบสมัครของท่านเรียบร้อยแล้ว
              กรุณารอการตรวจสอบจากคณะกรรมการ
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
            >
              กลับหน้าแรก
            </button>
          </div>
        </div>
      )}

      {/* ================= DUPLICATE OVERLAY ================= */}
      {showDuplicate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-center w-[450px]">
            <h1 className="text-2xl font-bold text-red-600">
              ไม่สามารถดำเนินการได้
            </h1>

            <p className="mt-4 text-gray-700">
              จากการตรวจสอบพบว่าท่านได้ยื่นใบสมัครไว้แล้ว
              ระบบไม่อนุญาตให้สมัครซ้ำ
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition"
            >
              กลับหน้าแรก
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CandidatePreview;