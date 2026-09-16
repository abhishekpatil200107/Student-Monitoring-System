import React from "react";
import {
  Bell,
  Search,
  LogOut,
  Sparkles,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Navbar({ portal = "admin" }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const portalData = {
    admin: {
      subtitle: "Admin Command Center",
      searchPlaceholder: "Search students, faculty, records...",
      defaultName: "Admin",
      role: "Administrator",
      avatarBg: "4f46e5",
    },
    student: {
      subtitle: "Student Portal",
      searchPlaceholder: "Search courses, lectures, assignments...",
      defaultName: "Student",
      role: "Student",
      avatarBg: "2563eb",
    },
    faculty: {
      subtitle: "Faculty Hub",
      searchPlaceholder: "Search students, subjects, attendance...",
      defaultName: "Faculty",
      role: "Faculty",
      avatarBg: "059669",
    },
  };

  const data = portalData[portal] || portalData.admin;

  const displayName =
    user?.first_name ||
    user?.username ||
    data.defaultName;

  const displayRole =
    user?.role === "ADMIN"
      ? "Administrator"
      : user?.role === "FACULTY"
        ? "Faculty"
        : user?.role === "STUDENT"
          ? "Student"
          : data.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-topbar">
      {/* Left: Branding & Subtitle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          className="mobile-menu-button btn-icon btn-secondary"
          onClick={() => window.dispatchEvent(new Event("toggle-mobile-sidebar"))}
        >
          <Menu size={19} />
        </button>
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-800 sm:text-lg">
            Student Monitoring System
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {data.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Search Field */}
      <div className="hidden lg:flex flex-1 max-w-md mx-6">
        <div className="nav-search-box">
          <Search size={17} className="absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={data.searchPlaceholder}
          />
          <span className="nav-shortcut-badge">⌘K</span>
        </div>
      </div>

      {/* Right: Actions, Notifications, User Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Status Pill */}
        <div className="hidden xl:inline-flex items-center gap-1.5 rounded-full bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
          <Sparkles size={13} className="text-indigo-600" />
          <span>Academic Portal</span>
        </div>

        {/* Notifications */}
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

        {/* User Card */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
          <div className="relative">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                displayName
              )}&background=${data.avatarBg}&color=fff&bold=true`}
              alt={displayName}
              className="h-10 w-10 rounded-xl ring-2 ring-indigo-50 shadow-sm"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="hidden md:block">
            <h4 className="text-xs font-bold text-slate-800 leading-tight">
              {displayName}
            </h4>
            <p className="text-[11px] font-medium text-slate-400">
              {displayRole}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          className="btn btn-secondary btn-sm text-rose-600 hover:border-rose-200 hover:bg-rose-50/70"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
