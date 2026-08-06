
export type SearchableValue =
  | string
  | number
  | null
  | undefined
  | Date;

export const normalize = (val: SearchableValue): string => {
  if (val === null || val === undefined) return '';

  if (val instanceof Date) {
    return val.toISOString().toLowerCase();
  }

  return String(val).toLowerCase().trim();
};

export const formatDateSearch = (
  date: string | Date | null | undefined
): string => {
  if (!date) return '';

  const parseToDate = (value: string): Date | null => {
    const v = value.trim();
    const dmy = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    if (dmy) {
      const [, dd, mm, yy] = dmy;
      const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? null : d;
    }
    const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
    if (iso) {
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }
    const fallback = new Date(v);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  const d =
    date instanceof Date ? date : parseToDate(String(date));

  if (!d || isNaN(d.getTime())) return '';

  return [
    d.toISOString(), // 2024-01-01
    d.toLocaleDateString('id-ID'), // 01/01/2024
    d.getFullYear().toString(), // 2024
  ]
    .join(' ')
    .toLowerCase();
};

export const buildSearchIndex = (fields: SearchableValue[]): string => {
  return fields.map(normalize).join(' ');
};

export const matchesSearch = (
  fields: SearchableValue[],
  query: string
): boolean => {
  const q = normalize(query);

  if (!q) return true;

  return fields.some((field) => normalize(field).includes(q));
};

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