'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { AlertCircle, Link2, Paperclip, X } from 'lucide-react';
import type { AttachmentType, JadwalTamu, JadwalTamuFormInput } from '@/types';
import { useAuth } from '@/lib/context/auth-context';
import { useTipeKegiatan } from '../hooks/useTipeKegiatan';
import TipeKegiatanSelect from './TipeKegiatanSelect';

interface EventFormModalProps {
  initial?: JadwalTamu | null;
  defaultDate?: string;
  onClose: () => void;
  onSubmit: (input: JadwalTamuFormInput) => Promise<void> | void;
  submitting: boolean;
}

const MAX_SIZE = 1024 * 1024; // 1 MB

export default function EventFormModal({ initial, defaultDate, onClose, onSubmit, submitting }: EventFormModalProps) {
  const { user } = useAuth();
  const { tipeList, addNew } = useTipeKegiatan();

  const [namaKegiatan, setNamaKegiatan] = useState(initial?.namaKegiatan ?? '');
  const [tipeKegiatan, setTipeKegiatan] = useState(initial?.tipeKegiatan ?? '');
  const [instansi, setInstansi] = useState(initial?.instansi ?? '');
  const [namaKetua, setNamaKetua] = useState(initial?.namaKetua ?? '');
  const [jumlahRombongan, setJumlahRombongan] = useState(initial?.jumlahRombongan?.toString() ?? '');
  const [tanggalMulai, setTanggalMulai] = useState(initial?.tanggalMulai ?? defaultDate ?? '');
  const [jamMulai, setJamMulai] = useState(initial?.jamMulai ?? '09:00');
  const [punyaWaktuSelesai, setPunyaWaktuSelesai] = useState(initial?.punyaWaktuSelesai ?? false);
  const [tanggalSelesai, setTanggalSelesai] = useState(initial?.tanggalSelesai ?? '');
  const [jamSelesai, setJamSelesai] = useState(initial?.jamSelesai ?? '');

  const [attachmentMode, setAttachmentMode] = useState<AttachmentType | 'none'>(initial?.attachmentType ?? 'none');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentLink, setAttachmentLink] = useState(initial?.attachmentType === 'link' ? initial.attachmentUrl ?? '' : '');
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isEdit = Boolean(initial);

  useEffect(() => {
    if (!tipeKegiatan && tipeList.length > 0) {
      setTipeKegiatan(tipeList[0].nama);
    }
  }, [tipeList, tipeKegiatan]);

  async function handleAddNewTipe(nama: string): Promise<string | null> {
    if (!user) return null;
    const { data } = await addNew(nama, { id: user.id, username: user.username });
    return data?.nama ?? null;
  }

  function handleFilePick(file: File | null, kind: 'pdf' | 'image') {
    setFileError(null);
    if (!file) {
      setAttachmentFile(null);
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileError(`Ukuran file maksimal 1 MB. File kamu ${(file.size / 1024 / 1024).toFixed(2)} MB.`);
      setAttachmentFile(null);
      return;
    }
    const okType = kind === 'pdf' ? file.type === 'application/pdf' : file.type.startsWith('image/');
    if (!okType) {
      setFileError(kind === 'pdf' ? 'File harus berformat PDF.' : 'File harus berupa gambar (JPG/PNG/WEBP).');
      setAttachmentFile(null);
      return;
    }
    setAttachmentFile(file);
  }

  function validate(): string | null {
    if (!namaKegiatan.trim()) return 'Nama kegiatan wajib diisi.';
    if (!tipeKegiatan.trim()) return 'Tipe kegiatan wajib dipilih.';
    if (!instansi.trim()) return 'Instansi wajib diisi.';
    if (!namaKetua.trim()) return 'Nama ketua rombongan wajib diisi.';
    if (!jumlahRombongan || Number(jumlahRombongan) <= 0) return 'Jumlah rombongan harus lebih dari 0.';
    if (!tanggalMulai) return 'Tanggal mulai wajib diisi.';
    if (!jamMulai) return 'Jam mulai wajib diisi.';
    if (punyaWaktuSelesai) {
      if (!tanggalSelesai || !jamSelesai) return 'Tanggal & jam selesai wajib diisi jika rentang waktu diaktifkan.';
      if (tanggalSelesai < tanggalMulai || (tanggalSelesai === tanggalMulai && jamSelesai < jamMulai)) {
        return 'Waktu selesai tidak boleh sebelum waktu mulai.';
      }
    }
    if (attachmentMode === 'link' && !attachmentLink.trim()) return 'Link Drive wajib diisi.';
    if ((attachmentMode === 'pdf' || attachmentMode === 'image') && !attachmentFile && !isEdit) {
      return 'Silakan pilih file lampiran.';
    }
    if (fileError) return fileError;
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setFormError(err);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setFormError(null);

    const input: JadwalTamuFormInput = {
      namaKegiatan: namaKegiatan.trim(),
      tipeKegiatan: tipeKegiatan.trim(),
      instansi: instansi.trim(),
      namaKetua: namaKetua.trim(),
      jumlahRombongan: Number(jumlahRombongan),
      tanggalMulai,
      jamMulai,
      punyaWaktuSelesai,
      tanggalSelesai: punyaWaktuSelesai ? tanggalSelesai : undefined,
      jamSelesai: punyaWaktuSelesai ? jamSelesai : undefined,
      attachmentType: attachmentMode === 'none' ? undefined : attachmentMode,
      attachmentFile: attachmentMode === 'pdf' || attachmentMode === 'image' ? attachmentFile : undefined,
      attachmentLink: attachmentMode === 'link' ? attachmentLink.trim() : undefined,
    };

    await onSubmit(input);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #EEEEEE' }}>
          <h2 className="text-base font-bold text-neutral-black dark:text-dark-text-primary" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {isEdit ? 'Edit Jadwal Tamu' : 'Tambah Jadwal Tamu'}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-light-gray dark:bg-dark-surface-hover text-neutral-gray dark:text-dark-text-secondary">
            <X size={18} />
          </button>
        </div>

        {formError && (
          <div className="flex items-start gap-2 px-5 py-3 bg-red-50" style={{ borderBottom: '1px solid #F3D1CC' }}>
            <AlertCircle size={16} className="text-status-danger flex-shrink-0 mt-0.5" />
            <p className="text-sm text-status-danger font-medium">{formError}</p>
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <Field label="Nama Kegiatan">
            <input
              value={namaKegiatan}
              onChange={(e) => setNamaKegiatan(e.target.value)}
              className="input-field"
              placeholder="Kunjungan Ziarah Rombongan..."
            />
          </Field>

          <Field label="Tipe Kegiatan">
            <TipeKegiatanSelect
              tipeList={tipeList}
              value={tipeKegiatan}
              onChange={setTipeKegiatan}
              onAddNew={handleAddNewTipe}
            />
          </Field>

          <Field label="Instansi yang Mengadakan">
            <input value={instansi} onChange={(e) => setInstansi(e.target.value)} className="input-field" placeholder="Nama instansi" />
          </Field>

          <Field label="Nama Ketua Rombongan">
            <input value={namaKetua} onChange={(e) => setNamaKetua(e.target.value)} className="input-field" placeholder="Nama ketua" />
          </Field>

          <Field label="Jumlah Rombongan">
            <input
              type="number"
              min={1}
              value={jumlahRombongan}
              onChange={(e) => setJumlahRombongan(e.target.value)}
              className="input-field"
              placeholder="Jumlah orang"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tanggal Mulai">
              <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="input-field" />
            </Field>
            <Field label="Jam Mulai">
              <input type="time" value={jamMulai} onChange={(e) => setJamMulai(e.target.value)} className="input-field" />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={punyaWaktuSelesai}
              onChange={(e) => setPunyaWaktuSelesai(e.target.checked)}
              className="w-4 h-4 accent-green-primary"
            />
            <span className="text-sm font-medium text-neutral-black dark:text-dark-text-primary">Punya tanggal & jam selesai</span>
          </label>

          {punyaWaktuSelesai && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tanggal Selesai">
                <input type="date" value={tanggalSelesai} onChange={(e) => setTanggalSelesai(e.target.value)} className="input-field" />
              </Field>
              <Field label="Jam Selesai">
                <input type="time" value={jamSelesai} onChange={(e) => setJamSelesai(e.target.value)} className="input-field" />
              </Field>
            </div>
          )}

          <Field label="Attachment Surat (opsional)">
            <div className="flex rounded-lg p-1 bg-neutral-light-gray dark:bg-dark-surface-hover mb-2">
              {(['none', 'pdf', 'image', 'link'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setAttachmentMode(mode);
                    setAttachmentFile(null);
                    setFileError(null);
                  }}
                  className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    attachmentMode === mode ? 'bg-white dark:bg-dark-surface text-green-primary dark:text-dark-brand-accent shadow-sm' : 'text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:text-dark-brand-accent'
                  }`}
                >
                  {mode === 'none' ? 'Tanpa' : mode === 'pdf' ? 'PDF' : mode === 'image' ? 'Gambar' : 'Link Drive'}
                </button>
              ))}
            </div>

            {(attachmentMode === 'pdf' || attachmentMode === 'image') && (
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm text-neutral-gray dark:text-dark-text-secondary hover:bg-neutral-light-gray dark:bg-dark-surface-hover transition-colors" style={{ border: '1px dashed #DDDDDD' }}>
                <Paperclip size={16} />
                {attachmentFile ? attachmentFile.name : isEdit && initial?.attachmentFilename ? `Ganti file (saat ini: ${initial.attachmentFilename})` : 'Pilih file (maks 1 MB)'}
                <input
                  type="file"
                  className="hidden"
                  accept={attachmentMode === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp'}
                  onChange={(e) => handleFilePick(e.target.files?.[0] ?? null, attachmentMode)}
                />
              </label>
            )}

            {attachmentMode === 'link' && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ border: '1px solid #DDDDDD' }}>
                <Link2 size={16} className="text-neutral-gray dark:text-dark-text-secondary flex-shrink-0" />
                <input
                  value={attachmentLink}
                  onChange={(e) => setAttachmentLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="flex-1 text-sm outline-none"
                />
              </div>
            )}

            {fileError && <p className="text-xs text-status-danger mt-1.5">{fileError}</p>}
          </Field>
        </div>

        <div className="flex gap-3 p-5" style={{ borderTop: '1px solid #EEEEEE' }}>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-green-primary dark:bg-dark-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-green-secondary dark:bg-dark-brand-primary transition-colors disabled:opacity-60"
          >
            {submitting ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Jadwal'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary text-sm py-3 px-6">
            Batal
          </button>
        </div>

        <style jsx>{`
          .input-field {
            width: 100%;
            padding: 0.625rem 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid #dddddd;
            font-size: 0.875rem;
            outline: none;
          }
          .input-field:focus {
            border-color: #3d7a73;
          }
        `}</style>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-gray dark:text-dark-text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  );
}
