import { useEffect, useState } from "react";

import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../services/subjectService";

export default function useSubjects() {

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSubjects = async () => {
    try {
      const data = await getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  return {
    subjects,
    loading,
    reload: loadSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  };
}