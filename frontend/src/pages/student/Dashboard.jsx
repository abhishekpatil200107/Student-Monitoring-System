import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Sparkles,
  ClipboardCheck,
  BookOpen,
  Code2,
  UserCircle,
  ArrowUpRight,
} from "lucide-react";

import StatsCard from "../../components/dashboard/StatsCard";
import StudentRecentActivity from "../../components/dashboard/StudentRecentActivity";
import Card from "../../components/ui/Card";
import api from "../../services/api";
import { getMyAttendance } from "../../services/attendanceService";

function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myAttendance, setMyAttendance] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/students/dashboard/");
      setDashboard(response.data);
    } catch (error) {
      console.error("STUDENT DASHBOARD ERROR:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    getMyAttendance()
      .then((data) => setMyAttendance(data))
      .catch((error) => console.error("ATTENDANCE ERROR:", error.response?.data || error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-slate-500">Loading your dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Dashboard unavailable</h2>
        <p className="mt-2 text-sm text-slate-500">
          Unable to load your student information.
        </p>
      </div>
    );
  }

  const student = dashboard.student;
  const statistics = dashboard.statistics;

  const quickActions = [
    {
      title: "Attendance",
      description: "View your day-wise attendance record.",
      icon: ClipboardCheck,
      color: "bg-orange-50 text-orange-600",
      onClick: () => navigate("/student/attendance"),
    },
    {
      title: "Daily Diary",
      description: "Log and review your daily learning entries.",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600",
      onClick: () => navigate("/student/diary"),
    },
    {
      title: "Coding Profile",
      description: "Track your coding practice and progress.",
      icon: Code2,
      color: "bg-purple-50 text-purple-600",
      onClick: () => navigate("/student/coding-profile"),
    },
    {
      title: "My Profile",
      description: "View and update your personal information.",
      icon: UserCircle,
      color: "bg-emerald-50 text-emerald-600",
      onClick: () => navigate("/student/profile"),
    },
  ];

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="dashboard-hero relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-indigo-900/10 lg:p-9">
        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.14em] text-indigo-100">
              <Sparkles size={14} /> Student workspace
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Welcome back, {student.name}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 lg:text-base">
              Here's your academic overview — attendance, performance and
              everything else in one place.
            </p>
          </div>

          <div className="toolbar-row">
            <button
              type="button"
              onClick={() => navigate("/student/diary")}
              className="hero-btn hero-btn-glass"
            >
              <BookOpen size={17} /> Open diary
            </button>
            <button
              type="button"
              onClick={() => navigate("/student/attendance")}
              className="hero-btn hero-btn-solid"
            >
              <ClipboardCheck size={17} /> View attendance
            </button>
          </div>
        </div>
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
      </section>

      {/* Student Information */}
      <Card>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Roll Number</p>
            <p className="mt-1 font-semibold text-slate-800">{student.roll_no}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Class</p>
            <p className="mt-1 font-semibold text-slate-800">
              {student.class_name || "Not assigned"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Department</p>
            <p className="mt-1 font-semibold text-slate-800">
              {student.department || "Not assigned"}
            </p>
          </div>
        </div>
      </Card>

      {/* Section header */}
      <div className="section-header-row">
        <div>
          <p className="section-eyebrow">Overview</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-800">
            Your progress at a glance
          </h2>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Attendance"
          value={myAttendance ? `${myAttendance.statistics.percentage}%` : "0%"}
          icon="attendance"
          color="bg-orange-500"
        />
        <StatsCard title="Assignments" value={statistics.assignments} icon="students" color="bg-blue-500" />
        <StatsCard title="Performance" value={`${statistics.performance}%`} icon="faculty" color="bg-green-500" />
        <StatsCard title="Pending Tasks" value={statistics.pending_tasks} icon="users" color="bg-purple-500" />
      </div>

      {/* My Class */}
      <Card title="My Class" subtitle="Your current academic class information">
        <div className="rounded-xl border border-slate-200 p-5">
          <h4 className="text-lg font-semibold text-slate-700">
            {student.class_name || "Class not assigned"}
          </h4>

          <div className="mt-3 flex flex-wrap gap-3">
            <span className="badge-premium badge-indigo">
              <span className="badge-dot" /> {student.year}
            </span>
            <span className="badge-premium badge-slate">
              <span className="badge-dot" /> Division {student.division}
            </span>
            <span
              className={`badge-premium ${
                student.status === "Active" ? "badge-emerald" : "badge-rose"
              }`}
            >
              <span className="badge-dot" /> {student.status}
            </span>
          </div>
        </div>
      </Card>

      {/* Quick Actions — aligned, identical-height tiles */}
      <div>
        <div className="section-header-row mb-4">
          <div>
            <p className="section-eyebrow">Shortcuts</p>
            <h2 className="mt-1 text-lg font-bold text-slate-800">Quick actions</h2>
          </div>
        </div>

        <div className="quick-action-grid">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                type="button"
                onClick={action.onClick}
                className="quick-action-card"
              >
                <span className={`quick-action-icon ${action.color}`}>
                  <Icon size={22} />
                </span>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
                <span className="quick-action-arrow">
                  Open <ArrowUpRight size={13} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <StudentRecentActivity student={student} />
    </div>
  );
}

export default Dashboard;
