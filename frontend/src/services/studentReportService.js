import api from "./api";

export const getStudentReport = async (studentId) => {
  const response = await api.get(
    `/classroom/student-report/${studentId}/`
  );

  return response.data;
};

export const downloadStudentReport = (studentId) => {
  window.open(
    `http://127.0.0.1:8000/api/classroom/student-report/${studentId}/pdf/`,
    "_blank"
  );
};