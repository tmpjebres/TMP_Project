"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Toast from "@/components/ui/Toast";
import CameraCapture from "@/components/ui/CameraCapture";
import { createTamuRombongan } from "@/features/tamu/api";
import { ROUTES } from "@/lib/routes";
import LoadingButton from "@/components/ui/LoadingButton";

const today = () => new Date().toISOString().split("T")[0];
const emptyForm = () => ({
  tanggal: today(),
  namaPimpinan: "",
  instansi: "",
  jumlahPeserta: "",
  tujuan: "",
});

export default function InputTamuRombongan() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [todayStr, setTodayStr] = useState(today());

  // Realtime: kalau ganti hari (midnight), tanggal otomatis ikut berubah
  useEffect(() => {
    const id = window.setInterval(() => setTodayStr(today()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setForm((f) => (f.tanggal === todayStr ? f : { ...f, tanggal: todayStr }));
  }, [todayStr]);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleTanggalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, tanggal: v === todayStr ? v : todayStr }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      !form.tanggal ||
      !form.namaPimpinan.trim() ||
      !form.instansi.trim() ||
      !form.jumlahPeserta ||
      !form.tujuan.trim()
    ) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    if (!capturedPhoto) {
      setError("Foto pimpinan rombongan wajib diambil sebelum menyimpan.");
      return;
    }

    setLoading(true);
    const { error: apiError } = await createTamuRombongan({
      tanggal: form.tanggal,
      namaPimpinan: form.namaPimpinan,
      instansi: form.instansi,
      jumlahPeserta: Number(form.jumlahPeserta),
      tujuan: form.tujuan,
      fotoBase64: capturedPhoto,
    });
    setLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    setForm(emptyForm());
    setCapturedPhoto(null);
    setShowToast(true);
  };

  const handleReset = () => {
    setForm(emptyForm());
    setError("");
    setCapturedPhoto(null);
  };

  const handleDone = useCallback(() => setShowToast(false), []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {showToast && <Toast message="Berhasil disimpan" onDone={handleDone} />}

      <button
        onClick={() => router.push(ROUTES["input-tamu"])}
        className="flex items-center gap-2 text-base text-neutral-gray hover:text-neutral-black mb-6 transition-colors self-start"
      >
        <ArrowLeft size={18} /> Kembali
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h1
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 28,
                fontWeight: 800,
              }}
              className="text-neutral-black text-center"
            >
              Tamu Rombongan
            </h1>
            <p className="text-base text-center text-neutral-gray mt-1">
              Catat kunjungan rombongan atau instansi
            </p>
          </div>

          <div
            className="bg-white rounded-2xl p-8"
            style={{
              border: "1px solid rgba(221,221,221,0.5)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-base font-semibold text-neutral-black mb-2">
                  Tanggal <span className="text-status-danger">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="form-input text-base py-3.5"
                  value={form.tanggal}
                  min={todayStr}
                  max={todayStr}
                  onChange={handleTanggalChange}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-neutral-black mb-2">
                  Nama Pimpinan <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input text-base py-3.5"
                  placeholder="Nama pimpinan rombongan"
                  value={form.namaPimpinan}
                  onChange={set("namaPimpinan")}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-neutral-black mb-2">
                  Instansi <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input text-base py-3.5"
                  placeholder="Nama instansi / organisasi"
                  value={form.instansi}
                  onChange={set("instansi")}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-neutral-black mb-2">
                  Jumlah Peserta <span className="text-status-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="form-input text-base py-3.5"
                  placeholder="Jumlah anggota rombongan"
                  value={form.jumlahPeserta}
                  onChange={set("jumlahPeserta")}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-neutral-black mb-2">
                  Tujuan <span className="text-status-danger">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  className="form-input text-base resize-none"
                  placeholder="Tujuan kunjungan"
                  value={form.tujuan}
                  onChange={set("tujuan")}
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-neutral-black mb-2">
                  Foto Pimpinan Rombongan{" "}
                  <span className="text-status-danger">*</span>
                </label>
                <CameraCapture
                  capturedPhoto={capturedPhoto}
                  onCapture={setCapturedPhoto}
                  onClear={() => setCapturedPhoto(null)}
                />
              </div>

              {error && (
                <p className="text-base text-status-danger font-medium">
                  {error}
                </p>
              )}

              <div className="pt-2 flex gap-3">
                <LoadingButton
                  type="submit"
                  loading={loading}
                  className="btn-primary text-base py-3.5 px-8 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Simpan
                </LoadingButton>
                <button
                  type="button"
                  className="btn-secondary text-base py-3.5 px-8"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
