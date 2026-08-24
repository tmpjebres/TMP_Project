import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { Role } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      username: string;
      fullName: string;
      password: string;
      role: Role;
    };

    if (!body.fullName?.trim()) {
      return NextResponse.json(
        { error: "Nama lengkap wajib diisi." },
        { status: 400 },
      );
    }
    if (!body.username?.trim()) {
      return NextResponse.json(
        { error: "Username wajib diisi." },
        { status: 400 },
      );
    }
    if (!body.password || body.password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 },
      );
    }
    if (!["master", "operator"].includes(body.role)) {
      return NextResponse.json({ error: "Role tidak valid." }, { status: 400 });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const serverClient = createServerSupabaseClient();
    const {
      data: { user: caller },
      error: verifyError,
    } = await serverClient.auth.getUser(token);

    if (verifyError || !caller) {
      return NextResponse.json(
        { error: "Token tidak valid." },
        { status: 401 },
      );
    }

    const { data: callerProfile } = await serverClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single<{ role: Role }>();

    if (callerProfile?.role !== "master") {
      return NextResponse.json(
        { error: "Hanya master yang dapat membuat user." },
        { status: 403 },
      );
    }

    const { data: existing } = await serverClient
      .from("profiles")
      .select("id")
      .eq("username", body.username.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Username sudah digunakan." },
        { status: 409 },
      );
    }

    const email = `${body.username.toLowerCase().trim()}@makam.app`;


    const { data: newUser, error: createError } =
      await serverClient.auth.admin.createUser({
        email,
        password: body.password,
        email_confirm: true,
        user_metadata: {
          username: body.username.trim(),
          full_name: body.fullName.trim(),
          role: body.role,
        },
      });

    if (createError || !newUser.user) {
      return NextResponse.json(
        { error: createError?.message ?? "Gagal membuat user." },
        { status: 500 },
      );
    }

    const { error: profileUpdateError } = await (
      serverClient.from("profiles") as any
    )
      .update({ full_name: body.fullName.trim() })
      .eq("id", newUser.user.id);

    if (profileUpdateError) {
      console.error(
        "[API/users POST] gagal set full_name:",
        profileUpdateError.message,
      );
    }

    const { data: profile } = await serverClient
      .from("profiles")
      .select(
        "id, username, full_name, role, is_active, last_login_at, created_at",
      )
      .eq("id", newUser.user.id)
      .single<{
        id: string;
        username: string;
        full_name: string;
        role: Role;
        is_active: boolean;
        last_login_at: string | null;
        created_at: string;
      }>();

    await (serverClient.from("activity_log") as any).insert({
      actor_id: caller.id,
      action: "create",
      entity_type: "user",
      entity_label: body.username.trim(),
      changes: {
        username: { from: "-", to: body.username.trim() },
        fullName: { from: "-", to: body.fullName.trim() },
        role: { from: "-", to: body.role },
      },
    });

    return NextResponse.json({
      data: {
        id: newUser.user.id,
        username: profile?.username ?? body.username.trim(),
        fullName: profile?.full_name ?? body.fullName.trim(),
        role: profile?.role ?? body.role,
        isActive: profile?.is_active ?? true,
        lastLoginAt: profile?.last_login_at ?? null,
        createdAt: (profile?.created_at ?? new Date().toISOString()).split(
          "T",
        )[0],
      },
    });
  } catch (err) {
    console.error("[API/users POST]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      userId: string;
      username?: string;
      fullName?: string;
      role?: Role;
    };

    if (!body.userId) {
      return NextResponse.json(
        { error: "userId wajib diisi." },
        { status: 400 },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const serverClient = createServerSupabaseClient();
    const {
      data: { user: caller },
      error: verifyError,
    } = await serverClient.auth.getUser(token);

    if (verifyError || !caller) {
      return NextResponse.json(
        { error: "Token tidak valid." },
        { status: 401 },
      );
    }

    const { data: callerProfile } = await serverClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single<{ role: Role }>();

    if (callerProfile?.role !== "master") {
      return NextResponse.json(
        { error: "Hanya master yang dapat mengubah data user." },
        { status: 403 },
      );
    }

    if (caller.id === body.userId && body.role && body.role !== "master") {
      return NextResponse.json(
        { error: "Master tidak dapat mengubah role dirinya sendiri." },
        { status: 400 },
      );
    }

    const { data: oldProfile } = await serverClient
      .from("profiles")
      .select("username, full_name, role")
      .eq("id", body.userId)
      .single<{ username: string; full_name: string | null; role: Role }>();

    if (!oldProfile) {
      return NextResponse.json(
        { error: "User tidak ditemukan." },
        { status: 404 },
      );
    }

    let username = oldProfile.username;
    if (body.username !== undefined) {
      const trimmed = body.username.trim();
      if (!trimmed) {
        return NextResponse.json(
          { error: "Username tidak boleh kosong." },
          { status: 400 },
        );
      }
      if (trimmed.length < 3 || trimmed.length > 50) {
        return NextResponse.json(
          { error: "Username harus 3-50 karakter." },
          { status: 400 },
        );
      }
      if (!/^[a-zA-Z0-9_.-]+$/.test(trimmed)) {
        return NextResponse.json(
          {
            error:
              "Username hanya boleh mengandung huruf, angka, dan simbol _ . -",
          },
          { status: 400 },
        );
      }
      username = trimmed;

      if (username.toLowerCase() !== oldProfile.username.toLowerCase()) {
        const { data: existing } = await serverClient
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", body.userId)
          .maybeSingle();

        if (existing) {
          return NextResponse.json(
            { error: "Username sudah digunakan oleh user lain." },
            { status: 409 },
          );
        }
      }
    }

    const fullName =
      body.fullName !== undefined ? body.fullName.trim() : oldProfile.full_name;
    if (body.fullName !== undefined && !fullName) {
      return NextResponse.json(
        { error: "Nama lengkap tidak boleh kosong." },
        { status: 400 },
      );
    }
    const role = body.role !== undefined ? body.role : oldProfile.role;

    const usernameChanged = username !== oldProfile.username;
    if (usernameChanged) {
      const newEmail = `${username.toLowerCase()}@makam.app`;
      const { error: authUpdateError } =
        await serverClient.auth.admin.updateUserById(body.userId, {
          email: newEmail,
          email_confirm: true,
          user_metadata: {
            username,
            full_name: fullName,
            role,
          },
        });

      if (authUpdateError) {
        if ((authUpdateError as { code?: string }).code === "email_exists") {
          return NextResponse.json(
            { error: "Username sudah digunakan oleh user lain." },
            { status: 409 },
          );
        }
        return NextResponse.json(
          { error: authUpdateError.message },
          { status: 500 },
        );
      }
    }

    const payload: Partial<{
      username: string;
      full_name: string;
      role: Role;
    }> = {};
    if (body.username !== undefined) payload.username = username;
    if (body.fullName !== undefined) payload.full_name = fullName as string;
    if (body.role !== undefined) payload.role = role;

    const { data: updated, error: updateError } = await (
      serverClient.from("profiles") as any
    )
      .update(payload)
      .eq("id", body.userId)
      .select(
        "id, username, full_name, role, is_active, last_login_at, created_at",
      )
      .single<{
        id: string;
        username: string;
        full_name: string | null;
        role: Role;
        is_active: boolean | null;
        last_login_at: string | null;
        created_at: string;
      }>();

    if (updateError || !updated) {
      if (usernameChanged) {
        await serverClient.auth.admin.updateUserById(body.userId, {
          email: `${oldProfile.username.toLowerCase()}@makam.app`,
        });
      }
      if (updateError?.code === "23505") {
        return NextResponse.json(
          { error: "Username sudah digunakan oleh user lain." },
          { status: 409 },
        );
      }
      return NextResponse.json(
        { error: "Gagal menyimpan perubahan. Coba lagi." },
        { status: 500 },
      );
    }

    const changes: Record<string, { from: string; to: string }> = {};
    if (body.username !== undefined && username !== oldProfile.username) {
      changes.username = { from: oldProfile.username, to: username };
    }
    if (
      body.fullName !== undefined &&
      fullName !== (oldProfile.full_name ?? "")
    ) {
      changes.fullName = {
        from: oldProfile.full_name ?? "-",
        to: fullName as string,
      };
    }
    if (body.role !== undefined && role !== oldProfile.role) {
      changes.role = { from: oldProfile.role, to: role };
    }

    if (Object.keys(changes).length > 0) {
      await (serverClient.from("activity_log") as any).insert({
        actor_id: caller.id,
        action: "update",
        entity_type: "user",
        entity_label: updated.username,
        changes,
      });
    }

    return NextResponse.json({
      data: {
        id: updated.id,
        username: updated.username,
        fullName: updated.full_name ?? updated.username,
        role: updated.role,
        isActive: updated.is_active ?? true,
        lastLoginAt: updated.last_login_at,
        createdAt: updated.created_at.split("T")[0],
      },
    });
  } catch (err) {
    console.error("[API/users PATCH]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = (await req.json()) as { userId: string };

    if (!userId) {
      return NextResponse.json(
        { error: "userId wajib diisi." },
        { status: 400 },
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");

    const serverClient = createServerSupabaseClient();
    const {
      data: { user: caller },
    } = await serverClient.auth.getUser(token);

    if (!caller) {
      return NextResponse.json(
        { error: "Token tidak valid." },
        { status: 401 },
      );
    }

    // Cegah hapus diri sendiri
    if (caller.id === userId) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri." },
        { status: 400 },
      );
    }

    const { data: callerProfile } = await serverClient
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single<{ role: Role }>();

    if (callerProfile?.role !== "master") {
      return NextResponse.json(
        { error: "Hanya master yang dapat menghapus user." },
        { status: 403 },
      );
    }

    const { data: targetProfile } = await serverClient
      .from("profiles")
      .select("username, full_name, role")
      .eq("id", userId)
      .single<{ username: string; full_name: string | null; role: string }>();

    // Hapus dari auth.users (profiles terhapus via CASCADE)
    const { error: deleteError } =
      await serverClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    await (serverClient.from("activity_log") as any).insert({
      actor_id: caller.id,
      action: "delete",
      entity_type: "user",
      entity_label: targetProfile?.username ?? userId,
      changes: targetProfile
        ? {
            username: { from: targetProfile.username, to: "-" },
            fullName: { from: targetProfile.full_name ?? "-", to: "-" },
            role: { from: targetProfile.role, to: "-" },
          }
        : null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API/users DELETE]", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
