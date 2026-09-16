import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { getSubjects } from "../../services/subjectService";
import { getFaculty } from "../../services/facultyService";
import { startLecture } from "../../services/classroomService";

function StartLectureModal({ open, onClose, onStarted }) {
  const [subjects, setSubjects] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [form, setForm] = useState({
    subject: "",
    faculty: "",
    department: "",
    year: "",
    division: "A",
    topic: "",
  });

  useEffect(() => {
    if (!open) return;

    loadData();
  }, [open]);

  const loadData = async () => {
    try {
      const [subjectData, facultyData] = await Promise.all([
        getSubjects(),
        getFaculty(),
      ]);

      setSubjects(subjectData);
      setFaculty(facultyData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      console.log("Sending:", form);

      const lecture = await startLecture(form);

      console.log("Response:", lecture);

      onStarted(lecture);

      onClose();
    } catch (err) {
      console.log("ERROR:", err);

      if (err.response) {
        console.log(err.response.data);
      }
    }
  };

  // ✅ Hide modal when open is false
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Start New Lecture
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="grid gap-5">

          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="">Select Subject</option>

            {subjects.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            name="faculty"
            value={form.faculty}
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="">Select Faculty</option>

            {faculty.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            className="rounded-lg border p-3"
          />

          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="">Select Year</option>
            <option value="FY">FY</option>
            <option value="SY">SY</option>
            <option value="TY">TY</option>
            <option value="LY">LY</option>
          </select>

          <select
            name="division"
            value={form.division}
            onChange={handleChange}
            className="rounded-lg border p-3"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>

          <input
            type="text"
            name="topic"
            placeholder="Lecture Topic"
            value={form.topic}
            onChange={handleChange}
            className="rounded-lg border p-3"
          />

        </div>

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border px-6 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white"
          >
            Start Lecture
          </button>

        </div>
      </div>
    </div>
  );
}

export default StartLectureModal;