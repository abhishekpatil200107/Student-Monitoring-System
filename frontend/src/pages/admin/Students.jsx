import { useState } from "react";

import useStudents from "../../hooks/useStudents";

import StudentRow from "../../components/students/StudentRow";
import StudentFilters from "../../components/students/StudentFilters";
import StudentHeader from "../../components/students/StudentHeader";
import AddStudentModal from "../../components/students/AddStudentModal";

import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";

function Students() {
  const {
    students,
    loading,
    reload,
    createStudent,
    deleteStudent,
  } = useStudents();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const filteredStudents = students.filter((student) => {
    const matchName = student.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchDepartment =
      department === "" ||
      student.department === department;

    return matchName && matchDepartment;
  });

  const handleSave = async (student) => {
    try {
      await createStudent(student);

      reload();

      setOpenModal(false);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;

    try {
      await deleteStudent(id);

      reload();
    } catch (error) {
      console.log("Status:", error.response?.status);
      console.log("Error:", error.response?.data);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-lg">
        Loading Students...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <StudentHeader
        onAdd={() => setOpenModal(true)}
      />

      <Card className="overflow-hidden p-0">

        <StudentFilters
          search={search}
          setSearch={setSearch}
          department={department}
          setDepartment={setDepartment}
        />

        <Table
          columns={[
            "Roll No",
            "Student",
            "Department",
            "Year",
            "Attendance",
            "Status",
            "Action",
          ]}
        >
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={7}
                className="py-10 text-center text-slate-500"
              >
                No Students Found
              </td>
            </tr>
          )}
        </Table>

      </Card>

      <AddStudentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
      />

    </div>
  );
}

export default Students;