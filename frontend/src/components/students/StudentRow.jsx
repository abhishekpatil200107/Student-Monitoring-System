import {
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import Badge from "../ui/Badge";
import { useNavigate } from "react-router-dom";

function StudentRow({ student }) {
  const navigate = useNavigate();
  return (
    <tr className="border-b border-slate-200 transition hover:bg-slate-50">

      {/* Roll No */}

      <td className="px-6 py-4 font-medium text-slate-700">
        {student.roll_no}
      </td>

      {/* Student */}

      <td className="px-6 py-4">

        <div className="flex items-center gap-3">

          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              student.name
            )}&background=2563eb&color=fff`}
            alt={student.name}
            className="h-11 w-11 rounded-full"
          />

          <div>

            <p className="font-semibold text-slate-800">
              {student.name}
            </p>

            <p className="text-sm text-slate-500">
              Student
            </p>

          </div>

        </div>

      </td>

      {/* Department */}

      <td className="px-6 py-4 text-slate-600">
        {student.department}
      </td>

      {/* Year */}

      <td className="px-6 py-4">
        <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {student.year}
        </span>
      </td>

      {/* Attendance */}

      <td className="px-6 py-4">
        <span className="font-semibold text-green-600">
          {student.attendance}
        </span>
      </td>

      {/* Status */}

      <td className="px-6 py-4">

        <Badge
          color={
            student.status === "Active"
              ? "green"
              : "red"
          }
        >
          {student.status}
        </Badge>

      </td>

      {/* Actions */}

      <td className="px-6 py-4">

        <div className="flex items-center gap-2">

          <button
            className="rounded-lg bg-slate-100 p-2 transition hover:bg-blue-100"
            title="View"
          >
            <FaEye className="text-blue-600" />
          </button>

          <button
            className="rounded-lg bg-slate-100 p-2 transition hover:bg-green-100"
            title="Edit"
          >
            <FaEdit className="text-green-600" />
          </button>

          <button
            onClick={() => onDelete(student.id)}
            className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={() => navigate(`/admin/student-report/${student.id}`)}
            className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          >
            View Report
          </button>

        </div>

      </td>

    </tr>
  );
}

export default StudentRow;