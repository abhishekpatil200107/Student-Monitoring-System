import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/classroom/dashboard/");
  return response.data;
};