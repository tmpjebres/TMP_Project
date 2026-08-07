"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, X } from "lucide-react";
import type { AppUser, Role } from "@/types";
import { Avatar } from "./Avatar";
import { RoleBadge } from "./RoleBadge";

export function EditUserModal({
  user,
  currentUserId,
  onSave,
  onClose,
  onToggleStatus,
  togglingId,
}: {
  user: AppUser;
  currentUserId: string;
  onSave: (id: string, data: { username: string; fullName: string; role: Role }) => Promise<void>;
  onClose: () => void;
  onToggleStatus?: (user: AppUser) => void;
  togglingId?: string | null;
}) {
  const [form, setForm] = useState({
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSelf = user.id === currentUserId;

  const hasChanges =
    form.username.trim() !== user.username ||
    form.fullName.trim() !== user.fullName ||
    form.role !== user.role;

  const handleSave = async () => {
    setError("");
    if (!form.fullName.trim()) {
      setError("Nama lengkap tidak boleh kosong.");
      return;
    }
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
    await onSave(user.id, {
      username: form.username.trim(),
      fullName: form.fullName.trim(),
      role: form.role,
    });
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
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <Avatar username={user.username} role={user.role} />
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-dark-text-primary">Edit User</h2>
              <p className="text-xs text-neutral-400 dark:text-dark-text-muted">Bergabung {user.createdAt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-surface-hover rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={18} className="text-neutral-500 dark:text-dark-text-secondary" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-dark-text-primary mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface-hover
                focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white dark:focus:bg-dark-surface outline-none transition-colors"
              value={form.fullName}
              onChange={(e) => {
                setForm((f) => ({ ...f, fullName: e.target.value }));
                setError("");
              }}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-dark-text-primary mb-1.5">
              Username
            </label>
            <input
              type="text"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors outline-none
                ${error
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface-hover focus:form-input:focus focus:ring-2 focus:ring-violet-100 focus:bg-white dark:focus:bg-dark-surface"
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

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-dark-text-primary mb-1.5">
              Role
            </label>
            {isSelf ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface-hover">
                <RoleBadge role={form.role} />
                <span className="text-xs text-neutral-400 dark:text-dark-text-muted ml-auto">
                  Tidak bisa mengubah role sendiri
                </span>
              </div>
            ) : (
              <div className="relative">
                <select
                  className="w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface-hover
                    focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white dark:focus:bg-dark-surface outline-none transition-colors pr-9"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                  disabled={loading}
                >
                  <option value="operator">Operator</option>
                  <option value="master">Master</option>
                </select>
                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-dark-text-muted pointer-events-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-dark-text-primary mb-1.5">
              Status Akun
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface-hover">
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-dark-text-primary">
                  {user.isActive ? "Aktif" : "Nonaktif"}
                </p>
                <p className="text-xs text-neutral-400 dark:text-dark-text-muted">
                  {isSelf
                    ? "Tidak bisa menonaktifkan akun sendiri"
                    : user.isActive
                    ? "User dapat login ke sistem"
                    : "User tidak dapat login ke sistem"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggleStatus?.(user)}
                disabled={isSelf || togglingId === user.id}
                title={
                  isSelf
                    ? "Tidak bisa mengubah status sendiri"
                    : user.isActive
                    ? "Nonaktifkan user"
                    : "Aktifkan user"
                }
                className="relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: user.isActive ? "#10b981" : "#d4d4d4" }}
              >
                <span
                  className={`inline-flex items-center justify-center h-4 w-4 transform rounded-full bg-white dark:bg-dark-surface shadow-sm transition-transform duration-200 ${
                    user.isActive ? "translate-x-4" : "translate-x-0.5"
                  }`}
                >
                  {togglingId === user.id && (
                    <Loader2 size={10} className="animate-spin text-neutral-400 dark:text-dark-text-muted" />
                  )}
                </span>
              </button>
            </div>
          </div>

          {hasChanges && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <AlertTriangle size={12} /> Perubahan yang akan disimpan:
              </p>
              {form.fullName.trim() !== user.fullName && (
                <p>
                  Nama:{" "}
                  <span className="line-through text-neutral-500 dark:text-dark-text-secondary">{user.fullName}</span>{" "}
                  → <span className="font-semibold">{form.fullName.trim()}</span>
                </p>
              )}
              {form.username.trim() !== user.username && (
                <p>
                  Username:{" "}
                  <span className="line-through text-neutral-500 dark:text-dark-text-secondary">{user.username}</span>{" "}
                  → <span className="font-semibold">{form.username.trim()}</span>
                </p>
              )}
              {form.role !== user.role && (
                <p>
                  Role:{" "}
                  <span className="line-through text-neutral-500 dark:text-dark-text-secondary capitalize">{user.role}</span>{" "}
                  → <span className="font-semibold capitalize">{form.role}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-2.5">
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges || !form.username.trim() || !form.fullName.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-green-primary dark:bg-dark-brand-secondary text-white hover:bg-green-secondary dark:hover:bg-dark-brand-primary active:bg-green-primary dark:active:bg-dark-brand-secondary
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
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200 dark:border-dark-border
              text-neutral-600 dark:text-dark-text-secondary hover:bg-neutral-50 dark:hover:bg-dark-surface-hover active:bg-neutral-100 dark:active:bg-dark-surface-hover transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}