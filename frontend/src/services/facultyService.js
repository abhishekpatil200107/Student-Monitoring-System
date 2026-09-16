import api from "./api";

export const getFaculty = async () => {
  const res = await api.get("/faculty/");
  return res.data.results || res.data;
};

export const createFaculty = async (faculty) => {
  const response = await api.post("/faculty/", faculty);
  return response.data;
};

export const updateFaculty = async (id, faculty) => {
  const response = await api.put(`/faculty/${id}/`, faculty);
  return response.data;
};

export const deleteFaculty = async (id) => {
  await api.delete(`/faculty/${id}/`);
};

/// Get students for selected subject and date
export const getFacultyAttendanceStudents = async (
  subject,
  date
) => {
  const response = await api.get(
    "/attendance/faculty-students/",
    {
      params: {
        subject,
        date,
      },
    }
  );

  return response.data;
};


// Mark or update attendance
export const markFacultyAttendance = async (data) => {
  const response = await api.post(
    "/attendance/mark/",
    data
  );

  return response.data;
};


// Get attendance permissions
export const getMyAttendancePermissions = async () => {
  const response = await api.get(
    "/attendance/my-permissions/"
  );

  return response.data.results || response.data;
};