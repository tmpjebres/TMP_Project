"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, Loader2, Plus, X } from "lucide-react";
import type { Role } from "@/types";

export function CreateUserModal({
  onSave,
  onClose,
}: {
  onSave: (d: { username: string; fullName: string; role: Role; password: string }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    role: "operator" as Role,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    fullName?: string;
    password?: string;
  }>({});

  const validate = (): boolean => {
    const errs: { username?: string; fullName?: string; password?: string } = {};
    if (!form.fullName.trim()) errs.fullName = "Nama lengkap wajib diisi.";

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
      await onSave({ ...form, username: form.username.trim(), fullName: form.fullName.trim() });
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
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-dark-border">
          <h2 className="text-base font-bold text-neutral-900 dark:text-dark-text-primary">Tambah User Baru</h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 hover:bg-neutral-100 dark:hover:bg-dark-surface-hover rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={18} className="text-neutral-500 dark:text-dark-text-secondary" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-dark-text-primary mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              autoFocus
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-colors
                ${fieldErrors.fullName
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface-hover focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white dark:focus:bg-dark-surface"
                }`}
              placeholder="contoh: John Doe"
              value={form.fullName}
              onChange={(e) => {
                setForm((f) => ({ ...f, fullName: e.target.value }));
                setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              disabled={loading}
            />
            {fieldErrors.fullName && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle size={11} />
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-dark-text-primary mb-1.5">
              Username
            </label>
            <input
              type="text"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-colors
                ${fieldErrors.username
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface-hover focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white dark:focus:bg-dark-surface"
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
            <label className="block text-sm font-semibold text-neutral-700 dark:text-dark-text-primary mb-1.5">
              Role
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-dark-border
                  bg-neutral-50 dark:bg-dark-surface-hover focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white dark:focus:bg-dark-surface
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-dark-text-muted pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-dark-text-primary mb-1.5">
              Password
            </label>
            <input
              type="password"
              className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-colors
                ${fieldErrors.password
                  ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  : "border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-surface-hover focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white dark:focus:bg-dark-surface"
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

        <div className="px-6 pb-6 flex gap-2.5">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-green-primary dark:bg-dark-brand-secondary text-white hover:bg-green-secondary dark:hover:bg-dark-brand-primary active:bg-green-950
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