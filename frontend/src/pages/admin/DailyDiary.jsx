import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import AddDiaryModal from "../../components/dailyDiary/AddDiaryModal";
import EditDiaryModal from "../../components/dailyDiary/EditDiaryModal";
import ViewDiaryModal from "../../components/dailyDiary/ViewDiaryModal";

import {
  getDailyDiaries,
  deleteDailyDiary,
} from "../../services/dailyDiaryService";

function DailyDiary() {
  const [diaries, setDiaries] = useState([]);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [selectedDiary, setSelectedDiary] = useState(null);

  // Load diaries when page opens
  useEffect(() => {
    loadDiaries(currentPage);
  }, [currentPage]);

  const loadDiaries = async (page = currentPage) => {
    try {
      const data = await getDailyDiaries(page);

      console.log("================================");
      console.log("API Response:", data);
      console.log("Results:", data.results);
      console.log("Total Records:", data.count);
      console.log("Next:", data.next);
      console.log("Previous:", data.previous);
      console.log("================================");

      setDiaries(data.results || []);
      setTotalRecords(data.count || 0);
      setNextPage(data.next);
      setPreviousPage(data.previous);

    } catch (err) {
      console.error("Diary Error:", err);
    }
  };

  // Delete diary
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this diary?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteDailyDiary(id);

      await loadDiaries(currentPage);

      console.log("Diary deleted successfully");
    } catch (err) {
      console.error("Delete diary error:", err);
    }
  };

  // Open edit modal
  const handleEdit = (diary) => {
    setSelectedDiary(diary);
    setEditOpen(true);
  };

  // Search diaries
  const filteredDiaries = diaries.filter((item) => {
    const searchText = search.toLowerCase();

    return (
      item.student_name?.toLowerCase().includes(searchText) ||
      item.subject?.toLowerCase().includes(searchText) ||
      item.status?.toLowerCase().includes(searchText) ||
      item.date?.includes(searchText)
    );
  });

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <h1 className="text-3xl font-bold">
          Daily Study Diary
        </h1>

        <div className="flex flex-col gap-3 sm:flex-row">

          {/* Search */}
          <input
            type="text"
            placeholder="Search diary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 sm:w-72"
          />

          {/* Add Diary */}
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            + Add Diary
          </button>

        </div>

      </div>

      {/* Diary Table */}
      <Card>

        <h2 className="mb-5 text-xl font-semibold">
          Daily Diary Records
        </h2>

        <div className="overflow-x-auto">

          <table className="min-w-full border-collapse">

            <thead className="bg-slate-100">

              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Study Hours</th>
                <th className="p-3 text-left">Homework</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredDiaries.length === 0 ? (

                <tr>

                  <td
                    colSpan={7}
                    className="py-10 text-center"
                  >

                    {search ? (
                      <>
                        <p className="text-lg font-semibold text-slate-600">
                          No matching diary found
                        </p>

                        <p className="text-slate-400">
                          Try another search.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-slate-600">
                          No Diary Records Found
                        </p>

                        <p className="text-slate-400">
                          Click "Add Diary" to create your first study diary.
                        </p>
                      </>
                    )}

                  </td>

                </tr>

              ) : (

                filteredDiaries.map((item) => (

                  <tr
                    key={item.id}
                    className="border-b transition hover:bg-slate-50"
                  >

                    {/* Date */}
                    <td className="p-3">
                      {item.date}
                    </td>

                    {/* Student */}
                    <td className="p-3 font-medium">
                      {item.student_name}
                    </td>

                    {/* Subject */}
                    <td className="p-3">
                      {item.subject}
                    </td>

                    {/* Study Hours */}
                    <td className="p-3">
                      {item.study_hours} hrs
                    </td>

                    {/* Homework */}
                    <td className="max-w-xs p-3">
                      {item.homework || "-"}
                    </td>

                    {/* Status */}
                    <td className="p-3">

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${item.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {item.status}
                      </span>

                    </td>

                    {/* Actions */}
                    <td className="space-x-2 p-3 text-center">

                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-700"
                      >
                        ✏ Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition hover:bg-red-700"
                      >
                        🗑 Delete
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDiary(item);
                          setViewOpen(true);
                        }}
                        className="rounded-lg bg-slate-600 px-3 py-2 text-sm text-white transition hover:bg-slate-700"
                      >
                        👁 View
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

        {/* Pagination */}
        <div className="mt-5 flex items-center justify-between border-t pt-5">

          <div className="text-sm text-slate-600">
            Total Records: <span className="font-semibold">{totalRecords}</span>
          </div>

          <div className="flex items-center gap-3">

            <button
              type="button"
              disabled={!previousPage}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="rounded-lg border px-4 py-2 font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Previous
            </button>

            <span className="rounded-lg bg-slate-100 px-4 py-2 font-medium">
              Page {currentPage}
            </span>

            <button
              type="button"
              disabled={!nextPage}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="rounded-lg border px-4 py-2 font-medium transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next →
            </button>

          </div>

        </div>

      </Card>

      {/* Add Diary Modal */}
      <AddDiaryModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={() => loadDiaries(currentPage)}
      />
      {/* Edit Diary Modal */}
      <EditDiaryModal
        open={editOpen}
        diary={selectedDiary}
        onClose={() => {
          setEditOpen(false);
          setSelectedDiary(null);
        }}
        onSuccess={() => loadDiaries(currentPage)}
      />
      
      <ViewDiaryModal
        open={viewOpen}
        diary={selectedDiary}
        onClose={() => {
          setViewOpen(false);
          setSelectedDiary(null);
        }}
      />

    </div>
  );
}

export default DailyDiary;