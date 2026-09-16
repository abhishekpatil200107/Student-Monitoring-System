import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

import Card from "../../components/ui/Card";

import {
  getCodingProfiles,
  createCodingProfile,
  updateCodingProfile,
  deleteCodingProfile,
} from "../../services/codingService";

import api from "../../services/api";

function Coding() {
  const [profiles, setProfiles] = useState([]);
  const [students, setStudents] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingProfile, setEditingProfile] = useState(null);

  const [formData, setFormData] = useState({
    student: "",
    leetcode_url: "",
    hackerrank_url: "",
    codechef_url: "",
    geeksforgeeks_url: "",
    github_url: "",
    other_platform: "",
    other_url: "",
  });

  // =========================
  // LOAD CODING PROFILES
  // =========================

  const loadProfiles = async () => {
    try {
      setLoading(true);

      const data = await getCodingProfiles();

      console.log("Coding Profiles API:", data);

      const results = data.results || data;

      setProfiles(Array.isArray(results) ? results : []);
    } catch (error) {
      console.error("Coding profiles error:", error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coding profile?"
    );

    if (!confirmed) return;

    try {
      await deleteCodingProfile(id);

      await loadProfiles();
    } catch (error) {
      console.error("Delete coding profile error:", error);
      alert("Failed to delete coding profile.");
    }
  };


  const handleEdit = (profile) => {
    setEditingProfile(profile);

    setFormData({
      student: profile.student ? String(profile.student) : "",
      leetcode_url: profile.leetcode_url || "",
      hackerrank_url: profile.hackerrank_url || "",
      codechef_url: profile.codechef_url || "",
      geeksforgeeks_url: profile.geeksforgeeks_url || "",
      github_url: profile.github_url || "",
      other_platform: profile.other_platform || "",
      other_url: profile.other_url || "",
    });

    setShowModal(true);
  };
  // =========================
  // LOAD STUDENTS
  // =========================

  const loadStudents = async () => {
    try {
      const response = await api.get("/students/");

      console.log("Students API:", response.data);

      const data = response.data.results || response.data;

      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Students loading error:", error);
      setStudents([]);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadProfiles();
    loadStudents();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================
  // ADD CODING PROFILE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.student) {
      alert("Please select a student.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        student: Number(formData.student),

        leetcode_url: formData.leetcode_url || null,
        hackerrank_url: formData.hackerrank_url || null,
        codechef_url: formData.codechef_url || null,
        geeksforgeeks_url: formData.geeksforgeeks_url || null,
        github_url: formData.github_url || null,

        other_platform: formData.other_platform,
        other_url: formData.other_url || null,
      };

      if (editingProfile) {
        await updateCodingProfile(editingProfile.id, data);

        alert("Coding profile updated successfully.");
      } else {
        await createCodingProfile(data);

        alert("Coding profile added successfully.");
      }

      setFormData({
        student: "",
        leetcode_url: "",
        hackerrank_url: "",
        codechef_url: "",
        geeksforgeeks_url: "",
        github_url: "",
        other_platform: "",
        other_url: "",
      });

      setEditingProfile(null);
      setShowModal(false);

      await loadProfiles();

    } catch (error) {
      console.error("Coding profile save error:", error);

      console.log(
        "Backend error:",
        error.response?.data
      );

      alert(
        error.response?.data
          ? JSON.stringify(error.response.data)
          : "Failed to save coding profile."
      );

    } finally {
      setSaving(false);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredProfiles = profiles.filter((profile) => {
    const searchText = search.toLowerCase();

    return (
      profile.student_name?.toLowerCase().includes(searchText) ||
      profile.other_platform?.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // RENDER
  // =========================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Coding Reports
          </h1>

          <p className="mt-1 text-slate-500">
            Student coding platform profiles and links
          </p>
        </div>

        <div className="flex gap-3">

          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
          />

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Coding Profile
          </button>

        </div>

      </div>

      {/* TABLE */}

      <Card>

        <h2 className="mb-5 text-xl font-semibold text-slate-800">
          Student Coding Profiles
        </h2>

        {loading ? (

          <div className="py-10 text-center text-slate-500">
            Loading coding profiles...
          </div>

        ) : filteredProfiles.length === 0 ? (

          <div className="py-10 text-center">

            <p className="text-lg font-semibold text-slate-600">
              No Coding Profiles Found
            </p>

            <p className="mt-1 text-slate-400">
              Click "Add Coding Profile" to create one.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="min-w-full border-collapse">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-3 text-left">
                    Student
                  </th>

                  <th className="p-3 text-center">
                    LeetCode
                  </th>

                  <th className="p-3 text-center">
                    HackerRank
                  </th>

                  <th className="p-3 text-center">
                    CodeChef
                  </th>

                  <th className="p-3 text-center">
                    GeeksforGeeks
                  </th>

                  <th className="p-3 text-center">
                    GitHub
                  </th>

                  <th className="p-3 text-center">
                    Other
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProfiles.map((profile) => (

                  <tr
                    key={profile.id}
                    className="border-b hover:bg-slate-50"
                  >

                    <td className="p-3 font-medium text-slate-800">
                      {profile.student_name || "-"}
                    </td>

                    <td className="p-3 text-center">
                      {profile.leetcode_url ? (
                        <a
                          href={profile.leetcode_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open
                        </a>
                      ) : "-"}
                    </td>

                    <td className="p-3 text-center">
                      {profile.hackerrank_url ? (
                        <a
                          href={profile.hackerrank_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open
                        </a>
                      ) : "-"}
                    </td>

                    <td className="p-3 text-center">
                      {profile.codechef_url ? (
                        <a
                          href={profile.codechef_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open
                        </a>
                      ) : "-"}
                    </td>

                    <td className="p-3 text-center">
                      {profile.geeksforgeeks_url ? (
                        <a
                          href={profile.geeksforgeeks_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open
                        </a>
                      ) : "-"}
                    </td>

                    <td className="p-3 text-center">
                      {profile.github_url ? (
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open
                        </a>
                      ) : "-"}
                    </td>

                    <td className="p-3 text-center">
                      {profile.other_url ? (
                        <a
                          href={profile.other_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.other_platform || "Open"}
                        </a>
                      ) : "-"}
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleEdit(profile)}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() => handleDelete(profile.id)}
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </Card>

      {/* ADD CODING PROFILE MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b p-5">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingProfile ? "Edit Coding Profile" : "Add Coding Profile"}
                </h2>

                <p className="text-sm text-slate-500">
                  {editingProfile
                    ? "Update coding platform links for this student"
                    : "Add coding platform links for a student"}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProfile(null);
                }}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="max-h-[75vh] space-y-5 overflow-y-auto p-5"
            >

              {/* STUDENT */}

              <div>

                <label className="mb-1 block font-medium text-slate-700">
                  Student
                </label>

                <select
                  name="student"
                  value={formData.student}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
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
                      {student.roll_no
                        ? ` (${student.roll_no})`
                        : ""}
                    </option>

                  ))}

                </select>

              </div>

              {/* LEETCODE */}

              <div>

                <label className="mb-1 block font-medium text-slate-700">
                  LeetCode URL
                </label>

                <input
                  type="url"
                  name="leetcode_url"
                  value={formData.leetcode_url}
                  onChange={handleChange}
                  placeholder="https://leetcode.com/username"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />

              </div>

              {/* HACKERRANK */}

              <div>

                <label className="mb-1 block font-medium text-slate-700">
                  HackerRank URL
                </label>

                <input
                  type="url"
                  name="hackerrank_url"
                  value={formData.hackerrank_url}
                  onChange={handleChange}
                  placeholder="https://hackerrank.com/username"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />

              </div>

              {/* CODECHEF */}

              <div>

                <label className="mb-1 block font-medium text-slate-700">
                  CodeChef URL
                </label>

                <input
                  type="url"
                  name="codechef_url"
                  value={formData.codechef_url}
                  onChange={handleChange}
                  placeholder="https://codechef.com/users/username"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />

              </div>

              {/* GFG */}

              <div>

                <label className="mb-1 block font-medium text-slate-700">
                  GeeksforGeeks URL
                </label>

                <input
                  type="url"
                  name="geeksforgeeks_url"
                  value={formData.geeksforgeeks_url}
                  onChange={handleChange}
                  placeholder="https://geeksforgeeks.org/user/username"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />

              </div>

              {/* GITHUB */}

              <div>

                <label className="mb-1 block font-medium text-slate-700">
                  GitHub URL
                </label>

                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />

              </div>

              {/* OTHER PLATFORM */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>

                  <label className="mb-1 block font-medium text-slate-700">
                    Other Platform
                  </label>

                  <input
                    type="text"
                    name="other_platform"
                    value={formData.other_platform}
                    onChange={handleChange}
                    placeholder="Example: Codeforces"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-1 block font-medium text-slate-700">
                    Other URL
                  </label>

                  <input
                    type="url"
                    name="other_url"
                    value={formData.other_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t pt-5">

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProfile(null);
                  }}
                  className="rounded-lg border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProfile
                      ? "Update Profile"
                      : "Save Profile"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Coding;