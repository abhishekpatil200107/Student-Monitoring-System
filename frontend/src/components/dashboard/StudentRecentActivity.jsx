import Card from "../ui/Card";

function StudentRecentActivity({ student }) {
  const activities = [
    {
      title: "Profile created",
      description: "Your student profile is active.",
    },
    {
      title: "Student account approved",
      description: "Your account has been approved by faculty.",
    },
    {
      title: "Class assigned",
      description: student?.class_relation
        ? "You are assigned to your current class."
        : "Your class is not assigned yet.",
    },
  ];

  return (
    <Card>

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Recent Activities
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your latest academic activities
          </p>
        </div>

      </div>

      <div className="space-y-4">

        {activities.map((activity, index) => (

          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
          >

            <div>

              <h4 className="font-medium text-slate-700">
                {activity.title}
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                {activity.description}
              </p>

            </div>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Info
            </span>

          </div>

        ))}

      </div>

    </Card>
  );
}

export default StudentRecentActivity;

