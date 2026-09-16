import Card from "../ui/Card";

function RecentActivity() {
  const activities = [
    "Rahul submitted Daily Diary",
    "Attendance updated",
    "Faculty created new Assignment",
    "Student completed LeetCode Problem",
    "Report Generated",
  ];

  return (
    <Card>

      <div className="mb-6 flex items-center justify-between">
        <div><p className="section-eyebrow">Live feed</p><h2 className="mt-1 text-lg font-bold text-slate-800">Recent activities</h2></div>

        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View All
        </button>

      </div>

      <div className="space-y-4">

        {activities.map((activity, index) => (

          <div
            key={index}
            className="group flex items-center justify-between rounded-xl border border-slate-100 p-3.5 transition hover:border-blue-100 hover:bg-blue-50/40"
          >

            <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">{String(index + 1).padStart(2, "0")}</span><div>

              <h4 className="font-medium text-slate-700">
                {activity}
              </h4>

              <p className="text-sm text-slate-500">
                Just now
              </p>

            </div></div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600">
              New
            </span>

          </div>

        ))}

      </div>

    </Card>
  );
}

export default RecentActivity;
