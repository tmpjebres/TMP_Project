import { supabaseClient } from "@/lib/supabase/client";
import { logActivity, type ActivityChanges } from "@/lib/activity-log";
import type { AppUser, Role } from "@/types";

const ROLE_LABEL: Record<Role, string> = { master: "Master", operator: "Operator" };

function rowToAppUser(row: {
  id: string;
  username: string;
  full_name: string | null;
  role: string;
  is_active: boolean | null;
  last_login_at: string | null;
  created_at: string;
}): AppUser {
  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name ?? row.username,
    role: row.role as Role,
    isActive: row.is_active ?? true,
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at.split("T")[0],
  };
}

/** Ambil role dari current user yang sedang login */
async function getCurrentUserRole(): Promise<{
  userId: string | null;
  role: Role | null;
  error?: string;
}> {
  const {
    data: { user: currentUser },
    error: authError,
  } = await supabaseClient.auth.getUser();

  if (authError || !currentUser?.id) {
    return { userId: null, role: null, error: "Sesi tidak valid. Silakan login ulang." };
  }

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .single<{ role: Role }>();

  if (profileError || !profile) {
    return { userId: currentUser.id, role: null, error: "Gagal memverifikasi hak akses." };
  }

  return { userId: currentUser.id, role: profile.role };
}

export async function getAllUsers(): Promise<{
  data: AppUser[];
  error?: string;
}> {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, username, full_name, role, is_active, last_login_at, created_at")
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []).map(rowToAppUser) };
}

export async function updateUserProfile(
  userId: string,
  updates: { username?: string; fullName?: string; role?: Role },
): Promise<{ data?: AppUser; error?: string }> {
  // Validasi input awal
  if (!userId) return { error: "ID user tidak valid." };

  const hasNoUpdates =
    updates.username === undefined &&
    updates.fullName === undefined &&
    updates.role === undefined;
  if (hasNoUpdates) return { error: "Tidak ada perubahan yang dikirim." };

  if (updates.username !== undefined) {
    const trimmed = updates.username.trim();
    if (!trimmed) return { error: "Username tidak boleh kosong." };
    if (trimmed.length < 3) return { error: "Username minimal 3 karakter." };
    if (trimmed.length > 50) return { error: "Username maksimal 50 karakter." };
    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
      return { error: "Username hanya boleh mengandung huruf, angka, dan simbol _ . -" };
    }
    updates = { ...updates, username: trimmed };
  }

  if (updates.fullName !== undefined) {
    const trimmed = updates.fullName.trim();
    if (!trimmed) return { error: "Nama lengkap tidak boleh kosong." };
    updates = { ...updates, fullName: trimmed };
  }

  // Verifikasi hak akses
  const { userId: currentUserId, role: currentRole, error: authErr } =
    await getCurrentUserRole();

  if (authErr) return { error: authErr };
  if (currentRole !== "master") {
    return { error: "Hanya master yang dapat mengubah data user." };
  }

  // Master tidak boleh downgrade diri sendiri
  if (currentUserId === userId && updates.role && updates.role !== "master") {
    return { error: "Master tidak dapat mengubah role dirinya sendiri." };
  }

  // Cek apakah username sudah dipakai user lain
  if (updates.username) {
    const { data: existing, error: dupError } = await supabaseClient
      .from("profiles")
      .select("id")
      .eq("username", updates.username)
      .neq("id", userId)
      .maybeSingle();

    if (dupError) return { error: "Gagal memverifikasi keunikan username." };
    if (existing) return { error: "Username sudah digunakan oleh user lain." };
  }

  const { data: oldProfile } = await supabaseClient
    .from("profiles")
    .select("username, full_name, role")
    .eq("id", userId)
    .single<{ username: string; full_name: string | null; role: Role }>();

  const payload: Partial<{ username: string; full_name: string; role: Role }> = {};
  if (updates.username !== undefined) payload.username = updates.username;
  if (updates.fullName !== undefined) payload.full_name = updates.fullName;
  if (updates.role !== undefined) payload.role = updates.role;

  const { data, error } = await (supabaseClient
    .from("profiles") as any)
    .update(payload)
    .eq("id", userId)
    .select("id, username, full_name, role, is_active, last_login_at, created_at")
    .single();

  if (error) {
    // Handle unique constraint violation dari database
    if (error.code === "23505") {
      return { error: "Username sudah digunakan oleh user lain." };
    }
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

  const changes: ActivityChanges = {};
  if (oldProfile) {
    if (updates.username !== undefined && updates.username !== oldProfile.username) {
      changes.username = { from: oldProfile.username, to: updates.username };
    }
    if (updates.fullName !== undefined && updates.fullName !== (oldProfile.full_name ?? "")) {
      changes.fullName = { from: oldProfile.full_name ?? "-", to: updates.fullName };
    }
    if (updates.role !== undefined && updates.role !== oldProfile.role) {
      changes.role = { from: ROLE_LABEL[oldProfile.role], to: ROLE_LABEL[updates.role] };
    }
  }

  logActivity("update", "user", data.username, changes);
  return { data: rowToAppUser(data) };
}

