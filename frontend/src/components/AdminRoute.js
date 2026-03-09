import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  // 1. ดึงข้อมูล User จากเครื่อง
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // 2. เช็คว่า ล็อกอินหรือยัง? และ มี role เป็น "admin" หรือไม่?
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 3. ถ้าเป็นแอดมิน ให้แสดงผลหน้านั้นได้ตามปกติ
  return children;
}