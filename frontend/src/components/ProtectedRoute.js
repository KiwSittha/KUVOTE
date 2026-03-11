import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  // ตรวจสอบว่ามี Token หรือไม่
  const token = localStorage.getItem("token");

  // ❌ ถ้าไม่มี Token ให้ดีดกลับไปหน้า Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ ถ้ามี Token ให้แสดงหน้านั้นๆ ได้เลย
  return children;
}