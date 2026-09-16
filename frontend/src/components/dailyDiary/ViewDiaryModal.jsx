function ViewDiaryModal({ open, onClose, diary }) {
  if (!open || !diary) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-5">

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Diary Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Daily study diary information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-400 transition hover:text-slate-700"
          >
            ×
          </button>

        </div>

        {/* Content */}
        <div className="space-y-5 p-6">

          {/* Student & Date */}
          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">
                Student
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-800">
                {diary.student_name || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">
                Date
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-800">
                {diary.date || "-"}
              </p>
            </div>

          </div>

          {/* Subject & Study Hours */}
          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">
                Subject
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-800">
                {diary.subject || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">
                Study Hours
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-800">
                {diary.study_hours} hrs
              </p>
            </div>

          </div>

          {/* Homework */}
          <div>
            <p className="mb-2 font-medium text-slate-600">
              Homework
            </p>

            <div className="rounded-lg border bg-white p-4 text-slate-700">
              {diary.homework || "No homework recorded."}
            </div>
          </div>

          {/* Topics */}
          <div>
            <p className="mb-2 font-medium text-slate-600">
              Topics Studied
            </p>

            <div className="rounded-lg border bg-white p-4 text-slate-700">
              {diary.topics || "No topics recorded."}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <p className="mb-2 font-medium text-slate-600">
              Remarks
            </p>

            <div className="rounded-lg border bg-white p-4 text-slate-700">
              {diary.remarks || "No remarks."}
            </div>
          </div>

          {/* Status & Parent Signature */}
          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-sm font-medium text-slate-500">
                Status
              </p>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  diary.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : diary.status === "Pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {diary.status}
              </span>

            </div>

            <div className="rounded-lg bg-slate-50 p-4">

              <p className="text-sm font-medium text-slate-500">
                Parent Signature
              </p>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                  diary.parent_signature
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {diary.parent_signature
                  ? "Verified"
                  : "Not Verified"}
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end border-t bg-slate-50 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  );
}

export default ViewDiaryModal;