import api from "./api";

export const loginUser = async (data) => {
  const response = await api.post("/auth/login/", data);
  return response.data;
};

export const registerStudent = async (data) => {
  const response = await api.post(
    "/auth/student/register/",
    data
  );

  return response.data;
};