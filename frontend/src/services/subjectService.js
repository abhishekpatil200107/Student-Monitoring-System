import api from "./api";

export const getSubjects = async () => {
  const res = await api.get("/subjects/");
  return res.data.results || res.data;
};

export const createSubject = async (subject) => {
  const response = await api.post("/subjects/", subject);
  return response.data;
};

export const updateSubject = async (id, subject) => {
  const response = await api.put(`/subjects/${id}/`, subject);
  return response.data;
};

export const deleteSubject = async (id) => {
  await api.delete(`/subjects/${id}/`);
};

export const getMySubjects = async () => {
  const response = await api.get("/subjects/my-subjects/");
  return response.data.results || response.data;
};