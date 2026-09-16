import type { ComponentSpec } from "@/lib/component-model";

export const defaultSliderTSX = `import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

import "./styles.css";

export type SliderProps =
  InputHTMLAttributes<HTMLInputElement>;

export const Slider = forwardRef<
  HTMLInputElement,
  SliderProps
>(function Slider(
  {
    className = "",
    type = "range",
    min = 0,
    max = 100,
    defaultValue = 50,
    ...props
  },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      min={min}
      max={max}
      defaultValue={defaultValue}
      className={[
        "blank-slider",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
});
`;

const sliderSubCSS = `.blank-slider {
  cursor: pointer;
}`;

export const SLIDER_SPEC: ComponentSpec = {
  id: "slider",
  name: "Slider",
  fileName: "Slider.tsx",
  exportName: "Slider",
  className: "blank-slider",
  vanillaTSX: defaultSliderTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: sliderSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
