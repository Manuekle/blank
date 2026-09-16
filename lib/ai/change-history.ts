import type { ComponentFiles } from "../component-model";
import { createCheckpoint, type AIChangeSet } from "./change-set";

const STORAGE_KEY = "blank:ai-changes:v1";
const MAX_ENTRIES = 40;

/** Change sets per component id, oldest first. */
export type AIHistory = Record<string, AIChangeSet[]>;

function isComponentFiles(value: unknown): value is ComponentFiles {
  const files = value as ComponentFiles | undefined;
  return Boolean(files && typeof files.tsx === "string" && typeof files.css === "string");
}

function readEntry(value: unknown): AIChangeSet | null {
  const entry = value as AIChangeSet | undefined;
  if (!entry || typeof entry !== "object") return null;
  if (typeof entry.id !== "string" || typeof entry.componentId !== "string") return null;
  if (typeof entry.prompt !== "string" || typeof entry.summary !== "string") return null;
  if (typeof entry.createdAt !== "number" || !Number.isFinite(entry.createdAt)) return null;
  if (entry.status !== "applied" && entry.status !== "reverted") return null;
  if (!Array.isArray(entry.changes)) return null;

  const changes = entry.changes.filter(
    (change) =>
      change &&
      typeof change.path === "string" &&
      typeof change.before === "string" &&
      typeof change.after === "string",
  );
  if (changes.length !== entry.changes.length) return null;

  const checkpoint = isComponentFiles(entry.checkpoint) ? entry.checkpoint : undefined;
  const commit =
    entry.commit &&
    typeof entry.commit.sha === "string" &&
    typeof entry.commit.url === "string" &&
    typeof entry.commit.at === "number"
      ? entry.commit
      : undefined;

  return {
    id: entry.id,
    componentId: entry.componentId,
    prompt: entry.prompt,
    summary: entry.summary,
    createdAt: entry.createdAt,
    changes,
    status: entry.status,
    ...(checkpoint ? { checkpoint } : {}),
    ...(commit ? { commit } : {}),
  };
}

export function loadAIHistory(): AIHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object") return {};

    const history: AIHistory = {};
    for (const [componentId, list] of Object.entries(parsed)) {
      if (!Array.isArray(list)) continue;
      const entries = list.map(readEntry).filter((entry): entry is AIChangeSet => entry !== null);
      if (entries.length > 0) history[componentId] = entries;
    }
    return history;
  } catch {
    return {};
  }
}

export function saveAIHistory(history: AIHistory): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* Storage may be disabled; history simply stays in memory. */
  }
}

export function pushChangeSet(list: AIChangeSet[], entry: AIChangeSet): AIChangeSet[] {
  const next = [...list, entry];
  return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next;
}

/**
 * Every component starts with an "Initial" checkpoint so any later change set
 * can be traced back to the state it was built on.
 */
export function ensureInitialCheckpoint(
  list: AIChangeSet[],
  componentId: string,
  files: ComponentFiles,
): AIChangeSet[] {
  if (list.length > 0) return list;
  return [createCheckpoint(componentId, "Initial", files)];
}

export function replaceEntry(list: AIChangeSet[], entry: AIChangeSet): AIChangeSet[] {
  return list.map((candidate) => (candidate.id === entry.id ? entry : candidate));
}

export function markCommitted(
  list: AIChangeSet[],
  ids: string[],
  commit: { sha: string; url: string; at: number },
): AIChangeSet[] {
  const included = new Set(ids);
  return list.map((entry) => (included.has(entry.id) ? { ...entry, commit } : entry));
}

/** Latest applied entry, used to build the "Current" marker in the history UI. */
export function latestApplied(list: AIChangeSet[]): AIChangeSet | undefined {
  for (let index = list.length - 1; index >= 0; index--) {
    if (list[index].status === "applied") return list[index];
  }
  return undefined;
}
