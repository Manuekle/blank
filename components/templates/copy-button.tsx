"use client";

import { useEffect, useRef, useState } from "react";
import { SFSymbol } from "@/components/icons/sf-symbol";

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

type CopyButtonProps = {
  text: string;
  label: string;
  className?: string;
  children?: React.ReactNode;
};

export function CopyButton({ text, label, className = "tpl-copy", children }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={className}
      data-copied={copied || undefined}
      onClick={async () => {
        await writeClipboard(text);
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {children}
      {copied && <SFSymbol name="checkmark" size={12} className="tpl-copy-check" />}
      <span aria-live="polite" className="tpl-copy-label">
        {copied ? "Copied" : label}
      </span>
    </button>
  );
}
