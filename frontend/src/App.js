import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import VerifyEmail from "./VerifyEmail";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import Home from "./Home";
import Candidates from "./Candidates";
import Vote from "./Vote";
import VoteGuide from "./VoteGuide";
import AdminChat from "./AdminChat";
import AddCandidates from "./AddCandidates";
import ManageUsers from "./ManageUsers"; // ✅ นำเข้าไฟล์ที่เพิ่งสร้าง (เช็ค path ให้ตรง)
import CandidateManagement from "./CandidateManagement";  
import CandidateDetail from "./CandidateDetail";
import CandidatePreview from "./CandidatePreview";
import AdminDashboard from "./AdminDashboard";
import SelectPosition from "./SelectPosition"; // ✅ นำเข้าไฟล์ที่เพิ่งสร้าง (เช็ค path ให้ตรง)
import Recommend from "./Recommend"; // ✅ นำเข้าไฟล์ที่เพิ่งสร้าง (เช็ค path ให้ตรง)
import AdminRoute from "./components/AdminRoute"; // ✅ นำเข้าไฟล์ที่เพิ่งสร้าง (เช็ค path ให้ตรง)
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ 1. นำเข้าไฟล์ที่เพิ่งสร้าง
import ElectionResults from "./ElectionResults";

function App() {
  return (
    <Routes>
      {/* --- หน้าที่ใครๆ ก็เข้าได้ (Public) --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/voteguide" element={<VoteGuide />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:id/:token" element={<ResetPassword />} />

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
        path="/recommend"
        element={
          <ProtectedRoute>
            <Recommend />
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

      <Route 
        path="/admin-chat" 
        element={
          <AdminRoute>
            <AdminChat />
          </AdminRoute>
        } 
      />

      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            <ManageUsers />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/add-candidates" 
        element={
          <AdminRoute>
            <AddCandidates />
          </AdminRoute>
        } 
      />

      <Route 
        path="/candidate-management" 
        element={
          <AdminRoute>
            <CandidateManagement />
          </AdminRoute>
        } 
      />

      <Route 
        path="/candidate-detail/:id" 
        element={
          <ProtectedRoute>
            <CandidateDetail />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/candidate-preview" 
        element={
          <ProtectedRoute>
            <CandidatePreview />
          </ProtectedRoute>
        } 
      />

      <Route
        path="/select-position"
        element={
          <ProtectedRoute>
            <SelectPosition />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* หน้าผลการเลือกตั้ง — ทุกคนเข้าได้ */}
      <Route path="/election-results" element={<ElectionResults />} />

    </Routes>
  );
}

export default App;