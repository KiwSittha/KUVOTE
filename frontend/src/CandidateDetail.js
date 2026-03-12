import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import { getCandidateById, updateCandidateStatus } from "./services/candidateService";

const POSITION_LABELS = {
  OBK: "นายกองค์การบริหารนิสิต",
  REPRESENTATIVE: "สมาชิกผู้แทนนิสิต",
  CLUB: "ประธานสโมสรนิสิต"
};

function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [loadingApprove, setLoadingApprove] = useState(false);
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
  const handleUpdateStatus = async (status, reason = "") => {
  try {
    await updateCandidateStatus(id, status, reason);
      navigate("/candidate-management");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };
  const handleToggleReason = (reason) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };
  const handleApprove = async () => {
    try {
      setLoadingApprove(true); // เริ่ม loading

      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:8000/candidates/${candidate._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: "approved"
        })
      });

      // const data = await res.json();

      if (res.ok) {
        alert("อนุมัติสำเร็จ");
        navigate("/candidate-management");
      }

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    } finally {
      setLoadingApprove(false); // หยุด loading
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
    ${candidate.status === "approved"
      ? "bg-green-100 text-green-700"
      : candidate.status === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : candidate.status === "needs_revision"
      ? "bg-orange-100 text-orange-700"
      : "bg-red-100 text-red-700"
    }`}
>
  {candidate.status === "needs_revision" ? "แก้ไข" : candidate.status}
</span>
          </div>

          {/* REJECT REASON */}
          {candidate.status === "needs_revision" && candidate.rejectReason && (
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
              <p>
                <b>ตำแหน่ง:</b> {POSITION_LABELS[candidate.position] || candidate.position}
              </p>

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
                  <p className="text-slate-600">
                    {index + 1}. {policy}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">ไม่มีข้อมูลนโยบาย</p>
            )}
          </div>

          {/* ADMIN ACTIONS */}
          {candidate.status === "pending" && (
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleApprove}
                disabled={loadingApprove}
                className={`flex-1 text-white py-3 rounded-xl ${loadingApprove ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {loadingApprove ? "กำลังอนุมัติ..." : "Approve"}
              </button>

              <button
  onClick={() => setShowRejectModal(true)}
  className="flex-1 bg-yellow-500 text-white py-3 rounded-xl hover:bg-yellow-600"
>
  ขอให้แก้ไข
</button>
            </div>
          )}

        </div>
      </Layout>

      {/* REJECT MODAL */}
      {/* REJECT MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl w-[500px] space-y-4 shadow-2xl">

            <h2 className="text-xl font-bold text-red-600">
              เลือกเหตุผลที่ต้องแก้ไข
            </h2>

            {/* CHECKBOX OPTIONS */}
            <div className="space-y-2">
              {[
                "ข้อมูลส่วนตัวไม่ครบถ้วน",
                "รูปภาพไม่ชัดเจน",
                "นโยบายไม่เหมาะสม",
                "เอกสารไม่ถูกต้อง",
                "ข้อมูลติดต่อไม่ถูกต้อง"
              ].map((reason, index) => (
                <label key={index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason)}
                    onChange={() => handleToggleReason(reason)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {/* ADDITIONAL DETAIL */}
            <textarea
              className="w-full border rounded-xl p-3 mt-3"
              rows="3"
              placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
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
    if (selectedReasons.length === 0) {
      alert("กรุณาเลือกอย่างน้อย 1 เหตุผล");
      return;
    }

    const finalReason = [
      ...selectedReasons,
      rejectReason && `เพิ่มเติม: ${rejectReason}`
    ]
      .filter(Boolean)
      .join(", ");

    handleUpdateStatus("needs_revision", finalReason);
  }}
  className="flex-1 bg-yellow-500 text-white py-2 rounded-xl"
>
  ส่งกลับให้แก้ไข
</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CandidateDetail;