import { useEffect, useState } from "react";

import Card from "../../components/ui/Card";
import { getPerformanceDashboard } from "../../services/performanceService";
import PerformanceChart from "../../components/dashboard/PerformanceChart";

function PerformanceDashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const result = await getPerformanceDashboard();
            setData(result);
        } catch (err) {
            console.log(err);
        }
    };

    if (!data) {
        return (
            <div className="p-10 text-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="space-y-6">

            <h1 className="text-3xl font-bold">
                Student Performance Dashboard
            </h1>

            {/* Summary Cards */}

            <div className="grid gap-6 md:grid-cols-4">

                <Card>
                    <p className="text-slate-500">
                        Total Students
                    </p>

                    <h2 className="mt-2 text-3xl font-bold">
                        {data.total_students}
                    </h2>
                </Card>

                <Card>
                    <p className="text-slate-500">
                        Average Score
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-blue-600">
                        {data.average_score}
                    </h2>
                </Card>

                <Card>
                    <p className="text-slate-500">
                        Highest Score
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-green-600">
                        {data.highest_score}
                    </h2>
                </Card>

                <Card>
                    <p className="text-slate-500">
                        Lowest Score
                    </p>

                    <h2 className="mt-2 text-3xl font-bold text-red-600">
                        {data.lowest_score}
                    </h2>
                </Card>

            </div>

            {/* Leaderboards */}

            <div className="grid gap-6 lg:grid-cols-2">

                <Card>
                    <h2 className="mb-4 text-xl font-bold text-green-700">
                        🏆 Top Performers
                    </h2>

                    <div className="space-y-3">
                        {data.top_students.map((student, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-lg bg-green-50 p-3"
                            >
                                <div>
                                    <h3 className="font-semibold">
                                        {student.name}
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        {student.roll_no}
                                    </p>
                                </div>

                                <div className="text-xl font-bold text-green-700">
                                    {student.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h2 className="mb-4 text-xl font-bold text-red-700">
                        ⚠ Needs Improvement
                    </h2>

                    <div className="space-y-3">
                        {data.weak_students.map((student, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-lg bg-red-50 p-3"
                            >
                                <div>
                                    <h3 className="font-semibold">
                                        {student.name}
                                    </h3>

                                    <p className="text-sm text-slate-500">
                                        {student.roll_no}
                                    </p>
                                </div>

                                <div className="text-xl font-bold text-red-700">
                                    {student.score}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>

                    <h2 className="mb-6 text-2xl font-bold">
                        Student Performance Chart
                    </h2>

                    <PerformanceChart
                        data={data.top_students}
                    />

                </Card>

            </div>

        </div>
    );
}

export default PerformanceDashboard;