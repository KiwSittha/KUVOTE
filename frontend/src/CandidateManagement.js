import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import { getCandidates, updateCandidateStatus } from "./services/candidateService";
import { useNavigate } from "react-router-dom";

function CandidateManagement() {
  const [filter, setFilter] = useState("all");
  const [candidates, setCandidates] = useState([]);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const navigate = useNavigate();

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getCandidates();
    setCandidates(data);
  };

  // ================= APPROVE =================
  const handleApprove = async (e, id) => {
    e.stopPropagation();

    await updateCandidateStatus(id, "approved");

    // 🔥 อัปเดต UI ทันที
    setCandidates(prev =>
      prev.map(c =>
        c._id === id ? { ...c, status: "approved" } : c
      )
    );
  };

  // ================= REJECT =================
  const handleRejectClick = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectReason) return alert("กรุณาระบุเหตุผล");

    await updateCandidateStatus(selectedId, "rejected", rejectReason);

    setCandidates(prev =>
      prev.map(c =>
        c._id === selectedId ? { ...c, status: "rejected" } : c
      )
    );

    setShowRejectModal(false);
    setRejectReason("");
  };

  // ================= FILTER =================
  const filteredCandidates =
    filter === "all"
      ? candidates
      : candidates.filter(c => c.status === filter);

  const countStatus = (status) =>
    candidates.filter(c => c.status === status).length;

  return (
    <Layout>
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-screen-2xl mx-auto space-y-8">

          {/* HEADER + FILTER RIGHT SIDE */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                ตรวจสอบผู้สมัคร
              </h1>
              <p className="text-slate-500 mt-1">
                จัดการสถานะใบสมัคร
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded font-medium 
                ${filter === "all"
                    ? "bg-slate-800 text-white"
                    : "bg-slate-200"}`}
              >
                ทั้งหมด ({candidates.length})
              </button>

              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded font-medium 
                ${filter === "pending"
                    ? "bg-yellow-400 text-black"
                    : "bg-yellow-200"}`}
              >
                Pending ({countStatus("pending")})
              </button>

              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded font-medium 
                ${filter === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-green-200"}`}
              >
                Approved ({countStatus("approved")})
              </button>

              <button
                onClick={() => setFilter("rejected")}
                className={`px-4 py-2 rounded font-medium 
                ${filter === "rejected"
                    ? "bg-red-600 text-white"
                    : "bg-red-200"}`}
              >
                Rejected ({countStatus("rejected")})
              </button>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4">ชื่อ</th>
                  <th className="p-4">ตำแหน่ง</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {filteredCandidates.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => navigate(`/candidate-detail/${c._id}`)}
                    className="border-t hover:bg-slate-100 cursor-pointer"
                  >
                    <td className="p-4">{c.name}</td>
                    <td className="p-4">{c.position}</td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm
                        ${c.status === "pending" && "bg-yellow-200 text-yellow-800"}
                        ${c.status === "approved" && "bg-green-200 text-green-800"}
                        ${c.status === "rejected" && "bg-red-200 text-red-800"}
                      `}
                      >
                        {c.status}
                      </span>
                    </td>

                    <td className="p-4 text-center space-x-2">
                      {c.status === "pending" && (
                        <>
                          <button
                            onClick={(e) => handleApprove(e, c._id)}
                            className="px-3 py-1 bg-green-600 text-white rounded"
                          >
                            Approve
                          </button>

                          <button
                            onClick={(e) => handleRejectClick(e, c._id)}
                            className="px-3 py-1 bg-red-600 text-white rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

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
              placeholder="กรุณาระบุเหตุผล..."
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
                onClick={handleConfirmReject}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl"
              >
                ยืนยัน Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CandidateManagement;