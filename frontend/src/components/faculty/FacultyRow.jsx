function FacultyRow({
  faculty,
  onEdit,
  onDelete,
}) {
  return (
    <tr className="border-b hover:bg-slate-50">

      <td className="px-4 py-3">
        {faculty.employee_id}
      </td>

      <td className="px-4 py-3">
        <div>
          <p className="font-medium">
            {faculty.name}
          </p>

          <p className="text-sm text-slate-500">
            {faculty.email}
          </p>
        </div>
      </td>

      <td className="px-4 py-3">
        {faculty.department}
      </td>

      <td className="px-4 py-3">
        {faculty.designation}
      </td>

      <td className="px-4 py-3">
        {faculty.phone}
      </td>

      <td className="px-4 py-3">

        <span
          className={`rounded-full px-3 py-1 text-sm text-white ${
            faculty.status === "Active"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        >
          {faculty.status}
        </span>

      </td>

      <td className="px-4 py-3">

        <button
          onClick={() =>
            onEdit(faculty)
          }
          className="mr-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
        >
          Edit
        </button>

        <button
          onClick={() =>
            onDelete(faculty.id)
          }
          className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
        >
          Delete
        </button>

      </td>

    </tr>
  );
}

export default FacultyRow;