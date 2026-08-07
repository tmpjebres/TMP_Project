"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Copy, Check, ArrowLeft, ClipboardList, Send, KeyRound, Lock, Database, HelpCircle } from "lucide-react";
import { LOGIN_ROUTE } from "@/lib/routes";

const SUPPORT_EMAIL = "tmpjebres@gmail.com";

type IssueKey = "password" | "locked" | "data" | "other";

const ISSUES: Record<
  IssueKey,
  { label: string; icon: typeof KeyRound; subject: string; body: string }
> = {
  password: {
    label: "Lupa kata sandi",
    icon: KeyRound,
    subject: "Permintaan Reset Password - TMP Management System",
    body: `Halo Admin TMP Management System,

Saya lupa kata sandi dan ingin meminta reset password.

Nama pengguna (username): 
Nama lengkap: 
Jabatan / unit kerja: 

Terima kasih.`,
  },
  locked: {
    label: "Akun terkunci / tidak bisa masuk",
    icon: Lock,
    subject: "Akun Terkunci - TMP Management System",
    body: `Halo Admin TMP Management System,

Saya tidak bisa masuk ke akun meskipun kata sandi yang dimasukkan sudah benar.

Nama pengguna (username): 
Nama lengkap: 
Pesan error yang muncul (jika ada): 

Terima kasih.`,
  },
  data: {
    label: "Data makam / blok / tamu tidak sesuai",
    icon: Database,
    subject: "Laporan Data Tidak Sesuai - TMP Management System",
    body: `Halo Admin TMP Management System,

Saya ingin melaporkan data yang tampaknya tidak sesuai di sistem.

Nama pengguna (username): 
Menu / halaman terkait: 
Detail data yang tidak sesuai: 

Terima kasih.`,
  },
  other: {
    label: "Kendala lain",
    icon: HelpCircle,
    subject: "Permintaan Bantuan - TMP Management System",
    body: `Halo Admin TMP Management System,

Saya membutuhkan bantuan terkait kendala berikut.

Nama pengguna (username): 
Nama lengkap: 
Deskripsi kendala: 

Terima kasih.`,
  },
};

