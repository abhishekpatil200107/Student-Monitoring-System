import api from "./api";

export const getAttendancePermissions = async () => {
const response = await api.get("/attendance/permissions/");
return response.data.results || response.data;
};

export const createAttendancePermission = async (data) => {
const response = await api.post(
"/attendance/permissions/",
data
);

return response.data;
};
