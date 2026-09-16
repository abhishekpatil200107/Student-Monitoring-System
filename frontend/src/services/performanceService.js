import api from "./api";

export const getPerformanceDashboard = async () => {
  const response = await api.get("/classroom/performance/");
  return response.data;
};