import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import toast from "react-hot-toast";

import Card from "../../components/ui/Card";

import {
  getFacultyAttendanceStudents,
  markFacultyAttendance,
  getMyAttendancePermissions,
} from "../../services/facultyService";

import { getMySubjects } from "../../services/subjectService";

import {
  createCRAttendanceAccess,
  resendCRAttendanceAccess,
  createFacultyQRAttendance,
  getQRAttendanceSession,
  completeQRAttendance,
} from "../../services/attendanceService";

// =====================================================
// Date Helpers
// =====================================================

const getLocalDate = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (dateObject) => {
  const year = dateObject.getFullYear();

  const month = String(
    dateObject.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    dateObject.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDate = (dateString) => {
  if (!dateString) return null;

  const [
    year,
    month,
    day,
  ] = dateString.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
};

// =====================================================
// Get Browser Location
// Used for CR Attendance Access
// =====================================================

const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "Geolocation is not supported by this browser."
        )
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message =
          "Unable to get your location.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access.";
        }

        if (error.code === 2) {
          message =
            "Your location is currently unavailable.";
        }

        if (error.code === 3) {
          message =
            "Location request timed out.";
        }

        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};

// =====================================================
// Attendance Page
// =====================================================

function Attendance() {
  // ===================================================
  // Subjects
  // ===================================================

  const [subjects, setSubjects] =
    useState([]);

  const [selectedSubject, setSelectedSubject] =
    useState("");

  // ===================================================
  // Students
  // ===================================================

  const [students, setStudents] =
    useState([]);

  const [attendance, setAttendance] =
    useState({});

  // ===================================================
  // Permissions
  // ===================================================

  const [permissions, setPermissions] =
    useState([]);

  const [markedDates, setMarkedDates] =
    useState({});

  // ===================================================
  // Date
  // ===================================================

  const [date, setDate] =
    useState(getLocalDate());

  // ===================================================
  // Loading
  // ===================================================

  const [loadingSubjects, setLoadingSubjects] =
    useState(true);

  const [loadingStudents, setLoadingStudents] =
    useState(false);

  const [loadingPermissions, setLoadingPermissions] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // ===================================================
  // CR Attendance
  // ===================================================

  const [crModalOpen, setCrModalOpen] =
    useState(false);

  const [crGenerating, setCrGenerating] =
    useState(false);

  const [crAccess, setCrAccess] =
    useState(null);

  const [crCopied, setCrCopied] =
    useState(false);

  const [crResending, setCrResending] =
    useState(false);

  const [crStudent, setCrStudent] =
    useState("");

  // ===================================================
  // Faculty QR Attendance
  // ===================================================

  const [qrModalOpen, setQrModalOpen] =
    useState(false);

  const [qrGenerating, setQrGenerating] =
    useState(false);

  const [qrLoading, setQrLoading] =
    useState(false);

  const [qrSession, setQrSession] =
    useState(null);

  const qrPollRef =
    useRef(null);

  // ===================================================
  // Calendar
  // ===================================================

  const [calendarOpen, setCalendarOpen] =
    useState(false);

  const [calendarMonth, setCalendarMonth] =
    useState(() => {
      const today = new Date();

      return new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
    });

  const calendarRef =
    useRef(null);

  // ===================================================
  // Permission Helpers
  // ===================================================

  const getPermissionSubjectId = (
    permission
  ) => {
    if (
      permission?.subject &&
      typeof permission.subject === "object"
    ) {
      return permission.subject.id;
    }

    return (
      permission?.subject ||
      permission?.subject_id
    );
  };

  const getPermissionDate = (
    permission
  ) => {
    if (!permission?.date) {
      return "";
    }

    return String(
      permission.date
    ).slice(0, 10);
  };

  const getPermissionKey = (
    subjectId,
    permissionDate
  ) => {
    return `${subjectId}_${permissionDate}`;
  };

  // ===================================================
  // Today
  // ===================================================

  const getTodayDate = () => {
    return parseDate(
      getLocalDate()
    );
  };

  // ===================================================
  // Normal 3-Day Window
  // ===================================================

  const isWithinNormalWindow = (
    selectedDate
  ) => {
    if (!selectedDate) {
      return false;
    }

    const today =
      getTodayDate();

    const selected =
      parseDate(selectedDate);

    const oldestAllowed =
      new Date(today);

    oldestAllowed.setDate(
      oldestAllowed.getDate() - 3
    );

    return (
      selected >= oldestAllowed &&
      selected <= today
    );
  };

  // ===================================================
  // Admin Permission
  // ===================================================

  const hasPermissionForDate = (
    selectedDate
  ) => {
    if (
      !selectedSubject ||
      !selectedDate
    ) {
      return false;
    }

    const permissionKey =
      getPermissionKey(
        selectedSubject,
        selectedDate
      );

    if (
      markedDates[permissionKey]
    ) {
      return false;
    }

    return permissions.some(
      (permission) => {
        const permissionSubjectId =
          getPermissionSubjectId(
            permission
          );

        const permissionDate =
          getPermissionDate(
            permission
          );

        return (
          String(permissionSubjectId) ===
          String(selectedSubject) &&
          permissionDate ===
          selectedDate
        );
      }
    );
  };

  // ===================================================
  // Date Allowed
  // ===================================================

  const isDateAllowed = (
    selectedDate = date
  ) => {
    if (
      !selectedDate ||
      !selectedSubject
    ) {
      return false;
    }

    const today =
      getTodayDate();

    const selected =
      parseDate(selectedDate);

    if (selected > today) {
      return false;
    }

    if (
      isWithinNormalWindow(
        selectedDate
      )
    ) {
      return true;
    }

    return hasPermissionForDate(
      selectedDate
    );
  };

  // ===================================================
  // Calendar
  // ===================================================

  const allowedCalendarDates =
    useMemo(() => {
      const dates = [];

      const today =
        getTodayDate();

      for (
        let i = 0;
        i <= 3;
        i++
      ) {
        const current =
          new Date(today);

        current.setDate(
          current.getDate() - i
        );

        dates.push(
          formatDate(current)
        );
      }

      permissions.forEach(
        (permission) => {
          const subjectId =
            getPermissionSubjectId(
              permission
            );

          const permissionDate =
            getPermissionDate(
              permission
            );

          if (
            String(subjectId) ===
            String(selectedSubject) &&
            permissionDate &&
            !markedDates[
            getPermissionKey(
              subjectId,
              permissionDate
            )
            ]
          ) {
            dates.push(
              permissionDate
            );
          }
        }
      );

      return [
        ...new Set(dates),
      ];
    }, [
      permissions,
      selectedSubject,
      markedDates,
    ]);

  const isCalendarDateAllowed = (
    dateString
  ) => {
    if (
      !selectedSubject ||
      !dateString
    ) {
      return false;
    }

    return allowedCalendarDates.includes(
      dateString
    );
  };

  // ===================================================
  // Calendar Month
  // ===================================================

  const calendarYear =
    calendarMonth.getFullYear();

  const calendarMonthIndex =
    calendarMonth.getMonth();

  const firstDayOfMonth =
    new Date(
      calendarYear,
      calendarMonthIndex,
      1
    );

  const lastDayOfMonth =
    new Date(
      calendarYear,
      calendarMonthIndex + 1,
      0
    );

  const firstWeekday =
    firstDayOfMonth.getDay();

  const daysInMonth =
    lastDayOfMonth.getDate();

  const calendarDays = [];

  for (
    let i = 0;
    i < firstWeekday;
    i++
  ) {
    calendarDays.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    calendarDays.push(
      new Date(
        calendarYear,
        calendarMonthIndex,
        day
      )
    );
  }

  const monthName =
    calendarMonth.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

  // ===================================================
  // Calendar Controls
  // ===================================================

  const openCalendar = () => {
    const selectedDate =
      parseDate(date);

    if (selectedDate) {
      setCalendarMonth(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          1
        )
      );
    }

    setCalendarOpen(true);
  };

  const closeCalendar = () => {
    setCalendarOpen(false);
  };

  const handleCalendarDateSelect = (
    selectedDate
  ) => {
    const selectedDateString =
      formatDate(selectedDate);

    if (
      !isCalendarDateAllowed(
        selectedDateString
      )
    ) {
      return;
    }

    setDate(
      selectedDateString
    );

    setCalendarOpen(false);
  };

  const goToPreviousMonth = () => {
    setCalendarMonth(
      new Date(
        calendarYear,
        calendarMonthIndex - 1,
        1
      )
    );
  };

  const goToNextMonth = () => {
    setCalendarMonth(
      new Date(
        calendarYear,
        calendarMonthIndex + 1,
        1
      )
    );
  };

  // ===================================================
  // Outside Calendar Click
  // ===================================================

  useEffect(() => {
    const handleClickOutside = (
      event
    ) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(
          event.target
        )
      ) {
        setCalendarOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ===================================================
  // Unused Permissions
  // ===================================================

  const unusedPermissions =
    useMemo(() => {
      return permissions.filter(
        (permission) => {
          const subjectId =
            getPermissionSubjectId(
              permission
            );

          const permissionDate =
            getPermissionDate(
              permission
            );

          const key =
            getPermissionKey(
              subjectId,
              permissionDate
            );

          return !markedDates[key];
        }
      );
    }, [
      permissions,
      markedDates,
    ]);

  // ===================================================
  // Load Subjects
  // ===================================================

  const loadSubjects =
    async () => {
      try {
        setLoadingSubjects(true);

        const data =
          await getMySubjects();

        console.log(
          "FACULTY SUBJECTS:",
          data
        );

        const subjectData =
          Array.isArray(data)
            ? data
            : data.results || [];

        setSubjects(
          subjectData
        );

        if (
          subjectData.length > 0
        ) {
          setSelectedSubject(
            String(
              subjectData[0].id
            )
          );
        }
      } catch (error) {
        console.error(
          "FACULTY SUBJECTS ERROR:",
          error.response?.data ||
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
          "Failed to load subjects."
        );
      } finally {
        setLoadingSubjects(false);
      }
    };

  // ===================================================
  // Load Permissions
  // ===================================================

  const loadPermissions =
    async () => {
      try {
        setLoadingPermissions(
          true
        );

        const data =
          await getMyAttendancePermissions();

        console.log(
          "FACULTY ATTENDANCE PERMISSIONS:",
          data
        );

        const permissionData =
          Array.isArray(data)
            ? data
            : data.results || [];

        setPermissions(
          permissionData
        );
      } catch (error) {
        console.error(
          "PERMISSIONS ERROR:",
          error.response?.data ||
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
          "Failed to load attendance permissions."
        );
      } finally {
        setLoadingPermissions(
          false
        );
      }
    };

  // ===================================================
  // Initial Load
  // ===================================================

  useEffect(() => {
    loadSubjects();
    loadPermissions();
  }, []);

  // ===================================================
  // Load Students
  // ===================================================

  const loadStudents =
    async () => {
      if (!selectedSubject) {
        setStudents([]);
        setAttendance({});
        return;
      }

      try {
        setLoadingStudents(true);

        const data =
          await getFacultyAttendanceStudents(
            selectedSubject,
            date
          );

        console.log(
          "FACULTY ATTENDANCE STUDENTS:",
          data
        );

        const studentData =
          Array.isArray(data)
            ? data
            : data.students || [];

        setStudents(
          studentData
        );

        const initialAttendance =
          {};

        let attendanceAlreadyMarked =
          false;

        studentData.forEach(
          (student) => {
            if (
              student.status
            ) {
              attendanceAlreadyMarked =
                true;

              initialAttendance[
                student.student
              ] =
                student.status;
            } else {
              initialAttendance[
                student.student
              ] =
                "Present";
            }
          }
        );

        setAttendance(
          initialAttendance
        );

        if (
          attendanceAlreadyMarked &&
          studentData.length > 0
        ) {
          const key =
            getPermissionKey(
              selectedSubject,
              date
            );

          setMarkedDates(
            (previous) => ({
              ...previous,
              [key]: true,
            })
          );
        }
      } catch (error) {
        console.error(
          "FACULTY ATTENDANCE STUDENTS ERROR:",
          error.response?.data ||
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
          "Failed to load students."
        );

        setStudents([]);
        setAttendance({});
      } finally {
        setLoadingStudents(
          false
        );
      }
    };

  // ===================================================
  // Reload Students
  // ===================================================

  useEffect(() => {
    if (
      selectedSubject &&
      date
    ) {
      loadStudents();
    }
  }, [
    selectedSubject,
    date,
  ]);

  // ===================================================
  // Change Attendance
  // ===================================================

  const handleStatusChange = (
    studentId,
    status
  ) => {
    const key =
      getPermissionKey(
        selectedSubject,
        date
      );

    if (
      markedDates[key]
    ) {
      toast.error(
        "Attendance for this date has already been marked."
      );

      return;
    }

    if (
      !isDateAllowed()
    ) {
      toast.error(
        "Attendance is not allowed for this date."
      );

      return;
    }

    setAttendance(
      (previous) => ({
        ...previous,
        [studentId]: status,
      })
    );
  };

  // ===================================================
  // Save Manual Attendance
  // ===================================================

  const handleSaveAttendance =
    async () => {
      if (!selectedSubject) {
        toast.error(
          "Please select a subject."
        );

        return;
      }

      if (!isDateAllowed()) {
        toast.error(
          "Attendance is not allowed for this date."
        );

        return;
      }

      const permissionKey =
        getPermissionKey(
          selectedSubject,
          date
        );

      if (
        markedDates[
        permissionKey
        ]
      ) {
        toast.error(
          "Attendance for this date has already been marked."
        );

        return;
      }

      if (
        students.length === 0
      ) {
        toast.error(
          "No students available."
        );

        return;
      }

      try {
        setSaving(true);

        for (
          const student of students
        ) {
          await markFacultyAttendance({
            student:
              student.student,

            subject:
              Number(
                selectedSubject
              ),

            date,

            status:
              attendance[
              student.student
              ] || "Present",
          });
        }

        setMarkedDates(
          (previous) => ({
            ...previous,
            [permissionKey]: true,
          })
        );

        setPermissions(
          (previous) => {
            return previous.filter(
              (permission) => {
                const permissionSubjectId =
                  getPermissionSubjectId(
                    permission
                  );

                const permissionDate =
                  getPermissionDate(
                    permission
                  );

                return !(
                  String(
                    permissionSubjectId
                  ) ===
                  String(
                    selectedSubject
                  ) &&
                  permissionDate ===
                  date
                );
              }
            );
          }
        );

        toast.success(
          "Attendance marked successfully."
        );

        await loadStudents();
      } catch (error) {
        console.error(
          "SAVE ATTENDANCE ERROR:",
          error.response?.data ||
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
          "Failed to save attendance."
        );
      } finally {
        setSaving(false);
      }
    };

  // ===================================================
  // Create CR Attendance Access
  // ===================================================

  const handleCreateCRAccess =
    async () => {
      if (!selectedSubject) {
        toast.error(
          "Please select a subject."
        );

        return;
      }

      if (!date) {
        toast.error(
          "Please select an attendance date."
        );

        return;
      }

      if (!crStudent) {
        toast.error(
          "Please select the Class Representative."
        );

        return;
      }

      try {
        setCrGenerating(true);

        toast.loading(
          "Getting your location...",
          {
            id: "cr-location",
          }
        );

        const location =
          await getCurrentLocation();

        toast.dismiss(
          "cr-location"
        );

        const data =
          await createCRAttendanceAccess({
            subject:
              Number(
                selectedSubject
              ),

            date,

            cr_student:
              Number(crStudent),

            latitude:
              location.latitude,

            longitude:
              location.longitude,
          });

        console.log(
          "CR ATTENDANCE ACCESS:",
          data
        );

        setCrAccess(
          data.access
        );

        setCrModalOpen(false);

        toast.success(
          data.message ||
          "CR attendance access created successfully."
        );
      } catch (error) {
        toast.dismiss(
          "cr-location"
        );

        console.error(
          "CREATE CR ACCESS ERROR:",
          error.response?.data ||
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
          error.message ||
          "Failed to create CR attendance access."
        );
      } finally {
        setCrGenerating(false);
      }
    };

  // ===================================================
  // Copy CR Link
  // ===================================================

  const handleCopyCRLink =
    async () => {
      if (!crAccess?.token) {
        return;
      }

      const link =
        `${window.location.origin}/cr-attendance/${crAccess.token}`;

      try {
        await navigator.clipboard.writeText(
          link
        );

        setCrCopied(true);

        toast.success(
          "CR attendance link copied."
        );

        setTimeout(() => {
          setCrCopied(false);
        }, 2000);
      } catch (error) {
        console.error(
          "COPY CR LINK ERROR:",
          error
        );

        toast.error(
          "Failed to copy the CR attendance link."
        );
      }
    };

  // ===================================================
  // Resend CR Access
  // ===================================================

  const handleResendCRAccess =
    async () => {
      if (!crAccess?.id) {
        return;
      }

      try {
        setCrResending(true);

        const data =
          await resendCRAttendanceAccess(
            crAccess.id
          );

        console.log(
          "CR ACCESS RESENT:",
          data
        );

        setCrAccess(
          data.access
        );

        setCrCopied(false);

        toast.success(
          data.message ||
          "CR attendance access resent successfully."
        );
      } catch (error) {
        console.error(
          "RESEND CR ACCESS ERROR:",
          error.response?.data ||
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
          "Failed to resend CR attendance access."
        );
      } finally {
        setCrResending(false);
      }
    };

  // ===================================================
  // Create Faculty QR Session
  // IMPORTANT:
  // Faculty GPS is NOT requested here.
  // Backend should use the configured college location.
  // ===================================================

  const handleCreateFacultyQR =
    async () => {
      if (!selectedSubject) {
        toast.error(
          "Please select a subject."
        );

        return;
      }

      if (!date) {
        toast.error(
          "Please select an attendance date."
        );

        return;
      }

      if (!isDateAllowed()) {
        toast.error(
          "Attendance is not allowed for this date."
        );

        return;
      }

      try {
        setQrGenerating(true);

        const data =
          await createFacultyQRAttendance({
            subject:
              Number(
                selectedSubject
              ),

            date,
          });

        console.log(
          "FACULTY QR SESSION:",
          data
        );

        setQrSession(
          data
        );

        setQrModalOpen(true);

        toast.success(
          data.message ||
          "QR attendance session created."
        );
      } catch (error) {
        console.error(
          "CREATE FACULTY QR ERROR:",
          error.response?.data ||
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
          error.message ||
          "Failed to create QR attendance session."
        );
      } finally {
        setQrGenerating(false);
      }
    };

  // ===================================================
  // Refresh QR Session
  // ===================================================

  const refreshQRSession =
    async (
      showLoader = true
    ) => {
      if (
        !qrSession?.access?.id
      ) {
        return;
      }

      try {
        if (showLoader) {
          setQrLoading(true);
        }

        const data =
          await getQRAttendanceSession(
            qrSession.access.id
          );

        setQrSession(
          data
        );
      } catch (error) {
        console.error(
          "REFRESH QR SESSION ERROR:",
          error.response?.data ||
          error
        );

        if (
          error.response?.status ===
          410
        ) {
          toast.error(
            "This QR attendance session has expired."
          );
        }
      } finally {
        setQrLoading(false);
      }
    };

  // ===================================================
  // QR Polling
  // ===================================================

  useEffect(() => {
    if (
      !qrModalOpen ||
      !qrSession?.access?.id
    ) {
      return;
    }

    if (
      qrPollRef.current
    ) {
      clearInterval(
        qrPollRef.current
      );
    }

    qrPollRef.current =
      setInterval(() => {
        refreshQRSession(false);
      }, 5000);

    return () => {
      if (
        qrPollRef.current
      ) {
        clearInterval(
          qrPollRef.current
        );

        qrPollRef.current =
          null;
      }
    };
  }, [
    qrModalOpen,
    qrSession?.access?.id,
  ]);

  // ===================================================
  // Complete QR Session
  // ===================================================

  const handleCompleteQR =
    async () => {
      if (
        !qrSession?.access?.id
      ) {
        return;
      }

      try {
        setQrLoading(true);

        const data =
          await completeQRAttendance(
            qrSession.access.id
          );

        console.log(
          "QR SESSION COMPLETED:",
          data
        );

        await refreshQRSession(
          false
        );

        toast.success(
          data.message ||
          "Attendance session completed."
        );
      } catch (error) {
        console.error(
          "COMPLETE QR ERROR:",
          error.response?.data ||
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
          "Failed to complete QR session."
        );
      } finally {
        setQrLoading(false);
      }
    };

  // ===================================================
  // QR Data
  // ===================================================

  const qrAccess =
    qrSession?.access;

  const qrData =
    qrSession?.qr;

  const qrToken =
    qrData?.token;

  const qrExpiresAt =
    qrData?.expires_at;

  const qrStudents =
    qrSession?.students || [];

  const qrTotal =
    qrSession?.total_students ??
    qrStudents.length;

  const qrMarkedCount =
    qrStudents.filter(
      (student) =>
        Boolean(student.status)
    ).length;

  const qrCompleted =
    Boolean(
      qrAccess?.completed_at
    ) ||
    qrAccess?.is_active === false ||
    qrSession?.session_completed ===
    true;

  // ===================================================
  // QR Image
  // ===================================================

  const qrImageUrl =
    qrToken
      ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(
        qrToken
      )}`
      : "";

  // ===================================================
  // Loading Subjects
  // ===================================================

  if (loadingSubjects) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading subjects...
      </div>
    );
  }

  // ===================================================
  // Current State
  // ===================================================

  const currentDateKey =
    getPermissionKey(
      selectedSubject,
      date
    );

  const attendanceAlreadyMarked =
    markedDates[
    currentDateKey
    ] || false;

  const dateAllowed =
    isDateAllowed();

  // ===================================================
  // Render
  // ===================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Attendance
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage manual attendance and QR attendance sessions.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() =>
              setCrModalOpen(true)
            }
            className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Generate CR Access
          </button>

          <button
            type="button"
            onClick={
              handleCreateFacultyQR
            }
            disabled={
              qrGenerating ||
              !selectedSubject ||
              !dateAllowed
            }
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {qrGenerating
              ? "Generating..."
              : "Generate QR Attendance"}
          </button>

        </div>

      </div>

      {/* =================================================
          SUBJECT + DATE
      ================================================= */}

      <Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Subject */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Subject
            </label>

            <select
              value={
                selectedSubject
              }
              onChange={(event) =>
                setSelectedSubject(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {subjects.map(
                (subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name}
                    {subject.code
                      ? ` (${subject.code})`
                      : ""}
                  </option>
                )
              )}
            </select>

            {selectedSubject &&
              subjects.find(
                (subject) =>
                  String(
                    subject.id
                  ) ===
                  String(
                    selectedSubject
                  )
              ) && (
                <p className="mt-2 text-xs text-slate-500">
                  {subjects.find(
                    (subject) =>
                      String(
                        subject.id
                      ) ===
                      String(
                        selectedSubject
                      )
                  )?.class_name ||
                    subjects.find(
                      (subject) =>
                        String(
                          subject.id
                        ) ===
                        String(
                          selectedSubject
                        )
                    )?.department}
                </p>
              )}
          </div>

          {/* Date */}

          <div
            className="relative"
            ref={calendarRef}
          >
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Attendance Date
            </label>

            <button
              type="button"
              onClick={
                openCalendar
              }
              className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-left text-sm hover:border-blue-400"
            >
              <span>
                {parseDate(date)?.toLocaleDateString(
                  "en-US",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>

              <span className="text-slate-400">
                📅
              </span>
            </button>

            {calendarOpen && (
              <div className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">

                <div className="mb-4 flex items-center justify-between">

                  <button
                    type="button"
                    onClick={
                      goToPreviousMonth
                    }
                    className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                  >
                    ←
                  </button>

                  <h3 className="font-semibold text-slate-800">
                    {monthName}
                  </h3>

                  <button
                    type="button"
                    onClick={
                      goToNextMonth
                    }
                    className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                  >
                    →
                  </button>

                </div>

                <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                <div className="grid grid-cols-7 gap-1">

                  {calendarDays.map(
                    (
                      calendarDate,
                      index
                    ) => {
                      if (
                        !calendarDate
                      ) {
                        return (
                          <div
                            key={`empty-${index}`}
                            className="h-9"
                          />
                        );
                      }

                      const dateString =
                        formatDate(
                          calendarDate
                        );

                      const allowed =
                        isCalendarDateAllowed(
                          dateString
                        );

                      const selected =
                        dateString ===
                        date;

                      return (
                        <button
                          key={
                            dateString
                          }
                          type="button"
                          disabled={
                            !allowed
                          }
                          onClick={() =>
                            handleCalendarDateSelect(
                              calendarDate
                            )
                          }
                          className={`h-9 rounded-lg text-sm ${selected
                              ? "bg-blue-600 text-white"
                              : allowed
                                ? "text-slate-700 hover:bg-blue-50"
                                : "cursor-not-allowed text-slate-300"
                            }`}
                        >
                          {
                            calendarDate.getDate()
                          }
                        </button>
                      );
                    }
                  )}

                </div>

              </div>
            )}

            <p className="mt-2 text-xs text-slate-500">
              Available dates are today, the previous
              3 days, and dates specifically approved
              by Admin.
            </p>

          </div>

        </div>

        {/* Permission information */}

        {unusedPermissions.length >
          0 && (
            <div className="mt-5 rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-800">
                Admin Attendance Permissions
              </p>

              <p className="mt-1 text-sm text-blue-700">
                You have{" "}
                {
                  unusedPermissions.length
                }{" "}
                admin-approved attendance date
                {unusedPermissions.length !==
                  1
                  ? "s"
                  : ""}.
              </p>
            </div>
          )}

        {loadingPermissions && (
          <p className="mt-4 text-xs text-slate-400">
            Checking attendance permissions...
          </p>
        )}

      </Card>

      {/* =================================================
          ALREADY MARKED
      ================================================= */}

      {attendanceAlreadyMarked && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">

          <p className="text-sm font-semibold text-green-700">
            Attendance already marked.
          </p>

          <p className="mt-1 text-sm text-green-600">
            Attendance for this date has already
            been saved. You cannot mark it again.
          </p>

        </div>
      )}

      {/* =================================================
          QR SESSION CARD
      ================================================= */}

      {qrSession && (
        <Card>

          <div className="flex flex-col gap-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Faculty QR Attendance
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  QR attendance session is ready.
                  Students can scan the rotating QR code
                  from their authenticated accounts.
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${qrCompleted
                    ? "bg-slate-100 text-slate-600"
                    : "bg-green-100 text-green-700"
                  }`}
              >
                {qrCompleted
                  ? "Completed"
                  : "Active"}
              </span>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Subject
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {qrAccess?.subject_name ||
                    subjects.find(
                      (subject) =>
                        String(
                          subject.id
                        ) ===
                        String(
                          selectedSubject
                        )
                    )?.name ||
                    "—"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Students
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {qrMarkedCount} /{" "}
                  {qrTotal}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-500">
                  Session
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  20 minutes
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() =>
                  setQrModalOpen(true)
                }
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Open QR
              </button>

              {!qrCompleted && (
                <button
                  type="button"
                  onClick={
                    handleCompleteQR
                  }
                  disabled={qrLoading}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  Complete Session
                </button>
              )}

            </div>

          </div>

        </Card>
      )}

      {/* =================================================
          CR ACCESS
      ================================================= */}

      {crAccess && (
        <Card>

          <div className="flex flex-col gap-5">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  CR Attendance Access
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Share this secure link with the selected
                  Class Representative.
                </p>
              </div>

              <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Active
              </span>

            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-3">

              <div>
                <p className="text-xs text-slate-500">
                  Subject
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {crAccess.subject_name ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Attendance Date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {crAccess.date ||
                    date}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Link Valid Until
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {crAccess.expires_at
                    ? new Date(
                      crAccess.expires_at
                    ).toLocaleString()
                    : "2 days"}
                </p>
              </div>

            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">
                Secure CR Link
              </p>

              <div className="flex flex-col gap-2 sm:flex-row">

                <input
                  readOnly
                  value={
                    crAccess.token
                      ? `${window.location.origin}/cr-attendance/${crAccess.token}`
                      : ""
                  }
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 outline-none"
                />

                <button
                  type="button"
                  onClick={
                    handleCopyCRLink
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {crCopied
                    ? "Copied"
                    : "Copy Link"}
                </button>

              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-slate-500">
                The CR attendance session remains active
                for 20 minutes after opening.
              </p>

              <button
                type="button"
                onClick={
                  handleResendCRAccess
                }
                disabled={
                  crResending
                }
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {crResending
                  ? "Resending..."
                  : "Resend Access"}
              </button>

            </div>

          </div>

        </Card>
      )}

      {/* =================================================
          DATE WARNING
      ================================================= */}

      {!dateAllowed &&
        selectedSubject &&
        !attendanceAlreadyMarked && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-700">
              Attendance is not allowed for this date.
            </p>

            <p className="mt-1 text-sm text-red-600">
              Please select today, one of the previous
              3 days, or a date approved by Admin.
            </p>

          </div>
        )}

      {/* =================================================
          MANUAL ATTENDANCE TABLE
      ================================================= */}

      <Card className="overflow-hidden p-0">

        <div className="border-b border-slate-200 px-5 py-4">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Manual Attendance
              </h2>

              <p className="text-sm text-slate-500">
                Mark Present or Absent manually.
              </p>
            </div>

            {loadingStudents && (
              <span className="text-sm text-slate-400">
                Loading students...
              </span>
            )}

          </div>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Student
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Roll No
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Department
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Attendance
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {students.length ===
                0 && !loadingStudents ? (
                <tr>

                  <td
                    colSpan="4"
                    className="px-5 py-10 text-center text-sm text-slate-500"
                  >
                    No students available.
                  </td>

                </tr>
              ) : (
                students.map(
                  (student) => {
                    const currentStatus =
                      attendance[
                      student.student
                      ] ||
                      "Present";

                    return (
                      <tr
                        key={
                          student.student
                        }
                        className="hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <p className="font-semibold text-slate-800">
                            {student.name ||
                              "Student"}
                          </p>

                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.roll_no ||
                            "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.department ||
                            "—"}
                        </td>

                        <td className="px-5 py-4">

                          <div className="flex flex-wrap gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  student.student,
                                  "Present"
                                )
                              }
                              disabled={
                                attendanceAlreadyMarked ||
                                !dateAllowed
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${currentStatus ===
                                  "Present"
                                  ? "bg-green-600 text-white"
                                  : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(
                                  student.student,
                                  "Absent"
                                )
                              }
                              disabled={
                                attendanceAlreadyMarked ||
                                !dateAllowed
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${currentStatus ===
                                  "Absent"
                                  ? "bg-red-600 text-white"
                                  : "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              Absent
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>

        {/* Save */}

        <div className="flex justify-end border-t border-slate-200 px-5 py-4">

          <button
            type="button"
            onClick={
              handleSaveAttendance
            }
            disabled={
              saving ||
              attendanceAlreadyMarked ||
              !dateAllowed ||
              students.length === 0
            }
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Attendance"}
          </button>

        </div>

      </Card>

      {/* =================================================
          CR MODAL
      ================================================= */}

      {crModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5">

              <h2 className="text-xl font-bold text-slate-800">
                Generate CR Attendance Access
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Select the Class Representative who will
                manage the attendance session.
              </p>

            </div>

            {/* Subject */}

            <div className="mb-4">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Subject
              </label>

              <select
                value={
                  selectedSubject
                }
                onChange={(event) =>
                  setSelectedSubject(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              >
                {subjects.map(
                  (subject) => (
                    <option
                      key={
                        subject.id
                      }
                      value={
                        subject.id
                      }
                    >
                      {subject.name}
                    </option>
                  )
                )}
              </select>

            </div>

            {/* CR */}

            <div className="mb-4">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Class Representative
              </label>

              <select
                value={crStudent}
                onChange={(event) =>
                  setCrStudent(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              >

                <option value="">
                  Select Class Representative
                </option>

                {students.map(
                  (student) => (
                    <option
                      key={
                        student.student
                      }
                      value={
                        student.student
                      }
                    >
                      {student.name ||
                        "Student"}{" "}
                      —{" "}
                      {student.roll_no ||
                        ""}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* Date */}

            <div className="mb-4">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Attendance Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              />

            </div>

            <div className="mb-5 rounded-lg bg-blue-50 p-3">

              <p className="text-xs leading-5 text-blue-700">
                The CR access link will remain valid for
                2 days. After the CR opens the session,
                attendance remains active for 20 minutes.
                The attendance location will be recorded
                when the access is created.
              </p>

            </div>

            <div className="flex justify-end gap-3">

              <button
                type="button"
                onClick={() => {
                  setCrModalOpen(
                    false
                  );
                  setCrStudent("");
                }}
                disabled={
                  crGenerating
                }
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleCreateCRAccess
                }
                disabled={
                  crGenerating ||
                  !crStudent
                }
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {crGenerating
                  ? "Generating..."
                  : "Generate Access"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =================================================
          FACULTY QR MODAL
      ================================================= */}

      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">

          <div className="my-8 w-full max-w-4xl rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  Faculty QR Attendance
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Students scan this QR code from their
                  authenticated student accounts.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setQrModalOpen(
                    false
                  )
                }
                className="w-fit rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

            </div>

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-2">

              {/* QR */}

              <div className="flex flex-col items-center">

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                  {qrImageUrl ? (
                    <img
                      src={
                        qrImageUrl
                      }
                      alt="Faculty attendance QR code"
                      className="h-72 w-72 object-contain sm:h-80 sm:w-80"
                    />
                  ) : (
                    <div className="flex h-80 w-80 items-center justify-center text-sm text-slate-400">
                      QR unavailable
                    </div>
                  )}

                </div>

                <div className="mt-4 text-center">

                  <p className="text-sm font-semibold text-slate-800">
                    QR code rotates every 15 seconds
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Students must scan the latest QR code.
                  </p>

                </div>

                {qrExpiresAt && (
                  <p className="mt-2 text-xs text-slate-400">
                    Current QR expires at{" "}
                    {new Date(
                      qrExpiresAt
                    ).toLocaleTimeString()}
                  </p>
                )}

              </div>

              {/* Session Information */}

              <div className="space-y-5">

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Attendance
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-800">
                      {qrMarkedCount}/
                      {qrTotal}
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Status
                    </p>

                    <p
                      className={`mt-1 text-sm font-bold ${qrCompleted
                          ? "text-slate-500"
                          : "text-green-600"
                        }`}
                    >
                      {qrCompleted
                        ? "Completed"
                        : "Active"}
                    </p>

                  </div>

                </div>

                {/* Student List */}

                <div>

                  <h3 className="mb-3 text-sm font-bold text-slate-800">
                    Student Attendance
                  </h3>

                  <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">

                    {qrStudents.length ===
                      0 ? (
                      <div className="p-5 text-center text-sm text-slate-500">
                        No students found.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">

                        {qrStudents.map(
                          (student) => (
                            <div
                              key={
                                student.student
                              }
                              className="flex items-center justify-between gap-3 p-3"
                            >

                              <div className="min-w-0">

                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {student.name ||
                                    "Student"}
                                </p>

                                <p className="text-xs text-slate-500">
                                  {student.roll_no ||
                                    "—"}
                                </p>

                              </div>

                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${student.status ===
                                    "Present"
                                    ? "bg-green-100 text-green-700"
                                    : student.status ===
                                      "Absent"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                              >
                                {student.status ||
                                  "Waiting"}
                              </span>

                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                </div>

                {/* Controls */}

                <div className="flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={() =>
                      refreshQRSession(
                        true
                      )
                    }
                    disabled={
                      qrLoading
                    }
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {qrLoading
                      ? "Refreshing..."
                      : "Refresh"}
                  </button>

                  {!qrCompleted && (
                    <button
                      type="button"
                      onClick={
                        handleCompleteQR
                      }
                      disabled={
                        qrLoading
                      }
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Complete Attendance
                    </button>
                  )}

                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                  <p className="text-sm font-semibold text-blue-800">
                    Attendance Security
                  </p>

                  <ul className="mt-2 space-y-1 text-xs leading-5 text-blue-700">

                    <li>
                      • Students must be authenticated.
                    </li>

                    <li>
                      • The QR code rotates every 15 seconds.
                    </li>

                    <li>
                      • Attendance is accepted only within 50 meters of the session location.
                    </li>

                    <li>
                      • A student can mark attendance only once.
                    </li>

                    <li>
                      • The session automatically expires after its configured time.
                    </li>

                  </ul>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Attendance;

