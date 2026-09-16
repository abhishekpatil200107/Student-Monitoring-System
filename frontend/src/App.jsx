import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";

// Admin
import AdminLayout from "./layouts/AdminLayout";

import Dashboard from "./pages/admin/Dashboard";
import Students from "./pages/admin/Students";
import Faculty from "./pages/admin/Faculty";
import Attendance from "./pages/admin/Attendance";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import Subjects from "./pages/admin/Subjects";
import LiveClassroom from "./pages/admin/LiveClassroom";
import LectureHistory from "./pages/admin/LectureHistory";
import PerformanceDashboard from "./pages/admin/PerformanceDashboard";
import AttendanceDashboard from "./pages/admin/AttendanceDashboard";
import AttendancePermission from "./components/attendance/AttendancePermission";
import StudentReport from "./pages/admin/StudentReport";
import ReportsDashboard from "./pages/admin/ReportsDashboard";
import DailyDiary from "./pages/admin/DailyDiary";
import Coding from "./pages/admin/Coding";

// Student
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/student/Dashboard";
import StudentProfile from "./pages/student/Profile";
import StudentAttendance from "./pages/student/Attendance";
import StudentRegister from "./pages/student/StudentRegister";

// Faculty
import FacultyLayout from "./layouts/FacultyLayout";
import FacultyDashboard from "./pages/faculty/Dashboard";
import PendingStudents from "./pages/faculty/PendingStudents";
import FacultyStudents from "./pages/faculty/Students";
import FacultyAttendance from "./pages/faculty/Attendance";

function App() {
  return (
    <Routes>

      {/* =========================
          Public Routes
      ========================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/student/register"
        element={<StudentRegister />}
      />


      {/* =========================
          Admin Portal
      ========================= */}

      <Route
        path="/admin"
        element={<AdminLayout />}
      >

        <Route
          index
          element={<Dashboard />}
        />

        <Route
          path="students"
          element={<Students />}
        />

        <Route
          path="student-report/:id"
          element={<StudentReport />}
        />

        <Route
          path="faculty"
          element={<Faculty />}
        />

        <Route
          path="attendance"
          element={<Attendance />}
        />

        <Route
          path="attendance-permissions"
          element={<AttendancePermission />}
        />


        <Route
          path="subjects"
          element={<Subjects />}
        />

        <Route
          path="reports"
          element={<Reports />}
        />

        <Route
          path="settings"
          element={<Settings />}
        />

        <Route
          path="classroom"
          element={<LiveClassroom />}
        />

        <Route
          path="history"
          element={<LectureHistory />}
        />

        <Route
          path="performance"
          element={<PerformanceDashboard />}
        />

        <Route
          path="attendance-dashboard"
          element={<AttendanceDashboard />}
        />

        <Route
          path="reports-dashboard"
          element={<ReportsDashboard />}
        />

        <Route
          path="daily-diary"
          element={<DailyDiary />}
        />

        <Route
          path="coding"
          element={<Coding />}
        />

      </Route>


      {/* =========================
          Student Portal
      ========================= */}

      <Route
        path="/student"
        element={<StudentLayout />}
      >

        <Route
          index
          element={<StudentDashboard />}
        />

        <Route
          path="profile"
          element={<StudentProfile />}
        />

        <Route
          path="attendance"
          element={<StudentAttendance />}
        />


      </Route>


      {/* =========================
          Faculty Portal
      ========================= */}

      <Route
        path="/faculty"
        element={<FacultyLayout />}
      >
        <Route
          index
          element={<FacultyDashboard />}
        />

        <Route
          path="pending-students"
          element={<PendingStudents />}
        />

        <Route
          path="students"
          element={<FacultyStudents />}
        />

        <Route
          path="attendance"
          element={<FacultyAttendance />}
        />
      </Route>

      {/* =========================
          Unknown Routes
      ========================= */}

      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}

export default App;