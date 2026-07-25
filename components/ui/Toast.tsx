"use client";

import { useEffect } from "react";
import { AlertTriangle,CheckCircle2 } from "lucide-react";
import type { Toast } from "@/features/user/hooks/useToast";

interface ToastProps {
  message: string;
  onDone: () => void;
}

export default function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div
        className="flex items-center gap-3 bg-neutral-black text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl animate-fade-in"
        style={{ backdropFilter: "blur(8px)" }}
      >
        <CheckCircle2 size={18} className="text-status-success flex-shrink-0" />
        {message}
      </div>
    </div>
  );
}

export function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: number) => void;
}) {
  return (
    <>
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out both; }
      `}</style>
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg cursor-pointer
            text-sm font-medium transition-all duration-300 animate-slide-up max-w-sm
            ${t.type === "success"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
            }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          {t.message}
        </div>
      ))}
      </div>
    </>
  );
}