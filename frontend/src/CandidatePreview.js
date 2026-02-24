import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import CandidateA4Preview from "./components/CandidateA4Preview";
import { createCandidate } from "./services/candidateService";
function CandidatePreview() {

  const location = useLocation();
  const navigate = useNavigate();
  const { form, policies, profilePreview } = location.state || {};

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
      await createCandidate({
        ...form,
        policies
      });

      navigate("/candidate-success");

    } catch (err) {
      alert("ส่งใบสมัครไม่สำเร็จ");
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
          className="flex-1 bg-emerald-600 text-white py-3 rounded-xl"
        >
          ยืนยันส่งใบสมัคร
        </button>
      </div>

    </Layout>
  );
}

export default CandidatePreview;

