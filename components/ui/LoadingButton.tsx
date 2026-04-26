import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export default function LoadingButton({
  loading,
  children,
  className = "",
  disabled,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${className} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"/>
            <path d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" fill="currentColor"/>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}