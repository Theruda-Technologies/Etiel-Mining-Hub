"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

type PasswordInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
  /** Optional decorative icon after the visibility toggle (e.g. lock). */
  trailingSlot?: ReactNode;
};

export function PasswordInput({
  id,
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  required,
  minLength,
  className = "",
  trailingSlot,
}: PasswordInputProps) {
  const t = useTranslations("auth");
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative mt-2 block">
      <input
        id={id}
        type={visible ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-sm border border-white/20 bg-basalt-deep py-2.5 pl-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber ${
          trailingSlot ? "pr-20" : "pr-11"
        } ${className}`}
      />
      <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t("hidePassword") : t("showPassword")}
          aria-pressed={visible}
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-text-secondary transition-colors hover:text-white"
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
        {trailingSlot ? (
          <span className="pointer-events-none text-text-secondary">{trailingSlot}</span>
        ) : null}
      </span>
    </span>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.2A10.5 10.5 0 0 1 12 5c6.5 0 10 7 10 7a17.4 17.4 0 0 1-2.2 3.2" />
      <path d="M6.1 6.1C3.7 7.8 2 12 2 12s3.5 7 10 7a10.3 10.3 0 0 0 4.3-.9" />
    </svg>
  );
}
