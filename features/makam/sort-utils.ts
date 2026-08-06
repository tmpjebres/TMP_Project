export type SortDirection = "asc" | "desc" | null;

export interface SortConfig<T> {
  key: keyof T | null;
  direction: SortDirection;
}

/** Column type tells sortData how to compare values */
export type ColumnType = "string" | "number" | "date";


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


// Returns a sorted copy; never mutates the original array
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

// Tri-state toggle: null → asc → desc → null
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