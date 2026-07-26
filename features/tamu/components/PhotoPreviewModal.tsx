import { X } from "lucide-react";

interface PhotoPreviewModalProps {
  photoUrl: string;
  onClose: () => void;
}

export default function PhotoPreviewModal({ photoUrl, onClose }: PhotoPreviewModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 16, fontWeight: 700 }} className="text-neutral-black">
            Bukti Foto Tamu
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-light-gray rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          <img
            src={photoUrl}
            alt="Bukti foto tamu"
            className="w-full rounded-xl object-contain max-h-[70vh]"
          />
        </div>
      </div>
    </div>
  );
}
