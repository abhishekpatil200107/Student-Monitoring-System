import { Plus, Download } from "lucide-react";

function StudentHeader({ onAdd }) {
  return (
    <div className="page-action-header mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Students
        </h1>

        <p className="mt-1 text-slate-500">
          Manage all students in your college.
        </p>
      </div>

      <div className="page-actions flex gap-3">

        <button
          className="secondary-action flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium transition hover:bg-slate-50"
        >
          <Download size={18} />
          Export
        </button>

        <button
          onClick={onAdd}
          className="primary-action flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Student
        </button>

      </div>
    </div>
  );
}

export default StudentHeader;
