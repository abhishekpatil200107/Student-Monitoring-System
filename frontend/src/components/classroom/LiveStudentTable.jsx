import LiveStudentRow from "./LiveStudentRow";

function LiveStudentTable({
  activities,
  onUpdate,
}) {
  return (
    <div className="overflow-x-auto rounded-xl border">

      <table className="min-w-full">

        <thead className="bg-slate-100">

          <tr>

            <th className="p-3 text-left">Roll</th>

            <th className="p-3 text-left">Student</th>

            <th className="p-3">Attendance</th>

            <th className="p-3">Oral</th>

            <th className="p-3">Written</th>

            <th className="p-3">Coding</th>

            <th className="p-3">Homework</th>

            <th className="p-3">Confidence</th>

            <th className="p-3">Communication</th>

            <th className="p-3">Understanding</th>

            <th className="p-3">Behaviour</th>

            <th className="p-3">Score</th>

            <th className="p-3">Action</th>

          </tr>
        </thead>

        <tbody>

          {activities.map((activity) => (

            <LiveStudentRow
              key={activity.id}
              activity={activity}
              onUpdate={onUpdate}
            />

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default LiveStudentTable;