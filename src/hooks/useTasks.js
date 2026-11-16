import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';

export function useTasks(filters) {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const [{ data: taskData }, { data: statsData }] = await Promise.all([
        api.get('/tasks', { params }),
        api.get('/dashboard/stats'),
      ]);
      setTasks(taskData.tasks);
      setStats(statsData.stats);
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.status, filters.priority]);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  return { tasks, stats, loading, refresh: load };
}
