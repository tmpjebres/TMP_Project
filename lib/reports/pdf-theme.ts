import PDFDocument from 'pdfkit';

export const INK = '#1C3F3A';
export const INK_SOFT = '#5B7A74';
export const BRASS = '#A9822F';
export const BRASS_SOFT = '#D8C48F';
export const HAIRLINE = '#DDDDDD';
export const GRAY = '#6B6B6B';
export const BLACK = '#1A1A1A';

export const PAGE_MARGIN = { top: 64, bottom: 56, left: 50, right: 50 };
export const CONTENT_WIDTH = 595.28 - PAGE_MARGIN.left - PAGE_MARGIN.right;

export interface ReportMeta {
  title: string;
  periodLabel: string;
  printedByName: string;
  printedAt: Date;
}

export function createReportDoc() {
  return new PDFDocument({
    size: 'A4',
    margins: PAGE_MARGIN,
    bufferPages: true,
    info: { Title: 'Laporan Dashboard - Taman Makam Pahlawan' },
  });
}

export function drawMasthead(doc: PDFKit.PDFDocument, meta: ReportMeta) {
  const left = PAGE_MARGIN.left;
  const right = 595.28 - PAGE_MARGIN.right;
  let y = PAGE_MARGIN.top - 24;

  doc.font('Helvetica-Bold').fontSize(9).fillColor(BRASS)
    .text('LAPORAN DASHBOARD', left, y, { characterSpacing: 1.5 });

  y += 16;
  doc.font('Helvetica-Bold').fontSize(23).fillColor(INK)
    .text('Taman Makam Pahlawan', left, y);

  y += 30;
  doc.font('Helvetica').fontSize(11).fillColor(INK_SOFT)
    .text(`Periode ${meta.periodLabel}`, left, y);

  const rightBlockY = PAGE_MARGIN.top - 24 + 4;
  doc.font('Helvetica').fontSize(8.5).fillColor(GRAY)
    .text(`Dicetak oleh ${meta.printedByName}`, left, rightBlockY, { width: right - left, align: 'right' })
    .text(formatDateTime(meta.printedAt), left, rightBlockY + 12, { width: right - left, align: 'right' });

  const lineY = y + 22;
  doc.moveTo(left, lineY).lineTo(right, lineY).lineWidth(1.4).strokeColor(BRASS).stroke();

  doc.y = lineY + 20;
}

export function drawRunningHeader(doc: PDFKit.PDFDocument, meta: ReportMeta) {
  const left = PAGE_MARGIN.left;
  const right = 595.28 - PAGE_MARGIN.right;
  const y = PAGE_MARGIN.top - 30;

  doc.font('Helvetica-Bold').fontSize(9).fillColor(INK)
    .text('Laporan Dashboard \u2014 Taman Makam Pahlawan', left, y, { width: (right - left) / 2 });
  doc.font('Helvetica').fontSize(9).fillColor(GRAY)
    .text(meta.periodLabel, left, y, { width: right - left, align: 'right' });

  const lineY = y + 16;
  doc.moveTo(left, lineY).lineTo(right, lineY).lineWidth(0.75).strokeColor(HAIRLINE).stroke();
  doc.y = lineY + 18;
}

export function drawFooter(doc: PDFKit.PDFDocument, meta: ReportMeta, page: number, totalPages: number) {
  const left = PAGE_MARGIN.left;
  const right = 595.28 - PAGE_MARGIN.right;
  const y = 841.89 - PAGE_MARGIN.bottom + 18;

  // Footer ditulis di area bawah margin konten. PDFKit otomatis nge-addPage()
  // kalau nulis teks yang melewati batas margin bawah, jadi nonaktifkan
  // sementara supaya nggak muncul halaman kosong tambahan.
  const savedBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  doc.moveTo(left, y).lineTo(right, y).lineWidth(0.75).strokeColor(HAIRLINE).stroke();

  doc.font('Helvetica').fontSize(8).fillColor(GRAY)
    .text('Taman Makam Pahlawan', left, y + 8, { width: 200 })
    .text(`Dibuat ${formatDateTime(meta.printedAt)}`, left, y + 8, { width: right - left, align: 'center' })
    .text(`Halaman ${page} / ${totalPages}`, left, y + 8, { width: right - left, align: 'right' });

  doc.page.margins.bottom = savedBottom;
}

export function drawSectionTitle(doc: PDFKit.PDFDocument, title: string, subtitle?: string) {
  ensureSpace(doc, 40);
  const left = PAGE_MARGIN.left;
  const y = doc.y;

  doc.rect(left, y + 3, 3, 12).fill(BRASS);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(INK).text(title, left + 11, y);

  if (subtitle) {
    doc.font('Helvetica').fontSize(9.5).fillColor(GRAY)
      .text(subtitle, left + 11, doc.y + 1);
  }

  doc.y = doc.y + 10;
}

export function drawHairline(doc: PDFKit.PDFDocument, y?: number) {
  const left = PAGE_MARGIN.left;
  const right = 595.28 - PAGE_MARGIN.right;
  const lineY = y ?? doc.y;
  doc.moveTo(left, lineY).lineTo(right, lineY).lineWidth(0.75).strokeColor(HAIRLINE).stroke();
}

export function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottom = 841.89 - PAGE_MARGIN.bottom;
  if (doc.y + needed > bottom) {
    doc.addPage();
    doc.y = PAGE_MARGIN.top;
  }
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' WIB';
}