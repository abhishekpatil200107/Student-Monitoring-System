import api from "./api";

export const getDailyDiaries = async () => {
    const response = await api.get("/daily-diary/");
    return response.data;
};

export const getDailyDiary = async (id) => {
    const response = await api.get(`/daily-diary/${id}/`);
    return response.data;
};

export const createDailyDiary = async (data) => {
    const response = await api.post("/daily-diary/", data);
    return response.data;
};

export const updateDailyDiary = async (id, data) => {
    const response = await api.put(`/daily-diary/${id}/`, data);
    return response.data;
};

export const deleteDailyDiary = async (id) => {
    const response = await api.delete(`/daily-diary/${id}/`);
    return response.data;
};