import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";
import { Blok, Makam } from "@/types";
import LoadingButton from "@/components/ui/LoadingButton";
import {
  validateMakamForm,
  validateField as validateSingleField,
  MakamFormValues,
  FormErrors,
  ValidationContext,
} from "../validation";


interface FieldErrorProps {
  message?: string;
}

/** Inline error beneath a form field */
function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p
      role="alert"
      aria-live="polite"
      className="flex items-center gap-1.5 mt-1.5 text-sm text-red-600"
    >
      <AlertCircle size={13} className="flex-shrink-0" />
      {message}
    </p>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

/** Wrapper that pairs a label, input, and its inline error */
function FormField({
  label,
  required,
  error,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={className}>
      <label className="block text-base font-semibold text-neutral-black dark:text-dark-text-primary mb-2">
        {label}
        {required && (
          <span className="text-status-danger ml-1" aria-label="wajib diisi">
            *
          </span>
        )}
      </label>
      {children}
      <FieldError message={error} />
    </div>
  );
}


// Formats raw digits into dd/mm/yyyy as the user types
function applyDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  let out = digits.slice(0, 2);
  if (digits.length > 2) out += "/" + digits.slice(2, 4);
  if (digits.length > 4) out += "/" + digits.slice(4, 8);
  return out;
}


interface MakamModalProps {
  makam: Makam | null;
  bloks: Blok[];
  makams?: Makam[];
  onSave: (d: Omit<Makam, "id" | "blokNama">) => void | Promise<void>;
  onClose: () => void;
}

const INITIAL_FORM = (makam: Makam | null, firstBlokId: string): MakamFormValues => ({
  nama: makam?.nama ?? "",
  blokId: makam?.blokId ?? firstBlokId,
  nomor: makam?.nomor ?? "",
  nrp: makam?.nrp ?? "",
  pangkat: makam?.pangkat ?? "",
  tanggalLahir: makam?.tanggalLahir ?? "",
  tanggalGugur: makam?.tanggalGugur ?? "",
  kesatuan: makam?.kesatuan ?? "",
});

