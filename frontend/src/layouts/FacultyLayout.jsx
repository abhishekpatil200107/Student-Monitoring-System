import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  ClipboardCheck,
  BookOpen,
  BarChart3,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Search,
  Bell,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const facultyGroups = [
  {
    category: "Main Navigation",
    items: [
      {
        name: "Dashboard",
        path: "/faculty",
        icon: LayoutDashboard,
        end: true,
      },
      {
        name: "Attendance",
        path: "/faculty/attendance",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    category: "Student Management",
    items: [
      {
        name: "Pending Approvals",
        path: "/faculty/pending-students",
        icon: UserCheck,
        badge: "Review",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      },
      {
        name: "Student Directory",
        path: "/faculty/students",
        icon: Users,
      },
      {
        name: "Daily Diary",
        path: "/faculty/daily-diary",
        icon: BookOpen,
      },
    ],
  },
  {
    category: "Insights & Profile",
    items: [
      {
        name: "Academic Reports",
        path: "/faculty/reports",
        icon: BarChart3,
      },
      {
        name: "My Profile",
        path: "/faculty/profile",
        icon: UserCircle,
      },
    ],
  },
];

function FacultyLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("faculty_sidebar_collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileOpen((open) => !open);
    const handleClose = () => setMobileOpen(false);
    window.addEventListener("toggle-mobile-sidebar", handleToggle);
    window.addEventListener("close-mobile-sidebar", handleClose);
    return () => {
      window.removeEventListener("toggle-mobile-sidebar", handleToggle);
      window.removeEventListener("close-mobile-sidebar", handleClose);
    };
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("faculty_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    navigate("/login");
  };

  const displayName = user?.first_name || user?.username || "Faculty Member";

  return (
    <div className="app-shell flex min-h-screen bg-slate-50">
      {/* =========================
          SLIDEBAR
      ========================= */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={() => setMobileOpen(false)}
        className={`mobile-sidebar-backdrop ${mobileOpen ? "is-visible" : ""}`}
      />
      <aside
        className={`app-sidebar ${
          collapsed ? "is-collapsed" : "is-expanded"
        } ${mobileOpen ? "mobile-open" : ""}`}
      >
        {/* Logo & Collapse Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 text-white font-black text-lg shadow-lg shadow-teal-700/30 ring-1 ring-white/20">
              SM
            </div>

            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <h1 className="truncate text-base font-bold tracking-tight text-white">
                  Student Monitor
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Faculty Portal
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleCollapse}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition ${
              collapsed ? "mx-auto mt-2" : ""
            }`}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="slidebar-scroll flex-1 overflow-y-auto px-2.5 py-4 space-y-4">
          {facultyGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!collapsed && (
                <div className="nav-category">
                  <span>{group.category}</span>
                </div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `slidebar-item ${isActive ? "active" : ""}`
                    }
                  >
                    <div className="icon-wrapper">
                      <Icon size={19} />
                    </div>

                    {!collapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                          item.badgeColor ||
                          "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {collapsed && (
                      <div className="slidebar-tooltip">
                        {item.name}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout & Profile Footer */}
        <div className="border-t border-white/10 p-3 space-y-2">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-rose-300/80 hover:bg-rose-500/10 hover:text-rose-200 transition ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            <LogOut size={16} />
            {!collapsed && <span>Sign Out</span>}
          </button>

          <div
            className={`slidebar-footer ${
              collapsed ? "justify-center p-2" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="relative shrink-0">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=059669&color=fff&bold=true`}
                  alt={displayName}
                  className="h-9 w-9 rounded-xl ring-2 ring-emerald-500/40"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-white">
                    {displayName}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Briefcase size={12} className="text-teal-400" />
                    <span>Faculty</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <div className="min-w-0 flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="app-topbar">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
              Student Monitoring System
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Faculty Hub
            </p>
          </div>

          <div className="hidden md:flex items-center">
            <div className="nav-search-box">
              <Search size={17} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search students, subjects..."
              />
              <span className="nav-shortcut-badge">⌘K</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-icon btn-secondary text-slate-600 relative"
              title="Notifications"
            >
              <Bell size={18} />
              <div className="ping-dot-container">
                <span className="ping-dot" />
              </div>
            </button>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  displayName
                )}&background=059669&color=fff`}
                alt={displayName}
                className="h-10 w-10 rounded-xl ring-2 ring-slate-200"
              />
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{displayName}</p>
                <p className="text-[11px] text-slate-400">Faculty Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default FacultyLayout;
