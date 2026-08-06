import { useEffect, useState } from 'react';
import { today } from '@/features/tamu/utils';

export function useAutoTodayDate<T extends { tanggal: string }>(
  setForm: React.Dispatch<React.SetStateAction<T>>
) {
  const [todayStr, setTodayStr] = useState(today());

  useEffect(() => {
    const id = window.setInterval(() => setTodayStr(today()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setForm((f) => (f.tanggal === todayStr ? f : { ...f, tanggal: todayStr }));
  }, [todayStr, setForm]);

  const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, tanggal: v === todayStr ? v : todayStr }));
  };

  return { todayStr, handleTanggalChange };
}