export function MakamModal({
  makam,
  bloks,
  makams = [],
  onSave,
  onClose,
}: MakamModalProps) {
  const [form, setForm] = useState<MakamFormValues>(() =>
    INITIAL_FORM(makam, bloks[0]?.id ?? "")
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);


  const handleChange = useCallback(
    (key: keyof MakamFormValues) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [key]: value }));
        // Clear error eagerly on change so the field doesn't stay red
        setErrors((prev) => ({ ...prev, [key]: undefined }));
      },
    []
  );


  const handleDateChange = useCallback(
    (field: "tanggalLahir" | "tanggalGugur") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const masked = applyDateMask(e.target.value);
        setForm((prev) => ({ ...prev, [field]: masked }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      },
    []
  );


  const handleBlur = useCallback(
    (key: keyof MakamFormValues) => () => {
      const ctx: ValidationContext = {
        form,
        existingMakams: makams,
        editingId: makam?.id,
      };
      const error = validateSingleField(key, form[key] ?? "", ctx);
      setErrors((prev) => ({ ...prev, [key]: error || undefined }));
    },
    [form, makams, makam?.id]
  );


  const handleSave = async () => {
    if (saving) return;

    const newErrors = validateMakamForm(form, makams, makam?.id);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll first error into view for accessibility
      const firstErrorKey = Object.keys(newErrors)[0];
      document.getElementById(`field-${firstErrorKey}`)?.focus();
      return;
    }

    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl p-8 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2
            id="modal-title"
            style={{
              fontFamily: "Plus Jakarta Sans, sans-serif",
              fontSize: 20,
              fontWeight: 700,
            }}
            className="text-neutral-black dark:text-dark-text-primary"
          >
            {makam ? "Edit Makam" : "Tambah Makam"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-light-gray dark:hover:bg-dark-surface-hover rounded-lg transition-colors"
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {hasErrors && (
          <div
            role="alert"
            className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700"
          >
            <AlertCircle size={16} className="flex-shrink-0" />
            Harap perbaiki kesalahan pada formulir sebelum menyimpan.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="Nama Pahlawan"
            required
            error={errors.nama}
            className="sm:col-span-2"
          >
            <input
              id="field-nama"
              type="text"
              className={`form-input text-base py-3.5 ${errors.nama ? "border-red-400 focus:ring-red-300" : ""}`}
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={handleChange("nama")}
              onBlur={handleBlur("nama")}
              aria-invalid={!!errors.nama}
              aria-describedby={errors.nama ? "err-nama" : undefined}
            />
          </FormField>

          <FormField label="NRP" error={errors.nrp}>
            <input
              id="field-nrp"
              type="text"
              inputMode="numeric"
              className={`form-input text-base py-3.5 ${errors.nrp ? "border-red-400 focus:ring-red-300" : ""}`}
              placeholder="Nomor Registrasi Pokok"
              value={form.nrp}
              onChange={handleChange("nrp")}
              onBlur={handleBlur("nrp")}
              aria-invalid={!!errors.nrp}
            />
          </FormField>

          <FormField label="Pangkat" error={errors.pangkat}>
            <input
              id="field-pangkat"
              type="text"
              className="form-input text-base py-3.5"
              placeholder="Pangkat / gelar"
              value={form.pangkat}
              onChange={handleChange("pangkat")}
            />
          </FormField>

          <FormField label="Blok" error={errors.blokId}>
            <select
              id="field-blokId"
              className="form-input text-base py-3.5"
              value={form.blokId}
              onChange={handleChange("blokId")}
              onBlur={handleBlur("nomor")} // re-validate nomor on blok change
            >
              {bloks.map((b) => (
                <option key={b.id} value={b.id}>
                  Blok {b.nama}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Nomor Makam" required error={errors.nomor}>
            <input
              id="field-nomor"
              type="text"
              inputMode="numeric"
              className={`form-input text-base py-3.5 ${errors.nomor ? "border-red-400 focus:ring-red-300" : ""}`}
              placeholder="001"
              value={form.nomor}
              onChange={handleChange("nomor")}
              onBlur={handleBlur("nomor")}
              aria-invalid={!!errors.nomor}
            />
          </FormField>

          <FormField label="Tanggal Lahir" error={errors.tanggalLahir}>
            <input
              id="field-tanggalLahir"
              type="text"
              inputMode="numeric"
              className={`form-input text-base py-3.5 ${errors.tanggalLahir ? "border-red-400 focus:ring-red-300" : ""}`}
              placeholder="dd/mm/yyyy"
              value={form.tanggalLahir}
              onChange={handleDateChange("tanggalLahir")}
              onBlur={handleBlur("tanggalLahir")}
              maxLength={10}
              aria-invalid={!!errors.tanggalLahir}
            />
          </FormField>

          <FormField label="Gugur / Wafat" error={errors.tanggalGugur}>
            <input
              id="field-tanggalGugur"
              type="text"
              inputMode="numeric"
              className={`form-input text-base py-3.5 ${errors.tanggalGugur ? "border-red-400 focus:ring-red-300" : ""}`}
              placeholder="dd/mm/yyyy"
              value={form.tanggalGugur}
              onChange={handleDateChange("tanggalGugur")}
              onBlur={handleBlur("tanggalGugur")}
              maxLength={10}
              aria-invalid={!!errors.tanggalGugur}
            />
          </FormField>

          <FormField
            label="Kesatuan"
            error={errors.kesatuan}
            className="sm:col-span-2"
          >
            <input
              id="field-kesatuan"
              type="text"
              className="form-input text-base py-3.5"
              placeholder="Nama kesatuan / satuan"
              value={form.kesatuan}
              onChange={handleChange("kesatuan")}
            />
          </FormField>
        </div>

        <div className="flex gap-3 mt-7">
          <LoadingButton
            onClick={handleSave}
            loading={saving}
            className="btn-primary text-base py-3"
          >
            <CheckCircle2 size={18} className="mr-2" />
            Simpan
          </LoadingButton>
          <button onClick={onClose} className="btn-secondary text-base py-3">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}