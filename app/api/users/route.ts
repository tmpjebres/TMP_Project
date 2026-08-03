import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { Role } from '@/types';

// ─── POST: Buat user baru (hanya master) ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      username: string;
      fullName: string;
      password: string;
      role: Role;
    };

    // Validasi input
    if (!body.fullName?.trim()) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
    }
    if (!body.username?.trim()) {
      return NextResponse.json({ error: 'Username wajib diisi.' }, { status: 400 });
    }
    if (!body.password || body.password.length < 8) {
      return NextResponse.json({ error: 'Password minimal 8 karakter.' }, { status: 400 });
    }
    if (!['master', 'operator'].includes(body.role)) {
      return NextResponse.json({ error: 'Role tidak valid.' }, { status: 400 });
    }

    // Cek apakah pemanggil adalah master menggunakan client request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    // Verifikasi token dan cek role
    const serverClient = createServerSupabaseClient();
    const { data: { user: caller }, error: verifyError } = await serverClient.auth.getUser(token);

    if (verifyError || !caller) {
      return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });
    }

    const { data: callerProfile } = await serverClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single<{ role: Role }>();

    if (callerProfile?.role !== 'master') {
      return NextResponse.json({ error: 'Hanya master yang dapat membuat user.' }, { status: 403 });
    }

    // Cek duplikat username
    const { data: existing } = await serverClient
      .from('profiles')
      .select('id')
      .eq('username', body.username.trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan.' }, { status: 409 });
    }

    const email = `${body.username.toLowerCase().trim()}@makam.app`;

    // Buat user di Supabase Auth (bypass email confirmation)
    const { data: newUser, error: createError } = await serverClient.auth.admin.createUser({
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
        { error: createError?.message ?? 'Gagal membuat user.' },
        { status: 500 }
      );
    }

    // Pastikan full_name tersimpan di profiles, terlepas dari apakah trigger
    // handle_new_user sudah membaca full_name dari user_metadata atau belum.
    const { error: profileUpdateError } = await (serverClient
      .from('profiles') as any)
      .update({ full_name: body.fullName.trim() })
      .eq('id', newUser.user.id);

    if (profileUpdateError) {
      console.error('[API/users POST] gagal set full_name:', profileUpdateError.message);
    }

    // Ambil profile yang sudah dibuat trigger
    const { data: profile } = await serverClient
      .from('profiles')
      .select('id, username, full_name, role, is_active, last_login_at, created_at')
      .eq('id', newUser.user.id)
      .single<{
        id: string;
        username: string;
        full_name: string;
        role: Role;
        is_active: boolean;
        last_login_at: string | null;
        created_at: string;
      }>();

    // Catat aktivitas
    await (serverClient.from('activity_log') as any).insert({
      actor_id: caller.id,
      action: 'create',
      entity_type: 'user',
      entity_label: body.username.trim(),
      changes: {
        username: { from: '-', to: body.username.trim() },
        fullName: { from: '-', to: body.fullName.trim() },
        role: { from: '-', to: body.role },
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
        createdAt: (profile?.created_at ?? new Date().toISOString()).split('T')[0],
      },
    });
  } catch (err) {
    console.error('[API/users POST]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// ─── DELETE: Hapus user (hanya master) ────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json() as { userId: string };

    if (!userId) {
      return NextResponse.json({ error: 'userId wajib diisi.' }, { status: 400 });
    }

    // Verifikasi caller adalah master
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    const serverClient = createServerSupabaseClient();
    const { data: { user: caller } } = await serverClient.auth.getUser(token);

    if (!caller) {
      return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });
    }

    // Cegah hapus diri sendiri
    if (caller.id === userId) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun sendiri.' }, { status: 400 });
    }

    const { data: callerProfile } = await serverClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single<{ role: Role }>();

    if (callerProfile?.role !== 'master') {
      return NextResponse.json({ error: 'Hanya master yang dapat menghapus user.' }, { status: 403 });
    }

    const { data: targetProfile } = await serverClient
      .from('profiles')
      .select('username, full_name, role')
      .eq('id', userId)
      .single<{ username: string; full_name: string | null; role: string }>();

    // Hapus dari auth.users (profiles terhapus via CASCADE)
    const { error: deleteError } = await serverClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Catat aktivitas
    await (serverClient.from('activity_log') as any).insert({
      actor_id: caller.id,
      action: 'delete',
      entity_type: 'user',
      entity_label: targetProfile?.username ?? userId,
      changes: targetProfile ? {
        username: { from: targetProfile.username, to: '-' },
        fullName: { from: targetProfile.full_name ?? '-', to: '-' },
        role: { from: targetProfile.role, to: '-' },
      } : null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API/users DELETE]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}