import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import VerifyEmail from "./VerifyEmail";
import Home from "./Home";
import Candidates from "./Candidates";
import Vote from "./Vote";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ 1. นำเข้าไฟล์ที่เพิ่งสร้าง

function App() {
  return (
    <Routes>
      {/* --- หน้าที่ใครๆ ก็เข้าได้ (Public) --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* --- 🔒 หน้าที่ต้อง Login ก่อนถึงจะเข้าได้ (Protected) --- */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/candidates" 
        element={
          <ProtectedRoute>
            <Candidates />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/vote" 
        element={
          <ProtectedRoute>
            <Vote />
          </ProtectedRoute>
        } 
      />

    </Routes>
  );
}

export default App;