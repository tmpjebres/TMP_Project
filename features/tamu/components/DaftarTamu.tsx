"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Edit, Trash2, X, ImageOff, ZoomIn } from "lucide-react";
import { getAllTamu, deleteTamu, updateTamu } from "@/features/tamu/api";
import { formatTanggal, getDisplayName } from "@/features/tamu/utils";
import { Tamu, TamuRombongan } from "@/types";
import { useAuth } from "@/lib/context/auth-context";
import { LoadingSpinner } from "@/components/ui/LoadingAnimation";
import EditModal from "@/features/tamu/components/EditModal";
import ConfirmDialog from "@/features/tamu/components/ConfirmDialog";
import PhotoPreviewModal from "@/features/tamu/components/PhotoPreviewModal";
import SortableHeader, { SortKey } from "@/features/tamu/components/SortableHeader";

const ITEMS_PER_PAGE = 15;

export default function DaftarTamu() {
  const { isMaster } = useAuth();
  const [tamus, setTamus] = useState<Tamu[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');
  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState<"semua" | "umum" | "rombongan">("semua");
  const [filterTanggalMulai, setFilterTanggalMulai] = useState("");
  const [filterTanggalSampai, setFilterTanggalSampai] = useState("");
  const [editTarget, setEditTarget] = useState<Tamu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tamu | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey>("tanggal");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setCurrentPage(1);
  };

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
    const query = search.toLowerCase();
    return tamus.filter((t) => {
      const instansi = t.jenis === "rombongan" ? (t as TamuRombongan).instansi : "";
      const searchMatch =
        !query ||
        getDisplayName(t).toLowerCase().includes(query) ||
        instansi.toLowerCase().includes(query) ||
        t.tujuan.toLowerCase().includes(query);
      const jenisMatch = filterJenis === "semua" || t.jenis === filterJenis;
      const tanggalMatch =
        (!filterTanggalMulai || t.tanggal >= filterTanggalMulai) &&
        (!filterTanggalSampai || t.tanggal <= filterTanggalSampai);
      return searchMatch && jenisMatch && tanggalMatch;
    });
  }, [tamus, search, filterJenis, filterTanggalMulai, filterTanggalSampai]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      switch (sortKey) {
        case "tanggal":
          return (a.tanggal > b.tanggal ? 1 : a.tanggal < b.tanggal ? -1 : 0) * dir;
        case "nama":
          return getDisplayName(a).localeCompare(getDisplayName(b)) * dir;
        case "instansi": {
          const ai = a.jenis === "rombongan" ? (a as TamuRombongan).instansi : "";
          const bi = b.jenis === "rombongan" ? (b as TamuRombongan).instansi : "";
          return ai.localeCompare(bi) * dir;
        }
        case "peserta": {
          const ap = a.jenis === "rombongan" ? (a as TamuRombongan).jumlahPeserta : 0;
          const bp = b.jenis === "rombongan" ? (b as TamuRombongan).jumlahPeserta : 0;
          return (ap - bp) * dir;
        }
        default:
          return 0;
      }
    });

    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [sorted, currentPage]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await deleteTamu(deleteTarget);
    if (error) { setActionError(error); setDeleteTarget(null); return; }
    setTamus(prev => prev.filter(t => t.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleEditSave = async (updated: Tamu) => {
    setActionError('');
    const { error } = await updateTamu(updated);
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

      <div className="bg-white rounded-xl p-4 mb-5" style={{ border: "1px solid rgba(221,221,221,0.5)" }}>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-gray" size={18} />
            <input className="form-input pl-10 text-base" placeholder="Cari nama, instansi, atau tujuan..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-input text-base" style={{ width: "auto" }} value={filterJenis} onChange={(e) => setFilterJenis(e.target.value as "semua" | "umum" | "rombongan")}>
            <option value="semua">Semua Jenis</option>
            <option value="umum">Umum</option>
            <option value="rombongan">Rombongan</option>
          </select>
          <div className="flex items-center gap-2">
            <input
              type="date"
              className="form-input text-base"
              style={{ width: "auto" }}
              value={filterTanggalMulai}
              max={filterTanggalSampai || undefined}
              onChange={(e) => setFilterTanggalMulai(e.target.value)}
            />
            <span className="text-neutral-gray text-sm">s/d</span>
            <input
              type="date"
              className="form-input text-base"
              style={{ width: "auto" }}
              value={filterTanggalSampai}
              min={filterTanggalMulai || undefined}
              onChange={(e) => setFilterTanggalSampai(e.target.value)}
            />
          </div>
          {(filterTanggalMulai || filterTanggalSampai) && (
            <button
              onClick={() => { setFilterTanggalMulai(""); setFilterTanggalSampai(""); }}
              className="text-sm text-neutral-gray hover:text-neutral-black flex items-center gap-1 font-medium"
            >
              <X size={16} /> Reset tanggal
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden flex flex-col flex-1" style={{ border: "1px solid rgba(221,221,221,0.5)" }}>
        {loading ?
        <LoadingSpinner/> : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <SortableHeader label="Tanggal" sortKey="tanggal" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <th style={{ fontSize: 14 }}>Jenis</th>
                  <SortableHeader label="Nama / Pimpinan" sortKey="nama" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Instansi" sortKey="instansi" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Peserta" sortKey="peserta" activeKey={sortKey} dir={sortDir} onSort={handleSort} />
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
        <PhotoPreviewModal photoUrl={photoPreview} onClose={() => setPhotoPreview(null)} />
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
