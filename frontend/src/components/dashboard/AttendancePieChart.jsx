import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#22c55e",
  "#ef4444",
  "#f59e0b",
];

function AttendancePieChart({ data }) {

  const chartData = [
    {
      name: "Present",
      value: data.present,
    },
    {
      name: "Absent",
      value: data.absent,
    },
    {
      name: "Late",
      value: data.late,
    },
  ].filter(item => item.value > 0);

  return (
    <div className="h-96">

      <ResponsiveContainer>

        <PieChart>

          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            outerRadius={130}
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />
          <Legend />

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
}

export default AttendancePieChart;