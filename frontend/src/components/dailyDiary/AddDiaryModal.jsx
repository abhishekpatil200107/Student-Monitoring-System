import { useEffect, useState } from "react";
import { createDailyDiary } from "../../services/dailyDiaryService";
import { getStudents } from "../../services/studentService";

function AddDiaryModal({ open, onClose, onSuccess }) {
    const [students, setStudents] = useState([]);

    const [form, setForm] = useState({
        student: "",
        subject: "",
        date: "",
        study_hours: "",
        homework: "",
        status: "Pending",
    });

    // Load students whenever modal opens
    useEffect(() => {
        if (open) {
            loadStudents();
        }
    }, [open]);

    const loadStudents = async () => {
        try {
            const data = await getStudents();

            console.log("Students API:", data);

            setStudents(data);
        } catch (err) {
            console.error("Error loading students:", err);
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // Submit diary
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const diaryData = {
                ...form,
                study_hours: Number(form.study_hours),
            };

            console.log("Creating diary:", diaryData);

            await createDailyDiary(diaryData);

            console.log("Diary created successfully");

            // Reset form
            setForm({
                student: "",
                subject: "",
                date: "",
                study_hours: "",
                homework: "",
                status: "Pending",
            });

            // Reload diary table
            if (onSuccess) {
                await onSuccess();
            }

            // Close modal
            onClose();
        } catch (err) {
            console.error("Create diary error:", err);

            if (err.response) {
                console.error("Backend response:", err.response.data);
            }
        }
    };

    // Don't render when closed
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            {/* Modal */}
            <div className="w-full max-w-2xl rounded-xl bg-white p-8 shadow-xl">

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">

                    <h2 className="text-2xl font-bold text-slate-800">
                        Add Daily Diary
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-2xl text-slate-500 transition hover:text-slate-800"
                    >
                        ×
                    </button>

                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    {/* Student + Subject */}
                    <div className="grid gap-5 md:grid-cols-2">

                        {/* Student */}
                        <div>
                            <label className="mb-2 block font-medium text-slate-700">
                                Student
                            </label>

                            <select
                                name="student"
                                value={form.student}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                                required
                            >
                                <option value="">
                                    Select Student
                                </option>

                                {students.map((student) => (
                                    <option
                                        key={student.id}
                                        value={student.id}
                                    >
                                        {student.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="mb-2 block font-medium text-slate-700">
                                Subject
                            </label>

                            <input
                                type="text"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                                placeholder="Enter subject"
                                required
                            />
                        </div>

                        {/* Date */}
                        <div>
                            <label className="mb-2 block font-medium text-slate-700">
                                Date
                            </label>

                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                                required
                            />
                        </div>

                        {/* Study Hours */}
                        <div>
                            <label className="mb-2 block font-medium text-slate-700">
                                Study Hours
                            </label>

                            <input
                                type="number"
                                name="study_hours"
                                value={form.study_hours}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                                min="0"
                                step="0.5"
                                placeholder="e.g. 3"
                                required
                            />
                        </div>

                    </div>

                    {/* Homework */}
                    <div>
                        <label className="mb-2 block font-medium text-slate-700">
                            Homework
                        </label>

                        <textarea
                            rows={4}
                            name="homework"
                            value={form.homework}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                            placeholder="Enter homework details"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-medium text-slate-700">
                            Topics
                        </label>

                        <textarea
                            rows={3}
                            name="topics"
                            value={form.topics}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                            placeholder="What topics did the student study?"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block font-medium text-slate-700">
                            Remarks
                        </label>

                        <textarea
                            rows={3}
                            name="remarks"
                            value={form.remarks}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                            placeholder="Enter remarks"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="parent_signature"
                            checked={form.parent_signature}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    parent_signature: e.target.checked,
                                })
                            }
                            className="h-5 w-5"
                        />

                        <label className="font-medium text-slate-700">
                            Parent Signature Verified
                        </label>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="mb-2 block font-medium text-slate-700">
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-blue-500"
                        >
                            <option value="Completed">
                                Completed
                            </option>

                            <option value="Pending">
                                Pending
                            </option>

                            <option value="Incomplete">
                                Incomplete
                            </option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 border-t pt-5">

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 px-5 py-3 transition hover:bg-slate-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
                        >
                            Save Diary
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default AddDiaryModal;