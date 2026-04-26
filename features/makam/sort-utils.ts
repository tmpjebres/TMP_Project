export type SortDirection = "asc" | "desc" | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

/** Column type tells sortData how to compare values */
export type ColumnType = "string" | "number" | "date";

// ─── Parsers ──────────────────────────────────────────────────────────────────

function parseDateDMY(value: string): number {
  if (!value) return -Infinity;
  const parts = value.split("/");
  if (parts.length !== 3) return -Infinity;
  const [d, m, y] = parts.map(Number);
  return new Date(y, m - 1, d).getTime();
}

function parseNumber(value: unknown): number {
  const n = Number(value);
  return isNaN(n) ? -Infinity : n;
}

// ─── Core comparator factory ──────────────────────────────────────────────────

function createComparator<T>(
  key: keyof T,
  type: ColumnType,
  direction: "asc" | "desc"
): (a: T, b: T) => number {
  const sign = direction === "asc" ? 1 : -1;

  return (a: T, b: T): number => {
    const rawA = a[key] as unknown as string;
    const rawB = b[key] as unknown as string;

    let diff = 0;

    switch (type) {
      case "date":
        diff = parseDateDMY(rawA) - parseDateDMY(rawB);
        break;
      case "number":
        diff = parseNumber(rawA) - parseNumber(rawB);
        break;
      case "string":
      default:
        diff = String(rawA ?? "").localeCompare(String(rawB ?? ""), "id", {
          sensitivity: "base",
        });
        break;
    }

    return sign * diff;
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a sorted copy of `data`. Never mutates the original array.
 *
 * @param data        Source array
 * @param config      Current sort state
 * @param columnTypes Map of column key → data type (used for smart comparison)
 */
export function sortData<T>(
  data: T[],
  config: SortConfig<T>,
  columnTypes: Partial<Record<keyof T, ColumnType>>
): T[] {
  if (!config.key || !config.direction) return data;

  const type = columnTypes[config.key] ?? "string";
  const comparator = createComparator<T>(
    config.key,
    type,
    config.direction
  );

  return [...data].sort(comparator);
}

/**
 * Toggles sort direction or sets a new column:
 *   null → asc → desc → null (tri-state, returns to original order)
 */
export function toggleSort<T>(
  current: SortConfig<T>,
  key: keyof T
): SortConfig<T> {
  if (current.key !== key) return { key, direction: "asc" };

  const next: Record<string, SortDirection> = {
    asc: "desc",
    desc: null,
  };

  return {
    key: next[current.direction ?? "desc"] === null ? null : key,
    direction: next[current.direction ?? "desc"] as SortDirection,
  };
}

// ─── UI helper ────────────────────────────────────────────────────────────────

/** Returns the sort indicator character for a column header */
export function getSortIndicator<T>(
  config: SortConfig<T>,
  key: keyof T
): "↑" | "↓" | "↕" {
  if (config.key !== key) return "↕";
  if (config.direction === "asc") return "↑";
  if (config.direction === "desc") return "↓";
  return "↕";
}