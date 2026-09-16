import type { ComponentSpec } from "@/lib/component-model";

export const defaultCarouselTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type CarouselProps =
  HTMLAttributes<HTMLDivElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const slides = ["One", "Two", "Three", "Four"];

export const Carousel = forwardRef<
  HTMLDivElement,
  CarouselProps
>(function Carousel(
  {
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <div
      ref={ref}
      tabIndex={0}
      className={[
        "blank-carousel",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {slides.map((slide) => (
        <div
          key={slide}
          className="blank-carousel__slide"
        >
          {slide}
        </div>
      ))}
    </div>
  );
});
`;

const carouselSubCSS = `.blank-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.blank-carousel__slide {
  flex: 0 0 auto;
  scroll-snap-align: start;
  display: grid;
  place-items: center;
  min-width: 120px;
}`;

export const CAROUSEL_SPEC: ComponentSpec = {
  id: "carousel",
  name: "Carousel",
  fileName: "Carousel.tsx",
  exportName: "Carousel",
  className: "blank-carousel",
  vanillaTSX: defaultCarouselTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: carouselSubCSS,
  supportedStates: ["default"],
};
