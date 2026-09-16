import { Play, Square, MonitorSmartphone } from "lucide-react";

function LectureHeader({
  onStart,
  onEnd,
  hasLecture,
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">

      <div className="flex items-center gap-3">
        <MonitorSmartphone
          className="text-blue-600"
          size={32}
        />

        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Live Classroom
          </h1>

          <p className="text-slate-500">
            Monitor classroom activities in real time
          </p>
        </div>
      </div>

      {hasLecture ? (
        <button
          onClick={onEnd}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700"
        >
          <Square size={18} />
          End Lecture
        </button>
      ) : (
        <button
          onClick={onStart}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
        >
          <Play size={18} />
          Start Lecture
        </button>
      )}
    </div>
  );
}

export default LectureHeader;