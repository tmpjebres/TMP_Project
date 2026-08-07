import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";
import { Blok } from "@/types/index";
import LoadingButton from "@/components/ui/LoadingButton";

export function BlokModal({
  initial,
  onSave,
  onClose,
}: {
  initial: Blok | null;
  onSave: (d: { nama: string; kapasitas: number }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    nama: initial?.nama ?? "",
    kapasitas: initial?.kapasitas?.toString() ?? "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (saving) return; 

    if (!form.nama.trim()) {
      setError("Nama blok wajib diisi.");
      return;
    }
    if (!form.kapasitas || Number(form.kapasitas) < 1) {
      setError("Kapasitas minimal 1.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        nama: form.nama.trim(),
        kapasitas: Number(form.kapasitas),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: 20,
              fontWeight: 700,
            }}
            className="text-neutral-black dark:text-dark-text-primary"
          >
            {initial ? "Edit Blok" : "Tambah Blok"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-light-gray dark:bg-dark-surface-hover rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div>
            <label className="block text-base font-semibold text-neutral-black dark:text-dark-text-primary mb-2">
              Nama Blok
            </label>
            <input
              type="text"
              className="form-input text-base py-3.5"
              placeholder="Contoh: A, B, C"
              value={form.nama}
              onChange={(e) => {
                setForm((f) => ({ ...f, nama: e.target.value }));
                setError("");
              }}
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-neutral-black dark:text-dark-text-primary mb-2">
              Kapasitas
            </label>
            <input
              type="number"
              min="1"
              className="form-input text-base py-3.5"
              placeholder="Jumlah makam"
              value={form.kapasitas}
              onChange={(e) => {
                setForm((f) => ({ ...f, kapasitas: e.target.value }));
                setError("");
              }}
            />
          </div>
          {error && (
            <p className="text-base text-status-danger font-medium">{error}</p>
          )}
          <div className="flex gap-3 mt-6">
          <LoadingButton
            type="submit"
            loading={saving}
            disabled={!form.nama || !form.kapasitas}
            className="btn-primary text-base py-3"
          >
            <CheckCircle2 size={18} className="mr-2" />
            Simpan
          </LoadingButton>
          <button onClick={onClose} className="btn-secondary text-base py-3">
            Batal
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
