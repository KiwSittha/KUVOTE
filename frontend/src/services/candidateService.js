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

// ✅ อัปเดตสถานะ
export async function updateCandidateStatus(id, status, rejectReason = "") {

  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:8000/candidates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      status,
      rejectReason
    })
  });

  return await res.json();
}

// ✅ สร้างผู้สมัคร
export async function createCandidate(payload) {
  const res = await fetch(`http://localhost:8000/candidates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      status: "pending",
      votes: 0
    })
  });
  return await res.json();
}

// ⭐ ตรวจ email ผู้สมัครซ้ำ
export async function checkCandidateEmail(email) {
  const res = await fetch("http://localhost:8000/candidates/check-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  return await res.json();
}
// ⭐ ดึงผู้สมัครทั้งหมดสำหรับ Admin
export async function getAdminCandidates() {
  const res = await fetch("http://localhost:8000/admin/candidates");
  return await res.json();
}