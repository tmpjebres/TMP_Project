'use client';

import { Edit, Trash2 } from 'lucide-react';
import type { Makam } from '@/types';
import type { SortConfig } from '@/features/makam/sort-utils';
import { getSortIndicator } from '@/features/makam/sort-utils';

interface Props {
  data: Makam[];
  sortConfig: SortConfig<Makam>;
  onSort: (key: keyof Makam) => void;
  onEdit: (item: Makam) => void;
  onDelete: (item: Makam) => void;
  canEdit: boolean;
}

function SortTh({
  label,
  colKey,
  sortConfig,
  onSort,
}: {
  label: string;
  colKey: keyof Makam;
  sortConfig: SortConfig<Makam>;
  onSort: (key: keyof Makam) => void;
}) {
  const indicator = getSortIndicator(sortConfig, colKey);
  return (
    <th
      onClick={() => onSort(colKey)}
      className="cursor-pointer select-none"
      style={{ fontSize: 14 }}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className="text-neutral-gray text-xs">{indicator}</span>
      </span>
    </th>
  );
}

function formatTanggal(val: string) {
  if (!val) return '—';
  return val; // stored as dd/mm/yyyy already
}

export function MakamTable({ data, sortConfig, onSort, onEdit, onDelete, canEdit }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid rgba(221,221,221,0.5)' }}>
        <p className="text-center py-12 text-neutral-gray text-base">Tidak ada data ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid rgba(221,221,221,0.5)' }}>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <SortTh label="Nama Pahlawan" colKey="nama" sortConfig={sortConfig} onSort={onSort} />
              <SortTh label="Blok" colKey="blokNama" sortConfig={sortConfig} onSort={onSort} />
              <SortTh label="No. Makam" colKey="nomor" sortConfig={sortConfig} onSort={onSort} />
              <th style={{ fontSize: 14 }}>NRP</th>
              <SortTh label="Pangkat" colKey="pangkat" sortConfig={sortConfig} onSort={onSort} />
              <th style={{ fontSize: 14 }}>Tgl. Lahir</th>
              <th style={{ fontSize: 14 }}>Tgl. Gugur</th>
              <th style={{ fontSize: 14 }}>Kesatuan</th>
              {canEdit && <th style={{ fontSize: 14, textAlign: 'center' }}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td className="text-base font-semibold">{item.nama}</td>
                <td className="text-base">
                  <span className="px-2 py-0.5 bg-green-light text-green-primary text-sm font-semibold rounded">
                    {item.blokNama}
                  </span>
                </td>
                <td className="text-base">{item.nomor}</td>
                <td className="text-base">{item.nrp || '—'}</td>
                <td className="text-base">{item.pangkat || '—'}</td>
                <td className="text-base">{formatTanggal(item.tanggalLahir)}</td>
                <td className="text-base">{formatTanggal(item.tanggalGugur)}</td>
                <td className="text-base">{item.kesatuan || '—'}</td>
                {canEdit && (
                  <td>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={17} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={17} className="text-status-danger" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
