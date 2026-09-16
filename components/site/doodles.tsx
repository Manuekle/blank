import type { CSSProperties, ReactNode } from "react";

/*
 * Hand-drawn marks in the spirit of a design review: arrows, circles and
 * squiggles drawn over the page in redline coral. Strokes use pathLength=1
 * so the draw-on animation in site.css works for any path; `--i` orders the
 * strokes of one doodle (body first, arrowhead after).
 */

type DoodleProps = {
  className?: string;
  style?: CSSProperties;
  /** Rendered width in px. Height follows the viewBox. */
  size?: number;
};

function Doodle({
  viewBox,
  size,
  className,
  style,
  children,
}: DoodleProps & { viewBox: string; children: ReactNode }) {
  const [, , width, height] = viewBox.split(" ").map(Number);
  const rendered = size ?? width;
  return (
    <svg
      className={className ? `site-doodle ${className}` : "site-doodle"}
      style={style}
      width={rendered}
      height={Math.round((rendered * height) / width)}
      viewBox={viewBox}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function Stroke({ d, index = 0 }: { d: string; index?: number }) {
  return <path d={d} pathLength={1} style={{ "--i": index } as CSSProperties} />;
}

const ARROWS = {
  curve: {
    viewBox: "0 0 120 70",
    body: "M4 12C30 2 70 4 94 30c10 11 14 20 16 30",
    head: "M97 55l13 6 4-14",
  },
  loop: {
    viewBox: "0 0 140 90",
    body: "M6 72C26 32 60 14 80 30c16 13 4 34-12 26-16-8-2-36 28-38 18-1 30 8 36 18",
    head: "M118 34l14 3-2-14",
  },
  down: {
    viewBox: "0 0 60 110",
    body: "M30 4C10 30 50 50 28 78c-4 6-2 14 2 22",
    head: "M20 90l10 12 9-13",
  },
} as const;

export function DoodleArrow({ variant = "curve", ...props }: DoodleProps & { variant?: keyof typeof ARROWS }) {
  const arrow = ARROWS[variant];
  return (
    <Doodle viewBox={arrow.viewBox} {...props}>
      <Stroke d={arrow.body} />
      <Stroke d={arrow.head} index={1} />
    </Doodle>
  );
}

export function DoodleSquiggle(props: DoodleProps) {
  return (
    <Doodle viewBox="0 0 200 20" {...props}>
      <Stroke d="M3 12c15-9 27 6 43-2s30 7 46 0 30 7 46 0 30 6 59-1" />
    </Doodle>
  );
}

export function DoodleCircle(props: DoodleProps) {
  return (
    <Doodle viewBox="0 0 220 100" {...props}>
      <Stroke d="M122 10C64 2 10 20 12 52s72 44 126 36c48-7 74-26 68-50S150 4 100 10c-24 3-44 10-58 18" />
    </Doodle>
  );
}

export function DoodleStar(props: DoodleProps) {
  return (
    <Doodle viewBox="0 0 44 44" {...props}>
      <Stroke d="M22 4c1.5 8 3 11 5 13 4 .5 9 .5 13 1-5 4-9 7-10 9 1 5 2.5 9 3 13-4-3-8-5.5-11-7-3 1.5-7 4-11 7 .5-4 2-8 3-13-1-2-5-5-10-9 4-.5 9-.5 13-1 2-2 3.5-5 5-13Z" />
    </Doodle>
  );
}

export function DoodleScribble(props: DoodleProps) {
  return (
    <Doodle viewBox="0 0 80 40" {...props}>
      <Stroke d="M4 30 14 8l8 24 10-24 8 24 10-24 8 24 10-24 8 22" />
    </Doodle>
  );
}

export function DoodleBurst(props: DoodleProps) {
  return (
    <Doodle viewBox="0 0 40 40" {...props}>
      <Stroke d="M20 4v9" />
      <Stroke d="M7 11l6 6" index={1} />
      <Stroke d="M33 11l-6 6" index={2} />
    </Doodle>
  );
}

/** A filled four-point sparkle. It twinkles instead of drawing on. */
export function DoodleSparkle(props: DoodleProps) {
  return (
    <Doodle viewBox="0 0 24 24" {...props}>
      <path
        className="is-fill"
        d="M12 1.5c.7 5.6 3.9 8.8 9.5 10.5-5.6 1.7-8.8 4.9-9.5 10.5-.7-5.6-3.9-8.8-9.5-10.5C8.1 10.3 11.3 7.1 12 1.5Z"
      />
    </Doodle>
  );
}
