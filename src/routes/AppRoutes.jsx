import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Dashboard } from "../pages/Dashboard";
import LoginPage from "../pages/LoginPage";
import Patients from "../pages/Patients";
import Appointments from "../pages/Appointments";
import Doctors from "../pages/Doctors";
import Services from "../pages/Services";
import WebsiteContent from "../pages/WebsiteContent";
import Settings from "../pages/Settings";
import Admins from "../pages/Admins";
import ContactMessages from "../pages/ContactMessages";

// Helper function to get authentication token
const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

const ProtectedRoute = ({ children }) => {
  const token = getToken();

  return token ? children : <Navigate to="/login" replace />;
};

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    localStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("isAuthenticated");

    localStorage.removeItem("user");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const handleNewAppointment = () => {
    navigate("/appointments");
  };

  return (
    <div className="app-container flex min-h-screen bg-surface">
      <Sidebar
        onLogout={handleLogout}
        onNewAppointment={handleNewAppointment}
      />

      <main className="main-content flex-grow ml-64 min-h-screen flex flex-col">
        <Routes>
          {/* Smart redirect */}
          <Route
            path="/"
            element={
              getToken()
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />

          <Route
            path="/dashboard"
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
          />

          <Route
            path="/patients"
            element={<ProtectedRoute><Patients /></ProtectedRoute>}
          />

          <Route
            path="/dentists"
            element={<ProtectedRoute><Doctors defaultCategory="Dentist" /></ProtectedRoute>}
          />

          <Route
            path="/hygienists"
            element={<ProtectedRoute><Doctors defaultCategory="Hygienist" /></ProtectedRoute>}
          />

          <Route
            path="/surgeons"
            element={<ProtectedRoute><Doctors defaultCategory="Surgeon" /></ProtectedRoute>}
          />

          <Route
            path="/receptionists"
            element={<ProtectedRoute><Doctors defaultCategory="Receptionist" /></ProtectedRoute>}
          />

          <Route
            path="/appointments"
            element={<ProtectedRoute><Appointments /></ProtectedRoute>}
          />

          <Route
            path="/services"
            element={<ProtectedRoute><Services /></ProtectedRoute>}
          />

          <Route
            path="/content"
            element={<ProtectedRoute><WebsiteContent /></ProtectedRoute>}
          />

          <Route
            path="/settings"
            element={<ProtectedRoute><Settings /></ProtectedRoute>}
          />

          <Route
            path="/messages"
            element={<ProtectedRoute><ContactMessages /></ProtectedRoute>}
          />

          <Route
            path="/admins"
            element={<ProtectedRoute><Admins /></ProtectedRoute>}
          />

          <Route
            path="*"
            element={
              getToken()
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/login" replace />
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          getToken() ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;