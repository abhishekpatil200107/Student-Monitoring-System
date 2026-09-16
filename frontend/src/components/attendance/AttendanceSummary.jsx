import Card from "../ui/Card";

function AttendanceSummary({ attendance }) {

  const total = attendance.length;

  const present = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absent = attendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const late = attendance.filter(
    (item) => item.status === "Late"
  ).length;

  return (
    <div className="grid gap-5 md:grid-cols-4">

      <Card>
        <h3 className="text-slate-500">Total</h3>
        <p className="mt-2 text-3xl font-bold">
          {total}
        </p>
      </Card>

      <Card>
        <h3 className="text-slate-500">Present</h3>
        <p className="mt-2 text-3xl font-bold text-green-600">
          {present}
        </p>
      </Card>

      <Card>
        <h3 className="text-slate-500">Absent</h3>
        <p className="mt-2 text-3xl font-bold text-red-600">
          {absent}
        </p>
      </Card>

      <Card>
        <h3 className="text-slate-500">Late</h3>
        <p className="mt-2 text-3xl font-bold text-yellow-600">
          {late}
        </p>
      </Card>

    </div>
  );
}

export default AttendanceSummary;