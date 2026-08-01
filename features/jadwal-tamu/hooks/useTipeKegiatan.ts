'use client';

import { useCallback, useEffect, useState } from 'react';
import type { JadwalTamuTipeKegiatan } from '@/types';
import { addTipeKegiatan, fetchTipeKegiatan } from '../api';

export function useTipeKegiatan() {
  const [tipeList, setTipeList] = useState<JadwalTamuTipeKegiatan[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await fetchTipeKegiatan();
    setTipeList(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addNew = useCallback(async (nama: string, actor: { id: string; username: string }) => {
    const { data, error } = await addTipeKegiatan(nama, actor);
    if (data) {
      setTipeList((prev) => (prev.some((t) => t.nama === data.nama) ? prev : [...prev, data]));
    }
    return { data, error };
  }, []);

  return { tipeList, loading, reload, addNew };
}