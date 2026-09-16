import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  Code2,
  CheckCircle,
  FileText,
} from "lucide-react";

import Card from "../../components/ui/Card";
import api from "../../services/api";
import { getCodingProfiles } from "../../services/codingService";

function StudentReport() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [codingProfile, setCodingProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);

      const reportResponse = await api.get(
        `/classroom/student-report/${id}/`
      );

      setReport(reportResponse.data);

      const profiles = await getCodingProfiles();

      const profile = profiles.find(
        (item) => String(item.student) === String(id)
      );

      setCodingProfile(profile || null);
    } catch (error) {
      console.error("Student report error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-slate-500">
          Loading student report...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-xl bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-800">
          Student Report Not Found
        </h2>
      </div>
    );
  }

  const student = report.student;

  return (
    <div className="space-y-6">

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Student Report
        </h1>

        <p className="mt-1 text-slate-500">
          Detailed academic and coding performance
        </p>
      </div>

      {/* Student Information */}

      <Card>
        <div className="flex items-center gap-4">

          <div className="rounded-full bg-blue-100 p-4">
            <User
              size={30}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {student.name}
            </h2>

            <p className="text-slate-500">
              Roll No: {student.roll_no}
            </p>

            <p className="text-slate-500">
              {student.department} • {student.year} • Division{" "}
              {student.division}
            </p>
          </div>

        </div>
      </Card>

      {/* Statistics */}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        <Card>
          <div className="flex items-center gap-3">
            <ClipboardCheck className="text-blue-600" />

            <div>
              <p className="text-sm text-slate-500">
                Attendance
              </p>

              <h2 className="text-2xl font-bold">
                {report.attendance_percentage}%
              </h2>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <BookOpen className="text-green-600" />

            <div>
              <p className="text-sm text-slate-500">
                Total Lectures
              </p>

              <h2 className="text-2xl font-bold">
                {report.total_lectures}
              </h2>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <GraduationCap className="text-purple-600" />

            <div>
              <p className="text-sm text-slate-500">
                Average Score
              </p>

              <h2 className="text-2xl font-bold">
                {report.average_score}
              </h2>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <CheckCircle className="text-orange-600" />

            <div>
              <p className="text-sm text-slate-500">
                Homework
              </p>

              <h2 className="text-2xl font-bold">
                {report.homework_completed}
              </h2>
            </div>
          </div>
        </Card>

      </div>

      {/* Classroom Performance */}

      <Card>

        <div className="mb-5 flex items-center gap-3">
          <FileText className="text-blue-600" />

          <h2 className="text-xl font-bold">
            Classroom Performance
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Oral Answers
            </p>

            <p className="mt-1 text-2xl font-bold">
              {report.oral_answers}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Written Answers
            </p>

            <p className="mt-1 text-2xl font-bold">
              {report.written_answers}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Coding Answers
            </p>

            <p className="mt-1 text-2xl font-bold">
              {report.coding_answers}
            </p>
          </div>

        </div>

      </Card>

      {/* Coding Profiles */}

      <Card>

        <div className="mb-5 flex items-center gap-3">
          <Code2 className="text-indigo-600" />

          <div>
            <h2 className="text-xl font-bold">
              Coding Profiles
            </h2>

            <p className="text-sm text-slate-500">
              Student coding and developer platforms
            </p>
          </div>
        </div>

        {!codingProfile ? (
          <div className="rounded-lg bg-slate-50 p-8 text-center">
            <Code2
              size={36}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 font-medium text-slate-600">
              No coding profile found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              This student has not added any coding platform links.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            <CodingLink
              name="LeetCode"
              url={codingProfile.leetcode_url}
            />

            <CodingLink
              name="HackerRank"
              url={codingProfile.hackerrank_url}
            />

            <CodingLink
              name="CodeChef"
              url={codingProfile.codechef_url}
            />

            <CodingLink
              name="GeeksforGeeks"
              url={codingProfile.geeksforgeeks_url}
            />

            <CodingLink
              name="GitHub"
              url={codingProfile.github_url}
            />

            <CodingLink
              name={
                codingProfile.other_platform ||
                "Other Platform"
              }
              url={codingProfile.other_url}
            />

          </div>
        )}

      </Card>

    </div>
  );
}

function CodingLink({ name, url }) {
  if (!url) {
    return (
      <div className="rounded-lg border border-slate-200 p-4 opacity-50">
        <p className="font-semibold text-slate-700">
          {name}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Not added
        </p>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-lg border border-slate-200 p-4 transition hover:border-blue-400 hover:bg-blue-50"
    >
      <div className="flex items-center justify-between">

        <div>
          <p className="font-semibold text-slate-700">
            {name}
          </p>

          <p className="mt-1 text-sm text-blue-600">
            Open Profile →
          </p>
        </div>

        <Code2
          size={22}
          className="text-slate-400 group-hover:text-blue-600"
        />

      </div>
    </a>
  );
}

export default StudentReport;