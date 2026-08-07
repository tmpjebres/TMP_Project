"use client";

import { useMemo } from "react";
import { Plus, Search, X, ChevronDown, Users, ShieldCheck, UserCog, CircleDot } from "lucide-react";
import type { Role } from "@/types";
import { ToastContainer } from "@/components/ui/Toast";
import { useUserManagement } from "@/features/user/hooks/useUserManagement";
import { UserTable } from "./UserTable";
import { CreateUserModal } from "./CreateUserModal";
import { EditUserModal } from "./EditUserModal";
import { DeleteModal } from "./DeleteModal";

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  accent: "green" | "brass" | "neutral";
}) {
  const tint =
    accent === "green"
      ? "bg-green-light dark:bg-dark-brand-light text-green-primary dark:text-dark-brand-accent"
      : accent === "brass"
        ? "bg-brass-light text-brass-dark"
        : "bg-neutral-100 dark:bg-dark-surface-hover text-neutral-500 dark:text-dark-text-secondary";
  return (
    <div className="stat-card flex items-center gap-4 !p-5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}>
        <Icon size={18} />
      </div>
      <div>
        <p
          className="text-neutral-900 dark:text-dark-text-primary leading-none"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 22, fontWeight: 800 }}
        >
          {value}
        </p>
        <p className="text-xs text-neutral-400 dark:text-dark-text-muted mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const {
    currentUser,
    isMaster,
    users,
    filtered,
    loadingUsers,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    hasActiveFilter,
    resetFilters,
    modalOpen,
    setModalOpen,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleToggleStatus,
    togglingId,
    toasts,
    dismissToast,
  } = useUserManagement();

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      master: users.filter((u) => u.role === "master").length,
      operator: users.filter((u) => u.role === "operator").length,
    }),
    [users],
  );

  return (
    <>
      <div className="animate-fade-in flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="flex items-start justify-between mb-7">
          <div>
            
            <h1
              className="text-neutral-900 dark:text-dark-text-primary"
              style={{
                fontFamily: "Plus Jakarta Sans, sans-serif",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.4px",
              }}
            >
              User Management
            </h1>
            <p className="text-sm text-neutral-400 dark:text-dark-text-muted mt-1">
              Kelola akses dan aktivitas setiap pengguna sistem TMP.
            </p>
          </div>

          {isMaster && (
            <button onClick={() => setModalOpen(true)} className="btn-primary text-base">
              <Plus size={16} />
              Tambah User
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Total Pengguna" value={stats.total} accent="neutral" />
          <StatCard icon={CircleDot} label="Sedang Aktif" value={stats.active} accent="green" />
          <StatCard icon={ShieldCheck} label="Master" value={stats.master} accent="brass" />
          <StatCard icon={UserCog} label="Operator" value={stats.operator} accent="green" />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-dark-text-muted pointer-events-none"
            />
            <input
              type="text"
              placeholder="Cari nama, username, atau role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-dark-border
                bg-white dark:bg-dark-surface focus:border-green-accent dark:focus:border-dark-brand-primary focus:ring-2 focus:ring-green-light dark:focus:ring-dark-brand-light outline-none transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-dark-text-muted hover:text-neutral-600 dark:hover:text-dark-text-secondary"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
              className="appearance-none pl-3.5 pr-9 py-2.5 text-sm rounded-xl border border-neutral-200 dark:border-dark-border
                bg-white dark:bg-dark-surface focus:border-green-accent dark:focus:border-dark-brand-primary focus:ring-2 focus:ring-green-light dark:focus:ring-dark-brand-light outline-none transition-colors
                cursor-pointer"
            >
              <option value="all">Semua Role</option>
              <option value="master">Master</option>
              <option value="operator">Operator</option>
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-dark-text-muted pointer-events-none"
            />
          </div>
        </div>

        <div
          className="bg-white dark:bg-dark-surface rounded-2xl overflow-hidden flex-1"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <UserTable
            users={filtered}
            loading={loadingUsers}
            isMaster={isMaster}
            currentUserId={currentUser?.id}
            hasActiveFilter={hasActiveFilter}
            onResetFilter={resetFilters}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        </div>
      </div>

      {modalOpen && (
        <CreateUserModal onSave={handleCreate} onClose={() => setModalOpen(false)} />
      )}

      {editTarget && (
        <EditUserModal
          user={editTarget}
          currentUserId={currentUser?.id ?? ""}
          onSave={handleUpdate}
          onClose={() => setEditTarget(null)}
          onToggleStatus={handleToggleStatus}
          togglingId={togglingId}
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

      <ToastContainer toasts={toasts} dismiss={dismissToast} />
    </>
  );
}
