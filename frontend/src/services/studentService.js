import api from "./api";

export const getStudents = async () => {
  const response = await api.get("/students/");
  return response.data.results || response.data;
};

export const createStudent = async (data) => {
  const response = await api.post("/students/", data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/students/${id}/`, data);
  return response.data;
};

export const deleteStudent = async (id) => {
  await api.delete(`/students/${id}/`);
};

export const getMyProfile = async () => {
  const response = await api.get("/students/me/");
  return response.data;
};