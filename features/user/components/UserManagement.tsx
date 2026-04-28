"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Pencil,
  Shield,
  User,
  AlertTriangle,
  Loader2,
  Search,
  ChevronDown,
} from "lucide-react";
import { AppUser, Role } from "@/types";
import { useAuth } from "@/lib/context/auth-context";
import { getAllUsers, updateUserProfile, deleteUserProfile } from "@/features/user/api";
import { LoadingSpinner } from "@/components/ui/LoadingAnimation";

// ─── Types ─────────────────────────────────────────────────────────────────

type Toast = { id: number; message: string; type: "success" | "error" };

// ─── Toast ──────────────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const push = (message: string, type: Toast["type"] = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, push, dismiss };
}

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg cursor-pointer
            text-sm font-medium transition-all duration-300 animate-slide-up max-w-sm
            ${t.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
            }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Role Badge ─────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  if (role === "master") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-100 text-violet-700 border border-violet-200">
        <Shield size={11} />
        Master
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-700 border border-sky-200">
      <User size={11} />
      Operator
    </span>
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────

function Avatar({ username, role }: { username: string; role: Role }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
        ${role === "master"
          ? "bg-violet-100 text-violet-700"
          : "bg-sky-100 text-sky-700"
        }`}
    >
      {initials}
    </div>
  );
}

// ─── Edit User Modal ─────────────────────────────────────────────────────────

function EditUserModal({
  user,
  currentUserId,
  onSave,
  onClose,
}: {
  user: AppUser;
  currentUserId: string;
  onSave: (id: string, data: { username: string; role: Role }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ username: user.username, role: user.role });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSelf = user.id === currentUserId;

  // Detect changes
  const hasChanges =
    form.username.trim() !== user.username || form.role !== user.role;

  const handleSave = async () => {
    setError("");
    if (!form.username.trim()) {
      setError("Username tidak boleh kosong.");
      return;
    }
    if (form.username.trim().length < 3) {
      setError("Username minimal 3 karakter.");
      return;
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(form.username.trim())) {
      setError("Gunakan huruf, angka, atau simbol _ . - saja.");
      return;
    }
    setLoading(true);
    await onSave(user.id, { username: form.username.trim(), role: form.role });
    setLoading(false);
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <Avatar username={user.username} role={user.role} />
            <div>
              <h2 className="text-base font-bold text-neutral-900">Edit User</h2>
              <p className="text-xs text-neutral-400">Bergabung {user.createdAt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors outline-none
                ${error
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-neutral-200 bg-neutral-50 focus:form-input:focus focus:ring-2 focus:ring-violet-100 focus:bg-white"
                }`}
              value={form.username}
              onChange={(e) => {
                setForm((f) => ({ ...f, username: e.target.value }));
                setError("");
              }}
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle size={11} />
                {error}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Role
            </label>
            {isSelf ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50">
                <RoleBadge role={form.role} />
                <span className="text-xs text-neutral-400 ml-auto">
                  Tidak bisa mengubah role sendiri
                </span>
              </div>
            ) : (
              <div className="relative">
                <select
                  className="w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50
                    focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white outline-none transition-colors pr-9"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                  disabled={loading}
                >
                  <option value="operator">Operator</option>
                  <option value="master">Master</option>
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
                />
              </div>
            )}
          </div>

          {/* Preview changes */}
          {hasChanges && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle size={12} /> Perubahan yang akan disimpan:
              </p>
              {form.username.trim() !== user.username && (
                <p>
                  Username:{" "}
                  <span className="line-through text-neutral-500">{user.username}</span>{" "}
                  → <span className="font-semibold">{form.username.trim()}</span>
                </p>
              )}
              {form.role !== user.role && (
                <p>
                  Role:{" "}
                  <span className="line-through text-neutral-500 capitalize">{user.role}</span>{" "}
                  → <span className="font-semibold capitalize">{form.role}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2.5">
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges || !form.username.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-green-primary text-white hover:bg-green-secondary active:bg-green-primary
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                Simpan Perubahan
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200
              text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({
  user,
  loading,
  onConfirm,
  onClose,
}: {
  user: AppUser;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          {/* Icon */}
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 mb-1">Hapus User?</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Akun <span className="font-semibold text-neutral-800">{user.username}</span>{" "}
            akan dihapus secara permanen dan tidak bisa dikembalikan.
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-2.5">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              text-sm font-semibold bg-red-600 text-white hover:bg-red-700 active:bg-red-800
              disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              "Ya, Hapus"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200
              text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Create User Modal ───────────────────────────────────────────────────────

function CreateUserModal({
  onSave,
  onClose,
}: {
  onSave: (d: { username: string; role: Role; password: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    username: "",
    role: "operator" as Role,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});

  const validate = (): boolean => {
    const errs: { username?: string; password?: string } = {};
    if (!form.username.trim()) errs.username = "Username wajib diisi.";
    else if (form.username.trim().length < 3) errs.username = "Minimal 3 karakter.";
    else if (!/^[a-zA-Z0-9_.-]+$/.test(form.username.trim()))
      errs.username = "Gunakan huruf, angka, atau simbol _ . - saja.";

    if (!form.password) errs.password = "Password wajib diisi.";
    else if (form.password.length < 8) errs.password = "Minimal 8 karakter.";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave({ ...form, username: form.username.trim() });
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    }
    setLoading(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100">
          <h2 className="text-base font-bold text-neutral-900">Tambah User Baru</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Username
            </label>
            <input
              type="text"
              autoFocus
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-colors
                ${fieldErrors.username
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-neutral-200 bg-neutral-50 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white"
                }`}
              placeholder="contoh: john_doe"
              value={form.username}
              onChange={(e) => {
                setForm((f) => ({ ...f, username: e.target.value }));
                setFieldErrors((prev) => ({ ...prev, username: undefined }));
              }}
              disabled={loading}
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle size={11} />
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Role
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200
                  bg-neutral-50 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white
                  outline-none transition-colors pr-9"
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value as Role }))
                }
                disabled={loading}
              >
                <option value="operator">Operator</option>
                <option value="master">Master</option>
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-colors
                ${fieldErrors.password
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-neutral-200 bg-neutral-50 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white"
                }`}
              placeholder="Min. 8 karakter"
              value={form.password}
              onChange={(e) => {
                setForm((f) => ({ ...f, password: e.target.value }));
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              disabled={loading}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle size={11} />
                {fieldErrors.password}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-2.5">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-green-primary text-white hover:bg-green-secondary active:bg-green-950
              disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Membuat...
              </>
            ) : (
              <>
                <Plus size={15} />
                Buat User
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200
              text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function UserManagement() {
  const { user, session } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<AppUser | null>(null);
  const [search, setSearch] = useState("");
  const { toasts, push: pushToast, dismiss } = useToast();

  const isMaster = user?.role === "master";

  // ─── Load users ────────────────────────────────────────────────────────────
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      const { data, error } = await getAllUsers();
      if (error) pushToast(error, "error");
      else setUsers(data);
      setLoadingUsers(false);
    };
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Filter ────────────────────────────────────────────────────────────────
  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase()),
  );

  // ─── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (data: {
    username: string;
    role: Role;
    password: string;
  }) => {
    if (!session?.access_token) {
      pushToast("Sesi tidak valid. Silakan login ulang.", "error");
      return;
    }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(data),
    });

    const result = (await res.json()) as { data?: AppUser; error?: string };

    if (!res.ok || result.error) {
      pushToast(result.error ?? "Gagal membuat user.", "error");
      return;
    }

    if (result.data) {
      setUsers((prev) => [...prev, result.data!]);
      pushToast(`User "${result.data.username}" berhasil dibuat.`, "success");
    }
    setModalOpen(false);
  };

  // ─── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async (
    userId: string,
    data: { username: string; role: Role },
  ) => {
    const { data: updated, error } = await updateUserProfile(userId, data);

    if (error) {
      pushToast(error, "error");
      return;
    }

    if (updated) {
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      pushToast(`User "${updated.username}" berhasil diperbarui.`, "success");
    }
    setEditTarget(null);
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget || !session?.access_token) return;

    setDeleteLoading(true);

    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ userId: deleteTarget.id }),
    });

    const result = (await res.json()) as { success?: boolean; error?: string };
    setDeleteLoading(false);

    if (!res.ok || result.error) {
      pushToast(result.error ?? "Gagal menghapus user.", "error");
      setDeleteTarget(null);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    pushToast(`User "${deleteTarget.username}" berhasil dihapus.`, "success");
    setDeleteTarget(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out both; }
      `}</style>

      <div className="animate-fade-in flex flex-col min-h-[calc(100vh-8rem)]">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1
              className="text-neutral-900"
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 26,
                fontWeight: 800,
                letterSpacing: "-0.3px",
              }}
            >
              User Management
            </h1>
            <p className="text-sm text-neutral-400 mt-0.5">
              {users.length} user terdaftar
            </p>
          </div>

          {isMaster && (
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-base"
            >
              <Plus size={16} />
              Tambah User
            </button>
          )}
        </div>

        {/* ── Search ── */}
        <div className="relative mb-4">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Cari username atau role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200
              bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div
          className="bg-white rounded-2xl overflow-hidden flex-1"
          style={{ border: "1px solid #e5e7eb" }}
        >
          {loadingUsers ?
          <LoadingSpinner/> : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-neutral-400">
              <User size={32} className="opacity-30" />
              <p className="text-sm font-medium">
                {search ? "Tidak ada hasil yang cocok." : "Belum ada user."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs text-violet-500 hover:underline"
                >
                  Reset pencarian
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/60">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      User
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Role
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Bergabung
                    </th>
                    {isMaster && (
                      <th className="px-5 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wide text-right">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {filtered.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-neutral-50/80 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar username={u.username} role={u.role} />
                          <div>
                            <span className="font-semibold text-neutral-900">
                              {u.username}
                            </span>
                            {u.id === user?.id && (
                              <span className="ml-2 text-xs text-violet-500 font-medium bg-violet-50 px-1.5 py-0.5 rounded-md">
                                Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <RoleBadge role={u.role} />
                      </td>
                      <td className="px-5 py-3.5 text-neutral-400 text-xs">
                        {u.createdAt}
                      </td>
                      {isMaster && (
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Edit */}
                            <button
                              onClick={() => setEditTarget(u)}
                              title="Edit user"
                              className="p-1.5 rounded-lg hover:bg-violet-50 text-neutral-400 hover:text-violet-600 transition-colors"
                            >
                              <Pencil size={15} />
                            </button>

                            {/* Delete — tidak bisa hapus diri sendiri */}
                            {u.id !== user?.id ? (
                              <button
                                onClick={() => setDeleteTarget(u)}
                                title="Hapus user"
                                className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : (
                              <div className="w-[30px]" />
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {modalOpen && (
        <CreateUserModal
          onSave={handleCreate}
          onClose={() => setModalOpen(false)}
        />
      )}

      {editTarget && (
        <EditUserModal
          user={editTarget}
          currentUserId={user?.id ?? ""}
          onSave={handleUpdate}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          loading={deleteLoading}
          onConfirm={handleDelete}
          onClose={() => !deleteLoading && setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ── */}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
}