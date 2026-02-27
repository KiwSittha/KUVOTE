import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import { getCandidateById, updateCandidateStatus } from "./services/candidateService";

function CandidateDetail({ isAdmin = false }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ================= FETCH DATA =================
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

  // ================= UPDATE STATUS =================
  const handleUpdateStatus = async (status) => {
    try {
      await updateCandidateStatus(id, status, rejectReason);
      navigate("/candidate-management");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  // ================= LOADING =================
  if (!candidate) {
    return (
      <Layout>
        <div className="text-center py-20 text-gray-400">
          กำลังโหลดข้อมูล...
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout>
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              รายละเอียดผู้สมัคร
            </h1>

            <span
              className={`px-4 py-1 rounded-full text-sm font-semibold
                ${
                  candidate.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : candidate.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {candidate.status}
            </span>
          </div>

          {/* REJECT REASON */}
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

          {/* PROFILE SECTION */}
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
              <p><b>ชื่อ:</b> {candidate.name}</p>
              <p><b>คณะ:</b> {candidate.faculty}</p>
              <p><b>สาขา:</b> {candidate.major}</p>
              <p><b>ชั้นปี:</b> {candidate.year}</p>
              <p><b>ตำแหน่ง:</b> {candidate.position}</p>
              <p><b>พรรค:</b> {candidate.partyName}</p>
              <p><b>สโลแกน:</b> {candidate.slogan}</p>
              <p><b>เบอร์:</b> {candidate.phone}</p>
              <p><b>Email:</b> {candidate.email}</p>
            </div>
          </div>

          {/* POLICIES */}
          <div className="bg-white shadow rounded-2xl p-8 space-y-4">
            <h2 className="text-xl font-semibold">
              นโยบาย
            </h2>

            {candidate.policies && candidate.policies.length > 0 ? (
              candidate.policies.map((policy, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <p className="font-semibold">{index + 1}.</p>
                  <p className="text-slate-600">{policy}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">ไม่มีข้อมูลนโยบาย</p>
            )}
          </div>

        </div>

        {/* ADMIN ACTIONS */}
        {isAdmin && candidate.status === "pending" && (
          <div className="max-w-4xl mx-auto flex gap-6 pb-10">
            <button
              onClick={() => handleUpdateStatus("approved")}
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

      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[500px] space-y-4 shadow-2xl">
            <h2 className="text-xl font-bold text-red-600">
              เหตุผลในการปฏิเสธ
            </h2>

            <textarea
              className="w-full border rounded-xl p-3"
              rows="4"
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
                onClick={() => handleUpdateStatus("rejected")}
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