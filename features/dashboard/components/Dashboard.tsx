"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/lib/context/auth-context";
import { Database, Users, Grid3x3, UserSquare2, FileDown } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, LabelList,
} from "recharts";
import { getAllBlok } from "@/features/blok/api";
import { getTotalMakam } from "@/features/makam/api";
import { getTamuStatsByPeriod, type TamuPeriodStats } from "@/features/tamu/api";
import { fetchJadwalTamu } from "@/features/jadwal-tamu/api";
import type { Blok, JadwalTamu } from "@/types";
import { SectionLoading, SectionEmpty, SectionError } from "@/components/ui/SectionState";
import Toast from "@/components/ui/Toast";
import PeriodSelector from "./PeriodSelector";
import JadwalRingkasan from "./JadwalRingkasan";
import { resolvePeriodRange, computeTrend, type PeriodSelection } from "../period-utils";

const BLOK_COLORS = [
  "#1B4332", "#2D6A4F", "#40916C", "#52B788",
  "#74C69D", "#95D5B2", "#B7E4C7", "#D8F3DC",
];

const PREV_LABEL: Record<PeriodSelection["view"], string> = {
  minggu: "minggu lalu",
  bulan: "bulan lalu",
  tahun: "tahun lalu",
};

const emptyStats: TamuPeriodStats = {
  chartData: [], totalUmum: 0, totalRombonganKunjungan: 0, totalRombonganPeserta: 0, total: 0,
};

