import React, { useEffect, useState } from "react";
import Layout from "./components/Layout";
import {
  getCandidates,
  updateCandidateStatus
} from "./services/candidateService";

function AdminCandidates() {

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD DATA =================
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      const data = await getCandidates();
      setCandidates(data);
    } catch {
      alert("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  // ================= APPROVE =================
  const handleApprove = async (id) => {
    await updateCandidateStatus(id, "approved", "");
    loadCandidates();
  };

  // ================= REJECT =================
  const handleReject = async (id) => {
    const reason = prompt("กรุณาระบุเหตุผลในการปฏิเสธ");

    if (!reason) return;

    await updateCandidateStatus(id, "rejected", reason);
    loadCandidates();
  };

  return (
    <Layout>
      <div className="p-8 space-y-6">

        <h1 className="text-2xl font-bold">
          จัดการใบสมัครผู้สมัคร
        </h1>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">

            <thead className="bg-slate-100">
              <tr>
                <th className="p-3">ชื่อ</th>
                <th className="p-3">ตำแหน่ง</th>
                <th className="p-3">คณะ</th>
                <th className="p-3">พรรค</th>
                <th className="p-3">สถานะ</th>
                <th className="p-3">จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {candidates.map((c) => (
                <tr key={c._id} className="border-t">

                  <td className="p-3">{c.fullName}</td>
                  <td className="p-3">{c.position}</td>
                  <td className="p-3">{c.faculty}</td>
                  <td className="p-3">{c.partyName}</td>

                  <td className="p-3">
                    {c.status === "pending" && (
                      <span className="text-yellow-600 font-medium">
                        Pending
                      </span>
                    )}
                    {c.status === "approved" && (
                      <span className="text-green-600 font-medium">
                        Approved
                      </span>
                    )}
                    {c.status === "rejected" && (
                      <span className="text-red-600 font-medium">
                        Rejected
                      </span>
                    )}
                  </td>

                  <td className="p-3 flex gap-2">
                    {c.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(c._id)}
                          className="bg-green-600 text-white px-3 py-1 rounded"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() => handleReject(c._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
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
    </Layout>
  );
}

export default AdminCandidates;
