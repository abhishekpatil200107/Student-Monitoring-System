import { useState } from "react";

import useFaculty from "../../hooks/useFaculty";

import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";

import FacultyHeader from "../../components/faculty/FacultyHeader";
import FacultyFilters from "../../components/faculty/FacultyFilters";
import FacultyRow from "../../components/faculty/FacultyRow";
import AddFacultyModal from "../../components/faculty/AddFacultyModal";

function Faculty() {
  const {
    faculty,
    loading,
    reload,
    createFaculty,
    updateFaculty,
    deleteFaculty,
  } = useFaculty();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);

  const filteredFaculty = faculty.filter((item) => {
    const matchSearch =
      item.name
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchDepartment =
      department === "" ||
      item.department === department;

    return matchSearch && matchDepartment;
  });

  const handleAdd = () => {
    setEditingFaculty(null);
    setOpenModal(true);
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setOpenModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (editingFaculty) {
        await updateFaculty(
          editingFaculty.id,
          data
        );
      } else {
        await createFaculty(data);
      }

      await reload();

      setOpenModal(false);
      setEditingFaculty(null);

    } catch (err) {
      console.error(
        "FACULTY SAVE ERROR:",
        err.response?.data || err
      );

      throw err;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this faculty member?")) {
      return;
    }

    try {
      await deleteFaculty(id);
      await reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        Loading Faculty...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <FacultyHeader
        onAdd={() => {
          setEditingFaculty(null);
          setOpenModal(true);
        }}
      />

      <Card className="overflow-hidden p-0">

        <FacultyFilters
          search={search}
          setSearch={setSearch}
          department={department}
          setDepartment={setDepartment}
        />

        <Table
          columns={[
            "Employee ID",
            "Faculty",
            "Department",
            "Designation",
            "Phone",
            "Status",
            "Action",
          ]}
        >

          {filteredFaculty.length > 0 ? (

            filteredFaculty.map((item) => (

              <FacultyRow
                key={item.id}
                faculty={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />

            ))

          ) : (

            <tr>
              <td
                colSpan={7}
                className="py-10 text-center text-slate-500"
              >
                No Faculty Found
              </td>
            </tr>

          )}

        </Table>

      </Card>

      <AddFacultyModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingFaculty(null);
        }}
        onSave={handleSave}
        editingFaculty={editingFaculty}
      />

    </div>
  );
}

export default Faculty;