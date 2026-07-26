import { useEffect, useState } from 'react';
import { today } from '@/features/tamu/utils';

/**
 * Mengelola tanggal "hari ini" secara realtime dan mengunci field `tanggal`
 * pada form agar selalu mengikuti hari berjalan (berubah otomatis saat lewat
 * tengah malam).
 */
export function useAutoTodayDate<T extends { tanggal: string }>(
  setForm: React.Dispatch<React.SetStateAction<T>>
) {
  const [todayStr, setTodayStr] = useState(today());

  // Realtime: kalau ganti hari (midnight), tanggal otomatis ikut berubah
  useEffect(() => {
    const id = window.setInterval(() => setTodayStr(today()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setForm((f) => (f.tanggal === todayStr ? f : { ...f, tanggal: todayStr }));
  }, [todayStr, setForm]);

  const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    // konsep realtime: hanya boleh hari ini
    setForm((f) => ({ ...f, tanggal: v === todayStr ? v : todayStr }));
  };

  return { todayStr, handleTanggalChange };
}
