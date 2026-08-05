import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/client';
import type { PeriodView, PeriodSelection } from '@/features/dashboard/period-utils';
import { fetchDashboardReportData, buildDashboardReportPdf } from '@/lib/reports/dashboard-report';
import type { Role } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parsePeriod(searchParams: URLSearchParams): PeriodSelection | null {
  const view = searchParams.get('view') as PeriodView | null;
  const month = Number(searchParams.get('month'));
  const year = Number(searchParams.get('year'));
  const week = Number(searchParams.get('week'));

  if (!view || !['minggu', 'bulan', 'tahun'].includes(view)) return null;
  if (!Number.isFinite(month) || !Number.isFinite(year) || !Number.isFinite(week)) return null;

  return { view, month, year, week };
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    const serverClient = createServerSupabaseClient();
    const { data: { user: caller }, error: verifyError } = await serverClient.auth.getUser(token);
    if (verifyError || !caller) {
      return NextResponse.json({ error: 'Token tidak valid.' }, { status: 401 });
    }

    const { data: callerProfile } = await serverClient
      .from('profiles')
      .select('username, role')
      .eq('id', caller.id)
      .single<{ username: string; role: Role }>();

    if (callerProfile?.role !== 'master') {
      return NextResponse.json({ error: 'Hanya master yang dapat mengekspor laporan dashboard.' }, { status: 403 });
    }

    const period = parsePeriod(req.nextUrl.searchParams);
    if (!period) {
      return NextResponse.json({ error: 'Parameter periode tidak valid.' }, { status: 400 });
    }

    const { data, range } = await fetchDashboardReportData(serverClient, period);

    const printedAt = new Date();
    const pdfBuffer = await buildDashboardReportPdf(data, {
      title: 'Laporan Dashboard',
      periodLabel: range.label,
      printedByName: callerProfile.username,
      printedAt,
    });

    await (serverClient.from('activity_log') as any).insert({
      actor_id: caller.id,
      actor_username: callerProfile.username,
      action: 'export',
      entity_type: 'dashboard_report',
      entity_label: range.label,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="laporan-dashboard-${range.from}_sd_${range.to}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('[API/reports/dashboard GET]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}