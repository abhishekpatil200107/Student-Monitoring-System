import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  User,
  ClipboardCheck,
  MonitorPlay,
  History,
  BookOpenCheck,
  ClipboardList,
  BarChart3,
  Code2,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const studentGroups = [
  {
    category: "Main",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        path: "/student",
        exact: true,
      },
      {
        title: "Live Classroom",
        icon: MonitorPlay,
        path: "/student/classroom",
        badge: "Live",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      },
      {
        title: "My Attendance",
        icon: ClipboardCheck,
        path: "/student/attendance",
      },
    ],
  },
  {
    category: "Academics",
    items: [
      {
        title: "Daily Diary",
        icon: BookOpenCheck,
        path: "/student/daily-diary",
      },
      {
        title: "Assignments",
        icon: ClipboardList,
        path: "/student/assignments",
      },
      {
        title: "Lecture History",
        icon: History,
        path: "/student/history",
      },
      {
        title: "Coding Practice",
        icon: Code2,
        path: "/student/coding",
      },
    ],
  },
  {
    category: "Analytics & Profile",
    items: [
      {
        title: "My Performance",
        icon: BarChart3,
        path: "/student/performance",
      },
      {
        title: "My Reports",
        icon: BarChart3,
        path: "/student/reports",
      },
      {
        title: "My Profile",
        icon: User,
        path: "/student/profile",
      },
      {
        title: "Notifications",
        icon: Bell,
        path: "/student/notifications",
      },
      {
        title: "Settings",
        icon: Settings,
        path: "/student/settings",
      },
    ],
  },
];

function StudentSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("student_sidebar_collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

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
      localStorage.setItem("student_sidebar_collapsed", String(next));
      return next;
    });
  };

  const displayName = user?.first_name || user?.username || "Student";

  return (
    <>
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
      {/* Brand Header */}
      <div className="relative flex items-center justify-between border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3.5 overflow-hidden">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white font-black text-lg shadow-lg shadow-blue-600/30 ring-1 ring-white/20">
            SM
          </div>

          {!collapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <h1 className="truncate text-base font-bold tracking-tight text-white">
                Student Monitor
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Student Portal
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Slidebar Collapse Toggle Button */}
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

      {/* Slidebar Navigation Menu */}
      <nav className="slidebar-scroll flex-1 overflow-y-auto px-2.5 py-4 space-y-4">
        {studentGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!collapsed && (
              <div className="nav-category">
                <span>{group.category}</span>
              </div>
            )}

            {group.items.map((menu) => {
              const Icon = menu.icon;

              return (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  end={menu.exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `slidebar-item ${isActive ? "active" : ""}`
                  }
                >
                  <div className="icon-wrapper">
                    <Icon size={19} />
                  </div>

                  {!collapsed && (
                    <span className="truncate flex-1">{menu.title}</span>
                  )}

                  {!collapsed && menu.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                        menu.badgeColor ||
                        "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                      }`}
                    >
                      {menu.badge}
                    </span>
                  )}

                  {/* Tooltip on collapsed mode */}
                  {collapsed && (
                    <div className="slidebar-tooltip">
                      {menu.title}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Profile Mini-Card */}
      <div className="border-t border-white/10 p-3">
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
                )}&background=2563eb&color=fff&bold=true`}
                alt={displayName}
                className="h-9 w-9 rounded-xl ring-2 ring-blue-500/40"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">
                  {displayName}
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <GraduationCap size={12} className="text-blue-400" />
                  <span>Student</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
    </>
  );
}

export default StudentSidebar;
