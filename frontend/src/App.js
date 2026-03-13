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
import ManageUsers from "./ManageUsers";
import CandidateManagement from "./CandidateManagement";  
import CandidateDetail from "./CandidateDetail";
import CandidatePreview from "./CandidatePreview";
import AdminDashboard from "./AdminDashboard";
import AdminAuditLogs from "./AdminAuditLogs";
import AdminAnnouncements from "./AdminAnnouncements";
import SelectPosition from "./SelectPosition"; 
import Recommend from "./Recommend"; 
import AdminRoute from "./components/AdminRoute"; 
import ProtectedRoute from "./components/ProtectedRoute";
import AdminImageGenerator from "./AdminImageGenerator";
import AdminCandidateMediaGenerator from "./AdminCandidateMediaGenerator";
import Community from "./Community";
import CommunityThread from "./CommunityThread";

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

      {/* Community Discussion */}
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community/:id"
        element={
          <ProtectedRoute>
            <CommunityThread />
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

      <Route
        path="/admin-announcements"
        element={
          <AdminRoute>
            <AdminAnnouncements />
          </AdminRoute>
        }
      />

      <Route
        path="/admin-audit-logs"
        element={
          <AdminRoute>
            <AdminAuditLogs />
          </AdminRoute>
        }
      />

      <Route
        path="/admin-image-generator"
        element={
          <AdminRoute>
            <AdminImageGenerator />
          </AdminRoute>
        }
      />

      <Route
        path="/admin-candidate-media"
        element={
          <AdminRoute>
            <AdminCandidateMediaGenerator />
          </AdminRoute>
        }
      />
    </Routes>

  );
}

export default App;