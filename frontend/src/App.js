import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import VerifyEmail from "./VerifyEmail";
import Home from "./Home";
import Candidates from "./Candidates";
import Vote from "./Vote";
import ProtectedRoute from "./components/ProtectedRoute";
import SelectPosition from "./SelectPosition";
import AddCandidates from "./AddCandidates";
import CandidatePreview from "./CandidatePreview";
import CandidateSuccess from "./CandidateSuccess";
import CandidateManagement from "./CandidateManagement";
import CandidateDetail from "./CandidateDetail";


function App() {
  // ✅ ดึง user จาก localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
 

  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* ================= PROTECTED ROUTES (LOGIN REQUIRED) ================= */}
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

      <Route
        path="/select-position"
        element={
          <ProtectedRoute>
            <SelectPosition />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-candidates"
        element={
          <ProtectedRoute>
            <AddCandidates />
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
        path="/candidate-success"
        element={
          <ProtectedRoute>
            <CandidateSuccess />
          </ProtectedRoute>
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

      {/* ================= ADMIN ONLY ================= */}
      <Route
        path="/candidate-management"
        element={
          user?.role === "admin" ? (
            <ProtectedRoute>
              <CandidateManagement />
            </ProtectedRoute>
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;