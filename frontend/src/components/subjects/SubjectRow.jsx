function SubjectRow({
subject,
onDelete,
}) {
return ( <tr className="border-b hover:bg-slate-50">


  <td className="px-4 py-3">
    {subject.code}
  </td>

  <td className="px-4 py-3">
    {subject.name}
  </td>

  <td className="px-4 py-3">
    {subject.department}
  </td>

  <td className="px-4 py-3">
    Semester {subject.semester}
  </td>

  <td className="px-4 py-3">
    {subject.credits}
  </td>

  <td className="px-4 py-3">
    {subject.faculty_name || subject.faculty || "Not assigned"}
  </td>

  <td className="px-4 py-3">
    {subject.class_name || subject.class_relation || "Not assigned"}
  </td>

  <td className="px-4 py-3">

    <button
      className="mr-2 rounded bg-blue-600 px-3 py-1 text-white"
    >
      Edit
    </button>

    <button
      onClick={() => onDelete(subject.id)}
      className="rounded bg-red-600 px-3 py-1 text-white"
    >
      Delete
    </button>

  </td>

</tr>


);
}

export default SubjectRow;
