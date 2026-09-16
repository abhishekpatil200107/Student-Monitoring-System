import { useEffect, useState } from "react";

import Card from "../../components/ui/Card";
import { getAttendanceAnalytics } from "../../services/attendanceService";
import AttendancePieChart from "../../components/dashboard/AttendancePieChart";
import DepartmentAttendanceChart from "../../components/dashboard/DepartmentAttendanceChart";
import AttendanceTrendChart from "../../components/dashboard/AttendanceTrendChart";

function AttendanceDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const result = await getAttendanceAnalytics();
      setData(result);
    } catch (err) {
      console.log(err);
    }
  };

  if (!data) {
    return (
      <div className="p-10 text-center">
        Loading Attendance...
      </div>
    );
  }
  console.log(data.departments);
  console.log("Attendance Data:", data);
  console.log("Departments:", data.departments);
  return (
    <div className="space-y-6">

      <h1 className="text-3xl font-bold">
        Attendance Analytics
      </h1>

      <div className="grid gap-6 md:grid-cols-4">

        <Card>
          <p className="text-slate-500">Total Students</p>
          <h2 className="mt-2 text-3xl font-bold">
            {data.total}
          </h2>
        </Card>

        <Card>
          <p className="text-slate-500">Present</p>
          <h2 className="mt-2 text-3xl font-bold text-green-600">
            {data.present}
          </h2>
        </Card>

        <Card>
          <p className="text-slate-500">Absent</p>
          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {data.absent}
          </h2>
        </Card>

        <Card>
          <p className="text-slate-500">Late</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-600">
            {data.late}
          </h2>
        </Card>

      </div>

      <Card>

        <h2 className="mb-4 text-xl font-bold">
          Attendance Percentage
        </h2>

        <div className="h-5 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-green-600 transition-all"
            style={{
              width: `${data.attendance_percentage}%`,
            }}
          />

        </div>

        <p className="mt-3 text-lg font-semibold">
          {data.attendance_percentage}%
        </p>

      </Card>
      <Card>

        <h2 className="mb-6 text-2xl font-bold">
          Attendance Distribution
        </h2>

        <AttendancePieChart
          data={data}
        />

      </Card>
      <Card>

        <h2 className="mb-6 text-2xl font-bold">
          Department-wise Attendance
        </h2>

        <DepartmentAttendanceChart
          data={data.departments}
        />

      </Card>
      <Card>

        <h2 className="mb-6 text-2xl font-bold">
          Attendance Trend
        </h2>

        <AttendanceTrendChart
          trend={data.trend}
        />

      </Card>

    </div>
  );
}

export default AttendanceDashboard;