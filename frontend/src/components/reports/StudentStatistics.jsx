import Card from "../ui/Card";

function StudentStatistics({ report }) {
  const stats = [
    {
      title: "Attendance",
      value: `${report.attendance_percentage}%`,
      color: "text-green-600",
    },
    {
      title: "Average Score",
      value: report.average_score,
      color: "text-blue-600",
    },
    {
      title: "Lectures",
      value: report.total_lectures,
      color: "text-purple-600",
    },
    {
      title: "Homework",
      value: report.homework_completed,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-4">
      {stats.map((item) => (
        <Card key={item.title}>
          <p className="text-sm text-slate-500">
            {item.title}
          </p>

          <h2 className={`mt-2 text-3xl font-bold ${item.color}`}>
            {item.value}
          </h2>
        </Card>
      ))}
    </div>
  );
}

export default StudentStatistics;