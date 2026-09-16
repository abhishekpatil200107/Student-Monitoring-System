import { X } from "lucide-react";

function StudentDetailsModal({
  open,
  onClose,
  activity,
  onSave,
}) {
  if (!open || !activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="w-full max-w-3xl rounded-xl bg-white p-8">

        {/* Header */}

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h2 className="text-2xl font-bold">
              {activity.student.name}
            </h2>

            <p className="text-slate-500">
              {activity.student.roll_no}
            </p>

          </div>

          <button onClick={onClose}>
            <X />
          </button>

        </div>

        {/* Student Info */}

        <div className="grid grid-cols-2 gap-5">

          <div>

            <label className="font-semibold">
              Department
            </label>

            <p>{activity.student.department}</p>

          </div>

          <div>

            <label className="font-semibold">
              Year
            </label>

            <p>{activity.student.year}</p>

          </div>

        </div>

        {/* Today's Status */}

        <div className="mt-8">

          <h3 className="mb-4 text-xl font-bold">
            Today's Performance
          </h3>

          <div className="grid grid-cols-2 gap-4">

            <div>
              Oral Answer :
              {activity.oral_answer ? " ✅" : " ❌"}
            </div>

            <div>
              Written :
              {activity.written_answer ? " ✅" : " ❌"}
            </div>

            <div>
              Coding :
              {activity.coding_answer ? " ✅" : " ❌"}
            </div>

            <div>
              Homework :
              {activity.homework_completed ? " ✅" : " ❌"}
            </div>

          </div>

        </div>

        {/* Remarks */}

        <div className="mt-8">

          <label className="mb-2 block font-semibold">
            Faculty Remarks
          </label>

          <textarea
            rows="5"
            defaultValue={activity.remarks}
            className="w-full rounded-lg border p-3"
          />

        </div>

        {/* Footer */}

        <div className="mt-8 flex justify-end gap-3">

          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2"
          >
            Close
          </button>

          <button
            onClick={onSave}
            className="rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
}

export default StudentDetailsModal;