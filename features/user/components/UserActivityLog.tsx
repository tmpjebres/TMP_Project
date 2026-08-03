"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Power,
  History,
  X,
} from "lucide-react";
import type { AppUser } from "@/types";
import { LoadingSpinner } from "@/components/ui/LoadingAnimation";
import { getUserById, getUserActivityLog, type UserActivityEntry } from "@/features/user/api";
import { Avatar } from "./Avatar";
import { RoleBadge } from "./RoleBadge";
import { StatusBadge } from "./StatusBadge";
import { ROUTES } from "@/lib/routes";

const ENTITY_LABEL: Record<string, string> = {
  tamu_umum: "Tamu Umum",
  tamu_rombongan: "Tamu Rombongan",
  makam: "Makam",
  blok: "Blok",
  jadwal_tamu: "Jadwal Tamu",
  user: "User",
  auth: "Login",
};

const ACTION_LABEL: Record<string, string> = {
  create: "Menambahkan",
  update: "Mengubah",
  delete: "Menghapus",
  activate: "Mengaktifkan",
  deactivate: "Menonaktifkan",
  login_success: "Berhasil login",
  login_failed: "Gagal login",
};

const FIELD_LABEL: Record<string, string> = {
  username: "Username",
  fullName: "Nama Lengkap",
  role: "Role",
  status: "Status",
  nama: "Nama",
  tujuan: "Tujuan",
  tanggal: "Tanggal",
  namaPimpinan: "Nama Pimpinan",
  instansi: "Instansi",
  jumlahPeserta: "Jumlah Peserta",
  nomor: "Nomor",
  kesatuan: "Kesatuan",
  kapasitas: "Kapasitas",
  namaKegiatan: "Nama Kegiatan",
  namaKetua: "Nama Ketua",
  tanggalMulai: "Tanggal Mulai",
  nrp: "NRP",
  pangkat: "Pangkat",
};

function EntryIcon({ action }: { action: string }) {
  const cls = "w-4 h-4";
  if (action === "login_success") return <LogIn className={`${cls} text-emerald-600`} />;
  if (action === "login_failed") return <LogOut className={`${cls} text-red-600`} />;
  if (action === "create") return <Plus className={`${cls} text-sky-600`} />;
  if (action === "update") return <Pencil className={`${cls} text-amber-600`} />;
  if (action === "delete") return <Trash2 className={`${cls} text-red-600`} />;
  return <Power className={`${cls} text-violet-600`} />;
}

function describeEntry(e: UserActivityEntry): string {
  const actionText = ACTION_LABEL[e.action] ?? e.action;
  if (e.entityType === "auth") return actionText;

  const entityText = ENTITY_LABEL[e.entityType] ?? e.entityType;
  return e.entityLabel ? `${actionText} ${entityText} "${e.entityLabel}"` : `${actionText} ${entityText}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Modal detail: rincian field yang berubah pada satu entri log
function ActivityDetailModal({ entry, onClose }: { entry: UserActivityEntry; onClose: () => void }) {
  const fields = entry.changes ? Object.entries(entry.changes) : [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-neutral-100">
          <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center">
            <EntryIcon action={entry.action} />
          </div>
          <h3 className="text-sm font-semibold text-neutral-800 flex-1">{describeEntry(entry)}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-neutral-400 mb-3">{formatDateTime(entry.createdAt)}</p>

          {fields.length === 0 ? (
            <div className="rounded-xl border border-neutral-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Aktivitas</span>
                <span className="text-neutral-700 font-medium">{ACTION_LABEL[entry.action] ?? entry.action}</span>
              </div>
              {entry.entityType !== "auth" && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Jenis Data</span>
                  <span className="text-neutral-700 font-medium">{ENTITY_LABEL[entry.entityType] ?? entry.entityType}</span>
                </div>
              )}
              {entry.entityLabel && (
                <div className="flex justify-between">
                  <span className="text-neutral-400">Nama</span>
                  <span className="text-neutral-700 font-medium">{entry.entityLabel}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-400">Waktu</span>
                <span className="text-neutral-700 font-medium">{formatDateTime(entry.createdAt)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {fields.map(([field, diff]) => (
                <div key={field} className="rounded-xl border border-neutral-100 p-3">
                  <p className="text-xs font-semibold text-neutral-500 mb-1.5">{FIELD_LABEL[field] ?? field}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 rounded-md bg-red-50 text-red-600 line-through">{diff.from}</span>
                    <span className="text-neutral-300">→</span>
                    <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">{diff.to}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UserActivityLog({ userId }: { userId: string }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [entries, setEntries] = useState<UserActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UserActivityEntry | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);

    (async () => {
      const userRes = await getUserById(userId);
      if (!active) return;
      if (!userRes.data) {
        setError(userRes.error ?? "User tidak ditemukan.");
        setLoading(false);
        return;
      }
      setUser(userRes.data);

      const logRes = await getUserActivityLog(userId, userRes.data.username);
      if (!active) return;
      setEntries(logRes.data);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  if (loading) return <LoadingSpinner />;

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-400">
        <p className="text-sm font-medium">{error ?? "User tidak ditemukan."}</p>
        <Link href={ROUTES["user-management"]} className="text-xs text-violet-500 hover:underline">
          Kembali ke User Management
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col min-h-[calc(100vh-8rem)]">
      <Link
        href={ROUTES["user-management"]}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 mb-4 w-fit"
      >
        <ArrowLeft size={15} />
        Kembali
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <Avatar username={user.username} role={user.role} />
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-neutral-900"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 22, fontWeight: 800 }}
            >
              {user.fullName}
            </h1>
            <RoleBadge role={user.role} />
            <StatusBadge isActive={user.isActive} />
          </div>
          <p className="text-sm text-neutral-400">@{user.username}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl flex-1" style={{ border: "1px solid #e5e7eb" }}>
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center gap-2">
          <History size={16} className="text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-700">Log Aktivitas</h2>
          <span className="text-xs text-neutral-400 ml-auto">{entries.length} aktivitas</span>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-neutral-400">
            <History size={28} className="opacity-30" />
            <p className="text-sm font-medium">Belum ada aktivitas tercatat.</p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-50">
            {entries.map((e) => (
              <li
                key={e.id}
                onClick={() => setSelected(e)}
                className="flex items-center gap-3 px-5 py-3.5 cursor-pointer hover:bg-neutral-50/80"
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center flex-shrink-0">
                  <EntryIcon action={e.action} />
                </div>
                <p className="text-sm text-neutral-700 flex-1">{describeEntry(e)}</p>
                <span className="text-xs text-neutral-400 flex-shrink-0">{formatDateTime(e.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected && <ActivityDetailModal entry={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
