import { Link } from "react-router-dom";
import {
  FileText,
  BookOpen,
  Code2,
  ClipboardList,
  BarChart3,
  Users,
} from "lucide-react";

import ReportCard from "../../components/reports/ReportCard";

function Reports() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Reports Center
        </h1>

        <p className="mt-2 text-slate-500">
          Generate and manage all student academic reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        <ReportCard
          title="Student Performance"
          description="Detailed performance report of every student."
          icon={Users}
          button="Open"
          to="/admin/students"
        />

        <ReportCard
          title="Daily Diary"
          description="Home study, homework and learning diary."
          icon={BookOpen}
          button="Open"
          to="/admin/daily-diary"
        />

        <ReportCard
          title="Coding Report"
          description="LeetCode, HackerRank and coding activity."
          icon={Code2}
          button="Open"
          to="/admin/coding"
        />

        <ReportCard
          title="Attendance Report"
          description="Attendance analytics and reports."
          icon={ClipboardList}
          button="Open"
          to="/admin/attendance-dashboard"
        />

        <ReportCard
          title="Performance Analytics"
          description="Performance charts and statistics."
          icon={BarChart3}
          button="Open"
          to="/admin/performance"
        />

        <ReportCard
          title="Lecture Reports"
          description="Lecture history and PDF reports."
          icon={FileText}
          button="Open"
          to="/admin/history"
        />

      </div>

    </div>
  );
}

export default Reports;