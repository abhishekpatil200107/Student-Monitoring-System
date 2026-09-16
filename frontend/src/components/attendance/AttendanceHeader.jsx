import { Plus, Download } from "lucide-react";

function AttendanceHeader({ onAdd }) {
  return (
    <div className="flex items-center justify-between">

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Attendance
        </h1>

        <p className="text-slate-500">
          Manage student attendance records.
        </p>
      </div>

      <div className="flex gap-3">

        <button className="flex items-center gap-2 rounded-lg border px-5 py-3">
          <Download size={18} />
          Export
        </button>

        <button
          onClick={onAdd}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          <Plus size={18} />
          Mark Attendance
        </button>

      </div>

    </div>
  );
}

export default AttendanceHeader;