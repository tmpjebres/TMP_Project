import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

export type SortKey = "tanggal" | "nama" | "instansi" | "peserta";

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  activeKey: string;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
}

export default function SortableHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: SortableHeaderProps) {
  const isActive = activeKey === sortKey;
  return (
    <th style={{ fontSize: 14 }}>
      <button
        onClick={() => onSort(sortKey)}
        className="flex items-center gap-1 font-semibold hover:text-neutral-black dark:text-dark-text-primary transition-colors"
      >
        {label}
        {isActive ? (
          dir === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
        ) : (
          <ArrowUpDown size={14} className="text-neutral-gray dark:text-dark-text-secondary/50" />
        )}
      </button>
    </th>
  );
}
