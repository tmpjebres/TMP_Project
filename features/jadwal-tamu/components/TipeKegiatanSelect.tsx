'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { JadwalTamuTipeKegiatan } from '@/types';

interface TipeKegiatanSelectProps {
  tipeList: JadwalTamuTipeKegiatan[];
  value: string;
  onChange: (value: string) => void;
  onAddNew: (nama: string) => Promise<string | null>; // returns final nama on success
}

export default function TipeKegiatanSelect({ tipeList, value, onChange, onAddNew }: TipeKegiatanSelectProps) {
  const [addingNew, setAddingNew] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmNew() {
    const trimmed = newValue.trim();
    if (!trimmed) {
      setError('Nama tipe kegiatan tidak boleh kosong.');
      return;
    }
    setBusy(true);
    const result = await onAddNew(trimmed);
    setBusy(false);
    if (!result) {
      setError('Gagal menambah tipe kegiatan.');
      return;
    }
    onChange(result);
    setAddingNew(false);
    setNewValue('');
    setError(null);
  }

  if (addingNew) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Nama tipe kegiatan baru"
            className="input-field-plain flex-1"
          />
          <button
            type="button"
            onClick={handleConfirmNew}
            disabled={busy}
            className="px-3 py-2.5 rounded-lg bg-green-primary dark:bg-dark-brand-secondary text-white text-xs font-semibold hover:bg-green-secondary dark:hover:bg-dark-brand-primary transition-colors disabled:opacity-60"
          >
            {busy ? '...' : 'Tambah'}
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingNew(false);
              setNewValue('');
              setError(null);
            }}
            className="p-2.5 rounded-lg hover:bg-neutral-light-gray dark:hover:bg-dark-surface-hover text-neutral-gray dark:text-dark-text-secondary"
          >
            <X size={16} />
          </button>
        </div>
        {error && <p className="text-xs text-status-danger mt-1.5">{error}</p>}
        <style jsx>{`
          .input-field-plain {
            padding: 0.625rem 0.75rem;
            border-radius: 0.5rem;
            border: 1px solid var(--border-subtle);
            background-color: var(--surface);
            color: var(--text-primary);
            font-size: 0.875rem;
            outline: none;
          }
          .input-field-plain:focus {
            border-color: #3d7a73;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tipeList.map((tipe) => {
        const active = tipe.nama === value;
        return (
          <button
            key={tipe.id}
            type="button"
            onClick={() => onChange(tipe.nama)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              active ? 'bg-green-primary dark:bg-dark-brand-secondary text-white' : 'bg-neutral-light-gray dark:bg-dark-surface-hover text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:hover:text-dark-brand-accent'
            }`}
          >
            {tipe.nama}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => setAddingNew(true)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:hover:text-dark-brand-accent hover:border-green-primary dark:hover:border-dark-brand-primary transition-colors"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <Plus size={13} />
        Tipe Baru
      </button>
    </div>
  );
}