import {
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

function AttendanceRow({
  attendance,
  onDelete,
}) {
  return (
    <tr className="border-b hover:bg-slate-50">

      <td className="px-4 py-4">
        {attendance.student_name}
      </td>

      <td className="px-4 py-4">
        {attendance.department}
      </td>

      <td className="px-4 py-4">
        {attendance.date}
      </td>

      <td className="px-4 py-4">

        <span
          className={`rounded-full px-3 py-1 text-white ${
            attendance.status === "Present"
              ? "bg-green-500"
              : attendance.status === "Absent"
              ? "bg-red-500"
              : "bg-yellow-500"
          }`}
        >
          {attendance.status}
        </span>

      </td>

      <td className="px-4 py-4">

        <div className="flex gap-3">

          <button>
            <Eye
              size={18}
              className="text-blue-600"
            />
          </button>

          <button>
            <Pencil
              size={18}
              className="text-green-600"
            />
          </button>

          <button
            onClick={() =>
              onDelete(attendance.id)
            }
          >
            <Trash2
              size={18}
              className="text-red-600"
            />
          </button>

        </div>

      </td>

    </tr>
  );
}

export default AttendanceRow;