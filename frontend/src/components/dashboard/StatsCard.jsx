import Card from "../ui/Card";

import {
  FaUsers,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaClipboardCheck,
} from "react-icons/fa";

const icons = {
  students: FaUserGraduate,
  faculty: FaChalkboardTeacher,
  attendance: FaClipboardCheck,
  users: FaUsers,
};

function StatsCard({
  title,
  value,
  icon,
  color = "bg-blue-500",
}) {
  const Icon = icons[icon];
  const trend = { students: "+8.2%", faculty: "+4.6%", attendance: "+2.4%", users: "+11.9%" }[icon];

  return (
    <Card className="metric-card group cursor-pointer">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[.12em] text-slate-400">
            {title}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-800">
            {value}
          </h2>

        </div>

        <div
          className={`${color} rounded-2xl p-4 text-white shadow-lg transition-all duration-300 group-hover:scale-110`}
        >
          <Icon size={28} />
        </div>

      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4"><span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600">{trend}</span><span className="text-xs text-slate-400">vs last month</span></div>

    </Card>
  );
}

export default StatsCard;
