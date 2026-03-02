import React, { useState, useEffect } from "react";
import Layout from "./components/Layout";
import { getCandidates } from "./services/candidateService";
import { useNavigate } from "react-router-dom";

function CandidateManagement() {
  const [filter, setFilter] = useState("all");
  const [candidates, setCandidates] = useState([]);
  const navigate = useNavigate();

  // ================= LOAD DATA =================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await getCandidates();
    setCandidates(data);
  };

  // ================= FILTER =================
  const filteredCandidates =
    filter === "all"
      ? candidates
      : candidates.filter((c) => c.status === filter);

  const countStatus = (status) =>
    candidates.filter((c) => c.status === status).length;

  return (
    <Layout>
      <div className="min-h-screen px-6 py-8">
        <div className="max-w-screen-2xl mx-auto space-y-8">

          {/* HEADER + FILTER */}
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
                onClick={() => setFilter("needs_revision")}
                className={`px-4 py-2 rounded font-medium 
                  ${filter === "needs_revision"
                    ? "bg-red-600 text-white"
                    : "bg-red-200"}`}
              >
                Needs Revision ({countStatus("needs_revision")})
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
                </tr>
              </thead>

              <tbody>
                {filteredCandidates.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() =>
                      navigate(`/candidate-detail/${c._id}`)
                    }
                    className="border-t hover:bg-slate-100 cursor-pointer transition"
                  >
                    <td className="p-4">{c.name}</td>
                    <td className="p-4">{c.position}</td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium
                          ${c.status === "pending" &&
                            "bg-yellow-200 text-yellow-800"}
                          ${c.status === "approved" &&
                            "bg-green-200 text-green-800"}
                          ${c.status === "needs_revision" &&
                            "bg-red-200 text-red-800"}
                        `}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredCandidates.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                ไม่มีข้อมูล
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
}

export default CandidateManagement;