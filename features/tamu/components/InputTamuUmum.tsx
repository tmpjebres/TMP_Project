"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Toast from "@/components/ui/Toast";
import CameraCapture from "@/components/ui/CameraCapture";
import { createTamuUmum } from "@/features/tamu/api";
import { Page } from "@/types";
import LoadingButton from "@/components/ui/LoadingButton";

const today = () => new Date().toISOString().split("T")[0];

interface Props {
  onNavigate: (p: Page) => void;
}

export default function InputTamuUmum({ onNavigate }: Props) {
  const [form, setForm] = useState({ tanggal: today(), nama: "", tujuan: "" });
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
    // konsep realtime: hanya boleh hari ini
    setForm((f) => ({ ...f, tanggal: v === todayStr ? v : todayStr }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!capturedPhoto) {
      setError("Foto tamu wajib diambil sebelum menyimpan.");
      return;
    }

    setLoading(true);
    const { error: apiError } = await createTamuUmum({
      tanggal: form.tanggal,
      nama: form.nama,
      tujuan: form.tujuan,
      fotoBase64: capturedPhoto,
    });
    setLoading(false);

    if (apiError) {
      setError(apiError);
      return;
    }

    setForm({ tanggal: today(), nama: "", tujuan: "" });
    setCapturedPhoto(null);
    setShowToast(true);
  };

  const handleReset = () => {
    setForm({ tanggal: today(), nama: "", tujuan: "" });
    setError("");
    setCapturedPhoto(null);
  };

  const handleDone = useCallback(() => setShowToast(false), []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {showToast && <Toast message="Berhasil disimpan" onDone={handleDone} />}

      <button
        onClick={() => onNavigate("input-tamu")}
        className="flex items-center gap-2 text-base text-neutral-gray hover:text-neutral-black mb-6 transition-colors self-start"
      >
        <ArrowLeft size={18} /> Kembali
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h1
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 28, fontWeight: 800 }}
              className="text-neutral-black text-center"
            >
              Tamu Umum
            </h1>
            <p className="text-base text-center text-neutral-gray mt-1">
              Catat kunjungan tamu perorangan
            </p>
          </div>

          <div
            className="bg-white rounded-2xl p-8"
            style={{ border: "1px solid rgba(221,221,221,0.5)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
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
                  Nama <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-input text-base py-3.5"
                  placeholder="Nama lengkap"
                  value={form.nama}
                  onChange={set("nama")}
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
                  Foto Tamu <span className="text-status-danger">*</span>
                </label>
                <CameraCapture
                  capturedPhoto={capturedPhoto}
                  onCapture={setCapturedPhoto}
                  onClear={() => setCapturedPhoto(null)}
                />
              </div>

              {error && (
                <p className="text-base text-status-danger font-medium">{error}</p>
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
