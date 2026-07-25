"use client";

import { useEffect, useMemo, useState } from "react";
import type { AppUser, Role } from "@/types";
import { useAuth } from "@/lib/context/auth-context";
import { getAllUsers, updateUserProfile } from "@/features/user/api";
import { useToast } from "./useToast";

export function useUserManagement() {
  const { user, session } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<AppUser | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
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

  // ─── Filter & Sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return users
      .filter((u) => {
        const q = search.toLowerCase();
        return (
          (roleFilter === "all" || u.role === roleFilter) &&
          (u.fullName.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => a.fullName.localeCompare(b.fullName, undefined, { sensitivity: "base" }));
  }, [users, search, roleFilter]);

  const hasActiveFilter = search !== "" || roleFilter !== "all";
  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
  };

  // ─── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (data: {
    username: string;
    fullName: string;
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
    data: { username: string; fullName: string; role: Role },
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

  return {
    currentUser: user,
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
    toasts,
    dismissToast: dismiss,
  };
}