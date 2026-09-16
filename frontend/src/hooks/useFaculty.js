import { useEffect, useState } from "react";

import {
  getFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from "../services/facultyService";

export default function useFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFaculty = async () => {
    try {
      const data = await getFaculty();
      setFaculty(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaculty();
  }, []);

  return {
    faculty,
    loading,
    reload: loadFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty,
  };
}