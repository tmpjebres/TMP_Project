import { useEffect, useMemo, useState, useCallback } from "react";
import { getAllMakam } from "@/features/makam/api";
import { getAllBlok } from "@/features/blok/api";
import type { Makam, Blok } from "@/types";
import {
  sortData,
  toggleSort,
  type SortConfig,
} from "@/features/makam/sort-utils";
import {
  createSearchIndex,
  searchWithIndex,
  formatDateSearch,
} from "@/features/makam/search-utils";

const PAGE_SIZE = 10;

const COLUMN_TYPES: Partial<Record<keyof Makam, "string" | "number" | "date">> =
  {
    nama: "string",
    blokNama: "string",
    nomor: "number",
    pangkat: "string",
    tanggalLahir: "date",
    tanggalGugur: "date",
  };

export function useMakamData() {
  const [allData, setAllData] = useState<Makam[]>([]);
  const [blokList, setBlokList] = useState<Blok[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const [search, setSearch] = useState("");
  const [selectedBlok, setSelectedBlok] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig<Makam>>({
    key: null,
    direction: null,
  });
  const [page, setPage] = useState(1);

  // Sinkron: saat search / filter berubah, kembali ke halaman 1
  useEffect(() => {
    setPage(1);
  }, [search, selectedBlok]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      const [makamResult, blokResult] = await Promise.all([
        getAllMakam(),
        getAllBlok(),
      ]);
      if (cancelled) return;
      if (makamResult.error) setError(makamResult.error);
      else setAllData(makamResult.data);
      if (blokResult.error) setError(blokResult.error);
      else setBlokList(blokResult.data);
      setLoading(false);
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const indexedData = useMemo(() => {
    return createSearchIndex(allData, (item) => [
      item.nama,
      item.nrp,
      item.blokNama,
      item.nomor,
      item.pangkat,
      item.kesatuan,
      formatDateSearch(item.tanggalLahir),
      formatDateSearch(item.tanggalGugur),
    ]);
  }, [allData]);

  const filtered = useMemo(() => {
    const result = searchWithIndex(indexedData, search);

    return result.filter(
      (item) => !selectedBlok || item.blokId === selectedBlok,
    );
  }, [indexedData, search, selectedBlok]);

  const sorted = useMemo(
    () => sortData(filtered, sortConfig, COLUMN_TYPES),
    [filtered, sortConfig],
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const handleSort = useCallback((key: keyof Makam) => {
    setSortConfig((prev) => toggleSort(prev, key));
    setPage(1);
  }, []);

  const addMakam = useCallback((makam: Makam) => {
    setAllData((prev) => [...prev, makam]);
  }, []);

  const updateMakam = useCallback((updated: Makam) => {
    setAllData((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  const removeMakam = useCallback((id: string) => {
    setAllData((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    loading,
    error,
    blokList,
    allData,
    search,
    setSearch,
    selectedBlok,
    setSelectedBlok,
    sortConfig,
    handleSort,
    page,
    setPage,
    pageSize: PAGE_SIZE,
    totalData: sorted.length,
    data: paginated,
    addMakam,
    updateMakam,
    removeMakam,
  };
}
