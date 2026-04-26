'use client';

import { Search, Plus } from 'lucide-react';
import type { Blok } from '@/types';

interface Props {
  search: string;
  setSearch: (v: string) => void;
  blokList: Blok[];
  selectedBlok: string;
  setSelectedBlok: (v: string) => void;
  onAdd: () => void;
  canAdd: boolean;
}

export function MakamToolbar({
  search,
  setSearch,
  blokList,
  selectedBlok,
  setSelectedBlok,
  onAdd,
  canAdd,
}: Props) {
  return (
    <div className="bg-white rounded-xl p-4 mb-5 flex flex-wrap gap-3 items-center justify-between"
      style={{ border: '1px solid rgba(221,221,221,0.5)' }}>
      <div className="flex flex-wrap gap-3 flex-1">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-gray" size={18} />
          <input
            className="form-input pl-10 text-base"
            placeholder="Cari Nama, No Makam, NRP, Pangkat, dan lainnya disini..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input text-base"
          style={{ width: 'auto' }}
          value={selectedBlok}
          onChange={(e) => setSelectedBlok(e.target.value)}
        >
          <option value="">Semua Blok</option>
          {blokList.map((b) => (
            <option key={b.id} value={b.id}>
              Blok {b.nama}
            </option>
          ))}
        </select>
      </div>
      {canAdd && (
        <button onClick={onAdd} className="btn-primary text-base">
          <Plus size={18} className="mr-2" /> Tambah Makam
        </button>
      )}
    </div>
  );
}
