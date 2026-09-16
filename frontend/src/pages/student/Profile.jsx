import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  CalendarDays,
  Hash,
} from "lucide-react";

import Card from "../../components/ui/Card";
import { useEffect, useState } from "react";
import { getMyProfile } from "../../services/studentService";

function Profile() {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();

      console.log("MY STUDENT PROFILE:", data);

      setStudent(data);
    } catch (error) {
      console.error("PROFILE ERROR:", error);

      setError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to load student profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

          <p className="mt-4 text-slate-500">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="space-y-8">

        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            My Profile
          </h1>

          <p className="mt-2 text-slate-500">
            View and manage your personal and academic information.
          </p>
        </div>

        <Card>
          <div className="rounded-xl bg-red-50 p-6 text-center">

            <p className="font-semibold text-red-700">
              {error}
            </p>

            <button
              onClick={loadProfile}
              className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>

          </div>
        </Card>

      </div>
    );
  }

  // No student
  if (!student) {
    return (
      <Card>
        <div className="p-6 text-center text-slate-500">
          Student profile not found.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}

      <div>
        <h1 className="text-4xl font-bold text-slate-800">
          My Profile
        </h1>

        <p className="mt-2 text-slate-500">
          View your personal and academic information.
        </p>
      </div>


      {/* Profile Header */}

      <Card>

        <div className="flex flex-col gap-6 md:flex-row md:items-center">

          <img
            src={
              student.profile
                ? `http://127.0.0.1:8000${student.profile}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    student.name
                  )}&background=2563eb&color=fff&size=128`
            }
            alt={student.name}
            className="h-28 w-28 rounded-full object-cover"
          />

          <div>

            <h2 className="text-2xl font-bold text-slate-800">
              {student.name}
            </h2>

            <p className="mt-1 text-slate-500">
              {student.department}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">

              <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
                {student.year}
              </span>

              <span className="rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
                Division {student.division}
              </span>

              <span
                className={`rounded-full px-4 py-1 text-sm font-semibold ${
                  student.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {student.status}
              </span>

            </div>

          </div>

        </div>

      </Card>


      {/* Personal Information */}

      <Card>

        <div className="mb-6">

          <h2 className="text-xl font-bold text-slate-800">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your basic personal details
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <ProfileItem
            icon={User}
            label="Full Name"
            value={student.name}
          />

          <ProfileItem
            icon={Hash}
            label="Roll Number"
            value={student.roll_no}
          />

          <ProfileItem
            icon={Mail}
            label="Email"
            value={student.email}
          />

          <ProfileItem
            icon={Phone}
            label="Phone"
            value={student.phone}
          />

        </div>

      </Card>


      {/* Academic Information */}

      <Card>

        <div className="mb-6">

          <h2 className="text-xl font-bold text-slate-800">
            Academic Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current academic details
          </p>

        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <ProfileItem
            icon={GraduationCap}
            label="Department"
            value={student.department}
          />

          <ProfileItem
            icon={CalendarDays}
            label="Academic Year"
            value="2026 - 2027"
          />

          <ProfileItem
            icon={GraduationCap}
            label="Program"
            value="Master of Computer Applications"
          />

          <ProfileItem
            icon={Hash}
            label="Current Year"
            value={student.year}
          />

          <ProfileItem
            icon={User}
            label="Division"
            value={`Division ${student.division}`}
          />

          <ProfileItem
            icon={Hash}
            label="Attendance"
            value={`${student.attendance}%`}
          />

        </div>

      </Card>

    </div>
  );
}


function ProfileItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-4">

      <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
        <Icon size={20} />
      </div>

      <div>

        <p className="text-sm text-slate-500">
          {label}
        </p>

        <p className="mt-1 font-semibold text-slate-800">
          {value || "Not available"}
        </p>

      </div>

    </div>
  );
}


export default Profile;