import StatsCard from "../../components/dashboard/StatsCard";
import RecentActivity from "../../components/dashboard/RecentActivity";
import Button from "../../components/ui/Button";
import { ArrowUpRight, CalendarDays, Download, Sparkles } from "lucide-react";

function Dashboard() {
  return (
    <div className="space-y-7">
      {/* Hero */}
      <section className="dashboard-hero relative overflow-hidden rounded-3xl p-7 text-white shadow-xl shadow-blue-900/10 lg:p-9">
        <div className="relative z-10 flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.14em] text-blue-100">
              <Sparkles size={14} /> Academic command center
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Good morning, Admin
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 lg:text-base">
              Stay on top of your institution's performance, attendance and
              student engagement from one clear view.
            </p>
          </div>

          {/* Aligned action row — both buttons share the same height via .hero-btn */}
          <div className="toolbar-row">
            <button type="button" className="hero-btn hero-btn-glass">
              <CalendarDays size={17} /> This month
            </button>
            <button type="button" className="hero-btn hero-btn-solid">
              <Download size={17} /> Export report
            </button>
          </div>
        </div>
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
      </section>

      {/* Section header */}
      <div className="section-header-row">
        <div>
          <p className="section-eyebrow">Overview</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-800">
            Institution at a glance
          </h2>
        </div>
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
          View analytics <ArrowUpRight size={16} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Students" value="520" icon="students" color="bg-blue-500" />
        <StatsCard title="Faculty" value="32" icon="faculty" color="bg-green-500" />
        <StatsCard title="Attendance" value="94%" icon="attendance" color="bg-orange-500" />
        <StatsCard title="Users" value="552" icon="users" color="bg-purple-500" />
      </div>

      {/* Activity + Engagement */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <RecentActivity />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-eyebrow">Engagement</p>
              <h2 className="mt-1 text-lg font-bold text-slate-800">Weekly activity</h2>
            </div>
            <span className="badge-premium badge-emerald">
              <span className="badge-dot" /> +12.8%
            </span>
          </div>

          <div className="mt-8 flex h-36 items-end gap-2">
            {[42, 58, 48, 76, 63, 88, 72].map((height, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-lg ${
                    index === 5
                      ? "bg-gradient-to-t from-blue-600 to-indigo-400"
                      : "bg-blue-100"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] font-medium text-slate-400">
                  {["M", "T", "W", "T", "F", "S", "S"][index]}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs text-slate-500">Total engagement</span>
            <span className="text-sm font-bold text-slate-800">8,492 actions</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
