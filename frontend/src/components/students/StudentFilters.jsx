function StudentFilters({
  search,
  setSearch,
  department,
  setDepartment,
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row">
      <input
        type="text"
        placeholder="Search Student..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 rounded-lg border px-4 py-3"
      />

      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="rounded-lg border px-4 py-3"
      >
        <option value="">All Departments</option>
        <option>Computer</option>
        <option>IT</option>
        <option>AI & DS</option>
      </select>
    </div>
  );
}

export default StudentFilters;