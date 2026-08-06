import type { SupabaseClient } from '@supabase/supabase-js';
import { resolvePeriodRange, type PeriodSelection } from '@/features/dashboard/period-utils';
import type { JadwalTamu } from '@/types';
import { rowToJadwalTamu, type JadwalTamuRow } from '@/features/jadwal-tamu/api';
import {
  createReportDoc, drawMasthead, drawRunningHeader, drawFooter, drawSectionTitle,
  drawHairline, ensureSpace, PAGE_MARGIN, CONTENT_WIDTH,
  INK, INK_SOFT, BRASS, HAIRLINE, GRAY, BLACK,
  type ReportMeta,
} from './pdf-theme';

const JADWAL_ITEM_CAP = 400;

interface ChartPoint {
  key: string;
  name: string;
  umum: number;
  rombongan: number; // jumlah kunjungan rombongan (per baris/grup), bukan jumlah peserta
}

interface DashboardReportData {
  totalMakam: number;
  makamKosong: number;
  totalUmum: number;
  totalRombonganKunjungan: number;
  totalRombonganPeserta: number;
  chartData: ChartPoint[];
  granularity: 'day' | 'month';
  bloks: { nama: string; kapasitas: number; terisi: number }[];
  jadwal: JadwalTamu[];
}

// ─── Ambil semua data section dashboard untuk periode terpilih ──────────────
export async function fetchDashboardReportData(
  serverClient: SupabaseClient,
  period: PeriodSelection
): Promise<{ data: DashboardReportData; range: ReturnType<typeof resolvePeriodRange> }> {
  const range = resolvePeriodRange(period);

  const [blokRes, makamCountRes, umumRes, rombonganRes, jadwalRes] = await Promise.all([
    serverClient.from('blok').select('nama, kapasitas, terisi').order('nama', { ascending: true }),
    serverClient.from('makam').select('id', { count: 'exact', head: true }),
    serverClient.from('tamu_umum').select('tanggal').gte('tanggal', range.from).lte('tanggal', range.to),
    serverClient.from('tamu_rombongan').select('tanggal, jumlah_peserta').gte('tanggal', range.from).lte('tanggal', range.to),
    serverClient.from('jadwal_tamu').select('*').is('deleted_at', null)
      .gte('tanggal_mulai', range.from).lte('tanggal_mulai', range.to)
      .order('tanggal_mulai', { ascending: true }).order('jam_mulai', { ascending: true }),
  ]);

  const bloks = (blokRes.data ?? []) as { nama: string; kapasitas: number; terisi: number }[];
  const makamKosong = bloks.reduce((acc, b) => acc + Math.max(b.kapasitas - b.terisi, 0), 0);

  const umumRows = (umumRes.data ?? []) as { tanggal: string }[];
  const rombRows = (rombonganRes.data ?? []) as { tanggal: string; jumlah_peserta: number | null }[];

  const buckets = buildEmptyBuckets(range.from, range.to, range.granularity);
  let totalUmum = 0;
  let totalRombonganKunjungan = 0;
  let totalRombonganPeserta = 0;

  umumRows.forEach((r) => {
    const bucket = buckets.get(bucketKey(r.tanggal, range.granularity));
    if (bucket) bucket.umum += 1;
    totalUmum += 1;
  });

  rombRows.forEach((r) => {
    const peserta = r.jumlah_peserta ?? 0;
    const bucket = buckets.get(bucketKey(r.tanggal, range.granularity));
    if (bucket) bucket.rombongan += 1;
    totalRombonganKunjungan += 1;
    totalRombonganPeserta += peserta;
  });

  const jadwal = ((jadwalRes.data ?? []) as JadwalTamuRow[]).map(rowToJadwalTamu);

  return {
    range,
    data: {
      totalMakam: makamCountRes.count ?? 0,
      makamKosong,
      totalUmum,
      totalRombonganKunjungan,
      totalRombonganPeserta,
      chartData: Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key)),
      granularity: range.granularity,
      bloks: bloks.map((b) => ({ nama: b.nama, kapasitas: b.kapasitas, terisi: b.terisi })),
      jadwal,
    },
  };
}

function buildEmptyBuckets(from: string, to: string, granularity: 'day' | 'month'): Map<string, ChartPoint> {
  const buckets = new Map<string, ChartPoint>();
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  if (granularity === 'day') {
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      const name = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      buckets.set(key, { key, name, umum: 0, rombongan: 0 });
    }
  } else {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const endCursor = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= endCursor) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, { key, name: monthNames[cursor.getMonth()], umum: 0, rombongan: 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return buckets;
}

function bucketKey(tanggal: string, granularity: 'day' | 'month'): string {
  return granularity === 'day' ? tanggal : tanggal.slice(0, 7);
}

