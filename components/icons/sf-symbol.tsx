import type { SVGProps } from "react";

import { SF_SYMBOL_BOX, type SFSymbolName, sfSymbols } from "./sf-symbols.generated";

export type { SFSymbolName };

type SFSymbolProps = Omit<SVGProps<SVGSVGElement>, "children" | "width" | "height" | "viewBox"> & {
  name: SFSymbolName;
  /** Icon box in px, like lucide's `size`. Symbols wider or taller than the box grow proportionally. */
  size?: number;
};

export function SFSymbol({ name, size = 16, ...props }: SFSymbolProps) {
  const { width, height, d } = sfSymbols[name];

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      width={(size * width) / SF_SYMBOL_BOX}
      height={(size * height) / SF_SYMBOL_BOX}
      viewBox={`0 0 ${width} ${height}`}
      {...props}
    >
      <path d={d} />
    </svg>
  );
}
