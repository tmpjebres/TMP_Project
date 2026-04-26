"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Database, Users, Grid3x3, CalendarCheck } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, LabelList,
} from "recharts";
import { getAllBlok } from "@/features/blok/api";
import { getTotalMakam } from "@/features/makam/api";
import { getVisitStats, getAllTamu } from "@/features/tamu/api";
import type { Blok } from "@/types";

const today = new Date().toISOString().split("T")[0];
const BLOK_COLORS = 
[
  "#1B4332", 
  "#2D6A4F",
  "#40916C",
  "#52B788",
  "#74C69D",
  "#95D5B2",
  "#B7E4C7",
  "#D8F3DC"  
];

export default function Dashboard() {
  const { isMaster } = useAuth();
  const [bloks, setBloks] = useState<Blok[]>([]);
  const [totalMakam, setTotalMakam] = useState(0);
  const [makamKosong, setMakamKosong] = useState(0);
  const [tamuHariIni, setTamuHariIni] = useState(0);
  const [tamuBulanIni, setTamuBulanIni] = useState(0);
  const [visitChartData, setVisitChartData] = useState<{ name: string; kunjungan: number }[]>([]);

  // ─── Load statistik dari Supabase ──────────────────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      const [blokResult, makamResult, tamuResult, statsResult] = await Promise.all([
        getAllBlok(),
        getTotalMakam(),
        getAllTamu(),
        getVisitStats(),
      ]);

      if (!blokResult.error) {
        setBloks(blokResult.data);
        setMakamKosong(blokResult.data.reduce((acc, b) => acc + Math.max(b.kapasitas - b.terisi, 0), 0));
      }

      if (!makamResult.error) {
        setTotalMakam(makamResult.count || 0);
      }

      if (!tamuResult.error) {
        const tamus = tamuResult.data;
        setTamuHariIni(tamus.filter(t => t.tanggal === today).length);
        setTamuBulanIni(tamus.filter(t => t.tanggal.startsWith(today.slice(0, 7))).length);
      }

      if (!statsResult.error) {
        setVisitChartData(statsResult.data);
      }
    };

    loadStats();
  }, []);

  const blokData = bloks.map((b, i) => ({
    name: `Blok ${b.nama}`,
    terisi: b.terisi,
    kapasitas: b.kapasitas,
    color: BLOK_COLORS[i % BLOK_COLORS.length],
  }));

  const stats = [
    { label: "Total Data Makam", value: totalMakam, icon: Database, color: "#1C3F3A", bg: "#E8F0EF" },
    { label: "Makam Kosong", value: makamKosong, icon: Grid3x3, color: "#B45309", bg: "#FEF3C7" },
    { label: "Tamu Bulan Ini", value: tamuBulanIni, icon: Users, color: "#1D4ED8", bg: "#DBEAFE" },
    { label: "Tamu Hari Ini", value: tamuHariIni, icon: CalendarCheck, color: "#7C3AED", bg: "#EDE9FE" },
  ];

  return (
    <div className="animate-fade-in flex flex-col gap-6 h-full">
      <div>
        <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 800 }} className="text-neutral-black text-2xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-3xl">
          Dashboard
        </h1>
        <p className="text-xs sm:text-xs md:text-xs lg:text-base xl:text-base text-neutral-gray mt-1">
          Ringkasan data Taman Makam Pahlawan
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-start justify-between xl:h-20">
              <div>
                <p className="text-base text-neutral-gray font-medium">{s.label}</p>
                <p className="text-3xl font-extrabold text-neutral-black mt-1" style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}>
                  {s.value}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.bg }}>
                <s.icon size={24} style={{ color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      {isMaster ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
          {/* Statistik Kunjungan */}
          <div className="lg:col-span-3 bg-white rounded-xl p-6 flex flex-col" style={{ border: "1px solid rgba(221,221,221,0.5)", minHeight: 360 }}>
            <div className="mb-4">
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 18, fontWeight: 700 }} className="text-neutral-black">Statistik Kunjungan</h3>
              <p className="text-sm text-neutral-gray mt-0.5">12 bulan terakhir</p>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={visitChartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1C3F3A" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#1C3F3A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEEEEE" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 14, fontWeight: 500 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#666", fontSize: 13 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EEE", fontSize: 14, fontWeight: 500 }} formatter={(v: number) => [`${v} orang`, "Kunjungan"]} />
                  <Area type="monotone" dataKey="kunjungan" stroke="#1C3F3A" strokeWidth={2.5} fill="url(#grad1)" name="Kunjungan" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribusi per Blok */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 flex flex-col" style={{ border: "1px solid rgba(221,221,221,0.5)", minHeight: 360 }}>
            <div className="mb-4">
              <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 18, fontWeight: 700 }} className="text-neutral-black">Distribusi per Blok</h3>
              <p className="text-sm text-neutral-gray mt-0.5">Makam terisi tiap blok</p>
            </div>
            <div className="flex-1">
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
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {blokData.map((b, i) => (
                <div key={b.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: b.color }} />
                  <span className="text-sm font-medium text-neutral-gray">
                    {b.name}: <strong className="text-neutral-black">{b.terisi}</strong>/{b.kapasitas}
                  </span>
                </div>
              ))}
            </div>
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
