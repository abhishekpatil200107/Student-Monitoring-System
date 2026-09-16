import { useEffect, useState } from "react";
import api from "../../services/api";

const initialState = {
  employee_id: "",
  name: "",
  email: "",
  phone: "",
  department_id: "",
  designation: "",
  qualification: "",
  experience: 0,
  joining_date: "",
  status: "Active",

  username: "",
  password: "",

  assigned_classes: [],
};

function AddFacultyModal({
  open,
  onClose,
  onSave,
  editingFaculty,
}) {
  const [form, setForm] = useState(initialState);

  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  // -----------------------------------------
  // Load departments/classes
  // -----------------------------------------

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setLoadingData(true);

        const [
          departmentResponse,
          classResponse,
        ] = await Promise.all([
          api.get("/departments/"),
          api.get("/classes/"),
        ]);

        setDepartments(
          departmentResponse.data.results ||
            departmentResponse.data
        );

        setClasses(
          classResponse.data.results ||
            classResponse.data
        );
      } catch (error) {
        console.error(
          "Failed to load departments/classes:",
          error
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [open]);

  // -----------------------------------------
  // Load faculty data when editing
  // -----------------------------------------

  useEffect(() => {
    if (!open) return;

    if (!editingFaculty) {
      setForm(initialState);
      return;
    }

    console.log(
      "EDITING FACULTY:",
      editingFaculty
    );

    setForm({
      employee_id:
        editingFaculty.employee_id || "",

      name:
        editingFaculty.name || "",

      email:
        editingFaculty.email || "",

      phone:
        editingFaculty.phone || "",

      /*
       * IMPORTANT:
       *
       * department_id comes from
       * department_relation.
       *
       * If backend returns department_relation,
       * use that.
       *
       * Otherwise use department_id if available.
       */
      department_id:
        editingFaculty.department_id ||
        editingFaculty.department_relation ||
        "",

      designation:
        editingFaculty.designation || "",

      qualification:
        editingFaculty.qualification || "",

      experience:
        editingFaculty.experience ?? 0,

      joining_date:
        editingFaculty.joining_date || "",

      status:
        editingFaculty.status || "Active",

      /*
       * Username/password are NOT edited.
       */
      username: "",
      password: "",

      assigned_classes:
        Array.isArray(
          editingFaculty.assigned_classes
        )
          ? editingFaculty.assigned_classes.map(
              (id) => Number(id)
            )
          : [],
    });
  }, [open, editingFaculty]);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  // -----------------------------------------
  // Normal input
  // -----------------------------------------

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "experience"
          ? Number(value)
          : value,
    }));
  };

  // -----------------------------------------
  // Department
  // -----------------------------------------

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;

    setForm((previous) => ({
      ...previous,
      department_id: departmentId,
      assigned_classes: [],
    }));
  };

  // -----------------------------------------
  // Classes
  // -----------------------------------------

  const handleClassChange = (e) => {
    const classId = Number(
      e.target.value
    );

    setForm((previous) => {
      const alreadySelected =
        previous.assigned_classes.includes(
          classId
        );

      const updatedClasses =
        alreadySelected
          ? previous.assigned_classes.filter(
              (id) => id !== classId
            )
          : [
              ...previous.assigned_classes,
              classId,
            ];

      return {
        ...previous,
        assigned_classes:
          updatedClasses,
      };
    });
  };

  // -----------------------------------------
  // Save
  // -----------------------------------------

  const handleSubmit = async () => {
    /*
     * Basic frontend validation
     */

    if (!form.employee_id.trim()) {
      alert("Employee ID is required.");
      return;
    }

    if (!form.name.trim()) {
      alert("Faculty name is required.");
      return;
    }

    if (!form.email.trim()) {
      alert("Email is required.");
      return;
    }

    if (!form.department_id) {
      alert("Please select a department.");
      return;
    }

    if (!form.designation) {
      alert("Please select a designation.");
      return;
    }

    /*
     * Username/password are required
     * ONLY when creating faculty.
     */

    if (!editingFaculty) {
      if (!form.username.trim()) {
        alert("Username is required.");
        return;
      }

      if (!form.password.trim()) {
        alert("Password is required.");
        return;
      }
    }

    /*
     * Prepare data
     */

    const data = {
      employee_id: form.employee_id,
      name: form.name,
      email: form.email,
      phone: form.phone,

      department_id:
        Number(form.department_id),

      designation: form.designation,

      qualification:
        form.qualification,

      experience:
        Number(form.experience),

      joining_date:
        form.joining_date || null,

      status: form.status,

      assigned_classes:
        form.assigned_classes,
    };

    /*
     * Only send login details when creating.
     */

    if (!editingFaculty) {
      data.username =
        form.username;

      data.password =
        form.password;
    }

    console.log(
      "FACULTY DATA BEING SENT:",
      data
    );

    try {
      setSaving(true);

      await onSave(data);

      setForm(initialState);
    } catch (error) {
      console.error(
        "SAVE FACULTY ERROR:",
        error.response?.data ||
          error
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // Filter classes
  // -----------------------------------------

  const filteredClasses =
    classes.filter(
      (item) =>
        String(item.department) ===
        String(form.department_id)
    );

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="faculty-modal fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6">

      <div className="faculty-modal-panel max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-8 shadow-xl">

        {/* Header */}

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold">
            {editingFaculty
              ? "Edit Faculty"
              : "Add Faculty"}
          </h2>

          <button
            onClick={onClose}
            className="text-2xl"
            disabled={saving}
          >
            ✕
          </button>

        </div>

        {loadingData ? (

          <div className="py-10 text-center">
            Loading departments and classes...
          </div>

        ) : (

          <div className="space-y-8">

            {/* Faculty Information */}

            <div>

              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                Faculty Information
              </h3>

              <div className="grid gap-5 md:grid-cols-2">

                <input
                  name="employee_id"
                  placeholder="Employee ID"
                  value={form.employee_id}
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                />

                <input
                  name="name"
                  placeholder="Faculty Name"
                  value={form.name}
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                />

                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                />

                <input
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                />

                {/* Department */}

                <select
                  name="department_id"
                  value={form.department_id}
                  onChange={
                    handleDepartmentChange
                  }
                  className="rounded-lg border p-3"
                >

                  <option value="">
                    Select Department
                  </option>

                  {departments.map(
                    (department) => (

                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>

                    )
                  )}

                </select>

                {/* Designation */}

                <select
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                >

                  <option value="">
                    Designation
                  </option>

                  <option value="Professor">
                    Professor
                  </option>

                  <option value="Associate Professor">
                    Associate Professor
                  </option>

                  <option value="Assistant Professor">
                    Assistant Professor
                  </option>

                  <option value="Lecturer">
                    Lecturer
                  </option>

                </select>

                <input
                  name="qualification"
                  placeholder="Qualification"
                  value={form.qualification}
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                />

                <input
                  type="number"
                  name="experience"
                  placeholder="Experience"
                  value={form.experience}
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                />

                <input
                  type="date"
                  name="joining_date"
                  value={form.joining_date}
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                />

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="rounded-lg border p-3"
                >

                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>

                </select>

              </div>

            </div>

            {/* Login */}

            {!editingFaculty && (

              <div>

                <h3 className="mb-4 text-lg font-semibold text-slate-800">
                  Faculty Login
                </h3>

                <div className="grid gap-5 md:grid-cols-2">

                  <input
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="rounded-lg border p-3"
                  />

                  <input
                    name="password"
                    type="password"
                    placeholder="Temporary Password"
                    value={form.password}
                    onChange={handleChange}
                    className="rounded-lg border p-3"
                  />

                </div>

              </div>

            )}

            {/* Assigned Classes */}

            <div>

              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                Assigned Classes
              </h3>

              {!form.department_id ? (

                <p className="text-sm text-slate-500">
                  Select a department first.
                </p>

              ) : filteredClasses.length === 0 ? (

                <p className="text-sm text-slate-500">
                  No classes found for this department.
                </p>

              ) : (

                <div className="grid gap-3 md:grid-cols-2">

                  {filteredClasses.map(
                    (item) => (

                      <label
                        key={item.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-slate-50"
                      >

                        <input
                          type="checkbox"
                          value={item.id}
                          checked={form.assigned_classes.includes(
                            item.id
                          )}
                          onChange={
                            handleClassChange
                          }
                          className="h-4 w-4"
                        />

                        <div>

                          <p className="font-medium">
                            {item.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {item.year}
                            {item.division
                              ? ` • Division ${item.division}`
                              : ""}
                          </p>

                        </div>

                      </label>

                    )
                  )}

                </div>

              )}

            </div>

          </div>

        )}

        {/* Buttons */}

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border px-5 py-3 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              loadingData || saving
            }
            className="rounded-lg bg-blue-600 px-6 py-3 text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingFaculty
              ? "Update Faculty"
              : "Save Faculty"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default AddFacultyModal;
