interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 18, fontWeight: 700 }} className="text-neutral-black mb-3">
          Konfirmasi Hapus
        </h2>
        <p className="text-base text-neutral-gray mb-7">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="px-6 py-3 bg-status-danger text-white text-base font-semibold rounded-lg hover:opacity-90 transition-opacity">
            Hapus
          </button>
          <button onClick={onCancel} className="btn-secondary text-base py-3">Batal</button>
        </div>
      </div>
    </div>
  );
}
