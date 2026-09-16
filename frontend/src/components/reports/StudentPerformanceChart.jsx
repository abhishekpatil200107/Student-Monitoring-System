import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function StudentPerformanceChart({ report }) {
  const data = [
    {
      name: "Oral",
      value: report.oral_answers,
    },
    {
      name: "Written",
      value: report.written_answers,
    },
    {
      name: "Coding",
      value: report.coding_answers,
    },
    {
      name: "Homework",
      value: report.homework_completed,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="name" />

        <YAxis />

        <Tooltip />

        <Bar
          dataKey="value"
          fill="#2563eb"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default StudentPerformanceChart;