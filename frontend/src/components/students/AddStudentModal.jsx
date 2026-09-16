import { useState } from "react";

import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Lock,
  UserCircle,
} from "lucide-react";

const initialState = {
  username: "",
  password: "",

  roll_no: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  year: "",
  division: "A",
};

function AddStudentModal({ open, onClose, onSave }) {

  const [form, setForm] = useState(initialState);

  if (!open) return null;

  const handleChange = (e) => {

    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  };

  const handleSubmit = () => {

    if (
      !form.username ||
      !form.password ||
      !form.roll_no ||
      !form.name ||
      !form.email ||
      !form.department ||
      !form.year
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (form.password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (onSave) {
      onSave(form);
    }

  };

  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm">

      <div className="my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b p-6">

          <div>

            <h2 className="text-2xl font-bold text-slate-800">
              Add New Student
            </h2>

            <p className="text-sm text-slate-500">
              Create student profile and login account.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <X size={22} />
          </button>

        </div>


        {/* Login Information */}

        <div className="border-b bg-slate-50 p-6">

          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">

            <Lock
              size={20}
              className="text-blue-600"
            />

            Login Information

          </h3>

          <div className="grid gap-5 md:grid-cols-2">

            {/* Username */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Username *
              </label>

              <div className="relative">

                <UserCircle
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="abhishek"
                  className="w-full rounded-lg border py-3 pl-10 pr-3 outline-none focus:border-blue-500"
                />

              </div>

            </div>


            {/* Password */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Password *
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border py-3 pl-10 pr-3 outline-none focus:border-blue-500"
                />

              </div>

            </div>

          </div>

        </div>


        {/* Student Information */}

        <div className="p-6">

          <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800">

            <GraduationCap
              size={20}
              className="text-blue-600"
            />

            Student Information

          </h3>


          <div className="grid gap-5 md:grid-cols-2">


            {/* Roll Number */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Roll Number *
              </label>

              <div className="relative">

                <GraduationCap
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="text"
                  name="roll_no"
                  value={form.roll_no}
                  onChange={handleChange}
                  placeholder="MCA001"
                  className="w-full rounded-lg border py-3 pl-10 pr-3 outline-none focus:border-blue-500"
                />

              </div>

            </div>


            {/* Full Name */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Full Name *
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Abhishek Patil"
                  className="w-full rounded-lg border py-3 pl-10 pr-3 outline-none focus:border-blue-500"
                />

              </div>

            </div>


            {/* Email */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Email *
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@gmail.com"
                  className="w-full rounded-lg border py-3 pl-10 pr-3 outline-none focus:border-blue-500"
                />

              </div>

            </div>


            {/* Phone */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Phone
              </label>

              <div className="relative">

                <Phone
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full rounded-lg border py-3 pl-10 pr-3 outline-none focus:border-blue-500"
                />

              </div>

            </div>


            {/* Department */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Department *
              </label>

              <div className="relative">

                <Building2
                  size={18}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full rounded-lg border py-3 pl-10 pr-3 outline-none focus:border-blue-500"
                >

                  <option value="">
                    Select Department
                  </option>

                  <option value="Computer Engineering">
                    Computer Engineering
                  </option>

                  <option value="Information Technology">
                    Information Technology
                  </option>

                  <option value="AI & DS">
                    AI & DS
                  </option>

                  <option value="Mechanical">
                    Mechanical
                  </option>

                  <option value="Civil">
                    Civil
                  </option>

                </select>

              </div>

            </div>


            {/* Year */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Year *
              </label>

              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              >

                <option value="">
                  Select Year
                </option>

                <option value="FY">
                  First Year
                </option>

                <option value="SY">
                  Second Year
                </option>

                <option value="TY">
                  Third Year
                </option>

                <option value="LY">
                  Last Year
                </option>

              </select>

            </div>


            {/* Division */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Division
              </label>

              <select
                name="division"
                value={form.division}
                onChange={handleChange}
                className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
              >

                <option value="A">
                  Division A
                </option>

                <option value="B">
                  Division B
                </option>

                <option value="C">
                  Division C
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* Footer */}

        <div className="flex justify-end gap-3 border-t p-6">

          <button
            onClick={onClose}
            className="rounded-lg border px-6 py-3 font-medium hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Create Student
          </button>

        </div>

      </div>

    </div>

  );
}

export default AddStudentModal;