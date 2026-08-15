"use client";

import { useState } from "react";
import { Eye, EyeOff, UserX } from "lucide-react";
import { useAuth } from "@/lib/context/auth-context";
import LoadingButton from "@/components/ui/LoadingButton";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

function FieldGlass({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  focused,
  onFocus,
  onBlur,
  delayClass,
  rightSlot,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  delayClass: string;
  rightSlot?: React.ReactNode;
}) {
  const active = focused || value.length > 0;
  return (
    <div
      className={`group relative rounded-2xl border px-4 opacity-0 animate-fade-in ${delayClass}
        bg-green-light dark:bg-dark-brand-light/40 backdrop-blur-md border-green-light dark:border-dark-brand-light/80 shadow-card
        transition-all duration-300
        ${focused ? "bg-green-light dark:bg-dark-brand-light/70 border-green-accent dark:border-dark-brand-primary/70 shadow-glow -translate-y-px" : ""}`}
    >
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 origin-left transition-all duration-300 ease-out
          ${active
            ? "top-[0.5rem] scale-[0.72] text-green-accent dark:text-dark-brand-accent font-semibold tracking-wide uppercase"
            : "top-[1.15rem] scale-100 text-neutral-gray dark:text-dark-text-secondary"
          }`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        autoComplete={autoComplete}
        value={value}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent border-none outline-none pt-6 pb-[0.6rem] text-neutral-black dark:text-dark-text-primary font-body
          [&:-webkit-autofill]:[-webkit-text-fill-color:theme(colors.neutral.black)]
          [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_theme(colors.transparent)_inset]
          [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s]
          [&:-webkit-autofill:focus]:[-webkit-box-shadow:0_0_0_1000px_theme(colors.green.light/70%)_inset]
          ${rightSlot ? "pr-8" : ""}`}
      />
      {rightSlot}
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<"invalid_credentials" | "account_disabled" | "unknown" | null>(null);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<"username" | "password" | null>(null);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const triggerShake = () => {
    setShake(false);
    requestAnimationFrame(() => setShake(true));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorCode(null);

    if (!username.trim()) {
      setError("Nama pengguna wajib diisi.");
      triggerShake();
      return;
    }
    if (!password) {
      setError("Kata sandi wajib diisi.");
      triggerShake();
      return;
    }

    setLoading(true);
    const result = await login(username, password);

    if (!result.success) {
      setLoading(false);
      setError(result.error ?? "Gagal masuk. Silakan coba lagi.");
      setErrorCode(result.code ?? "unknown");
      triggerShake();
      return;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-neutral-white dark:bg-dark-surface overflow-hidden relative motion-reduce:[&_*]:!animate-none motion-reduce:[&_*]:!transition-none">
      <div className="flex items-center justify-center px-6 md:px-16 relative">
        <div
          className="pointer-events-none absolute -z-10 w-[620px] h-[620px] rounded-full opacity-[0.18] blur-3xl animate-drift bg-[radial-gradient(circle_at_30%_30%,theme(colors.green.accent)_0%,theme(colors.green.primary)_55%,transparent_75%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -z-10 right-[8%] bottom-[10%] w-[420px] h-[420px] rounded-full opacity-[0.14] blur-3xl animate-drift [animation-duration:18s] [animation-direction:reverse] bg-[radial-gradient(circle_at_60%_60%,theme(colors.green.secondary)_0%,transparent_70%)]"
          aria-hidden="true"
        />

        <div className={`w-full max-w-lg text-center ${shake ? "animate-shake" : ""}`}>
          <p
            className="font-body opacity-0 animate-fade-in [animation-delay:0.02s] text-xs font-semibold tracking-[0.18em] uppercase text-green-accent dark:text-dark-brand-accent mb-4"
          >
            TMP Management System
          </p>

          <h1 className="font-display text-4xl md:text-5xl text-green-primary dark:text-dark-brand-accent mb-3 tracking-normal">
            {"Masuk".split(" ").map((word, i) => (
              <span
                key={word}
                className="inline-block opacity-0 animate-word-in mr-3"
                style={{ animationDelay: `${0.1 + i * 0.12}s` }}
              >
                {word}
              </span>
            ))}
          </h1>

          <p className="font-body opacity-0 animate-fade-in [animation-delay:0.32s] text-neutral-gray dark:text-dark-text-secondary mb-10">
            Kelola data makam, blok, dan tamu dalam satu portal admin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="w-3/4 mx-auto text-left">
              <FieldGlass
                id="lp-username"
                label="Nama Pengguna"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(v) => {
                  setUsername(v);
                  setError("");
                  setErrorCode(null);
                }}
                focused={focusedField === "username"}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField(null)}
                delayClass="[animation-delay:0.4s]"
              />
            </div>

            <div className="w-3/4 mx-auto text-left">
              <FieldGlass
                id="lp-password"
                label="Kata Sandi"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  setError("");
                  setErrorCode(null);
                }}
                focused={focusedField === "password"}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                delayClass="[animation-delay:0.48s]"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    tabIndex={-1}
                    className="absolute right-3 top-[1.05rem] text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:hover:text-dark-brand-accent transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff size={18} strokeWidth={1.8} />
                    ) : (
                      <Eye size={18} strokeWidth={1.8} />
                    )}
                  </button>
                }
              />

              <div className="mt-2 text-right">
                <Link
                  href={ROUTES.help}
                  className="font-body text-xs text-neutral-gray dark:text-dark-text-secondary hover:text-green-primary dark:hover:text-dark-brand-accent transition-colors"
                >
                  Lupa kata sandi?
                </Link>
              </div>
            </div>

            <div className="min-h-[1.25rem]" aria-live="polite">
              {error && errorCode === "account_disabled" ? (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-left opacity-0 animate-fade-in">
                  <UserX size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body text-sm font-semibold text-amber-800">
                      Akun dinonaktifkan
                    </p>
                    <p className="font-body text-xs text-amber-700 mt-0.5">
                      Akun Anda telah dinonaktifkan oleh master. Hubungi master untuk
                      mengaktifkan kembali akun Anda.
                    </p>
                  </div>
                </div>
              ) : (
                error && (
                  <p className="font-body text-sm text-status-danger opacity-0 animate-fade-in">
                    {error}
                  </p>
                )
              )}
            </div>

            <div className="opacity-0 animate-fade-in [animation-delay:0.56s]">
              <LoadingButton
                type="submit"
                loading={loading}
                className="w-3/4 px-5 py-4 bg-green-primary dark:bg-dark-brand-secondary text-white rounded-xl font-body font-medium shadow-card hover:bg-green-secondary dark:hover:bg-dark-brand-primary hover:shadow-card-hover active:scale-[0.97] transition-all duration-200 disabled:opacity-60"
              >
                {loading ? "Memuat..." : "Masuk"}
              </LoadingButton>
            </div>

            <p className="font-body opacity-0 animate-fade-in [animation-delay:0.64s] text-xs text-neutral-gray dark:text-dark-text-secondary">
              Butuh bantuan masuk? Hubungi{" "}
              <Link href={ROUTES['help']} className="text-green-primary dark:text-dark-brand-accent font-medium hover:underline">
                admin sistem
              </Link>
              .
            </p>
          </form>
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