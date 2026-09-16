import { useEffect, useState } from "react";
import { updateDailyDiary } from "../../services/dailyDiaryService";
import { getStudents } from "../../services/studentService";

function EditDiaryModal({
  open,
  onClose,
  diary,
  onSuccess,
}) {
  const [students, setStudents] = useState([]);

  const [form, setForm] = useState({
    student: "",
    subject: "",
    date: "",
    study_hours: "",
    homework: "",
    topics: "",
    remarks: "",
    parent_signature: false,
    status: "Pending",
  });

  // Load students when modal opens
  useEffect(() => {
    if (open) {
      loadStudents();
    }
  }, [open]);

  const loadStudents = async () => {
    try {
      const data = await getStudents();

      console.log("Students:", data);

      setStudents(data);
    } catch (err) {
      console.error("Student loading error:", err);
    }
  };

  // Load selected diary
  useEffect(() => {
    if (diary) {
      console.log("Selected diary:", diary);

      setForm({
        student: diary.student || "",
        subject: diary.subject || "",
        date: diary.date || "",
        study_hours: diary.study_hours ?? "",
        homework: diary.homework || "",
        topics: diary.topics || "",
        remarks: diary.remarks || "",
        parent_signature: diary.parent_signature || false,
        status: diary.status || "Pending",
      });
    }
  }, [diary]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!diary) {
      console.error("No diary selected");
      return;
    }

    console.log("================================");
    console.log("Updating diary ID:", diary.id);
    console.log("Form data:", form);
    console.log("================================");

    try {
      const updated = await updateDailyDiary(diary.id, {
        ...form,
        study_hours: Number(form.study_hours),
      });

      console.log("Diary updated successfully:", updated);

      if (onSuccess) {
        await onSuccess();
      }

      onClose();

    } catch (err) {
      console.error("Update diary error:", err);
      console.error("Server response:", err.response?.data);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-8 shadow-xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            Edit Daily Diary
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-slate-800"
          >
            ×
          </button>

        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div className="grid gap-5 md:grid-cols-2">

            {/* Student */}
            <div>

              <label className="mb-2 block font-medium">
                Student
              </label>

              <select
                name="student"
                value={form.student}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-3"
                required
              >

                <option value="">
                  Select Student
                </option>

                {students.map((student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {student.name}
                  </option>
                ))}

              </select>

            </div>

            {/* Subject */}
            <div>

              <label className="mb-2 block font-medium">
                Subject
              </label>

              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-3"
                required
              />

            </div>

            {/* Date */}
            <div>

              <label className="mb-2 block font-medium">
                Date
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-3"
                required
              />

            </div>

            {/* Study Hours */}
            <div>

              <label className="mb-2 block font-medium">
                Study Hours
              </label>

              <input
                type="number"
                name="study_hours"
                value={form.study_hours}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 p-3"
                min="0"
                step="0.5"
                required
              />

            </div>

          </div>

          {/* Homework */}
          <div>

            <label className="mb-2 block font-medium">
              Homework
            </label>

            <textarea
              rows={4}
              name="homework"
              value={form.homework}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
              placeholder="Enter homework details"
            />

          </div>

          {/* Topics */}
          <div>

            <label className="mb-2 block font-medium">
              Topics
            </label>

            <textarea
              rows={3}
              name="topics"
              value={form.topics}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
              placeholder="What topics did the student study?"
            />

          </div>

          {/* Remarks */}
          <div>

            <label className="mb-2 block font-medium">
              Remarks
            </label>

            <textarea
              rows={3}
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
              placeholder="Enter remarks"
            />

          </div>

          {/* Parent Signature */}
          <div className="flex items-center gap-3">

            <input
              type="checkbox"
              name="parent_signature"
              checked={form.parent_signature}
              onChange={(e) =>
                setForm({
                  ...form,
                  parent_signature: e.target.checked,
                })
              }
              className="h-5 w-5"
            />

            <label className="font-medium text-slate-700">
              Parent Signature Verified
            </label>

          </div>

          {/* Status */}
          <div>

            <label className="mb-2 block font-medium">
              Status
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 p-3"
            >

              <option value="Completed">
                Completed
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Incomplete">
                Incomplete
              </option>

            </select>

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-3 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
            >
              Update Diary
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default EditDiaryModal;