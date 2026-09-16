import { useEffect, useState } from "react";

import {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../services/attendanceService";

export default function useAttendance() {

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAttendance = async () => {
    try {
      const data = await getAttendance();
      setAttendance(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  return {
    attendance,
    loading,
    reload: loadAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance,
  };
}