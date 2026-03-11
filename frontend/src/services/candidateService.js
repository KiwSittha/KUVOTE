// ✅ ดึงผู้สมัครทั้งหมด
export async function getCandidates() {
  const res = await fetch(`http://localhost:8000/candidates`);
  return await res.json();
}

// ✅ ดึงผู้สมัครคนเดียว
export async function getCandidateById(id) {
  const res = await fetch(`http://localhost:8000/candidates/${id}`);
  return await res.json();
}

// ✅ อัปเดตสถานะ (Approve/Reject)
export async function updateCandidateStatus(id, status, rejectReason = "") {
  const res = await fetch(`http://localhost:8000/candidates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, rejectReason })
  });
  return await res.json();
}

// ✅ สร้างผู้สมัครใหม่ (ยิงไปที่ /candidates)
export async function createCandidate(payload) {
  const res = await fetch(`http://localhost:8000/candidates`, { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      status: "pending",   // บังคับสถานะเริ่มต้น
      votes: 0
    })
  });
  return await res.json();
}