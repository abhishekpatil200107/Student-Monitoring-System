import { useState } from "react";

const initialState = {
  student_name: "",
  department: "",
  date: "",
  status: "Present",
};

function MarkAttendanceModal({
  open,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(initialState);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    onSave(form);
    setForm(initialState);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

      <div className="w-full max-w-xl rounded-xl bg-white p-8">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Mark Attendance
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
          >
            ✕
          </button>

        </div>

        <div className="grid gap-5">

          <input
            name="student_name"
            placeholder="Student Name"
            value={form.student_name}
            onChange={handleChange}
            className="rounded-lg border p-3"
          />

          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            className="rounded-lg border p-3"
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="rounded-lg border p-3"
          />

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
          </select>

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-3"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-6 py-3 text-white"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
}

export default MarkAttendanceModal;