export default function Dashboard() {
  const { isMaster, session } = useAuth();

  const [period, setPeriod] = useState<PeriodSelection>(() => {
    const now = new Date();
    return { view: "tahun", month: now.getMonth(), year: now.getFullYear(), week: 1 };
  });

  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportToast, setExportToast] = useState<string>();

  const [bloks, setBloks] = useState<Blok[]>([]);
  const [totalMakam, setTotalMakam] = useState(0);
  const [makamKosong, setMakamKosong] = useState(0);
  const [blokLoading, setBlokLoading] = useState(true);
  const [blokError, setBlokError] = useState<string>();
  const [blokRetrying, setBlokRetrying] = useState(false);

  const [currentStats, setCurrentStats] = useState<TamuPeriodStats>(emptyStats);
  const [prevStats, setPrevStats] = useState<TamuPeriodStats>(emptyStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string>();
  const [statsRetrying, setStatsRetrying] = useState(false);

  const [jadwal, setJadwal] = useState<JadwalTamu[]>([]);
  const [jadwalLoading, setJadwalLoading] = useState(true);
  const [jadwalError, setJadwalError] = useState<string>();
  const [jadwalRetrying, setJadwalRetrying] = useState(false);

  const range = useMemo(() => resolvePeriodRange(period), [period]);

  const loadBlokData = useCallback(async (isRetry = false) => {
    if (isRetry) setBlokRetrying(true);
    else setBlokLoading(true);
    setBlokError(undefined);

    const [blokResult, makamResult] = await Promise.all([getAllBlok(), getTotalMakam()]);

    if (!blokResult.error) {
      setBloks(blokResult.data);
      setMakamKosong(blokResult.data.reduce((acc, b) => acc + Math.max(b.kapasitas - b.terisi, 0), 0));
    } else {
      setBlokError(blokResult.error);
    }

    if (!makamResult.error) setTotalMakam(makamResult.count || 0);

    setBlokLoading(false);
    setBlokRetrying(false);
  }, []);

  useEffect(() => {
    loadBlokData();
  }, [loadBlokData]);

  const loadStats = useCallback(async (isRetry = false) => {
    if (isRetry) setStatsRetrying(true);
    else setStatsLoading(true);
    setStatsError(undefined);

    const [curRes, prevRes] = await Promise.all([
      getTamuStatsByPeriod(range.from, range.to, range.granularity),
      getTamuStatsByPeriod(range.prevFrom, range.prevTo, range.granularity),
    ]);

    if (curRes.error) {
      setStatsError(curRes.error);
      setCurrentStats(emptyStats);
    } else {
      setCurrentStats(curRes.data);
    }
    setPrevStats(prevRes.error ? emptyStats : prevRes.data);
    setStatsLoading(false);
    setStatsRetrying(false);
  }, [range.from, range.to, range.prevFrom, range.prevTo, range.granularity]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadStats();
    })();
    return () => { cancelled = true; };
  }, [loadStats]);

  const loadJadwal = useCallback(async (isRetry = false) => {
    if (isRetry) setJadwalRetrying(true);
    else setJadwalLoading(true);
    setJadwalError(undefined);

    const res = await fetchJadwalTamu(range.from, range.to);
    if (res.error) setJadwalError(res.error);
    setJadwal(res.data);
    setJadwalLoading(false);
    setJadwalRetrying(false);
  }, [range.from, range.to]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadJadwal();
    })();
    return () => { cancelled = true; };
  }, [loadJadwal]);

  const blokData = bloks.map((b, i) => ({
    name: `Blok ${b.nama}`,
    terisi: b.terisi,
    kapasitas: b.kapasitas,
    color: BLOK_COLORS[i % BLOK_COLORS.length],
  }));

  const totalTrend = computeTrend(currentStats.total, prevStats.total);
  const umumTrend = computeTrend(currentStats.totalUmum, prevStats.totalUmum);
  const rombonganTrend = computeTrend(currentStats.totalRombonganKunjungan, prevStats.totalRombonganKunjungan);
  const prevLabel = PREV_LABEL[period.view];

  const stats = [
    { label: "Total Data Makam", value: totalMakam, icon: Database, color: "#1C3F3A", bg: "#E8F0EF" },
    { label: "Makam Kosong", value: makamKosong, icon: Grid3x3, color: "#B45309", bg: "#FEF3C7" },
    {
      label: "Tamu Umum", value: currentStats.totalUmum, icon: Users, color: "#1D4ED8", bg: "#DBEAFE",
      trend: umumTrend,
    },
    {
      label: "Tamu Rombongan", value: currentStats.totalRombonganKunjungan, icon: UserSquare2, color: "#7C3AED", bg: "#EDE9FE",
      trend: rombonganTrend, sub: `${currentStats.totalRombonganPeserta} peserta`,
    },
  ];

  const cardsBusy = blokLoading || statsLoading;
  const cardsFailed = blokError && statsError;

  async function handleExportDashboardPdf() {
    if (!session?.access_token || exportingPdf) return;
    setExportingPdf(true);
    try {
      const params = new URLSearchParams();
      params.set("view", period.view);
      params.set("month", String(period.month));
      params.set("year", String(period.year));
      params.set("week", String(period.week));

      const res = await fetch(`/api/reports/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Gagal membuat laporan PDF.");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-dashboard-${range.from}_sd_${range.to}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportToast("Laporan PDF berhasil diunduh.");
    } catch (err) {
      setExportToast(err instanceof Error ? err.message : "Gagal membuat laporan PDF.");
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <div className="animate-fade-in flex flex-col gap-6 h-full">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800 }} className="text-neutral-black text-2xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl">
            Dashboard
          </h1>
          <p className="text-xs sm:text-xs md:text-xs lg:text-base xl:text-base text-neutral-gray mt-1">
            Ringkasan data Taman Makam Pahlawan &middot; {range.label}
          </p>
        </div>
        {isMaster && (
          <div className="flex items-center gap-3 flex-wrap">
            <PeriodSelector value={period} onChange={setPeriod} />
            <button
              onClick={handleExportDashboardPdf}
              disabled={exportingPdf || cardsBusy}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-black border rounded-lg px-3 py-1.5 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ borderColor: "rgba(221,221,221,0.8)" }}
              title="Export seluruh ringkasan dashboard ke PDF"
            >
              <FileDown size={14} className={exportingPdf ? "animate-pulse" : ""} />
              {exportingPdf ? "Membuat PDF..." : "Export PDF"}
            </button>
          </div>
        )}
      </div>

      {exportToast && typeof document !== "undefined" && createPortal(
        <Toast message={exportToast} onDone={() => setExportToast(undefined)} />,
        document.body
      )}

      <div className="bg-white rounded-xl p-4 sm:p-6" style={{ border: "1px solid rgba(221,221,221,0.5)" }}>
        {cardsBusy ? (
          <SectionLoading variant="cards" label="Memuat ringkasan..." />
        ) : cardsFailed ? (
          <SectionError
            title="Gagal memuat ringkasan"
            description={blokError || statsError}
            onRetry={() => { loadBlokData(true); loadStats(true); }}
            retrying={blokRetrying || statsRetrying}
          />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="flex items-start justify-between xl:h-20">
                  <div>
                    <p className="text-base text-neutral-gray font-medium">{s.label}</p>
                    <p className="text-3xl font-extrabold text-neutral-black mt-1" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                      {s.value}
                    </p>
                    {"sub" in s && s.sub && (
                      <p className="text-xs text-neutral-gray mt-0.5">{s.sub}</p>
                    )}
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg }}>
                    <s.icon size={24} style={{ color: s.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!cardsBusy && !cardsFailed && (blokError || statsError) && (
          <p className="text-xs text-red-600 mt-3">
            Sebagian data gagal dimuat: {blokError || statsError}
          </p>
        )}
      </div>

      {isMaster ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl p-6 flex flex-col" style={{ border: "1px solid rgba(221,221,221,0.5)", minHeight: 360 }}>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 18, fontWeight: 700 }} className="text-neutral-black">Statistik Kunjungan</h3>
                <p className="text-sm text-neutral-gray mt-0.5">{range.label}</p>
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              {statsLoading ? (
                <SectionLoading variant="chart" label="Memuat grafik..." />
              ) : statsError ? (
                <SectionError
                  title="Gagal memuat statistik kunjungan"
                  description={statsError}
                  onRetry={() => loadStats(true)}
                  retrying={statsRetrying}
                />
              ) : currentStats.chartData.length === 0 ? (
                <SectionEmpty
                  title="Belum ada data kunjungan"
                  description={`Belum ada tamu tercatat untuk ${range.label.toLowerCase()}.`}
                />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={currentStats.chartData} margin={{ top: 24, right: 8, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradUmum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradRombongan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1B4332" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 12, fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 13 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 10, border: "1px solid #EEE", fontSize: 14, fontWeight: 500 }}
                      formatter={(value: number, name: string, entry: any) => {
                        if (entry?.dataKey === "rombongan") {
                          const peserta = entry?.payload?.pesertaRombongan ?? 0;
                          return [`${value} kunjungan (${peserta} orang)`, name];
                        }
                        return [`${value} kunjungan`, name];
                      }}
                    />
                    <Area type="monotone" dataKey="umum" stackId="1" stroke="#2D6A4F" strokeWidth={2} fill="url(#gradUmum)" name="Tamu Umum" />
                    <Area type="monotone" dataKey="rombongan" stackId="1" stroke="#1B4332" strokeWidth={2} fill="url(#gradRombongan)" name="Tamu Rombongan">
                      <LabelList
                        dataKey="kunjungan"
                        position="top"
                        formatter={(value: number) => (value === 0 ? "" : String(value))}
                        style={{ fontSize: 11, fontWeight: 700, fill: "#2D6A4F" }}
                      />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl p-6 flex flex-col" style={{ border: "1px solid rgba(221,221,221,0.5)", minHeight: 360 }}>
            <div className="mb-4">
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 18, fontWeight: 700 }} className="text-neutral-black">Distribusi per Blok</h3>
              <p className="text-sm text-neutral-gray mt-0.5">Makam terisi tiap blok</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              {blokLoading ? (
                <SectionLoading variant="chart" label="Memuat blok..." />
              ) : blokError ? (
                <SectionError
                  title="Gagal memuat data blok"
                  description={blokError}
                  onRetry={() => loadBlokData(true)}
                  retrying={blokRetrying}
                />
              ) : blokData.length === 0 ? (
                <SectionEmpty
                  title="Belum ada blok terdaftar"
                  description="Tambahkan data blok makam untuk melihat distribusinya di sini."
                />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={blokData} layout="vertical" margin={{ top: 4, right: 64, left: 8, bottom: 4 }} barSize={30}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" horizontal={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 13 }} domain={[0, Math.max(...blokData.map(d => d.kapasitas), 10) + 15]} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#222", fontSize: 15, fontWeight: 600 }} width={60} />
                      <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EEE", fontSize: 14 }} formatter={(v: number) => [v, "Terisi"]} />
                      <Bar dataKey="terisi" name="Terisi" radius={[0, 6, 6, 0]}>
                        {blokData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        <LabelList dataKey="terisi" position="right" style={{ fontSize: 14, fontWeight: 700, fill: "#333" }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                    {blokData.map((b, i) => (
                      <div key={b.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: b.color }} />
                        <span className="text-sm font-medium text-neutral-gray">
                          {b.name}: <strong className="text-neutral-black">{b.terisi}</strong>/{b.kapasitas}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-5">
            <JadwalRingkasan
              items={jadwal}
              loading={jadwalLoading}
              error={jadwalError}
              periodLabel={range.label}
              onRetry={() => loadJadwal(true)}
              retrying={jadwalRetrying}
              rangeFrom={range.from}
              rangeTo={range.to}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-10 text-center flex-1" style={{ border: "1px solid rgba(221,221,221,0.5)" }}>
          <p className="text-neutral-gray text-base">Statistik detail hanya tersedia untuk Master.</p>
        </div>
      )}
    </div>
  );
}