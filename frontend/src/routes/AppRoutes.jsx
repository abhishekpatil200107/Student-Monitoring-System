import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";

import AdminDashboard from "../pages/admin/Dashboard";
import FacultyDashboard from "../pages/faculty/Dashboard";
import StudentDashboard from "../pages/student/Dashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      <Route path="/login" element={<Login />} />

      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      <Route path="/faculty/dashboard" element={<FacultyDashboard />} />

      <Route path="/student/dashboard" element={<StudentDashboard />} />

      <Route path="*" element={<h1>404 | Page Not Found</h1>} />
    </Routes>
  );
}

export default AppRoutes;