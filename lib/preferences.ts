/**
 * Interface preferences for this browser: interaction sounds and confetti.
 * Components read them through `usePreferences` in
 * components/editor/feedback.tsx, which re-renders on every change.
 */
export type Preferences = {
  /** Interaction sounds (cuelume). */
  sounds: boolean;
  /** Sound volume, 0 to 1. */
  volume: number;
  /** Confetti when an export or a commit lands. */
  confetti: boolean;
};

const STORAGE_KEY = "blank:preferences";

export const defaultPreferences: Preferences = {
  sounds: true,
  volume: 0.6,
  confetti: true,
};

let cached: Preferences | null = null;
const listeners = new Set<() => void>();

function read(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<Preferences> | null;
    return {
      sounds: typeof value?.sounds === "boolean" ? value.sounds : defaultPreferences.sounds,
      volume:
        typeof value?.volume === "number" && Number.isFinite(value.volume)
          ? Math.min(1, Math.max(0, value.volume))
          : defaultPreferences.volume,
      confetti: typeof value?.confetti === "boolean" ? value.confetti : defaultPreferences.confetti,
    };
  } catch {
    return { ...defaultPreferences };
  }
}

/** The same object until the next change, as useSyncExternalStore requires. */
export function getPreferences(): Preferences {
  cached ??= read();
  return cached;
}

export function setPreferences(patch: Partial<Preferences>): void {
  cached = { ...getPreferences(), ...patch };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {
    // Storage may be disabled; the change still applies to this visit.
  }
  for (const listener of listeners) listener();
}

export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
