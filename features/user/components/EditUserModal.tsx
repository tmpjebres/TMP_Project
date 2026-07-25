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
}: {
  user: AppUser;
  currentUserId: string;
  onSave: (id: string, data: { username: string; fullName: string; role: Role }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSelf = user.id === currentUserId;

  // Detect changes
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
          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50
                focus:border-violet-400 focus:ring-2 focus:ring-violet-100 focus:bg-white outline-none transition-colors"
              value={form.fullName}
              onChange={(e) => {
                setForm((f) => ({ ...f, fullName: e.target.value }));
                setError("");
              }}
              disabled={loading}
            />
          </div>

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
              {form.fullName.trim() !== user.fullName && (
                <p>
                  Nama:{" "}
                  <span className="line-through text-neutral-500">{user.fullName}</span>{" "}
                  → <span className="font-semibold">{form.fullName.trim()}</span>
                </p>
              )}
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
            disabled={loading || !hasChanges || !form.username.trim() || !form.fullName.trim()}
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