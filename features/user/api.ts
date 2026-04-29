import { supabaseClient } from "@/lib/supabase/client";
import type { AppUser, Role } from "@/types";

function rowToAppUser(row: {
  id: string;
  username: string;
  role: string;
  created_at: string;
}): AppUser {
  return {
    id: row.id,
    username: row.username,
    role: row.role as Role,
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
    .select("id, username, role, created_at")
    .order("created_at", { ascending: true });

  if (error) return { data: [], error: error.message };
  return { data: (data ?? []).map(rowToAppUser) };
}

export async function updateUserProfile(
  userId: string,
  updates: { username?: string; role?: Role },
): Promise<{ data?: AppUser; error?: string }> {
  // Validasi input awal
  if (!userId) return { error: "ID user tidak valid." };

  const hasNoUpdates =
    updates.username === undefined && updates.role === undefined;
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

  const payload: Partial<{ username: string; role: Role }> = {};
  if (updates.username !== undefined) payload.username = updates.username;
  if (updates.role !== undefined) payload.role = updates.role;

  const { data, error } = await (supabaseClient
    .from("profiles") as any)
    .update(payload)
    .eq("id", userId)
    .select("id, username, role, created_at")
    .single();

  if (error) {
    // Handle unique constraint violation dari database
    if (error.code === "23505") {
      return { error: "Username sudah digunakan oleh user lain." };
    }
    return { error: "Gagal menyimpan perubahan. Coba lagi." };
  }

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