// ─── Rakit dokumen PDF dari data yang sudah diambil ──────────────────────────
export async function buildDashboardReportPdf(
  data: DashboardReportData,
  meta: ReportMeta
): Promise<Buffer> {
  const doc = createReportDoc();
  const chunks: Buffer[] = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

  drawMasthead(doc, meta);
  drawKpiRow(doc, data);
  drawKunjunganChart(doc, data);
  drawBlokDistribution(doc, data);
  drawJadwalRingkasan(doc, data);

  const range = doc.bufferedPageRange();
  const totalPages = range.count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    if (i > 0) drawRunningHeader(doc, meta);
    drawFooter(doc, meta, i + 1, totalPages);
  }

  doc.end();
  return done;
}

// ─── KPI: Total Makam, Makam Kosong, Tamu Umum, Tamu Rombongan ──────────────
function drawKpiRow(doc: PDFKit.PDFDocument, data: DashboardReportData) {
  drawSectionTitle(doc, 'Ringkasan');
  ensureSpace(doc, 70);

  const left = PAGE_MARGIN.left;
  const colWidth = CONTENT_WIDTH / 4;
  const top = doc.y + 4;
  const items: { label: string; value: string; sub?: string }[] = [
    { label: 'TOTAL DATA MAKAM', value: String(data.totalMakam) },
    { label: 'MAKAM KOSONG', value: String(data.makamKosong) },
    { label: 'TAMU UMUM', value: String(data.totalUmum) },
    {
      label: 'TAMU ROMBONGAN', value: String(data.totalRombonganKunjungan),
      sub: `${data.totalRombonganPeserta} peserta`,
    },
  ];

  items.forEach((item, i) => {
    const x = left + i * colWidth;
    doc.font('Helvetica').fontSize(8).fillColor(GRAY)
      .text(item.label, x, top, { width: colWidth - 16, characterSpacing: 0.4 });
    doc.font('Helvetica-Bold').fontSize(22).fillColor(INK)
      .text(item.value, x, top + 13, { width: colWidth - 16 });
    if (item.sub) {
      doc.font('Helvetica').fontSize(8).fillColor(INK_SOFT)
        .text(item.sub, x, top + 40, { width: colWidth - 16 });
    }
    if (i > 0) {
      doc.moveTo(x - 8, top - 4).lineTo(x - 8, top + 52).lineWidth(0.75).strokeColor(HAIRLINE).stroke();
    }
  });

  doc.y = top + 60;
  drawHairline(doc);
  doc.y += 22;
}

// ─── Grafik kunjungan: batang bertumpuk umum (ink) vs rombongan (brass) ─────
function drawKunjunganChart(doc: PDFKit.PDFDocument, data: DashboardReportData) {
  const label = data.granularity === 'day' ? 'Per hari' : 'Per bulan';
  drawSectionTitle(doc, 'Statistik Kunjungan', label);

  const chartHeight = 150;
  const topPadding = 14; // ruang untuk label angka di atas batang tertinggi
  ensureSpace(doc, chartHeight + topPadding + 40);

  const left = PAGE_MARGIN.left;
  const top = doc.y + 4 + topPadding;
  const baseline = top + chartHeight;
  const points = data.chartData;
  const maxVal = Math.max(...points.map((p) => p.umum + p.rombongan), 1);

  const slot = CONTENT_WIDTH / Math.max(points.length, 1);
  const barWidth = Math.min(Math.max(slot * 0.55, 2), 26);

  doc.moveTo(left, baseline).lineTo(left + CONTENT_WIDTH, baseline).lineWidth(0.75).strokeColor(HAIRLINE).stroke();

  points.forEach((p, i) => {
    const x = left + i * slot + (slot - barWidth) / 2;
    const umumH = maxVal > 0 ? (p.umum / maxVal) * chartHeight : 0;
    const rombH = maxVal > 0 ? (p.rombongan / maxVal) * chartHeight : 0;

    if (rombH > 0) doc.rect(x, baseline - umumH - rombH, barWidth, rombH).fill(BRASS);
    if (umumH > 0) doc.rect(x, baseline - umumH, barWidth, umumH).fill(INK);

    const total = p.umum + p.rombongan;
    if (total > 0) {
      const labelY = baseline - umumH - rombH - 11;
      doc.font('Helvetica-Bold').fontSize(7).fillColor(INK)
        .text(String(total), x - slot / 2, labelY, { width: slot * 2, align: 'center' });
    }

    if (points.length <= 20 || i % Math.ceil(points.length / 16) === 0) {
      doc.font('Helvetica').fontSize(6.5).fillColor(GRAY)
        .text(p.name, x - slot / 2, baseline + 5, { width: slot * 2, align: 'center' });
    }
  });

  doc.y = baseline + 20;
  drawLegend(doc, [
    { color: INK, label: 'Tamu Umum' },
    { color: BRASS, label: 'Tamu Rombongan' },
  ]);
  doc.y += 22;
  drawHairline(doc);
  doc.y += 22;
}

