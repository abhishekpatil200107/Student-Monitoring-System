import React from "react";
import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="app-shell flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="min-w-0 flex-1 flex flex-col">
        <Navbar portal="admin" />

        <main className="flex-1 overflow-auto p-6 sm:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
