import { useEffect, useState } from "react";
import { getFaculty } from "../../services/facultyService";
import { getClasses } from "../../services/classService";

const initialState = {
code: "",
name: "",
department: "",
semester: "",
credits: "",
faculty: "",
class_relation: "",
};

function AddSubjectModal({ open, onClose, onSave }) {
const [form, setForm] = useState(initialState);

const [faculty, setFaculty] = useState([]);
const [classes, setClasses] = useState([]);

useEffect(() => {
if (open) {
loadFaculty();
loadClasses();
}
}, [open]);

const loadFaculty = async () => {
try {
const data = await getFaculty();
setFaculty(data);
} catch (error) {
console.error("Faculty loading error:", error);
}
};

const loadClasses = async () => {
try {
const data = await getClasses();
setClasses(data);
} catch (error) {
console.error("Classes loading error:", error);
}
};

const handleChange = (e) => {
setForm({
...form,
[e.target.name]: e.target.value,
});
};

const handleSubmit = () => {
if (
!form.code ||
!form.name ||
!form.department ||
!form.semester ||
!form.credits ||
!form.faculty ||
!form.class_relation
) {
alert("Please fill all fields.");
return;
}


onSave({
  ...form,
  credits: Number(form.credits),
  faculty: Number(form.faculty),
  class_relation: Number(form.class_relation),
});

setForm(initialState);


};

if (!open) return null;

return ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">


  <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-xl">

    <div className="mb-6 flex items-center justify-between">

      <h2 className="text-2xl font-bold">
        Add Subject
      </h2>

      <button
        onClick={onClose}
        className="text-2xl"
      >
        ✕
      </button>

    </div>

    <div className="grid gap-5 md:grid-cols-2">

      {/* Subject Code */}

      <input
        name="code"
        placeholder="Subject Code"
        value={form.code}
        onChange={handleChange}
        className="rounded-lg border p-3"
      />

      {/* Subject Name */}

      <input
        name="name"
        placeholder="Subject Name"
        value={form.name}
        onChange={handleChange}
        className="rounded-lg border p-3"
      />

      {/* Department */}

      <input
        name="department"
        placeholder="Department"
        value={form.department}
        onChange={handleChange}
        className="rounded-lg border p-3"
      />

      {/* Semester */}

      <select
        name="semester"
        value={form.semester}
        onChange={handleChange}
        className="rounded-lg border p-3"
      >
        <option value="">Semester</option>

        <option value="1">Semester 1</option>
        <option value="2">Semester 2</option>
        <option value="3">Semester 3</option>
        <option value="4">Semester 4</option>
        <option value="5">Semester 5</option>
        <option value="6">Semester 6</option>
        <option value="7">Semester 7</option>
        <option value="8">Semester 8</option>
      </select>

      {/* Credits */}

      <input
        type="number"
        name="credits"
        placeholder="Credits"
        value={form.credits}
        onChange={handleChange}
        className="rounded-lg border p-3"
      />

      {/* Faculty */}

      <select
        name="faculty"
        value={form.faculty}
        onChange={handleChange}
        className="rounded-lg border p-3"
      >
        <option value="">
          Select Faculty
        </option>

        {faculty.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.name}
          </option>
        ))}

      </select>

      {/* Class */}

      <select
        name="class_relation"
        value={form.class_relation}
        onChange={handleChange}
        className="rounded-lg border p-3"
      >
        <option value="">
          Select Class
        </option>

        {classes.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.name}
          </option>
        ))}

      </select>

    </div>

    {/* Buttons */}

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
        Save Subject
      </button>

    </div>

  </div>

</div>


);
}

export default AddSubjectModal;
