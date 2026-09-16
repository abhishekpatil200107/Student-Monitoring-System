import { useEffect, useState } from "react";
import { getDashboardStats } from "../../services/dashboardService";

function LiveStats() {
  const [stats, setStats] = useState({
    total_students: 0,
    present: 0,
    oral_answers: 0,
    written_answers: 0,
    coding_answers: 0,
    homework_completed: 0,
    average_score: 0,
    active_students: 0,
  });

  useEffect(() => {
    loadStats();

    const timer = setInterval(loadStats, 3000);

    return () => clearInterval(timer);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const cards = [
    {
      title: "Students",
      value: stats.total_students,
    },
    {
      title: "Present",
      value: stats.present,
    },
    {
      title: "Oral",
      value: stats.oral_answers,
    },
    {
      title: "Written",
      value: stats.written_answers,
    },
    {
      title: "Coding",
      value: stats.coding_answers,
    },
    {
      title: "Homework",
      value: stats.homework_completed,
    },
    {
      title: "Average Score",
      value: stats.average_score,
    },
    {
      title: "Active Students",
      value: stats.active_students,
    },
  ];

  return (
    <div className="grid gap-5 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border bg-white p-6 shadow-sm"
        >
          <h3 className="text-sm text-slate-500">
            {card.title}
          </h3>

          <h2 className="mt-2 text-3xl font-bold">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}

export default LiveStats;