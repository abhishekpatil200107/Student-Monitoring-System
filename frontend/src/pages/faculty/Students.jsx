import { useEffect, useState } from "react";
import {
  Users,
  Search,
  UserCheck,
  Mail,
  Phone,
} from "lucide-react";
import api from "../../services/api";

function FacultyStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ---------------------------------------------
  // Load faculty students
  // ---------------------------------------------

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/faculty/students/"
      );

      const data = response.data;

      setStudents(
        Array.isArray(data)
          ? data
          : data.results || []
      );

    } catch (error) {
      console.error(
        "FACULTY STUDENTS ERROR:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
        "Unable to load students."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // ---------------------------------------------
  // Search
  // ---------------------------------------------

  const filteredStudents = students.filter(
    (student) => {
      const searchText = search.toLowerCase();

      return (
        student.name
          ?.toLowerCase()
          .includes(searchText) ||
        student.roll_no
          ?.toLowerCase()
          .includes(searchText) ||
        student.email
          ?.toLowerCase()
          .includes(searchText) ||
        student.department
          ?.toLowerCase()
          .includes(searchText)
      );
    }
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          My Students
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View students assigned to your classes.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Students
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {loading ? "—" : students.length}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Users
                size={24}
                className="text-blue-600"
              />
            </div>

          </div>

        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Students
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-800">
                {loading
                  ? "—"
                  : students.filter(
                      (student) =>
                        student.status === "Active"
                    ).length}
              </h2>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <UserCheck
                size={24}
                className="text-green-600"
              />
            </div>

          </div>

        </div>

      </div>

      {/* Students Table */}
      <div className="rounded-xl bg-white shadow-sm">

        {/* Table Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Student List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Students assigned to your classes.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search students..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

          </div>

        </div>

        {/* Content */}
        <div className="overflow-x-auto">

          {loading ? (

            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Loading students...
            </div>

          ) : error ? (

            <div className="px-6 py-12 text-center">

              <p className="font-medium text-red-600">
                {error}
              </p>

              <button
                onClick={loadStudents}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Try Again
              </button>

            </div>

          ) : filteredStudents.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <Users
                size={40}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 font-medium text-slate-700">
                No students found
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try a different search."
                  : "No approved students are assigned to you yet."}
              </p>

            </div>

          ) : (

            <table className="w-full text-left">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                    Roll No
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                    Department
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                    Year
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                    Division
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                    Attendance
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredStudents.map(
                  (student) => (

                    <tr
                      key={student.id}
                      className="hover:bg-slate-50"
                    >

                      {/* Roll No */}
                      <td className="px-6 py-4 text-sm font-medium text-slate-800">
                        {student.roll_no}
                      </td>

                      {/* Student */}
                      <td className="px-6 py-4">

                        <p className="text-sm font-medium text-slate-800">
                          {student.name}
                        </p>

                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <Mail size={12} />
                          {student.email}
                        </div>

                        {student.phone && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Phone size={12} />
                            {student.phone}
                          </div>
                        )}

                      </td>

                      {/* Department */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.department}
                      </td>

                      {/* Year */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.year}
                      </td>

                      {/* Division */}
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.division}
                      </td>

                      {/* Attendance */}
                      <td className="px-6 py-4">

                        <span className="text-sm font-semibold text-slate-700">
                          {student.attendance ?? 0}%
                        </span>

                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            student.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {student.status}
                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  );
}

export default FacultyStudents;


