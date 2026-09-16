"use client";

import { useState } from "react";
import { SFSymbol } from "@/components/icons/sf-symbol";
import { DoodleSparkle } from "@/components/site/doodles";

const COLORS = [
  {
    id: "chrome",
    label: "Chrome",
    background: "linear-gradient(180deg, #fbfbfd 0%, #d9d9e1 55%, #c7c7d2 100%)",
    code: "linear-gradient(#fbfbfd, #c7c7d2)",
    text: "#0d0d11",
    glow: "rgba(255, 255, 255, 0.28)",
  },
  { id: "blue", label: "Electric", background: "#4f7cff", code: "#4f7cff", text: "#ffffff", glow: "rgba(79, 124, 255, 0.55)" },
  { id: "coral", label: "Coral", background: "#ff7a8a", code: "#ff7a8a", text: "#1a0d0f", glow: "rgba(255, 122, 138, 0.5)" },
  { id: "mint", label: "Mint", background: "#3ecf8e", code: "#3ecf8e", text: "#081410", glow: "rgba(62, 207, 142, 0.5)" },
] as const;

type ColorId = (typeof COLORS)[number]["id"];

const SIZES = [
  { id: "sm", label: "S", padding: "8px 16px", fontSize: "12px" },
  { id: "md", label: "M", padding: "12px 22px", fontSize: "14px" },
  { id: "lg", label: "L", padding: "16px 28px", fontSize: "16px" },
] as const;

type SizeId = (typeof SIZES)[number]["id"];

export function PlaygroundDemo() {
  const [radius, setRadius] = useState(14);
  const [colorId, setColorId] = useState<ColorId>("chrome");
  const [sizeId, setSizeId] = useState<SizeId>("md");

  const picked = COLORS.find((entry) => entry.id === colorId)!;
  const sized = SIZES.find((entry) => entry.id === sizeId)!;

  return (
    <div className="pdemo">
      <div className="pdemo-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>Button.tsx</span>
        <em>live</em>
      </div>

      <div className="pdemo-body">
        <div className="pdemo-stage">
          <div className="pdemo-grid" aria-hidden="true" />
          <DoodleSparkle className="pdemo-spark pdemo-spark--a" size={18} />
          <DoodleSparkle className="pdemo-spark pdemo-spark--b" size={12} />
          <button
            type="button"
            className="pdemo-button"
            style={{
              borderRadius: `${radius}px`,
              background: picked.background,
              color: picked.text,
              padding: sized.padding,
              fontSize: sized.fontSize,
              boxShadow: `0 18px 50px -12px ${picked.glow}, inset 0 1px 0 rgba(255,255,255,.35)`,
            }}
          >
            Make it yours
          </button>
        </div>

        <div className="pdemo-panel">
          <div className="pdemo-control">
            <div className="pdemo-control-head">
              <span>Corner radius</span>
              <code>{radius}px</code>
            </div>
            <input
              type="range"
              min={0}
              max={32}
              value={radius}
              aria-label="Corner radius"
              style={{ "--pdemo-fill": `${(radius / 32) * 100}%` } as React.CSSProperties}
              onChange={(event) => setRadius(Number(event.target.value))}
            />
          </div>

          <div className="pdemo-control">
            <div className="pdemo-control-head">
              <span>Accent</span>
              <code>{picked.label}</code>
            </div>
            <div className="pdemo-swatches" role="radiogroup" aria-label="Accent color">
              {COLORS.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="radio"
                  aria-checked={colorId === entry.id}
                  aria-label={entry.label}
                  className="pdemo-swatch"
                  data-on={colorId === entry.id || undefined}
                  style={{ "--sw": entry.background } as React.CSSProperties}
                  onClick={() => setColorId(entry.id)}
                />
              ))}
            </div>
          </div>

          <div className="pdemo-control">
            <div className="pdemo-control-head">
              <span>Size</span>
              <code>{sized.fontSize}</code>
            </div>
            <div className="pdemo-sizes" role="radiogroup" aria-label="Button size">
              {SIZES.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  role="radio"
                  aria-checked={sizeId === entry.id}
                  className="pdemo-size"
                  data-on={sizeId === entry.id || undefined}
                  onClick={() => setSizeId(entry.id)}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          <pre className="pdemo-code" aria-label="Generated CSS">
            <code>
              <span className="pdemo-line">.blank-button {"{"}</span>
              <span className="pdemo-line">{`  border-radius: ${radius}px;`}</span>
              <span className="pdemo-line">{`  background: ${picked.code};`}</span>
              <span className="pdemo-line">{`  padding: ${sized.padding};`}</span>
              <span className="pdemo-line">{`  font-size: ${sized.fontSize};`}</span>
              <span className="pdemo-line">{"}"}</span>
            </code>
          </pre>

          <span className="pdemo-note">
            <SFSymbol name="sparkles" size={12} />
            Real CSS, straight from the editor.
          </span>
        </div>
      </div>
    </div>
  );
}
