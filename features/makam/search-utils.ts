// ─── Types ────────────────────────────────────────────────────────────────

export type SearchableValue =
  | string
  | number
  | null
  | undefined
  | Date;

// ─── Core Normalization ───────────────────────────────────────────────────
export const normalize = (val: SearchableValue): string => {
  if (val === null || val === undefined) return '';

  // handle Date object
  if (val instanceof Date) {
    return val.toISOString().toLowerCase();
  }

  return String(val).toLowerCase().trim();
};

// ─── Date Formatting for Search ───────────────────────────────────────────
export const formatDateSearch = (
  date: string | Date | null | undefined
): string => {
  if (!date) return '';

  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) return '';

  return [
    d.toISOString(), // 2024-01-01
    d.toLocaleDateString('id-ID'), // 01/01/2024
    d.getFullYear().toString(), // 2024
  ]
    .join(' ')
    .toLowerCase();
};

// ─── Build Searchable String ──────────────────────────────────────────────
export const buildSearchIndex = (fields: SearchableValue[]): string => {
  return fields.map(normalize).join(' ');
};

// ─── Generic Match Function ───────────────────────────────────────────────
export const matchesSearch = (
  fields: SearchableValue[],
  query: string
): boolean => {
  const q = normalize(query);

  if (!q) return true;

  return fields.some((field) => normalize(field).includes(q));
};

// ─── Advanced (Optional) – Prebuilt Index (for performance) ────────────────
export const createSearchIndex = <T>(
  items: T[],
  getFields: (item: T) => SearchableValue[]
): { item: T; index: string }[] => {
  return items.map((item) => ({
    item,
    index: buildSearchIndex(getFields(item)),
  }));
};

export const searchWithIndex = <T>(
  indexed: { item: T; index: string }[],
  query: string
): T[] => {
  const q = normalize(query);

  if (!q) return indexed.map((i) => i.item);

  return indexed
    .filter((i) => i.index.includes(q))
    .map((i) => i.item);
};