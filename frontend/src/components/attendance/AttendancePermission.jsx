import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Card from "../ui/Card";

import { getFaculty } from "../../services/facultyService";
import { getSubjects } from "../../services/subjectService";
import {
    getAttendancePermissions,
    createAttendancePermission,
} from "../../services/attendancePermissionService";

function AttendancePermission() {
    const [faculty, setFaculty] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const [selectedFaculty, setSelectedFaculty] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [date, setDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);


            const [
                facultyData,
                subjectData,
                permissionData,
            ] = await Promise.all([
                getFaculty(),
                getSubjects(),
                getAttendancePermissions(),
            ]);

            setFaculty(facultyData);
            setSubjects(subjectData);
            setPermissions(permissionData);

        } catch (error) {
            console.error(
                "PERMISSION DATA ERROR:",
                error.response?.data || error
            );

            toast.error("Failed to load permission data.");

        } finally {
            setLoading(false);
        }


    };

    useEffect(() => {
        loadData();
    }, []);

    // -------------------------------------------------
    // Subjects belonging to selected faculty
    // -------------------------------------------------

    const facultySubjects = subjects.filter(
        (subject) =>
            String(subject.faculty) === String(selectedFaculty)
    );

    // -------------------------------------------------
    // Grant permission
    // -------------------------------------------------

    const handleGrantPermission = async () => {
        if (
            !selectedFaculty ||
            !selectedSubject ||
            !date
        ) {
            toast.error(
                "Please select faculty, subject and date."
            );


            return;
        }

        try {
            setSaving(true);

            await createAttendancePermission({
                faculty: Number(selectedFaculty),
                subject: Number(selectedSubject),
                date: date,
            });

            toast.success(
                "Attendance permission granted successfully."
            );

            setSelectedSubject("");
            setDate("");

            await loadData();

        } catch (error) {
            console.error(
                "GRANT PERMISSION ERROR:",
                error.response?.data || error
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to grant permission."
            );

        } finally {
            setSaving(false);
        }


    };

    if (loading) {
        return (<div className="py-10 text-center text-slate-500">
            Loading attendance permissions... </div>
        );
    }

    return (<div className="space-y-6">


        {/* Header */}

        <div>
            <h1 className="text-2xl font-bold text-slate-800">
                Attendance Permissions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
                Allow faculty to mark attendance for missed dates.
            </p>
        </div>

        {/* Grant Permission */}

        <Card>

            <h2 className="text-lg font-semibold text-slate-800">
                Grant Attendance Permission
            </h2>

            <p className="mt-1 text-sm text-slate-500">
                Select a faculty member, their subject and the
                missed attendance date.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-3">

                {/* Faculty */}

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Faculty
                    </label>

                    <select
                        value={selectedFaculty}
                        onChange={(event) => {
                            setSelectedFaculty(event.target.value);
                            setSelectedSubject("");
                        }}
                        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                    >
                        <option value="">
                            Select Faculty
                        </option>

                        {faculty.map((item) => (
                            <option
                                key={item.id}
                                value={item.id}
                            >
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Subject */}

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Subject
                    </label>

                    <select
                        value={selectedSubject}
                        onChange={(event) =>
                            setSelectedSubject(
                                event.target.value
                            )
                        }
                        disabled={!selectedFaculty}
                        className="w-full rounded-lg border border-slate-300 p-3 outline-none disabled:bg-slate-100 focus:border-blue-500"
                    >
                        <option value="">
                            Select Subject
                        </option>

                        {facultySubjects.map((subject) => (
                            <option
                                key={subject.id}
                                value={subject.id}
                            >
                                {subject.code} - {subject.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date */}

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Missed Date
                    </label>

                    <input
                        type="date"
                        value={date}
                        onChange={(event) =>
                            setDate(event.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                    />
                </div>

            </div>

            <div className="mt-6 flex justify-end">

                <button
                    onClick={handleGrantPermission}
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving
                        ? "Granting..."
                        : "Grant Permission"}
                </button>

            </div>

        </Card>

        {/* Existing Permissions */}

        <Card className="overflow-hidden p-0">

            <div className="border-b border-slate-200 px-6 py-5">

                <h2 className="text-lg font-semibold text-slate-800">
                    Granted Permissions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Attendance permissions already granted by Admin.
                </p>

            </div>

            {permissions.length === 0 ? (

                <div className="p-10 text-center text-slate-500">
                    No attendance permissions granted yet.
                </div>

            ) : (

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead className="bg-slate-50">

                            <tr>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                                    Faculty
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                                    Subject
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                                    Date
                                </th>

                                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                                    Granted By
                                </th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-200">

                            {permissions.map((permission) => (

                                <tr
                                    key={permission.id}
                                    className="hover:bg-slate-50"
                                >

                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {permission.faculty_name}
                                    </td>

                                    <td className="px-6 py-4">

                                        <p className="font-medium text-slate-800">
                                            {permission.subject_name}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {permission.subject_code}
                                        </p>

                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {permission.date}
                                    </td>

                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {permission.granted_by_name}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </Card>

    </div>


    );
}

export default AttendancePermission;
