"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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

// Warna & ikon tiap jenis aktivitas — selaras dengan identitas hijau/brass TMP
function iconStyle(action: string): { icon: typeof Plus; bg: string; fg: string } {
  switch (action) {
    case "login_success":
      return { icon: LogIn, bg: "bg-green-light", fg: "text-green-primary" };
    case "login_failed":
      return { icon: LogOut, bg: "bg-red-50", fg: "text-red-600" };
    case "create":
      return { icon: Plus, bg: "bg-green-light", fg: "text-green-primary" };
    case "update":
      return { icon: Pencil, bg: "bg-brass-light", fg: "text-brass-dark" };
    case "delete":
      return { icon: Trash2, bg: "bg-red-50", fg: "text-red-600" };
    default:
      return { icon: Power, bg: "bg-neutral-100", fg: "text-neutral-500" };
  }
}

function EntryIcon({ action }: { action: string }) {
  const { icon: Icon, bg, fg } = iconStyle(action);
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-white ${bg}`}>
      <Icon size={15} className={fg} />
    </div>
  );
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
// Dirender lewat portal ke document.body supaya position:fixed-nya benar-benar
// relatif ke viewport, bukan ke ancestor manapun (mis. elemen ber-animasi
// yang meninggalkan `transform` residual dan membuat containing block baru).
function ActivityDetailModal({ entry, onClose }: { entry: UserActivityEntry; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fields = entry.changes ? Object.entries(entry.changes) : [];

  const modal = (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 flex-shrink-0">
          <EntryIcon action={entry.action} />
          <h3
            className="text-sm font-semibold text-neutral-800 flex-1"
            style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
          >
            {describeEntry(entry)}
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto">
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
                    <span className="px-2 py-1 rounded-md bg-green-light text-green-primary font-medium">{diff.to}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
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
        <Link href={ROUTES["user-management"]} className="text-xs text-green-primary font-medium hover:underline">
          Kembali ke User Management
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col min-h-[calc(100vh-8rem)]">
      <Link
        href={ROUTES["user-management"]}
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 mb-5 w-fit transition-colors"
      >
        <ArrowLeft size={15} />
        Kembali
      </Link>

      {/* ── Hero identitas pengguna ── */}
      <div className="bg-white rounded-2xl p-6 mb-6 flex items-center gap-5" style={{ border: "1px solid #e5e7eb" }}>
        <div className="scale-[1.8] ml-2">
          <Avatar username={user.username} role={user.role} />
        </div>
        <div className="ml-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1
              className="text-neutral-900"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: "-0.3px" }}
            >
              {user.fullName}
            </h1>
            <RoleBadge role={user.role} />
            <StatusBadge isActive={user.isActive} />
          </div>
          <p className="text-sm text-neutral-400 mt-0.5">@{user.username}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl flex-1" style={{ border: "1px solid #e5e7eb" }}>
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
          <History size={16} className="text-brass-dark" />
          <h2 className="text-sm font-semibold text-neutral-700" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
            Riwayat Aktivitas
          </h2>
          <span className="text-xs text-neutral-400 ml-auto">{entries.length} aktivitas tercatat</span>
        </div>

        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-neutral-400">
            <History size={28} className="opacity-30" />
            <p className="text-sm font-medium">Belum ada aktivitas tercatat.</p>
          </div>
        ) : (
          <ul className="relative px-6 py-2">
            {/* Garis waktu vertikal menghubungkan setiap catatan */}
            <span className="absolute left-[38px] top-2 bottom-2 w-px bg-neutral-100" aria-hidden="true" />
            {entries.map((e) => (
              <li
                key={e.id}
                onClick={() => setSelected(e)}
                className="relative flex items-center gap-4 py-3 cursor-pointer group"
              >
                <EntryIcon action={e.action} />
                <div className="flex-1 min-w-0 rounded-xl px-3 py-2 -my-2 transition-colors group-hover:bg-neutral-50/80">
                  <p className="text-sm text-neutral-700 truncate">{describeEntry(e)}</p>
                </div>
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