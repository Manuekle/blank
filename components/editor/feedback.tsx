"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import ReactConfetti from "react-confetti";
import { bind, play, setEnabled, setVolume } from "cuelume";

import {
  type Preferences,
  defaultPreferences,
  getPreferences,
  subscribePreferences,
} from "@/lib/preferences";

const CELEBRATE_EVENT = "blank:celebrate";

/** The editor's blues and neutrals, with the status green and amber. */
const CONFETTI_COLORS = ["#4f7cff", "#7fa2ff", "#c5d6ff", "#fafafa", "#3ecf8e", "#e5a855"];

export function usePreferences(): Preferences {
  return useSyncExternalStore(subscribePreferences, getPreferences, () => defaultPreferences);
}

/**
 * Marks an outcome the user caused, such as a finished export: the success
 * sound, and confetti bursting from `origin` when the preference allows it.
 */
export function celebrate(origin?: Element | null) {
  play("success");
  window.dispatchEvent(new CustomEvent<DOMRect | undefined>(CELEBRATE_EVENT, { detail: origin?.getBoundingClientRect() }));
}

type Burst = {
  id: number;
  width: number;
  height: number;
  source: { x: number; y: number; w: number; h: number };
  velocityY: { min: number; max: number };
};

/**
 * Mounted once by the editor. Wires cuelume's `data-cuelume-*` attributes,
 * keeps its mute and volume in step with the preferences, and draws
 * confetti bursts.
 */
export function FeedbackLayer() {
  const preferences = usePreferences();
  const [burst, setBurst] = useState<Burst | null>(null);

  useEffect(() => {
    bind();
  }, []);

  useEffect(() => {
    setEnabled(preferences.sounds);
    setVolume(preferences.volume);
  }, [preferences.sounds, preferences.volume]);

  useEffect(() => {
    function onCelebrate(event: Event) {
      if (!getPreferences().confetti || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = (event as CustomEvent<DOMRect | undefined>).detail;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const source = rect
        ? { x: rect.left, y: rect.top, w: rect.width, h: rect.height }
        : { x: width / 2 - 80, y: height * 0.4, w: 160, h: 0 };
      setBurst({
        id: Date.now(),
        width,
        height,
        source,
        // A burst from the top bar would leave the screen upward, so it spills down instead.
        velocityY: source.y < height / 3 ? { min: -3, max: 9 } : { min: -16, max: -6 },
      });
    }

    window.addEventListener(CELEBRATE_EVENT, onCelebrate);
    return () => window.removeEventListener(CELEBRATE_EVENT, onCelebrate);
  }, []);

  if (!burst) return null;

  return (
    <ReactConfetti
      key={burst.id}
      aria-hidden="true"
      width={burst.width}
      height={burst.height}
      confettiSource={burst.source}
      numberOfPieces={160}
      recycle={false}
      tweenDuration={220}
      initialVelocityX={{ min: -9, max: 9 }}
      initialVelocityY={burst.velocityY}
      gravity={0.25}
      colors={CONFETTI_COLORS}
      style={{ position: "fixed", zIndex: 1000 }}
      onConfettiComplete={() => setBurst(null)}
    />
  );
}
