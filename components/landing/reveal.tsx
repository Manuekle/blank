"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Stagger delay in ms. */
  delay?: number;
  as?: "div" | "section" | "p" | "h2";
  className?: string;
};

/**
 * Fades content up once it enters the viewport. Respects
 * prefers-reduced-motion via CSS (the transition only exists under
 * no-preference), so this only toggles the data attribute.
 */
export function Reveal({ children, delay = 0, as = "div", className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // A ratio threshold never fires for blocks taller than the
    // viewport (the catalog sheet is), so trigger on first contact
    // instead and pull the trip line 12% up from the bottom edge.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.dataset.in = "true";
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`lb-reveal ${className ?? ""}`} style={{ "--lb-reveal-delay": `${delay}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}
