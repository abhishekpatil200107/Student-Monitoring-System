function RecentStudents() {
  const students = [
    "Rahul Sharma",
    "Priya Patil",
    "Amit Kumar",
    "Sneha Joshi",
    "Rohit Singh",
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow">

      <h2 className="mb-5 text-xl font-bold">
        Recent Students
      </h2>

      {students.map((student) => (
        <div
          key={student}
          className="border-b py-3"
        >
          {student}
        </div>
      ))}
    </div>
  );
}

export default RecentStudents;