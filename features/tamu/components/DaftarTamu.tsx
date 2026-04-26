"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Edit, Trash2, X, CheckCircle2, ImageOff, ZoomIn } from "lucide-react";
import { getAllTamu, deleteTamu } from "@/features/tamu/api";
import { supabaseClient } from "@/lib/supabase/client";
import { Tamu, TamuUmum, TamuRombongan } from "@/types";
import { useAuth } from "@/lib/context/auth-context";

function formatTanggal(iso: string) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function getDisplayName(t: Tamu) {
  return t.jenis === "umum"
    ? (t as TamuUmum).nama
    : (t as TamuRombongan).namaPimpinan;
}

export default function DaftarTamu() {
  const { isMaster } = useAuth();
  const [tamus, setTamus] = useState<Tamu[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState<"semua" | "umum" | "rombongan">("semua");
  const [filterTanggal, setFilterTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [editTarget, setEditTarget] = useState<Tamu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tamu | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // ─── Load data dari Supabase ────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await getAllTamu();
      if (error) setActionError(error);
      else setTamus(data);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return tamus.filter((t) => {
      const nameMatch = getDisplayName(t).toLowerCase().includes(search.toLowerCase());
      const jenisMatch = filterJenis === "semua" || t.jenis === filterJenis;
      const tanggalMatch = !filterTanggal || t.tanggal === filterTanggal;
      return nameMatch && jenisMatch && tanggalMatch;
    });
  }, [tamus, search, filterJenis, filterTanggal]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // ─── Hapus tamu (auto-detect jenis) ─────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteTamu(deleteTarget);
    if (error) { setActionError(error); setDeleteTarget(null); return; }
    setTamus(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ─── Update tamu (via Supabase langsung) ────────────────────────────────────
  const handleEditSave = async (updated: Tamu) => {
    setActionError('');
    let error: string | undefined;

    if (updated.jenis === 'umum') {
      const u = updated as TamuUmum;
      const { error: err } = await supabaseClient
        .from('tamu_umum')
        .update({ tanggal: u.tanggal, nama: u.nama, tujuan: u.tujuan })
        .eq('id', u.id);
      error = err?.message;
    } else {
      const r = updated as TamuRombongan;
      const { error: err } = await supabaseClient
        .from('tamu_rombongan')
        .update({
          tanggal: r.tanggal,
          nama_pimpinan: r.namaPimpinan,
          instansi: r.instansi,
          jumlah_peserta: r.jumlahPeserta,
          tujuan: r.tujuan,
        })
        .eq('id', r.id);
      error = err?.message;
    }

    if (error) { setActionError(error); return; }
    setTamus(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    setEditTarget(null);
  };

  return (
    <div className="animate-fade-in flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 28, fontWeight: 800 }} className="text-neutral-black">
          Daftar Tamu
        </h1>
        <p className="text-base text-neutral-gray mt-1">Riwayat dan manajemen data kunjungan</p>
      </div>

      {actionError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-base text-status-danger">
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-5" style={{ border: "1px solid rgba(221,221,221,0.5)" }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-gray" size={18} />
            <input className="form-input pl-10 text-base" placeholder="Cari nama..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-input text-base" style={{ width: "auto" }} value={filterJenis} onChange={(e) => setFilterJenis(e.target.value as "semua" | "umum" | "rombongan")}>
            <option value="semua">Semua Jenis</option>
            <option value="umum">Umum</option>
            <option value="rombongan">Rombongan</option>
          </select>
          <input type="date" className="form-input text-base" style={{ width: "auto" }} value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} />
          {filterTanggal && (
            <button onClick={() => setFilterTanggal("")} className="text-sm text-neutral-gray hover:text-neutral-black flex items-center gap-1 font-medium">
              <X size={16} /> Reset tanggal
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden flex flex-col flex-1" style={{ border: "1px solid rgba(221,221,221,0.5)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-neutral-gray">
            <svg className="animate-spin w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Memuat data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ fontSize: 14 }}>Tanggal</th>
                  <th style={{ fontSize: 14 }}>Jenis</th>
                  <th style={{ fontSize: 14 }}>Nama / Pimpinan</th>
                  <th style={{ fontSize: 14 }}>Instansi</th>
                  <th style={{ fontSize: 14 }}>Peserta</th>
                  <th style={{ fontSize: 14 }}>Tujuan</th>
                  <th style={{ fontSize: 14, textAlign: "center" }}>Bukti Foto</th>
                  <th style={{ fontSize: 14, textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-neutral-gray text-base">
                      Tidak ada data ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((t) => (
                    <tr key={t.id}>
                      <td className="text-base font-medium">{formatTanggal(t.tanggal)}</td>
                      <td>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${t.jenis === "umum" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>
                          {t.jenis === "umum" ? "Umum" : "Rombongan"}
                        </span>
                      </td>
                      <td className="text-base font-semibold">{getDisplayName(t)}</td>
                      <td className="text-base">{t.jenis === "rombongan" ? (t as TamuRombongan).instansi : "—"}</td>
                      <td className="text-base">{t.jenis === "rombongan" ? (t as TamuRombongan).jumlahPeserta : "—"}</td>
                      <td className="text-base max-w-xs truncate">{t.tujuan}</td>
                      <td>
                        <div className="flex items-center justify-center">
                          {t.fotoUrl ? (
                            <button
                              onClick={() => setPhotoPreview(t.fotoUrl ?? null)}
                              className="group relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-all hover:shadow-md"
                              title="Lihat foto"
                            >
                              <img
                                src={t.fotoUrl}
                                alt="Bukti foto"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ) : (
                            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 border border-gray-200" title="Tidak ada foto">
                              <ImageOff size={16} className="text-gray-300" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => setEditTarget(t)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit size={17} className="text-blue-600" />
                          </button>
                          {isMaster && (
                            <button onClick={() => setDeleteTarget(t)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={17} className="text-status-danger" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="px-4 py-3 flex items-center justify-between text-base text-neutral-gray font-medium border-t border-gray-200/50">
        <span>Menampilkan {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} data</span>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-40">Prev</button>
            <span className="px-2">{currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {photoPreview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setPhotoPreview(null)}
        >
          <div
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 16, fontWeight: 700 }} className="text-neutral-black">
                Bukti Foto Tamu
              </h2>
              <button
                onClick={() => setPhotoPreview(null)}
                className="p-2 hover:bg-neutral-light-gray rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <img
                src={photoPreview}
                alt="Bukti foto tamu"
                className="w-full rounded-xl object-contain max-h-[70vh]"
              />
            </div>
          </div>
        </div>
      )}
      {editTarget && <EditModal tamu={editTarget} onSave={handleEditSave} onClose={() => setEditTarget(null)} />}
      {deleteTarget && (
        <ConfirmDialog
          message={`Hapus data tamu "${getDisplayName(deleteTarget)}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function EditModal({ tamu, onSave, onClose }: { tamu: Tamu; onSave: (t: Tamu) => void; onClose: () => void }) {
  const [form, setForm] = useState({ ...tamu });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 20, fontWeight: 700 }} className="text-neutral-black">Edit Tamu</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-light-gray rounded-lg"><X size={20} /></button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-base font-semibold text-neutral-black mb-2">Tanggal</label>
            <input type="date" className="form-input text-base py-3.5" value={form.tanggal} onChange={set("tanggal")} />
          </div>
          {tamu.jenis === "umum" ? (
            <div>
              <label className="block text-base font-semibold text-neutral-black mb-2">Nama</label>
              <input type="text" className="form-input text-base py-3.5" value={(form as TamuUmum).nama} onChange={set("nama")} />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-base font-semibold text-neutral-black mb-2">Nama Pimpinan</label>
                <input type="text" className="form-input text-base py-3.5" value={(form as TamuRombongan).namaPimpinan} onChange={set("namaPimpinan")} />
              </div>
              <div>
                <label className="block text-base font-semibold text-neutral-black mb-2">Instansi</label>
                <input type="text" className="form-input text-base py-3.5" value={(form as TamuRombongan).instansi} onChange={set("instansi")} />
              </div>
              <div>
                <label className="block text-base font-semibold text-neutral-black mb-2">Jumlah Peserta</label>
                <input type="number" className="form-input text-base py-3.5" value={(form as TamuRombongan).jumlahPeserta}
                  onChange={e => setForm(f => ({ ...f, jumlahPeserta: Number(e.target.value) }))} />
              </div>
            </>
          )}
          <div>
            <label className="block text-base font-semibold text-neutral-black mb-2">Tujuan</label>
            <textarea rows={3} className="form-input text-base resize-none" value={form.tujuan} onChange={set("tujuan")} />
          </div>
        </div>
        <div className="flex gap-3 mt-7">
          <button onClick={() => onSave(form as Tamu)} className="btn-primary text-base py-3">
            <CheckCircle2 size={18} className="mr-2" /> Simpan
          </button>
          <button onClick={onClose} className="btn-secondary text-base py-3">Batal</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 18, fontWeight: 700 }} className="text-neutral-black mb-3">Konfirmasi Hapus</h2>
        <p className="text-base text-neutral-gray mb-7">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="px-6 py-3 bg-status-danger text-white text-base font-semibold rounded-lg hover:opacity-90 transition-opacity">Hapus</button>
          <button onClick={onCancel} className="btn-secondary text-base py-3">Batal</button>
        </div>
      </div>
    </div>
  );
}
