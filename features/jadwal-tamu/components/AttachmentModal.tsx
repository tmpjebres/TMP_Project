'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Loader2, X } from 'lucide-react';
import type { JadwalTamu } from '@/types';
import { getAttachmentSignedUrl } from '../api';

interface AttachmentModalProps {
  event: JadwalTamu;
  onClose: () => void;
}

export default function AttachmentModal({ event, onClose }: AttachmentModalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      if (event.attachmentType === 'link') {
        if (active) {
          setUrl(event.attachmentUrl ?? null);
          setLoading(false);
        }
        return;
      }
      const signed = event.attachmentUrl ? await getAttachmentSignedUrl(event.attachmentUrl) : null;
      if (active) {
        setUrl(signed);
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [event]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid #EEEEEE' }}>
          <div>
            <h2 className="text-base font-bold text-neutral-black dark:text-dark-text-primary" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Detail Surat
            </h2>
            <p className="text-xs text-neutral-gray dark:text-dark-text-secondary mt-0.5">{event.attachmentFilename ?? 'Lampiran'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-light-gray dark:bg-dark-surface-hover text-neutral-gray dark:text-dark-text-secondary">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5 flex items-center justify-center">
          {loading && <Loader2 size={28} className="animate-spin text-green-primary dark:text-dark-brand-accent" />}

          {!loading && !url && (
            <p className="text-sm text-neutral-gray dark:text-dark-text-secondary">Lampiran tidak ditemukan atau gagal dimuat.</p>
          )}

          {!loading && url && event.attachmentType === 'image' && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={event.attachmentFilename ?? 'Lampiran'} className="max-h-[60vh] rounded-lg object-contain" />
          )}

          {!loading && url && event.attachmentType === 'pdf' && (
            <iframe src={url} className="w-full h-[60vh] rounded-lg" style={{ border: '1px solid #EEEEEE' }} />
          )}

          {!loading && url && event.attachmentType === 'link' && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-green-primary dark:bg-dark-brand-secondary text-white text-sm font-semibold rounded-lg hover:bg-green-secondary dark:bg-dark-brand-primary transition-colors"
            >
              <ExternalLink size={16} />
              Buka Link Drive
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
