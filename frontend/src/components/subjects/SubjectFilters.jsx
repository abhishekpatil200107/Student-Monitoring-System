function SubjectFilters({
  search,
  setSearch,
  semester,
  setSemester,
}) {
  return (
    <div className="flex flex-col gap-4 border-b p-5 md:flex-row">

      <input
        type="text"
        placeholder="Search Subject..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 rounded-lg border px-4 py-3"
      />

      <select
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
        className="rounded-lg border px-4 py-3"
      >
        <option value="">All Semesters</option>

        <option value="1">Semester 1</option>
        <option value="2">Semester 2</option>
        <option value="3">Semester 3</option>
        <option value="4">Semester 4</option>
        <option value="5">Semester 5</option>
        <option value="6">Semester 6</option>
        <option value="7">Semester 7</option>
        <option value="8">Semester 8</option>

      </select>

    </div>
  );
}

export default SubjectFilters;