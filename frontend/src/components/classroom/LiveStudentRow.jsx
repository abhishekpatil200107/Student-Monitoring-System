import { useState } from "react";
import { updateActivity } from "../../services/classroomService";
import RatingStars from "./RatingStars";
import StudentDetailsModal from "./StudentDetailsModal";

function LiveStudentRow({
  activity,
  onUpdate,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const toggle = async (field) => {
    try {
      const updated = await updateActivity(activity.id, {
        [field]: !activity[field],
      });

      onUpdate(updated);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <tr className="border-b hover:bg-slate-50">

        {/* Roll Number */}
        <td className="p-3">
          {activity.student.roll_no}
        </td>

        {/* Student Name */}
        <td className="p-3 font-medium">
          {activity.student.name}
        </td>

        {/* Attendance */}
        <td className="text-center">
          <select
            value={activity.attendance}
            onChange={async (e) => {
              try {
                const updated = await updateActivity(activity.id, {
                  attendance: e.target.value,
                });

                onUpdate(updated);
              } catch (error) {
                console.error(error);
              }
            }}
            className="rounded border p-1"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </td>

        {/* Oral */}
        <td className="text-center">
          <input
            type="checkbox"
            checked={activity.oral_answer}
            onChange={() => toggle("oral_answer")}
          />
        </td>

        {/* Written */}
        <td className="text-center">
          <input
            type="checkbox"
            checked={activity.written_answer}
            onChange={() => toggle("written_answer")}
          />
        </td>

        {/* Coding */}
        <td className="text-center">
          <input
            type="checkbox"
            checked={activity.coding_answer}
            onChange={() => toggle("coding_answer")}
          />
        </td>

        {/* Homework */}
        <td className="text-center">
          <input
            type="checkbox"
            checked={activity.homework_completed}
            onChange={() => toggle("homework_completed")}
          />
        </td>

        {/* Confidence */}
        <td>
          <RatingStars
            value={activity.confidence}
            field="confidence"
            activity={activity}
            updateActivity={updateActivity}
            onUpdate={onUpdate}
          />
        </td>

        {/* Communication */}
        <td>
          <RatingStars
            value={activity.communication}
            field="communication"
            activity={activity}
            updateActivity={updateActivity}
            onUpdate={onUpdate}
          />
        </td>

        {/* Understanding */}
        <td>
          <RatingStars
            value={activity.understanding}
            field="understanding"
            activity={activity}
            updateActivity={updateActivity}
            onUpdate={onUpdate}
          />
        </td>

        {/* Behaviour */}
        <td>
          <RatingStars
            value={activity.behaviour}
            field="behaviour"
            activity={activity}
            updateActivity={updateActivity}
            onUpdate={onUpdate}
          />
        </td>

        {/* Participation Score */}
        <td className="text-center font-bold text-blue-700">
          {activity.participation_score}
        </td>

        {/* Details */}
        <td className="text-center">
          <button
            onClick={() => setShowDetails(true)}
            className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          >
            Details
          </button>
        </td>

      </tr>

      <StudentDetailsModal
        open={showDetails}
        activity={activity}
        onClose={() => setShowDetails(false)}
        onSave={(updatedActivity) => {
          onUpdate(updatedActivity);
          setShowDetails(false);
        }}
      />
    </>
  );
}

export default LiveStudentRow;