export async function toggleUserStatus(
  userId: string,
  isActive: boolean,
): Promise<{ data?: AppUser; error?: string }> {
  if (!userId) return { error: "ID user tidak valid." };

  const { userId: currentUserId, role: currentRole, error: authErr } =
    await getCurrentUserRole();

  if (authErr) return { error: authErr };
  if (currentRole !== "master") {
    return { error: "Hanya master yang dapat mengubah status user." };
  }
  if (currentUserId === userId) {
    return { error: "Tidak dapat menonaktifkan akun sendiri." };
  }

  const { data, error } = await (supabaseClient
    .from("profiles") as any)
    .update({ is_active: isActive })
    .eq("id", userId)
    .select("id, username, full_name, role, is_active, last_login_at, created_at")
    .single();

  if (error) return { error: "Gagal mengubah status user. Coba lagi." };
  logActivity(isActive ? "activate" : "deactivate", "user", data.username, {
    status: { from: isActive ? "Nonaktif" : "Aktif", to: isActive ? "Aktif" : "Nonaktif" },
  });
  return { data: rowToAppUser(data) };
}

export interface UserActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityLabel: string | null;
  changes: Record<string, { from: string; to: string }> | null;
  createdAt: string;
}

/** Gabungan activity_log + login_attempts untuk satu user, diurutkan terbaru dulu */
export async function getUserActivityLog(
  userId: string,
  username: string,
): Promise<{ data: UserActivityEntry[]; error?: string }> {
  const [logRes, loginRes] = await Promise.all([
    supabaseClient
      .from("activity_log")
      .select("*")
      .eq("actor_id", userId)
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseClient
      .from("login_attempts")
      .select("*")
      .eq("username", username)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (logRes.error) return { data: [], error: logRes.error.message };

  const activityEntries: UserActivityEntry[] = (logRes.data ?? []).map((row: any) => ({
    id: `act-${row.id}`,
    action: row.action,
    entityType: row.entity_type,
    entityLabel: row.entity_label,
    changes: row.changes ?? null,
    createdAt: row.created_at,
  }));

  const loginEntries: UserActivityEntry[] = (loginRes.data ?? []).map((row: any) => ({
    id: `login-${row.id}`,
    action: row.success ? "login_success" : "login_failed",
    entityType: "auth",
    entityLabel: null,
    changes: null,
    createdAt: row.created_at,
  }));

  const merged = [...activityEntries, ...loginEntries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return { data: merged };
}

export async function getUserById(userId: string): Promise<{ data: AppUser | null; error?: string }> {
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!userId || !uuidRe.test(userId)) return { data: null, error: "User tidak ditemukan." };

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, username, full_name, role, is_active, last_login_at, created_at")
    .eq("id", userId)
    .single();

  if (error || !data) return { data: null, error: error?.message ?? "User tidak ditemukan." };
  return { data: rowToAppUser(data) };
}

export async function deleteUserProfile(
  userId: string,
): Promise<{ error?: string }> {
  if (!userId) return { error: "ID user tidak valid." };

  const { userId: currentUserId, role: currentRole, error: authErr } =
    await getCurrentUserRole();

  if (authErr) return { error: authErr };
  if (currentRole !== "master") {
    return { error: "Hanya master yang dapat menghapus user." };
  }
  if (currentUserId === userId) {
    return { error: "Tidak dapat menghapus akun sendiri." };
  }

  const { error } = await (supabaseClient
    .from("profiles") as any)
    .delete()
    .eq("id", userId);

  if (error) return { error: "Gagal menghapus user. Coba lagi." };
  return {};
}