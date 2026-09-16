import api from "./api";

// =====================================================
// Normal Attendance
// =====================================================

export const getAttendance = async () => {
  const res = await api.get("/attendance/");
  return res.data.results || res.data;
};

export const createAttendance = async (data) => {
  const response = await api.post("/attendance/", data);
  return response.data;
};

export const updateAttendance = async (id, data) => {
  const response = await api.put(`/attendance/${id}/`, data);
  return response.data;
};

export const deleteAttendance = async (id) => {
  await api.delete(`/attendance/${id}/`);
};

export const getAttendanceAnalytics = async () => {
  const response = await api.get("/classroom/attendance/");
  return response.data;
};

export const getMyAttendance = async () => {
  const response = await api.get("/attendance/me/");
  return response.data;
};

// =====================================================
// Faculty Manual Attendance
// =====================================================

export const getFacultyAttendanceStudents = async (
  subjectId,
  date
) => {
  const response = await api.get(
    "/attendance/faculty-students/",
    {
      params: {
        subject: subjectId,
        ...(date ? { date } : {}),
      },
    }
  );

  return response.data;
};

export const markFacultyAttendance = async (data) => {
  const response = await api.post(
    "/attendance/mark/",
    data
  );

  return response.data;
};

// =====================================================
// Student Attendance
// =====================================================

export const getStudentAttendanceSummary = async () => {
  const response = await api.get(
    "/attendance/student-summary/"
  );

  return response.data;
};

// =====================================================
// CR Attendance
// =====================================================

export const createCRAttendanceAccess = async (data) => {
  const response = await api.post(
    "/attendance/cr-access/create/",
    data
  );

  return response.data;
};

export const resendCRAttendanceAccess = async (
  accessId
) => {
  const response = await api.post(
    `/attendance/cr-access/${accessId}/resend/`
  );

  return response.data;
};

export const openCRAttendanceAccess = async (
  token
) => {
  const response = await api.get(
    `/attendance/cr-access/${token}/open/`
  );

  return response.data;
};

export const submitCRAttendance = async (
  token,
  data
) => {
  const response = await api.post(
    `/attendance/cr-access/${token}/submit/`,
    data
  );

  return response.data;
};

// =====================================================
// Faculty QR Attendance
// =====================================================

export const createFacultyQRAttendance = async (
  data
) => {
  const response = await api.post(
    "/attendance/faculty-qr/create/",
    data
  );

  return response.data;
};

export const getMyQRSessions = async () => {
  const response = await api.get(
    "/attendance/my-qr-sessions/"
  );

  return response.data;
};

export const getQRAttendanceSession = async (
  sessionId
) => {
  const response = await api.get(
    `/attendance/${sessionId}/qr/`
  );

  return response.data;
};

export const completeQRAttendance = async (
  sessionId
) => {
  const response = await api.post(
    `/attendance/${sessionId}/complete-qr/`
  );

  return response.data;
};

// Student QR Attendance
export const scanAttendanceQR = async (qrToken, latitude, longitude) => {
  const response = await api.post("/attendance/qr-scan/", {
    qr_token: qrToken,
    latitude,
    longitude,
  });

  return response.data;
};