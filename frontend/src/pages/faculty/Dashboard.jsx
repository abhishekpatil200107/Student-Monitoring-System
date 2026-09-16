import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  ClipboardCheck,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getMySubjects } from "../../services/subjectService";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

function FacultyDashboard() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------
  // Load dashboard data
  // -------------------------------------------------
  const loadDashboard = async () => {
    try {
      setLoading(true);

      const pendingResponse = await api.get("/faculty/pending-students/");
      const pendingData = pendingResponse.data;
      setPendingStudents(Array.isArray(pendingData) ? pendingData : pendingData.results || []);

      const studentsResponse = await api.get("/faculty/students/");
      const studentsData = studentsResponse.data;
      setStudents(Array.isArray(studentsData) ? studentsData : studentsData.results || []);
    } catch (error) {
      console.error("FACULTY DASHBOARD ERROR:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    getMySubjects()
      .then((data) => console.log("MY FACULTY SUBJECTS:", data))
      .catch((error) => console.error("MY SUBJECTS ERROR:", error.response?.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------
  // Dashboard statistics
  // -------------------------------------------------
  const totalStudents = students.length;
  const pendingCount = pendingStudents.length;
  const approvedCount = students.filter((s) => s.approval_status === "APPROVED").length;
  const averageAttendance =
    students.length > 0
      ? Math.round(
          students.reduce((total, s) => total + Number(s.attendance || 0), 0) / students.length
        )
      : 0;

  const stats = [
    { title: "Total Students", value: totalStudents, icon: "students", color: "bg-blue-500" },
    { title: "Pending Approvals", value: pendingCount, icon: "users", color: "bg-amber-500" },
    { title: "Approved Students", value: approvedCount, icon: "faculty", color: "bg-emerald-500" },
    { title: "Avg. Attendance", value: `${averageAttendance}%`, icon: "attendance", color: "bg-purple-500" },
  ];

  const iconMap = { students: Users, users: UserPlus, faculty: UserCheck, attendance: ClipboardCheck };

  const quickActions = [
    {
      title: "Review Students",
      description: "Approve or reject pending registrations.",
      icon: UserPlus,
      color: "bg-amber-50 text-amber-600",
      onClick: () => navigate("/faculty/pending-students"),
    },
    {
      title: "View Students",
      description: "View and manage your student directory.",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      onClick: () => navigate("/faculty/students"),
    },
    {
      title: "Attendance",
      description: "Mark and track student attendance.",
      icon: ClipboardCheck,
      color: "bg-purple-50 text-purple-600",
      onClick: () => navigate("/faculty/attendance"),
    },
  ];

  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="dashboard-hero relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-emerald-900/10 lg:p-9">
        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.14em] text-emerald-100">
              <Sparkles size={14} /> Faculty command center
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Welcome back, Faculty
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-100 lg:text-base">
              Track your students, review pending approvals and manage
              attendance — all from a single, unified workspace.
            </p>
          </div>

          <div className="toolbar-row">
            <button
              type="button"
              onClick={() => navigate("/faculty/daily-diary")}
              className="hero-btn hero-btn-glass"
            >
              <BookOpen size={17} /> Daily diary
            </button>
            <button
              type="button"
              onClick={() => navigate("/faculty/pending-students")}
              className="hero-btn hero-btn-solid"
            >
              <UserCheck size={17} /> Review approvals
            </button>
          </div>
        </div>
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
      </section>

      {/* Section header */}
      <div className="section-header-row">
        <div>
          <p className="section-eyebrow">Overview</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-800">
            Your classroom at a glance
          </h2>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = iconMap[stat.icon];
          return (
            <Card key={stat.title} className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-400">
                    {stat.title}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
                    {loading ? "—" : stat.value}
                  </h2>
                </div>
                <div className={`${stat.color} rounded-2xl p-4 text-white shadow-lg`}>
                  <Icon size={24} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pending Students */}
      <Card
        padding="none"
        title="Pending Student Approvals"
        subtitle="Students waiting for your approval."
        action={
          pendingStudents.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/faculty/pending-students")}
            >
              View All <ArrowRight size={16} />
            </Button>
          )
        }
        className="!p-6"
      >
        <div className="table-container -mx-6 -mb-6 mt-2 rounded-none border-x-0 border-b-0 shadow-none">
          {loading ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">
              Loading students...
            </div>
          ) : pendingStudents.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <UserCheck size={40} className="mx-auto text-emerald-500" />
              <p className="mt-3 font-medium text-slate-700">No pending students</p>
              <p className="mt-1 text-sm text-slate-500">
                All student registrations have been reviewed.
              </p>
            </div>
          ) : (
            <table className="table-premium">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Year</th>
                  <th>Division</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.slice(0, 5).map((student) => (
                  <tr key={student.id}>
                    <td className="font-medium text-slate-800">{student.roll_no}</td>
                    <td>
                      <p className="font-medium text-slate-800">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </td>
                    <td className="text-slate-600">{student.department}</td>
                    <td className="text-slate-600">{student.year}</td>
                    <td className="text-slate-600">{student.division}</td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate("/faculty/pending-students")}
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Quick Actions — every tile shares identical height & alignment */}
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
    </div>
  );
}

export default FacultyDashboard;
