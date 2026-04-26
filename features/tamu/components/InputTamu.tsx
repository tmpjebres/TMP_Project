'use client';

import { Users, UserCheck } from 'lucide-react';
import type { Page } from '@/types';

interface Props {
  onNavigate: (p: Page) => void;
}

const CARDS = [
  {
    page: 'tamu-umum' as Page,
    icon: UserCheck,
    title: 'Tamu Umum',
    desc: 'Catat kunjungan tamu perorangan',
  },
  {
    page: 'tamu-rombongan' as Page,
    icon: Users,
    title: 'Tamu Rombongan',
    desc: 'Catat kunjungan rombongan atau instansi',
  },
];

export default function InputTamu({ onNavigate }: Props) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center animate-fade-in px-4">
      <div className="text-center mb-10">
        <h1
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 32, fontWeight: 800 }}
          className="text-neutral-black"
        >
          Pencatatan Tamu
        </h1>
        <p className="text-lg text-neutral-gray mt-2">Pilih jenis tamu yang akan dicatat</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl">
        {CARDS.map((card) => (
          <button
            key={card.page}
            onClick={() => onNavigate(card.page)}
            className="group bg-white rounded-2xl text-left transition-all duration-200 cursor-pointer p-10
              border-2 border-[rgba(221,221,221,0.6)] shadow-sm
              hover:border-green-primary hover:shadow-card-hover hover:-translate-y-0.5"
          >
            <div className="w-16 h-16 bg-green-light rounded-2xl flex items-center justify-center mb-6 transition-transform duration-200 group-hover:scale-110">
              <card.icon size={30} className="text-green-primary" />
            </div>
            <h3
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 22, fontWeight: 700 }}
              className="text-neutral-black mb-2"
            >
              {card.title}
            </h3>
            <p className="text-base text-neutral-gray leading-relaxed">{card.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
