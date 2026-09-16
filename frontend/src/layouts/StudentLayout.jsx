import React from "react";
import StudentSidebar from "../components/common/StudentSidebar";
import Navbar from "../components/common/Navbar";
import { Outlet } from "react-router-dom";

function StudentLayout() {
  return (
    <div className="app-shell flex min-h-screen bg-slate-50">
      <StudentSidebar />

      <div className="min-w-0 flex-1 flex flex-col">
        <Navbar portal="student" />

        <main className="flex-1 overflow-auto p-6 sm:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
