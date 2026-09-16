import { useEffect, useState } from "react";

import Card from "../../components/ui/Card";
import LectureHeader from "../../components/classroom/LectureHeader";
import LiveStats from "../../components/classroom/LiveStats";
import StartLectureModal from "../../components/classroom/StartLectureModal";
import LiveStudentTable from "../../components/classroom/LiveStudentTable";
import { endLecture } from "../../services/classroomService";

import {
    getActivities,
    getActiveLecture,
} from "../../services/classroomService";

function LiveClassroom() {
    const [open, setOpen] = useState(false);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [activities, setActivities] = useState([]);
    const handleEndLecture = async () => {
        if (!currentLecture) return;

        console.log("ENDING LECTURE:", currentLecture);

        try {
            await endLecture(currentLecture.id);

            setCurrentLecture(null);
            setActivities([]);
        } catch (err) {
            console.log(err);
        }
    };

    const loadActivities = async (lectureId) => {
        try {
            const data = await getActivities(lectureId);

            console.log("ACTIVITIES RESPONSE:", data);

            setActivities(
                Array.isArray(data) ? data : []
            );
        } catch (err) {
            console.error("Activities error:", err);
            setActivities([]);
        }
    };

    useEffect(() => {
        const loadCurrentLecture = async () => {
            try {
                const lecture = await getActiveLecture();

                console.log("ACTIVE LECTURE RESPONSE:", lecture);

                if (!lecture || !lecture.id) {
                    console.log("No active lecture returned");
                    setCurrentLecture(null);
                    setActivities([]);
                    return;
                }

                setCurrentLecture(lecture);

                await loadActivities(lecture.id);

            } catch (err) {
                console.error("Load active lecture error:", err);

                setCurrentLecture(null);
                setActivities([]);
            }
        };

        loadCurrentLecture();
    }, []);

    return (
        <div className="space-y-6">
            <LectureHeader
                hasLecture={currentLecture !== null}
                onStart={() => setOpen(true)}
                onEnd={handleEndLecture}
            />
            <LiveStats />

            <Card>
                {activities.length === 0 ? (
                    <div className="flex h-80 items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">
                                No Active Lecture
                            </h2>

                            <p className="mt-2 text-slate-500">
                                Click Start Lecture to begin.
                            </p>
                        </div>
                    </div>
                ) : (
                    <LiveStudentTable
                        activities={activities}
                        onUpdate={(updatedActivity) => {
                            setActivities((previous) =>
                                previous.map((activity) =>
                                    activity.id === updatedActivity.id
                                        ? updatedActivity
                                        : activity
                                )
                            );
                        }}
                    />
                )}
            </Card>

            <StartLectureModal
                open={open}
                onClose={() => setOpen(false)}
                onStarted={async () => {
                    try {
                        const activeLecture = await getActiveLecture();

                        setCurrentLecture(activeLecture);

                        await loadActivities(activeLecture.id);

                        setOpen(false);
                    } catch (err) {
                        console.log(err);
                    }
                }}
            />

        </div>
    );
}

export default LiveClassroom;