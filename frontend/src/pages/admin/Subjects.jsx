import { useState } from "react";

import useSubjects from "../../hooks/useSubjects";

import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";

import SubjectHeader from "../../components/subjects/SubjectHeader";
import SubjectFilters from "../../components/subjects/SubjectFilters";
import SubjectRow from "../../components/subjects/SubjectRow";
import AddSubjectModal from "../../components/subjects/AddSubjectModal";

function Subjects() {

  const {
    subjects,
    loading,
    reload,
    createSubject,
    deleteSubject,
  } = useSubjects();

  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const filteredSubjects = subjects.filter((subject) => {
    const matchSearch =
      subject.name.toLowerCase().includes(search.toLowerCase());

    const matchSemester =
      semester === "" || subject.semester === semester;

    return matchSearch && matchSemester;
  });

  const handleSave = async (data) => {
    try {
      await createSubject(data);
      reload();
      setOpenModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subject?")) return;

    try {
      await deleteSubject(id);
      reload();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        Loading Subjects...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <SubjectHeader
        onAdd={() => setOpenModal(true)}
      />

      <Card className="overflow-hidden p-0">

        <SubjectFilters
          search={search}
          setSearch={setSearch}
          semester={semester}
          setSemester={setSemester}
        />

        <Table
          columns={[
            "Code",
            "Subject",
            "Department",
            "Semester",
            "Credits",
            "Faculty",
            "Class",
            "Action",
          ]}
        >
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map((subject) => (
              <SubjectRow
                key={subject.id}
                subject={subject}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={8}
                className="py-10 text-center text-slate-500"
              >
                No Subjects Found
              </td>
            </tr>
          )}
        </Table>

      </Card>

      <AddSubjectModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
      />

    </div>
  );
}

export default Subjects;