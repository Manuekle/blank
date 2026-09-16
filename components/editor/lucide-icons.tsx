"use client";

import { createElement, useEffect, useState } from "react";

export type IconNode = [tag: string, attributes: Record<string, string | number>][];

export type IconSet = Record<string, IconNode>;

let loaded: IconSet | null = null;
let pending: Promise<IconSet> | null = null;

/** Lucide ships about 2,000 icons, so they load on first use instead of with the editor. */
export function loadLucideIcons(): Promise<IconSet> {
  pending ??= import("lucide").then((module) => (loaded = module.icons as unknown as IconSet));
  return pending;
}

export function useLucideIcons() {
  const [icons, setIcons] = useState<IconSet | null>(loaded);

  useEffect(() => {
    if (loaded) return;
    let active = true;
    loadLucideIcons().then((set) => { if (active) setIcons(set); }).catch(() => {});
    return () => { active = false; };
  }, []);

  return icons;
}

export function LucideIcon({ node, size = 16 }: { node?: IconNode; size?: number }) {
  if (!node) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {node.map(([tag, attributes], index) => createElement(tag, { key: index, ...attributes }))}
    </svg>
  );
}
