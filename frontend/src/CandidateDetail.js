import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import CandidateA4Preview from "./components/CandidateA4Preview";
import { getCandidateById, updateCandidateStatus } from "./services/candidateService";


function CandidateDetail() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [viewMode, setViewMode] = useState("modern");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
  const fetchCandidate = async () => {
    try {
      const data = await getCandidateById(id);
      setCandidate(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchCandidate();
}, [id]);


  const updateStatus = (newStatus) => {
    updateCandidateStatus(id, newStatus);
    navigate("/candidate-management");
  };

  if (!candidate) return null;

  return (
    <>
      <Layout>

        {/* 🔄 VIEW TOGGLE */}
        <div className="max-w-6xl mx-auto px-6 pt-10 flex justify-end gap-4">
          <button
            onClick={() => setViewMode("modern")}
            className={`px-4 py-2 rounded 
              ${viewMode === "modern"
                ? "bg-slate-800 text-white"
                : "bg-slate-200"}
            `}
          >
            Modern View
          </button>

          <button
            onClick={() => setViewMode("a4")}
            className={`px-4 py-2 rounded 
              ${viewMode === "a4"
                ? "bg-slate-800 text-white"
                : "bg-slate-200"}
            `}
          >
            A4 View
          </button>
        </div>

        {/* ================= MODERN VIEW ================= */}
        {viewMode === "modern" && (
          <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">
                รายละเอียดผู้สมัคร
              </h1>

              <span className="px-4 py-1 rounded-full bg-yellow-200">
                {candidate.status}
              </span>
            </div>

            {/* 🔴 แสดงเหตุผล reject */}
            {candidate.status === "rejected" && candidate.rejectReason && (
  <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
    <p className="font-semibold text-red-700">
      เหตุผลที่ต้องแก้ไข:
    </p>
    <p className="text-red-600">
      {candidate.rejectReason}
    </p>
  </div>
)}


            <div className="bg-white shadow rounded-2xl p-8 grid md:grid-cols-3 gap-8">

              <div>
                {candidate.profileImage ? (
                  <img
                    src={candidate.profileImage}
                    className="w-48 h-56 object-cover rounded-xl border"
                    alt="profile"
                  />
                ) : (
                  <div className="w-48 h-56 border rounded-xl flex items-center justify-center text-gray-400">
                    ไม่มีรูป
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-3">
                <p><b>ชื่อ:</b> {candidate.fullName}</p>
                <p><b>คณะ:</b> {candidate.faculty}</p>
                <p><b>สาขา:</b> {candidate.major}</p>
                <p><b>ชั้นปี:</b> {candidate.year}</p>
                <p><b>เบอร์:</b> {candidate.phone}</p>
              </div>

            </div>

            <div className="bg-white shadow rounded-2xl p-8 space-y-4">
              <h2 className="text-xl font-semibold">
                นโยบาย
              </h2>

              {candidate.policies?.map((p, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <p className="font-semibold">{i + 1}. {p.title}</p>
                  <p className="text-slate-600">{p.description}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= A4 VIEW ================= */}
        {viewMode === "a4" && (
          <div className="py-10">
            <CandidateA4Preview
              form={candidate}
              policies={candidate.policies}
              profilePreview={candidate.profileImage}
            />
          </div>
        )}

        {/* ================= ACTION BUTTONS ================= */}
        {candidate.status === "pending" && (
          <div className="max-w-4xl mx-auto flex gap-6 pb-10">
            <button
              onClick={() => updateStatus("approved")}
              className="flex-1 bg-green-600 text-white py-4 rounded-xl"
            >
              Approve
            </button>

            <button
              onClick={() => setShowRejectModal(true)}
              className="flex-1 bg-red-600 text-white py-4 rounded-xl"
            >
              Reject
            </button>
          </div>
        )}

      </Layout>

      {/* ================= REJECT MODAL ================= */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[500px] space-y-4 shadow-2xl">

            <h2 className="text-xl font-bold text-red-600">
              เหตุผลในการปฏิเสธ
            </h2>

            <textarea
              className="w-full border rounded-xl p-3"
              rows="4"
              placeholder="กรุณาระบุเหตุผลที่ต้องแก้ไข..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-200 py-2 rounded-xl"
              >
                ยกเลิก
              </button>

              <button
                onClick={() => {
                  if (!rejectReason)
                    return alert("กรุณาระบุเหตุผล");

                  updateCandidateStatus(id, "rejected", rejectReason);


                  navigate("/candidate-management");
                }}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl"
              >
                ยืนยัน Reject
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default CandidateDetail;
