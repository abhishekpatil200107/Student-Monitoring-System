import { useEffect, useState } from "react";
import {
    Eye,
    EyeOff,
    UserPlus,
    ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { registerStudent } from "../../services/authService";
import api from "../../services/api";

function StudentRegister() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    const [departments, setDepartments] = useState([]);
    const [classes, setClasses] = useState([]);

    const [form, setForm] = useState({
        username: "",
        password: "",
        email: "",
        phone: "",
        roll_no: "",
        department_id: "",
        class_id: "",
        division: "A",
    });

    const [errors, setErrors] = useState({});

    // ==========================================
    // Load Departments and Classes
    // ==========================================

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);

                const [departmentResponse, classResponse] =
                    await Promise.all([
                        api.get("/departments/"),
                        api.get("/classes/"),
                    ]);

                const departmentData =
                    departmentResponse.data;

                const classData =
                    classResponse.data;

                const departmentList =
                    Array.isArray(departmentData)
                        ? departmentData
                        : departmentData.results || [];

                const classList =
                    Array.isArray(classData)
                        ? classData
                        : classData.results || [];

                console.log(
                    "DEPARTMENTS:",
                    departmentList
                );

                console.log(
                    "CLASSES:",
                    classList
                );

                setDepartments(departmentList);
                setClasses(classList);

            } catch (error) {
                console.error(
                    "REGISTRATION DATA ERROR:",
                    error.response?.data || error
                );

                toast.error(
                    "Unable to load departments and classes."
                );
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);

    // ==========================================
    // Handle Input Change
    // ==========================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        // Clear error for current field
        if (errors[name]) {
            setErrors((previous) => ({
                ...previous,
                [name]: "",
            }));
        }

        // When department changes,
        // reset selected class.
        if (name === "department_id") {
            setForm((previous) => ({
                ...previous,
                department_id: value,
                class_id: "",
            }));

            setErrors((previous) => ({
                ...previous,
                department_id: "",
                class_id: "",
            }));
        }
    };

    // ==========================================
    // Filter Classes by Department
    // ==========================================

    const filteredClasses = classes.filter(
        (studentClass) =>
            String(studentClass.department) ===
            String(form.department_id)
    );

    // ==========================================
    // Form Validation
    // ==========================================

    const validateForm = () => {
        const validationErrors = {};

        if (!form.username.trim()) {
            validationErrors.username =
                "Username is required.";
        }

        if (!form.password.trim()) {
            validationErrors.password =
                "Password is required.";
        } else if (form.password.length < 6) {
            validationErrors.password =
                "Password must be at least 6 characters.";
        }

        if (!form.email.trim()) {
            validationErrors.email =
                "Email is required.";
        }

        if (!form.phone.trim()) {
            validationErrors.phone =
                "Phone number is required.";
        }

        if (!form.roll_no.trim()) {
            validationErrors.roll_no =
                "Roll number is required.";
        }

        if (!form.department_id) {
            validationErrors.department_id =
                "Please select a department.";
        }

        if (!form.class_id) {
            validationErrors.class_id =
                "Please select a class.";
        }

        if (!form.division) {
            validationErrors.division =
                "Please select a division.";
        }

        setErrors(validationErrors);

        return Object.keys(validationErrors).length === 0;
    };

    // ==========================================
    // Submit Registration
    // ==========================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            console.log(
                "Sending Student Registration Data:",
                form
            );

            const registrationData = {
                ...form,
                name: form.username,
            };

            console.log(
                "Sending Student Registration Data:",
                registrationData
            );

            const data = await registerStudent(registrationData);
            
            console.log(
                "STUDENT REGISTRATION SUCCESS:",
                data
            );

            toast.success(
                data?.message ||
                "Registration successful. Waiting for faculty approval."
            );

            navigate("/login");

        } catch (error) {
            console.error(
                "STUDENT REGISTRATION ERROR:",
                error.response?.data || error
            );

            const data = error.response?.data;

            if (data && typeof data === "object") {
                const firstError = Object.values(data)
                    .flat()
                    .find(
                        (message) =>
                            typeof message === "string"
                    );

                toast.error(
                    firstError ||
                    data.message ||
                    "Registration failed."
                );
            } else {
                toast.error(
                    "Registration failed. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // Page
    // ==========================================

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10">

            <div className="mx-auto max-w-2xl">

                {/* Header */}
                <div className="mb-8 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                        <UserPlus size={28} />
                    </div>

                    <h1 className="mt-4 text-3xl font-bold text-slate-800">
                        Student Registration
                    </h1>

                    <p className="mt-2 text-sm text-slate-500">
                        Create your student account
                    </p>

                </div>

                {/* Registration Card */}
                <div className="rounded-2xl bg-white p-6 shadow-xl md:p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Account Information */}
                        <section>

                            <h2 className="mb-5 text-lg font-semibold text-slate-800">
                                Account Information
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <InputField
                                    label="Username"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="Choose username"
                                    error={errors.username}
                                />

                                {/* Password */}
                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Password
                                    </label>

                                    <div className="relative">

                                        <input
                                            name="password"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            value={form.password}
                                            onChange={handleChange}
                                            placeholder="Create password"
                                            autoComplete="new-password"
                                            className={`w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:border-blue-500 ${errors.password
                                                    ? "border-red-400"
                                                    : "border-slate-300"
                                                }`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (previous) => !previous
                                                )
                                            }
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                        >
                                            {showPassword ? (
                                                <EyeOff size={19} />
                                            ) : (
                                                <Eye size={19} />
                                            )}
                                        </button>

                                    </div>

                                    {errors.password && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.password}
                                        </p>
                                    )}

                                </div>

                            </div>

                        </section>

                        {/* Contact Information */}
                        <section>

                            <h2 className="mb-5 text-lg font-semibold text-slate-800">
                                Contact Information
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <InputField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    error={errors.email}
                                />

                                <InputField
                                    label="Phone Number"
                                    name="phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    error={errors.phone}
                                />

                            </div>

                        </section>

                        {/* Academic Information */}
                        <section>

                            <h2 className="mb-5 text-lg font-semibold text-slate-800">
                                Academic Information
                            </h2>

                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <InputField
                                    label="Roll Number"
                                    name="roll_no"
                                    value={form.roll_no}
                                    onChange={handleChange}
                                    placeholder="Example: CSE003"
                                    error={errors.roll_no}
                                />

                                {/* Department */}
                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Department
                                    </label>

                                    <select
                                        name="department_id"
                                        value={form.department_id}
                                        onChange={handleChange}
                                        disabled={loadingData}
                                        className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 ${errors.department_id
                                                ? "border-red-400"
                                                : "border-slate-300"
                                            }`}
                                    >

                                        <option value="">
                                            {loadingData
                                                ? "Loading departments..."
                                                : "Select Department"}
                                        </option>

                                        {departments.map(
                                            (department) => (
                                                <option
                                                    key={department.id}
                                                    value={department.id}
                                                >
                                                    {department.code} -{" "}
                                                    {department.name}
                                                </option>
                                            )
                                        )}

                                    </select>

                                    {errors.department_id && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.department_id}
                                        </p>
                                    )}

                                </div>

                                {/* Class */}
                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Class
                                    </label>

                                    <select
                                        name="class_id"
                                        value={form.class_id}
                                        onChange={handleChange}
                                        disabled={
                                            loadingData ||
                                            !form.department_id
                                        }
                                        className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 ${errors.class_id
                                                ? "border-red-400"
                                                : "border-slate-300"
                                            }`}
                                    >

                                        <option value="">
                                            {!form.department_id
                                                ? "Select department first"
                                                : loadingData
                                                    ? "Loading classes..."
                                                    : filteredClasses.length ===
                                                        0
                                                        ? "No classes available"
                                                        : "Select Class"}
                                        </option>

                                        {filteredClasses.map(
                                            (studentClass) => (
                                                <option
                                                    key={studentClass.id}
                                                    value={studentClass.id}
                                                >
                                                    {studentClass.name}
                                                </option>
                                            )
                                        )}

                                    </select>

                                    {errors.class_id && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.class_id}
                                        </p>
                                    )}

                                </div>

                                {/* Division */}
                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                                        Division
                                    </label>

                                    <select
                                        name="division"
                                        value={form.division}
                                        onChange={handleChange}
                                        className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 ${errors.division
                                                ? "border-red-400"
                                                : "border-slate-300"
                                            }`}
                                    >

                                        <option value="A">
                                            Division A
                                        </option>

                                        <option value="B">
                                            Division B
                                        </option>

                                        <option value="C">
                                            Division C
                                        </option>

                                    </select>

                                    {errors.division && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors.division}
                                        </p>
                                    )}

                                </div>

                            </div>

                        </section>

                        {/* Approval Notice */}
                        <div className="rounded-xl bg-yellow-50 p-4">

                            <p className="text-sm font-semibold text-yellow-800">
                                Faculty approval required
                            </p>

                            <p className="mt-1 text-sm leading-6 text-yellow-700">
                                After registration, your account will
                                remain pending until a faculty member
                                approves your registration.
                            </p>

                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row">

                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                <ArrowLeft size={18} />
                                Back to Login
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    loading || loadingData
                                }
                                className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Creating Account..."
                                    : "Create Student Account"}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

// ==========================================
// Reusable Input
// ==========================================

function InputField({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder,
    error,
}) {
    return (
        <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
                {label}
            </label>

            <input
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 ${error
                        ? "border-red-400"
                        : "border-slate-300"
                    }`}
            />

            {error && (
                <p className="mt-1 text-xs text-red-500">
                    {error}
                </p>
            )}

        </div>
    );
}

export default StudentRegister
