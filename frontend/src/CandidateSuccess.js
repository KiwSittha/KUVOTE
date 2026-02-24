import React from "react";
import { useNavigate } from "react-router-dom";

function CandidateSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white shadow rounded-xl p-10 text-center">
        <h1 className="text-2xl font-bold text-green-600">
          สมัครสำเร็จ 🎉
        </h1>

        <p className="mt-4 text-gray-600">
          ขอบคุณสำหรับการสมัคร กรุณารอการตรวจสอบจากระบบ
        </p>

        <button
          onClick={() => navigate("/")}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
        >
          กลับหน้าแรก
        </button>
      </div>
    </div>
  );
}

export default CandidateSuccess;
