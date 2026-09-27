"use client";

import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20"
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value.replace(/\D/g, ""));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? "¡Copiado!" : label}
    </button>
  );
}
