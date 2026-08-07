"use client";

import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import type { Tamu, TamuUmum, TamuRombongan } from "@/types";

interface EditModalProps {
  tamu: Tamu;
  onSave: (t: Tamu) => void;
  onClose: () => void;
}

export default function EditModal({ tamu, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState({ ...tamu });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 20, fontWeight: 700 }} className="text-neutral-black dark:text-dark-text-primary">
            Edit Tamu
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-light-gray dark:bg-dark-surface-hover rounded-lg">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-base font-semibold text-neutral-black dark:text-dark-text-primary mb-2">Tanggal</label>
            <input type="date" className="form-input text-base py-3.5" value={form.tanggal} onChange={set("tanggal")} />
          </div>
          {tamu.jenis === "umum" ? (
            <div>
              <label className="block text-base font-semibold text-neutral-black dark:text-dark-text-primary mb-2">Nama</label>
              <input type="text" className="form-input text-base py-3.5" value={(form as TamuUmum).nama} onChange={set("nama")} />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-base font-semibold text-neutral-black dark:text-dark-text-primary mb-2">Nama Pimpinan</label>
                <input type="text" className="form-input text-base py-3.5" value={(form as TamuRombongan).namaPimpinan} onChange={set("namaPimpinan")} />
              </div>
              <div>
                <label className="block text-base font-semibold text-neutral-black dark:text-dark-text-primary mb-2">Instansi</label>
                <input type="text" className="form-input text-base py-3.5" value={(form as TamuRombongan).instansi} onChange={set("instansi")} />
              </div>
              <div>
                <label className="block text-base font-semibold text-neutral-black dark:text-dark-text-primary mb-2">Jumlah Peserta</label>
                <input
                  type="number"
                  className="form-input text-base py-3.5"
                  value={(form as TamuRombongan).jumlahPeserta}
                  onChange={(e) => setForm((f) => ({ ...f, jumlahPeserta: Number(e.target.value) }))}
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-base font-semibold text-neutral-black dark:text-dark-text-primary mb-2">Tujuan</label>
            <textarea rows={3} className="form-input text-base resize-none" value={form.tujuan} onChange={set("tujuan")} />
          </div>
        </div>
        <div className="flex gap-3 mt-7">
          <button onClick={() => onSave(form as Tamu)} className="btn-primary text-base py-3">
            <CheckCircle2 size={18} className="mr-2" /> Simpan
          </button>
          <button onClick={onClose} className="btn-secondary text-base py-3">Batal</button>
        </div>
      </div>
    </div>
  );
}
