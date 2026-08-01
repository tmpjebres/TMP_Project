'use client';

import { useCallback, useEffect, useState } from 'react';
import type { JadwalTamu, JadwalTamuFormInput } from '@/types';
import { checkBentrok, createJadwalTamu, deleteJadwalTamu, fetchJadwalTamu, updateJadwalTamu } from '../api';

export function useJadwalTamuData() {
  const [events, setEvents] = useState<JadwalTamu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchJadwalTamu();
    if (error) setError(error);
    else {
      setEvents(data);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (input: JadwalTamuFormInput, actor: { id: string; username: string }) => {
      const { data, error } = await createJadwalTamu(input, actor);
      if (data) setEvents((prev) => [...prev, data]);
      return { data, error };
    },
    []
  );

  const edit = useCallback(
    async (id: string, input: JadwalTamuFormInput, actor: { id: string; username: string }) => {
      const { data, error } = await updateJadwalTamu(id, input, actor);
      if (data) setEvents((prev) => prev.map((e) => (e.id === id ? data : e)));
      return { data, error };
    },
    []
  );

  const remove = useCallback(
    async (id: string, actor: { id: string; username: string }) => {
      const { success, error } = await deleteJadwalTamu(id, actor);
      if (success) setEvents((prev) => prev.filter((e) => e.id !== id));
      return { success, error };
    },
    []
  );

  const checkConflicts = useCallback(async (tanggalMulai: string, excludeId?: string) => {
    return checkBentrok(tanggalMulai, excludeId);
  }, []);

  return { events, loading, error, reload, add, edit, remove, checkConflicts };
}
