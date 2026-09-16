import React, { useState } from "react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  User,
  Shield,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { loginUser } from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "student",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleRoleSelect = (roleKey) => {
    setForm((prev) => ({ ...prev, role: roleKey }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    if (!form.username.trim()) {
      validationErrors.username = "Username is required.";
    }
    if (!form.password.trim()) {
      validationErrors.password = "Password is required.";
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const data = await loginUser({
        username: form.username,
        password: form.password,
      });

      login(data);
      toast.success("Welcome back! Login successful.");

      if (data.user.role === "ADMIN") {
        navigate("/admin");
        return;
      }
      if (data.user.role === "FACULTY") {
        navigate("/faculty");
        return;
      }
      if (data.user.role === "STUDENT") {
        navigate("/student");
        return;
      }

      toast.error("Unknown user role.");
    } catch (error) {
      const responseData = error.response?.data;
      const message =
        responseData?.message ||
        responseData?.detail ||
        "Invalid credentials. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { key: "student", label: "Student", icon: GraduationCap },
    { key: "faculty", label: "Faculty", icon: Briefcase },
    { key: "admin", label: "Admin", icon: Shield },
  ];

  return (
    <div className="login-shell flex min-h-screen overflow-hidden">
      {/* =========================================
          LEFT HERO SECTION
      ========================================= */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex xl:p-16">
        {/* Background Gradients & Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 z-0" />
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-blue-500 text-white font-black text-xl shadow-xl shadow-indigo-600/40 ring-1 ring-white/20">
            SM
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Student Monitoring System
            </h2>
            <p className="text-xs font-medium text-indigo-300">
              Enterprise Academic Management
            </p>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300">
            <Sparkles size={14} className="text-indigo-400" />
            <span>Next-Generation Campus Intelligence</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white xl:text-5xl leading-tight">
            Elevating student success through data-driven clarity.
          </h1>

          <p className="text-base text-slate-300 leading-relaxed">
            Unify attendance tracking, classroom engagement, lecture histories,
            daily diaries, and student performance metrics in one seamless, high-speed ecosystem.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <span className="block text-2xl font-bold text-white">99.8%</span>
              <span className="text-xs font-medium text-indigo-200">System Uptime</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <span className="block text-2xl font-bold text-white">500+</span>
              <span className="text-xs font-medium text-indigo-200">Active Students</span>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
              <span className="block text-2xl font-bold text-white">Live</span>
              <span className="text-xs font-medium text-indigo-200">Real-time Analytics</span>
            </div>
          </div>
        </div>

        {/* Footer Feature Highlights */}
        <div className="relative z-10 flex items-center gap-6 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>Encrypted Authentication</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>Role-Based Access</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>Instant Insights</span>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT FORM SECTION
      ========================================= */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10 lg:p-16 bg-slate-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Branding */}
          <div className="flex items-center gap-3 lg:hidden mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-lg shadow-md">
              SM
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Monitor</h2>
              <p className="text-xs text-slate-500">Academic Portal</p>
            </div>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Please choose your account type and sign in to continue.
            </p>
          </div>

          {/* Interactive Role Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Portal Account Type
            </label>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-200/80 p-1.5 border border-slate-300/60">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = form.role === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleRoleSelect(opt.key)}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={15} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              name="username"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={handleChange}
              error={errors.username}
              icon={User}
              required
            />

            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your secure password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                icon={Lock}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="text-slate-400 hover:text-slate-600 transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="mt-2"
            >
              Sign In to {form.role.charAt(0).toUpperCase() + form.role.slice(1)} Portal
            </Button>

            {form.role === "student" && (
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-center">
                <p className="text-xs text-slate-600">
                  New student joining the portal?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/student/register")}
                    className="font-bold text-indigo-600 hover:text-indigo-800 underline underline-offset-2 ml-1"
                  >
                    Register here
                  </button>
                </p>
              </div>
            )}
          </form>

          {/* Security footnote */}
          <p className="text-center text-[11px] text-slate-400">
            Protected by enterprise encryption • Student Monitoring System v1.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
