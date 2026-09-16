import { useEffect, useState } from "react";

import Card from "../../components/ui/Card";
import { getPerformanceDashboard } from "../../services/classroomService";
import {
    FileText,
    ClipboardCheck,
    BarChart3,
    History,
} from "lucide-react";

import ReportCard from "../../components/reports/ReportCard";

function ReportsDashboard() {
    const [report, setReport] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getPerformanceDashboard();
            setReport(data);
        } catch (err) {
            console.log(err);
        }
    };

    if (!report) {
        return (
            <div className="p-10 text-center">
                Loading Reports...
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Reports Dashboard
            </h1>

            <div className="grid gap-6 md:grid-cols-3">

                <Card>
                    <p>Total Students</p>
                    <h2 className="text-3xl font-bold">
                        {report.total_students}
                    </h2>
                </Card>

                <Card>
                    <p>Highest Score</p>
                    <h2 className="text-3xl font-bold text-green-600">
                        {report.highest_score}
                    </h2>
                </Card>

                <Card>
                    <p>Average Score</p>
                    <h2 className="text-3xl font-bold text-blue-600">
                        {report.average_score}
                    </h2>
                </Card>

            </div>
            <div className="grid gap-6 lg:grid-cols-2">

                <Card>

                    <h2 className="mb-4 text-xl font-bold">
                        Top Performers
                    </h2>

                    <table className="min-w-full">

                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Score</th>
                            </tr>
                        </thead>

                        <tbody>

                            {report.top_students.map((student) => (

                                <tr key={student.roll_no}>

                                    <td>{student.roll_no}</td>
                                    <td>{student.name}</td>
                                    <td>{student.score}</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </Card>

                <Card>

                    <h2 className="mb-4 text-xl font-bold">
                        Weak Performers
                    </h2>

                    <table className="min-w-full">

                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Score</th>
                            </tr>
                        </thead>

                        <tbody>

                            {report.weak_students.map((student) => (

                                <tr key={student.roll_no}>

                                    <td>{student.roll_no}</td>
                                    <td>{student.name}</td>
                                    <td>{student.score}</td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </Card>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

                <ReportCard
                    title="Student Reports"
                    description="View student performance reports."
                    icon={FileText}
                    button="Open"
                    to="/admin/student-reports"
                />

                <ReportCard
                    title="Lecture Reports"
                    description="View lecture history and lecture PDFs."
                    icon={History}
                    button="Open"
                    to="/admin/history"
                />

                <ReportCard
                    title="Attendance Reports"
                    description="Attendance analytics and reports."
                    icon={ClipboardCheck}
                    button="Open"
                    to="/admin/attendance-dashboard"
                />

                <ReportCard
                    title="Performance Reports"
                    description="View overall student performance."
                    icon={BarChart3}
                    button="Open"
                    to="/admin/performance"
                />

            </div>

        </div>
    );
}

export default ReportsDashboard;