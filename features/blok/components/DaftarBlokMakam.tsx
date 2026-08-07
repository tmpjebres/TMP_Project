"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, CheckCircle2 } from "lucide-react";
import { Blok } from "@/types";
import { useAuth } from "@/lib/context/auth-context";
import { getAllBlok, createBlok, updateBlok, deleteBlok } from "@/features/blok/api";
import LoadingButton from "@/components/ui/LoadingButton";
import { BlokModal } from "./BlokModal";
import { LoadingSpinner } from "@/components/ui/LoadingAnimation";

export default function DaftarBlokMakam() {
  const { isMaster } = useAuth();
  const [bloks, setBloks] = useState<Blok[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Blok | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Blok | null>(null);
  const [actionError, setActionError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await getAllBlok();
      if (error) setActionError(error);
      else setBloks(data);
      setLoading(false);
    };
    load();
  }, []);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (b: Blok) => {
    setEditTarget(b);
    setModalOpen(true);
  };

  const handleSave = async (data: { nama: string; kapasitas: number }) => {
    setActionError("");
    if (editTarget) {
      const { data: updated, error } = await updateBlok(editTarget.id, data);
      if (error) {
        setActionError(error);
        return;
      }
      if (updated)
        setBloks((prev) =>
          prev.map((b) => (b.id === editTarget.id ? updated : b)),
        );
    } else {
      const { data: created, error } = await createBlok(data);
      if (error) {
        setActionError(error);
        return;
      }
      if (created) setBloks((prev) => [...prev, created]);
    }
    setModalOpen(false);
  };

  const handleDeleteRequest = (b: Blok) => {
    setActionError("");
    setDeleteTarget(b);
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    const { error } = await deleteBlok(deleteTarget.id);

    if (error) {
      setActionError(error);
      setDeleting(false);
      return;
    }

    setBloks((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleting(false);
  };

  return (
    <div className="animate-fade-in flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: 28,
              fontWeight: 800,
            }}
            className="text-neutral-black dark:text-dark-text-primary"
          >
            Blok Makam
          </h1>
          <p className="text-base text-neutral-gray dark:text-dark-text-secondary mt-1">
            Kelola pembagian blok di Taman Makam Pahlawan
          </p>
        </div>
        {isMaster && (
          <button onClick={openCreate} className="btn-primary text-base">
            <Plus size={20} className="mr-2" /> Tambah Blok
          </button>
        )}
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-base text-status-danger">
          {actionError}
        </div>
      )}

      {loading ? 
      <LoadingSpinner/> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bloks.map((b) => (
            <div
              key={b.id}
              className="bg-white dark:bg-dark-surface rounded-2xl p-6"
              style={{
                border: "1px solid rgba(221,221,221,0.5)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-neutral-gray dark:text-dark-text-secondary uppercase tracking-wider">
                    Blok
                  </p>
                  <h2
                    style={{
                      fontFamily: "Plus Jakarta Sans, sans-serif",
                      fontSize: 32,
                      fontWeight: 800,
                    }}
                    className="text-neutral-black dark:text-dark-text-primary"
                  >
                    {b.nama}
                  </h2>
                </div>
                {isMaster && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-2 hover:bg-neutral-light-gray dark:bg-dark-surface-hover rounded-lg transition-colors"
                    >
                      <Edit size={16} className="text-neutral-gray dark:text-dark-text-secondary" />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(b)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} className="text-status-danger" />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-base">
                  <span className="text-neutral-gray dark:text-dark-text-secondary">Kapasitas</span>
                  <span className="font-semibold text-neutral-black dark:text-dark-text-primary">
                    {b.kapasitas}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-neutral-gray dark:text-dark-text-secondary">Terisi</span>
                  <span className="font-semibold text-neutral-black dark:text-dark-text-primary">
                    {b.terisi}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-neutral-gray dark:text-dark-text-secondary">Tersedia</span>
                  <span className="font-semibold text-green-primary dark:text-dark-brand-accent">
                    {b.kapasitas - b.terisi}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-neutral-light-gray dark:bg-dark-surface-hover rounded-full h-2">
                  <div
                    className="bg-green-primary dark:bg-dark-brand-secondary h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((b.terisi / b.kapasitas) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-neutral-gray dark:text-dark-text-secondary mt-1 text-right">
                  {b.kapasitas > 0
                    ? Math.round((b.terisi / b.kapasitas) * 100)
                    : 0}
                  % terisi
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <BlokModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-sm p-8">
            <h2
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 18,
                fontWeight: 700,
              }}
              className="text-neutral-black dark:text-dark-text-primary mb-3"
            >
              Konfirmasi Hapus
            </h2>
            <p className="text-base text-neutral-gray dark:text-dark-text-secondary mb-7">
              Hapus Blok <strong>{deleteTarget.nama}</strong>?
            </p>
            <div className="flex gap-3">
              <LoadingButton
                onClick={handleDelete}
                loading={deleting}
                className="px-6 py-3 bg-status-danger text-white rounded-lg"
              >
                Hapus
              </LoadingButton>
              <button
                onClick={() => setDeleteTarget(null)}
                className="btn-secondary text-base py-3"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