function drawLegend(doc: PDFKit.PDFDocument, entries: { color: string; label: string }[]) {
  let x = PAGE_MARGIN.left;
  const y = doc.y;
  entries.forEach((entry) => {
    doc.rect(x, y + 2, 8, 8).fill(entry.color);
    doc.font('Helvetica').fontSize(9).fillColor(BLACK).text(entry.label, x + 12, y);
    x += doc.widthOfString(entry.label) + 40;
  });
}

// ─── Distribusi Blok: makam terisi/kapasitas per blok ───────────────────────
function drawBlokDistribution(doc: PDFKit.PDFDocument, data: DashboardReportData) {
  drawSectionTitle(doc, 'Distribusi per Blok', 'Makam terisi tiap blok');

  if (data.bloks.length === 0) {
    ensureSpace(doc, 20);
    doc.font('Helvetica').fontSize(9.5).fillColor(GRAY).text('Belum ada blok terdaftar.', PAGE_MARGIN.left, doc.y);
    doc.y += 20;
    drawHairline(doc);
    doc.y += 22;
    return;
  }

  const rowHeight = 22;
  const left = PAGE_MARGIN.left;
  const labelWidth = 90;
  const valueWidth = 90;
  const trackWidth = CONTENT_WIDTH - labelWidth - valueWidth;
  const maxKapasitas = Math.max(...data.bloks.map((b) => b.kapasitas), 1);

  data.bloks.forEach((b) => {
    ensureSpace(doc, rowHeight + 4);
    const y = doc.y;
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(BLACK)
      .text(`Blok ${b.nama}`, left, y + 5, { width: labelWidth });

    const trackX = left + labelWidth;
    doc.rect(trackX, y + 5, trackWidth, 8).fill(HAIRLINE);
    const filled = Math.min((b.terisi / maxKapasitas) * trackWidth, trackWidth);
    if (filled > 0) doc.rect(trackX, y + 5, filled, 8).fill(INK);

    doc.font('Helvetica').fontSize(9).fillColor(INK_SOFT)
      .text(`${b.terisi} / ${b.kapasitas}`, trackX + trackWidth + 8, y + 4, { width: valueWidth - 8, align: 'right' });

    doc.y = y + rowHeight;
  });

  drawHairline(doc);
  doc.y += 22;
}

// ─── Ringkasan Jadwal: seluruh kegiatan pada periode, urut tanggal ──────────
function drawJadwalRingkasan(doc: PDFKit.PDFDocument, data: DashboardReportData) {
  drawSectionTitle(doc, 'Ringkasan Jadwal', 'Kegiatan tamu pada periode terpilih, urut tanggal');

  if (data.jadwal.length === 0) {
    ensureSpace(doc, 20);
    doc.font('Helvetica').fontSize(9.5).fillColor(GRAY).text('Tidak ada jadwal kegiatan pada periode ini.', PAGE_MARGIN.left, doc.y);
    doc.y += 20;
    return;
  }

  const items = data.jadwal.slice(0, JADWAL_ITEM_CAP);
  const overflow = data.jadwal.length - items.length;
  const left = PAGE_MARGIN.left;
  const right = PAGE_MARGIN.left + CONTENT_WIDTH;
  const dateColWidth = 90;

  items.forEach((item) => {
    const rowHeight = 30;
    ensureSpace(doc, rowHeight);
    const y = doc.y;

    doc.font('Helvetica-Bold').fontSize(9).fillColor(INK)
      .text(formatTanggalPendek(item.tanggalMulai), left, y, { width: dateColWidth });
    doc.font('Helvetica').fontSize(8.5).fillColor(GRAY)
      .text(item.jamMulai, left, y + 13, { width: dateColWidth });

    const textX = left + dateColWidth;
    const textWidth = right - textX;
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor(BLACK)
      .text(item.namaKegiatan, textX, y, { width: textWidth });
    doc.font('Helvetica').fontSize(8.5).fillColor(GRAY)
      .text(`${item.tipeKegiatan} \u00b7 ${item.instansi}`, textX, y + 13, { width: textWidth });

    doc.y = y + rowHeight;
    drawHairline(doc);
    doc.y += 2;
  });

  if (overflow > 0) {
    ensureSpace(doc, 20);
    doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(GRAY)
      .text(`...dan ${overflow} jadwal lainnya tidak ditampilkan karena keterbatasan halaman.`, left, doc.y);
    doc.y += 16;
  }
}

function formatTanggalPendek(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}