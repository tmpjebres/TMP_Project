'use client';

import { useState } from 'react';
import { useMakamData } from '@/features/makam/useMakamData';
import { createMakam, updateMakam, deleteMakam } from '@/features/makam/api';
import { MakamToolbar } from './MakamToolbar';
import { MakamTable } from './MakamTable';
import { MakamModal } from './MakamModal';
import { PaginationBar } from '@/components/ui/PaginationBar';
import { useAuth } from '@/lib/context/auth-context';
import type { Makam } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingAnimation';

function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <h2
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 18, fontWeight: 700 }}
          className="text-neutral-black dark:text-dark-text-primary mb-3"
        >
          Konfirmasi Hapus
        </h2>
        <p className="text-base text-neutral-gray dark:text-dark-text-secondary mb-7">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-status-danger text-white text-base font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Hapus
          </button>
          <button onClick={onCancel} className="btn-secondary text-base py-3">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DaftarMakam() {
  const { isMaster } = useAuth();
  const {
    loading,
    error: loadError,
    blokList,
    allData,
    search,
    setSearch,
    selectedBlok,
    setSelectedBlok,
    sortConfig,
    handleSort,
    page,
    setPage,
    pageSize,
    totalData,
    data,
    addMakam,
    updateMakam: updateLocal,
    removeMakam,
  } = useMakamData();

  const [modalTarget, setModalTarget] = useState<Makam | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<Makam | null>(null);
  const [actionError, setActionError] = useState('');

  const handleSave = async (payload: Omit<Makam, 'id' | 'blokNama'>) => {
    setActionError('');
    if (modalTarget === 'new') {
      const { data: created, error } = await createMakam(payload);
      if (error || !created) { setActionError(error ?? 'Gagal menyimpan.'); return; }
      addMakam(created);
    } else if (modalTarget) {
      const { data: updated, error } = await updateMakam(modalTarget.id, payload);
      if (error || !updated) { setActionError(error ?? 'Gagal memperbarui.'); return; }
      updateLocal(updated);
    }
    setModalTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionError('');
    const { error } = await deleteMakam(deleteTarget.id);
    if (error) { setActionError(error); setDeleteTarget(null); return; }
    removeMakam(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="animate-fade-in flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 28, fontWeight: 800 }}
          className="text-neutral-black dark:text-dark-text-primary"
        >
          Daftar Makam
        </h1>
        <p className="text-base text-neutral-gray dark:text-dark-text-secondary mt-1">
          Data pahlawan di Taman Makam Pahlawan
        </p>
      </div>

      {(actionError || loadError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-base text-status-danger">
          {actionError || loadError}
        </div>
      )}

      <MakamToolbar
        search={search}
        setSearch={setSearch}
        blokList={blokList}
        selectedBlok={selectedBlok}
        setSelectedBlok={setSelectedBlok}
        onAdd={() => setModalTarget('new')}
        canAdd={isMaster}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <MakamTable
          data={data}
          sortConfig={sortConfig}
          onSort={handleSort}
          onEdit={(item) => setModalTarget(item)}
          onDelete={(item) => setDeleteTarget(item)}
          canEdit={isMaster}
        />
      )}

      {!loading && (
        <div className="px-4 py-3 flex items-center justify-between text-base text-neutral-gray dark:text-dark-text-secondary font-medium border-t border-gray-200 dark:border-dark-border/50">
          <span>
            Menampilkan {Math.min(page * pageSize, totalData)} dari {totalData} data
          </span>
          {totalData > pageSize && (
            <PaginationBar
              page={page}
              setPage={setPage}
              total={totalData}
              pageSize={pageSize}
            />
          )}
        </div>
      )}

      {modalTarget !== null && (
        <MakamModal
          makam={modalTarget === 'new' ? null : modalTarget}
          bloks={blokList}
          makams={allData}
          onSave={handleSave}
          onClose={() => setModalTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Hapus makam "${deleteTarget.nama}" dari Blok ${deleteTarget.blokNama}?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
