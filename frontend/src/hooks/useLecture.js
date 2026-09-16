import { useEffect, useState } from "react";

import {
  getLectures,
  startLecture,
  endLecture,
} from "../services/classroomService";

export default function useLecture() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLectures = async () => {
    try {
      const data = await getLectures();
      setLectures(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLectures();
  }, []);

  return {
    lectures,
    loading,
    reload: loadLectures,
    startLecture,
    endLecture,
  };
}