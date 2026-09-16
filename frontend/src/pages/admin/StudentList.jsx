import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Card from "../../components/ui/Card";
import { getStudents } from "../../services/studentService";
import { downloadStudentReport } from "../../services/studentReportService";

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Student Reports
      </h1>

      <Card>

        <table className="min-w-full">

          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {students.map((student) => (

              <tr key={student.id}>

                <td>{student.roll_no}</td>

                <td>{student.name}</td>

                <td>{student.department}</td>

                <td>{student.year}</td>

                <td className="space-x-2">

                  <Link
                    to={`/admin/student-report/${student.id}`}
                    className="rounded bg-blue-600 px-3 py-1 text-white"
                  >
                    View
                  </Link>

                  <button
                    onClick={() =>
                      downloadStudentReport(student.id)
                    }
                    className="rounded bg-green-600 px-3 py-1 text-white"
                  >
                    PDF
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </Card>

    </div>
  );
}

export default StudentList;