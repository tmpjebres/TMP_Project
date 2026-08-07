import { Loader2, Trash2 } from "lucide-react";
import type { AppUser } from "@/types";

export function DeleteModal({
  user,
  loading,
  onConfirm,
  onClose,
}: {
  user: AppUser;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 pt-6 pb-5">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-dark-text-primary mb-1">Hapus User?</h2>
          <p className="text-sm text-neutral-500 dark:text-dark-text-secondary leading-relaxed">
            Akun <span className="font-semibold text-neutral-800 dark:text-dark-text-primary">{user.username}</span>{" "}
            akan dihapus secara permanen dan tidak bisa dikembalikan.
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-2.5">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              text-sm font-semibold bg-red-600 text-white hover:bg-red-700 active:bg-red-800
              disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              "Ya, Hapus"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border border-neutral-200 dark:border-dark-border
              text-neutral-600 dark:text-dark-text-secondary hover:bg-neutral-50 dark:hover:bg-dark-surface-hover transition-colors disabled:opacity-50"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}