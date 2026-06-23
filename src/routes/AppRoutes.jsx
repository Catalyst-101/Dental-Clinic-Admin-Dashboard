import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Dashboard } from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import BookAppointment from "../pages/BookAppointment";
import Patients from "../pages/Patients";


const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  // return isAuthenticated ? children : <Navigate to="/login" replace />;
  return children;
};

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const handleNewAppointment = () => {
    navigate("/book-appointment");
  };

  return (
    <div className="app-container flex min-h-screen bg-surface">
      <Sidebar onLogout={handleLogout} onNewAppointment={handleNewAppointment} />

      <main className="main-content flex-grow ml-64 min-h-screen flex flex-col">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/book-appointment" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
          <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
          <Route path="/dentists" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/hygienists" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/surgeons" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/receptionists" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<Layout />} />
    </Routes>
  );
};

export default AppRoutes;
