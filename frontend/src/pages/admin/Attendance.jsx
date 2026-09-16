import { useState } from "react";

import useAttendance from "../../hooks/useAttendance";

import Card from "../../components/ui/Card";
import Table from "../../components/ui/Table";

import AttendanceHeader from "../../components/attendance/AttendanceHeader";
import AttendanceSummary from "../../components/attendance/AttendanceSummary";
import AttendanceFilters from "../../components/attendance/AttendanceFilters";
import AttendanceRow from "../../components/attendance/AttendanceRow";
import MarkAttendanceModal from "../../components/attendance/MarkAttendanceModal";

function Attendance() {
  const {
    attendance,
    loading,
    reload,
    createAttendance,
    deleteAttendance,
  } = useAttendance();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [openModal, setOpenModal] = useState(false);

  const filteredAttendance = attendance.filter((item) => {
    const matchSearch = (item.student_name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus =
      status === "" || item.status === status;

    return matchSearch && matchStatus;
  });

  const handleSave = async (data) => {
    try {
      await createAttendance(data);
      reload();
      setOpenModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete attendance record?")) return;

    try {
      await deleteAttendance(id);
      reload();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center">
        Loading Attendance...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <AttendanceHeader
        onAdd={() => setOpenModal(true)}
      />

      <AttendanceSummary
        attendance={attendance}
      />

      <Card className="overflow-hidden p-0">

        <AttendanceFilters
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />

        <Table
          columns={[
            "Student",
            "Department",
            "Date",
            "Status",
            "Action",
          ]}
        >
          {filteredAttendance.length > 0 ? (
            filteredAttendance.map((item) => (
              <AttendanceRow
                key={item.id}
                attendance={item}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={5}
                className="py-10 text-center text-slate-500"
              >
                No Attendance Records Found
              </td>
            </tr>
          )}
        </Table>

      </Card>

      <MarkAttendanceModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSave}
      />

    </div>
  );
}

export default Attendance;