export default function HelpPage() {
  const [copied, setCopied] = useState(false);
  const [issue, setIssue] = useState<IssueKey>("password");

  const current = ISSUES[issue];
  const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    current.subject
  )}&body=${encodeURIComponent(current.body)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-neutral-white dark:bg-dark-surface overflow-hidden relative motion-reduce:[&_*]:!animate-none motion-reduce:[&_*]:!transition-none">
      <div className="h-screen overflow-y-auto flex items-start justify-center px-6 md:px-16 relative py-12">
        <div
          className="pointer-events-none absolute -z-10 w-[620px] h-[620px] rounded-full opacity-[0.18] blur-3xl animate-drift bg-[radial-gradient(circle_at_30%_30%,theme(colors.green.accent)_0%,theme(colors.green.primary)_55%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -z-10 right-[8%] bottom-[10%] w-[420px] h-[420px] rounded-full opacity-[0.14] blur-3xl animate-drift [animation-duration:18s] [animation-direction:reverse] bg-[radial-gradient(circle_at_60%_60%,theme(colors.green.secondary)_0%,transparent_70%)]"
          aria-hidden="true"
        />

        <div className="w-full max-w-lg">
          <Link
            href={LOGIN_ROUTE}
            className="inline-flex items-center gap-1.5 font-body text-sm text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:hover:text-dark-brand-accent transition-colors mb-8 opacity-0 animate-fade-in"
          >
            <ArrowLeft size={16} />
            Kembali ke halaman masuk
          </Link>

          <p className="font-body opacity-0 animate-fade-in [animation-delay:0.05s] text-xs font-semibold tracking-[0.18em] uppercase text-green-accent dark:text-dark-brand-accent mb-4">
            TMP Management System
          </p>

          <h1 className="font-display text-4xl md:text-5xl font-light text-green-primary dark:text-dark-brand-accent mb-3 tracking-normal opacity-0 animate-fade-in [animation-delay:0.12s]">
            Butuh bantuan?
          </h1>

          <p className="font-body opacity-0 animate-fade-in [animation-delay:0.2s] text-neutral-gray dark:text-dark-text-secondary mb-8 leading-relaxed">
            Sistem ini belum melayani permintaan otomatis. Pilih jenis kendala, lalu
            kirim email ke admin — mulai dari lupa kata sandi sampai masalah lainnya.
          </p>

          <div className="opacity-0 animate-fade-in [animation-delay:0.24s] grid grid-cols-2 gap-2 mb-5">
            {(Object.keys(ISSUES) as IssueKey[]).map((key) => {
              const item = ISSUES[key];
              const Icon = item.icon;
              const active = issue === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIssue(key)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left font-body text-sm transition-all duration-200
                    ${active
                      ? "bg-green-primary dark:bg-dark-brand-secondary text-white border-green-primary dark:border-dark-brand-primary shadow-card"
                      : "bg-green-light dark:bg-dark-brand-light/40 backdrop-blur-md border-green-light dark:border-dark-brand-light/80 text-neutral-black dark:text-dark-text-primary hover:bg-green-light dark:hover:bg-dark-brand-light/70"
                    }`}
                >
                  <Icon size={16} className={active ? "text-white shrink-0" : "text-green-accent dark:text-dark-brand-accent shrink-0"} />
                  <span className="leading-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="opacity-0 animate-fade-in [animation-delay:0.32s] rounded-2xl border bg-green-light dark:bg-dark-brand-light/40 backdrop-blur-md border-green-light dark:border-dark-brand-light/80 shadow-card p-5 mb-5">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-green-primary dark:bg-dark-brand-secondary/10 flex items-center justify-center text-green-primary dark:text-dark-brand-accent">
                <Mail size={18} />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="font-body text-xs text-neutral-gray dark:text-dark-text-secondary mb-0.5">Kirim permintaan ke</p>
                <p className="font-body font-medium text-neutral-black dark:text-dark-text-primary truncate">{SUPPORT_EMAIL}</p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-body font-medium text-green-primary dark:text-dark-brand-accent bg-white dark:bg-dark-surface/70 border border-green-light dark:border-dark-brand-light hover:bg-white dark:hover:bg-dark-surface transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Tersalin" : "Salin"}
              </button>
            </div>
          </div>

          <a
            href={mailtoHref}
            className="opacity-0 animate-fade-in [animation-delay:0.4s] w-full flex items-center justify-center gap-2 px-5 py-4 bg-green-primary dark:bg-dark-brand-secondary text-white rounded-xl font-body font-medium shadow-card hover:bg-green-secondary dark:hover:bg-dark-brand-primary hover:shadow-card-hover active:scale-[0.97] transition-all duration-200"
          >
            <Send size={18} />
            Buka draf email — {current.label}
          </a>

          <p className="opacity-0 animate-fade-in [animation-delay:0.46s] font-body text-xs text-neutral-gray dark:text-dark-text-secondary text-center mt-3">
            Tombol ini membuka aplikasi email Anda dengan subjek dan isi pesan yang sudah terisi
            sesuai jenis kendala yang dipilih.
          </p>

          <div className="opacity-0 animate-fade-in [animation-delay:0.54s] mt-8 rounded-2xl border border-green-light dark:border-dark-brand-light bg-white dark:bg-dark-surface p-5 text-left">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={16} className="text-green-accent dark:text-dark-brand-accent" />
              <p className="font-body text-sm font-semibold text-green-primary dark:text-dark-brand-accent">
                Sertakan informasi berikut di email
              </p>
            </div>
            <ul className="space-y-2 font-body text-sm text-neutral-gray dark:text-dark-text-secondary">
              <li className="flex gap-2">
                <span className="text-green-accent dark:text-dark-brand-accent">•</span>
                Nama pengguna (username) akun Anda
              </li>
              <li className="flex gap-2">
                <span className="text-green-accent dark:text-dark-brand-accent">•</span>
                Nama lengkap dan jabatan / unit kerja
              </li>
              <li className="flex gap-2">
                <span className="text-green-accent dark:text-dark-brand-accent">•</span>
                Deskripsi singkat kendala yang dialami, termasuk pesan error jika ada
              </li>
            </ul>
            <p className="font-body text-xs text-neutral-gray dark:text-dark-text-secondary mt-4 pt-4 border-t border-green-light dark:border-dark-brand-light">
              Admin akan membalas melalui email yang sama. Proses biasanya selesai dalam
              1×24 jam kerja.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden md:block relative overflow-hidden">
        <img
          src="/login-image.jpg"
          alt="Visual pemakaman"
          className="w-full h-full object-cover animate-kenburns"
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-green-primary/0 via-green-primary/0 to-green-primary/40"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}