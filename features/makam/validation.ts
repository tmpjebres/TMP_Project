import { Makam } from "@/types";

// ─── Primitives ──────────────────────────────────────────────────────────────

/** dd/mm/yyyy — allows partial entry while typing */
const DATE_MASK_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function isValidDate(value: string): boolean {
  if (!value) return true; // optional field — absent is valid

  if (!DATE_MASK_REGEX.test(value)) return false;

  const [d, m, y] = value.split("/").map(Number);
  const date = new Date(y, m - 1, d);

  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

export function isNumericString(value: string): boolean {
  return /^\d+$/.test(value);
}

// ─── Field validators ─────────────────────────────────────────────────────────
// Each returns "" (valid) or a human-readable error string.

export type FieldValidator = (
  value: string,
  context?: ValidationContext
) => string;

/** Context lets validators reference other fields (e.g. cross-field checks) */
export interface ValidationContext {
  form: MakamFormValues;
  existingMakams: Makam[];
  editingId?: string;
}

export const validators: Record<string, FieldValidator> = {
  nama(value) {
    if (!value.trim()) return "Nama wajib diisi";
    if (value.trim().length < 2) return "Nama minimal 2 karakter";
    return "";
  },

  nomor(value, ctx) {
    if (!value.trim()) return "Nomor makam wajib diisi";
    if (!isNumericString(value)) return "Nomor hanya boleh berisi angka";
    if (Number(value) <= 0) return "Nomor makam harus lebih dari 0";

    // Cross-field uniqueness check (blok + nomor)
    if (ctx) {
      const duplicate = ctx.existingMakams.some(
        (m) =>
          m.blokId === ctx.form.blokId &&
          String(m.nomor) === String(value) &&
          m.id !== ctx.editingId
      );
      if (duplicate) return "Nomor makam di blok ini sudah digunakan";
    }

    return "";
  },

  nrp(value) {
    if (!value) return ""; // optional
    if (!isNumericString(value)) return "NRP hanya boleh berisi angka";
    if (value.length < 4) return "NRP minimal 4 digit";
    return "";
  },

  pangkat() {
    return ""; // free text, no constraint
  },

  kesatuan() {
    return ""; // free text, no constraint
  },

  tanggalLahir(value) {
    if (!value) return ""; // optional
    if (!isValidDate(value)) return "Format tanggal tidak valid (dd/mm/yyyy)";
    return "";
  },

  tanggalGugur(value, ctx) {
    if (!value) return ""; // optional
    if (!isValidDate(value)) return "Format tanggal tidak valid (dd/mm/yyyy)";

    // Logical: gugur must not be before lahir
    if (ctx?.form.tanggalLahir && isValidDate(ctx.form.tanggalLahir)) {
      const [ld, lm, ly] = ctx.form.tanggalLahir.split("/").map(Number);
      const [gd, gm, gy] = value.split("/").map(Number);
      const lahir = new Date(ly, lm - 1, ld);
      const gugur = new Date(gy, gm - 1, gd);
      if (gugur < lahir)
        return "Tanggal gugur/wafat tidak boleh sebelum tanggal lahir";
    }

    return "";
  },
};

// ─── Whole-form validation ────────────────────────────────────────────────────

export interface MakamFormValues {
  nama: string;
  blokId: string;
  nomor: string;
  nrp: string;
  pangkat: string;
  tanggalLahir: string;
  tanggalGugur: string;
  kesatuan: string;
}

export type FormErrors = Partial<Record<keyof MakamFormValues, string>>;

/**
 * Validates all fields at once (used on submit).
 * Returns a map of field → error string; empty map = no errors.
 */
export function validateMakamForm(
  form: MakamFormValues,
  existingMakams: Makam[],
  editingId?: string
): FormErrors {
  const ctx: ValidationContext = { form, existingMakams, editingId };
  const errors: FormErrors = {};

  (Object.keys(validators) as (keyof MakamFormValues)[]).forEach((key) => {
    const validate = validators[key];
    if (validate) {
      const error = validate(form[key] ?? "", ctx);
      if (error) errors[key] = error;
    }
  });

  return errors;
}

/**
 * Validates a single field for real-time feedback.
 */
export function validateField(
  key: keyof MakamFormValues,
  value: string,
  ctx?: ValidationContext
): string {
  return validators[key]?.(value, ctx) ?? "";
}