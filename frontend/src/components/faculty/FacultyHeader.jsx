function FacultyHeader({ onAdd }) {
  return (
    <div className="page-action-header flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Faculty Management
        </h1>

        <p className="mt-1 text-slate-500">
          Manage faculty members and departments.
        </p>
      </div>

      <button
        onClick={onAdd}
        className="primary-action rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        + Add Faculty
      </button>
    </div>
  );
}

export default FacultyHeader;
