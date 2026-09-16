import { useEffect, useState } from "react";

import Card from "../../components/ui/Card";
import {
  getLectures,
  getActivities,
  downloadLecturePDF,
} from "../../services/classroomService";

function LectureHistory() {
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    loadLectures();
  }, []);

  const loadLectures = async () => {
    try {
      const data = await getLectures();
      setLectures(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleView = async (lecture) => {
    setSelectedLecture(lecture);

    try {
      const data = await getActivities(lecture.id);
      setActivities(data);
    } catch (err) {
      console.log(err);
    }
  };

  const totalStudents = activities.length;

  const presentStudents = activities.filter(
    (item) => item.attendance === "Present"
  ).length;

  const averageScore =
    activities.length > 0
      ? (
        activities.reduce(
          (sum, item) => sum + item.participation_score,
          0
        ) / activities.length
      ).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Lecture History
      </h1>

      <Card className="overflow-hidden p-0">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Faculty</th>
              <th className="px-4 py-3 text-left">Topic</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {lectures.map((lecture) => (
              <tr
                key={lecture.id}
                className="border-b hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  {lecture.subject_name}
                </td>

                <td className="px-4 py-3">
                  {lecture.faculty_name}
                </td>

                <td className="px-4 py-3">
                  {lecture.topic}
                </td>

                <td className="px-4 py-3">
                  {lecture.lecture_date}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${lecture.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : lecture.status === "Running"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {lecture.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex gap-2">

                    <button
                      onClick={() => handleView(lecture)}
                      className="rounded bg-blue-600 px-3 py-1 text-white"
                    >
                      View
                    </button>

                    <button
                      onClick={() => downloadLecturePDF(lecture.id)}
                      className="rounded bg-green-600 px-3 py-1 text-white"
                    >
                      PDF
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selectedLecture && (
        <>
          {/* Lecture Details */}

          <Card>
            <h2 className="mb-6 text-2xl font-bold">
              Lecture Details
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-slate-500">
                  Subject
                </p>
                <p className="font-semibold">
                  {selectedLecture.subject_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Faculty
                </p>
                <p className="font-semibold">
                  {selectedLecture.faculty_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Department
                </p>
                <p className="font-semibold">
                  {selectedLecture.department}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Year
                </p>
                <p className="font-semibold">
                  {selectedLecture.year}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Division
                </p>
                <p className="font-semibold">
                  {selectedLecture.division}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Date
                </p>
                <p className="font-semibold">
                  {selectedLecture.lecture_date}
                </p>
              </div>

              <div className="lg:col-span-2">
                <p className="text-sm text-slate-500">
                  Topic
                </p>
                <p className="font-semibold">
                  {selectedLecture.topic}
                </p>
              </div>
            </div>
          </Card>

          {/* Summary */}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <p className="text-slate-500">
                Students
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {totalStudents}
              </h2>
            </Card>

            <Card>
              <p className="text-slate-500">
                Present
              </p>

              <h2 className="mt-2 text-3xl font-bold text-green-600">
                {presentStudents}
              </h2>
            </Card>

            <Card>
              <p className="text-slate-500">
                Average Score
              </p>

              <h2 className="mt-2 text-3xl font-bold text-blue-600">
                {averageScore}
              </h2>
            </Card>
          </div>

          {/* Student Activities */}

          <Card className="overflow-hidden p-0">
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3">Roll No</th>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">
                    Attendance
                  </th>
                  <th className="px-4 py-3">Oral</th>
                  <th className="px-4 py-3">
                    Written
                  </th>
                  <th className="px-4 py-3">
                    Coding
                  </th>
                  <th className="px-4 py-3">
                    Homework
                  </th>
                  <th className="px-4 py-3">
                    Score
                  </th>
                </tr>
              </thead>

              <tbody>
                {activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      {activity.student?.roll_no}
                    </td>

                    <td className="px-4 py-3">
                      {activity.student?.name}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${activity.attendance ===
                            "Present"
                            ? "bg-green-100 text-green-700"
                            : activity.attendance ===
                              "Absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {activity.attendance}
                      </span>
                    </td>

                    <td className="text-center">
                      {activity.oral_answer
                        ? "✅"
                        : "❌"}
                    </td>

                    <td className="text-center">
                      {activity.written_answer
                        ? "✅"
                        : "❌"}
                    </td>

                    <td className="text-center">
                      {activity.coding_answer
                        ? "✅"
                        : "❌"}
                    </td>

                    <td className="text-center">
                      {activity.homework_completed
                        ? "✅"
                        : "❌"}
                    </td>

                    <td className="text-center font-semibold">
                      {activity.participation_score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}

export default LectureHistory;