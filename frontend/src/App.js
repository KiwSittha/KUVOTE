import React from "react";
import { Routes, Route } from "react-router-dom";

import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import VerifyEmail from "./VerifyEmail";
import Home from "./Home";
import Candidates from "./Candidates";
import Vote from "./Vote";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import CandidatesPage from "./pages/CandidatesPage";
import CommunityPage from "./pages/CommunityPage";
import CommunityPortal from "./pages/CommunityPortal";
import NewThreadPage from "./pages/NewThreadPage";
import ThreadDetailPage from "./pages/ThreadDetailPage";
import MatchPage from "./pages/MatchPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/community" element={<CommunityPortal />} />
      <Route path="/community/discussions" element={<CommunityPage />} />
      <Route path="/community/new" element={<NewThreadPage />} />
      <Route path="/community/:threadId" element={<ThreadDetailPage />} />
      <Route path="/match" element={<MatchPage />} />
      
      {/* Protected Routes */}
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
        path="/candidates-page" 
        element={
          <ProtectedRoute>
            <CandidatesPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;