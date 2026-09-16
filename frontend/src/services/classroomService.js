import api from "./api";

/*
-----------------------------------------
Lecture APIs
-----------------------------------------
*/

export const getLectures = async () => {
  const res = await api.get("/classroom/lectures/");
  return res.data.results || res.data;
};

export const getActiveLecture = async () => {
    try {
        const response = await api.get(
            "/classroom/lectures/active/"
        );

        console.log("GET ACTIVE LECTURE FULL RESPONSE:", response);
        console.log("GET ACTIVE LECTURE DATA:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "GET ACTIVE LECTURE ERROR:",
            error.response?.status,
            error.response?.data || error.message
        );

        throw error;
    }
};

export const startLecture = async (data) => {
  const response = await api.post(
    "/classroom/lectures/start_lecture/",
    data
  );

  return response.data;
};

export const endLecture = async (id) => {
  const response = await api.patch(
    `/classroom/lectures/${id}/`,
    {
      status: "Completed",
    }
  );

  return response.data;
};

export const downloadLecturePDF = (lectureId) => {
  window.open(
    `http://127.0.0.1:8000/api/classroom/lectures/${lectureId}/pdf/`,
    "_blank"
  );
};

/*
-----------------------------------------
Student Activity APIs
-----------------------------------------
*/

export const getActivities = async (lectureId) => {
  const response = await api.get(
    `/classroom/activities/?lecture=${lectureId}`
  );

  return response.data.results || response.data;
};

export const updateActivity = async (id, data) => {
  const response = await api.patch(
    `/classroom/activities/${id}/`,
    data
  );

  return response.data;
};


export const getPerformanceDashboard = async () => {
  const response = await api.get("/classroom/performance/");
  return response.data;
};

