import api from "./api";

const CODING_URL = "/coding/";

export const getCodingProfiles = async () => {
  const response = await api.get(CODING_URL);

  return response.data.results || [];
};

export const createCodingProfile = async (data) => {
  const response = await api.post(CODING_URL, data);
  return response.data;
};

export const updateCodingProfile = async (id, data) => {
  const response = await api.put(`${CODING_URL}${id}/`, data);
  return response.data;
};

export const deleteCodingProfile = async (id) => {
  const response = await api.delete(`${CODING_URL}${id}/`);
  return response.data;
};