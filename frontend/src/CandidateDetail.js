import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import { getCandidateById, updateCandidateStatus } from "./services/candidateService";

function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedReasons, setSelectedReasons] = useState([]);
  
  // ✅ เพิ่ม State สำหรับจัดการสถานะ Loading ตอนกด Approve/Reject
  const [isProcessing, setIsProcessing] = useState(false);

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
  // ✅ แก้ไขให้รับพารามิเตอร์ reason เข้ามาโดยตรง ป้องกันปัญหา State อัปเดตไม่ทัน
  const handleUpdateStatus = async (status, reason = "") => {
    try {
      setIsProcessing(true); // ⏳ เปิดตัวหมุน Loading
      await updateCandidateStatus(id, status, reason);
      navigate("/candidate-management");
    } catch (err) {
      console.error(err);
      alert(err.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    } finally {
      setIsProcessing(false); // ⏹️ ปิดตัวหมุน Loading ไม่ว่าจะสำเร็จหรือพัง
    }
  };

  const handleToggleReason = (reason) => {
    setSelectedReasons(prev =>
      prev.includes(reason)
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
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
              
              {/* ✅ ปรับปุ่ม Approve ให้มี Spinner */}
              <button
                onClick={() => handleUpdateStatus("approved", "")}
                disabled={isProcessing} // ปิดปุ่มกันกดเบิ้ล
                className={`flex-1 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all 
                           ${isProcessing ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังบันทึกลง Blockchain...
                  </>
                ) : (
                  "Approve"
                )}
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing} // ปิดปุ่ม Reject ไปด้วยตอนกำลังโหลด
                className={`flex-1 text-white py-3 rounded-xl transition-all
                           ${isProcessing ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                Reject
              </button>
            </div>
          )}

        </div>
      </Layout>

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
                <label key={index} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason)}
                    onChange={() => handleToggleReason(reason)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span className="text-slate-700">{reason}</span>
                </label>
              ))}
            </div>

            {/* ADDITIONAL DETAIL */}
            <textarea
              className="w-full border border-slate-300 rounded-xl p-3 mt-3 focus:ring-2 focus:ring-red-400 outline-none"
              rows="3"
              placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isProcessing}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
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

                  // ✅ แก้ไข: ส่ง finalReason เข้าฟังก์ชันโดยตรง
                  handleUpdateStatus("rejected", finalReason);
                }}
                disabled={isProcessing}
                className={`flex-1 text-white py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors
                           ${isProcessing ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังดำเนินการ...
                  </>
                ) : (
                  "ยืนยัน Reject"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CandidateDetail;