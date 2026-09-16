function FacultyFilters({
  search,
  setSearch,
  department,
  setDepartment,
}) {
  return (
    <div className="flex flex-col gap-4 border-b p-5 md:flex-row">
      <input
        type="text"
        placeholder="Search Faculty..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
      />

      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
      >
        <option value="">All Departments</option>
        <option>Computer Engineering</option>
        <option>Information Technology</option>
        <option>AI & DS</option>
        <option>Mechanical</option>
        <option>Civil</option>
      </select>
    </div>
  );
}

export default FacultyFilters;