import { API_URL } from "./api";

export async function getCandidates() {
  const res = await fetch(`${API_URL}/candidates`);
  return await res.json();
}

export async function getCandidateById(id) {
  const res = await fetch(`${API_URL}/candidates/${id}`);
  return await res.json();
}
export async function updateCandidateStatus(id, status, rejectReason = "") {
  const res = await fetch(`http://localhost:8000/candidates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, rejectReason })
  });

  return await res.json();
}
export async function createCandidate(payload) {
  const res = await fetch(`${API_URL}/candidates`, {  
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      status: "pending",   // 🔥 เพิ่มตรงนี้เลย
      votes: 0
    })
  });

  return await res.json();
}