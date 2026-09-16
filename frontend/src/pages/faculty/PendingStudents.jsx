import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
} from "lucide-react";

import api from "../../services/api";

function PendingStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadStudents = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/faculty/pending-students/"
      );

      setStudents(response.data);

    } catch (error) {
      console.error(
        "PENDING STUDENTS ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load pending students."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const approveStudent = async (studentId) => {
    try {
      setProcessingId(studentId);

      const response = await api.post(
        `/faculty/${studentId}/approve-student/`
      );

      toast.success(
        response.data.message ||
          "Student approved successfully."
      );

      // Remove approved student from the pending list
      setStudents((currentStudents) =>
        currentStudents.filter(
          (student) => student.id !== studentId
        )
      );

    } catch (error) {
      console.error(
        "APPROVE STUDENT ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to approve student."
      );

    } finally {
      setProcessingId(null);
    }
  };

  const rejectStudent = async (studentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this student registration?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(studentId);

      const response = await api.post(
        `/faculty/${studentId}/reject-student/`
      );

      toast.success(
        response.data.message ||
          "Student rejected successfully."
      );

      // Remove rejected student from the pending list
      setStudents((currentStudents) =>
        currentStudents.filter(
          (student) => student.id !== studentId
        )
      );

    } catch (error) {
      console.error(
        "REJECT STUDENT ERROR:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to reject student."
      );

    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Pending Students
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review student registration requests.
          </p>
        </div>

        <button
          onClick={loadStudents}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>

      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-xl bg-white p-10 text-center shadow-sm">

          <RefreshCw
            className="mx-auto animate-spin text-blue-600"
            size={30}
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading pending students...
          </p>

        </div>
      )}

      {/* Empty */}
      {!loading && students.length === 0 && (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm">

          <CheckCircle
            className="mx-auto text-green-500"
            size={45}
          />

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No Pending Students
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            There are no student registrations waiting
            for your approval.
          </p>

        </div>
      )}

      {/* Students */}
      {!loading && students.length > 0 && (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="border-b border-slate-200 bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Roll No
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Department
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Year
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Division
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {students.map((student) => (

                  <tr
                    key={student.id}
                    className="hover:bg-slate-50"
                  >

                    {/* Student */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <User size={20} />
                        </div>

                        <div>

                          <p className="font-medium text-slate-800">
                            {student.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {student.email}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* Roll number */}
                    <td className="px-6 py-5 text-sm font-medium text-slate-700">
                      {student.roll_no}
                    </td>

                    {/* Department */}
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {student.department}
                    </td>

                    {/* Year */}
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {student.year}
                    </td>

                    {/* Division */}
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {student.division}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            approveStudent(student.id)
                          }
                          disabled={
                            processingId === student.id
                          }
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                        >

                          <CheckCircle size={16} />

                          {processingId === student.id
                            ? "Processing..."
                            : "Approve"}

                        </button>

                        <button
                          onClick={() =>
                            rejectStudent(student.id)
                          }
                          disabled={
                            processingId === student.id
                          }
                          className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                        >

                          <XCircle size={16} />

                          Reject

                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </div>
  );
}

export default PendingStudents;