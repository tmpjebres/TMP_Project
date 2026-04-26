'use client';

import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

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
    <div
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      <div
        className="flex items-center gap-3 bg-neutral-black text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl animate-fade-in"
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <CheckCircle2 size={18} className="text-status-success flex-shrink-0" />
        {message}
      </div>
    </div>
  );
}
