import type { ComponentFiles } from "../component-model";
import { diffLines, type DiffLine } from "../revisions";

/** One file touched by a change set. Paths are display paths, e.g. "Button.tsx". */
export type AIChange = {
  path: string;
  before: string;
  after: string;
};

export type AIChangeSetStatus = "applied" | "reverted";

export type AIChangeSet = {
  id: string;
  componentId: string;
  prompt: string;
  summary: string;
  createdAt: number;

  changes: AIChange[];

  status: AIChangeSetStatus;

  /** Snapshot stored by checkpoints, which carry no diff. */
  checkpoint?: ComponentFiles;

  /** Filled in when the change set is included in a GitHub commit. */
  commit?: { sha: string; url: string; at: number };
};

export type AIMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  changeSetId?: string;
  tone?: "info" | "error";
};

export type AIComposerMode = "ask" | "agent";

export function newChangeId(prefix = "change"): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** CSS files are the only non-component path today; everything else edits the TSX. */
export function fileKey(path: string): keyof ComponentFiles {
  return path.endsWith(".css") ? "css" : "tsx";
}

export function componentPath(spec: { fileName: string }, file: keyof ComponentFiles): string {
  return file === "css" ? "styles.css" : spec.fileName;
}

export function createChangeSet(input: {
  componentId: string;
  prompt: string;
  summary: string;
  specFileName: string;
  before: ComponentFiles;
  after: ComponentFiles;
}): AIChangeSet {
  const changes: AIChange[] = [];
  const pairs: Array<[keyof ComponentFiles, string]> = [
    ["tsx", input.specFileName],
    ["css", "styles.css"],
  ];

  for (const [file, path] of pairs) {
    if (input.before[file] === input.after[file]) continue;
    changes.push({ path, before: input.before[file], after: input.after[file] });
  }

  return {
    id: newChangeId(),
    componentId: input.componentId,
    prompt: input.prompt,
    summary: input.summary,
    createdAt: Date.now(),
    changes,
    status: "applied",
  };
}

export function createCheckpoint(
  componentId: string,
  label: string,
  files: ComponentFiles,
): AIChangeSet {
  return {
    id: newChangeId("checkpoint"),
    componentId,
    prompt: label,
    summary: "Checkpoint",
    createdAt: Date.now(),
    changes: [],
    status: "applied",
    checkpoint: { ...files },
  };
}

export function isCheckpoint(entry: AIChangeSet): boolean {
  return Boolean(entry.checkpoint) && entry.changes.length === 0;
}

export function changedFiles(entry: AIChangeSet): string[] {
  return entry.changes.map((change) => change.path);
}

export function changeStats(entry: AIChangeSet): { added: number; removed: number } {
  return entry.changes.reduce(
    (total, change) => {
      const stats = diffStats(diffLines(change.before, change.after));
      return { added: total.added + stats.added, removed: total.removed + stats.removed };
    },
    { added: 0, removed: 0 },
  );
}

function diffStats(lines: DiffLine[]) {
  return {
    added: lines.filter((line) => line.kind === "add").length,
    removed: lines.filter((line) => line.kind === "del").length,
  };
}

const CONTEXT = 3;

/** Maximal runs of changed lines inside a line diff. */
function hunks(lines: DiffLine[]): Array<{ from: number; to: number }> {
  const result: Array<{ from: number; to: number }> = [];
  let index = 0;

  while (index < lines.length) {
    if (lines[index].kind === "same") {
      index++;
      continue;
    }
    let end = index;
    while (end + 1 < lines.length && lines[end + 1].kind !== "same") end++;
    result.push({ from: index, to: end });
    index = end + 1;
  }

  return result;
}

function findSequence(lines: string[], sequence: string[], from: number): number {
  if (sequence.length === 0) return Math.min(from, lines.length);
  for (let start = Math.max(0, from); start <= lines.length - sequence.length; start++) {
    let matches = true;
    for (let offset = 0; offset < sequence.length; offset++) {
      if (lines[start + offset] !== sequence[offset]) {
        matches = false;
        break;
      }
    }
    if (matches) return start;
  }
  return -1;
}

/**
 * Applies one hunk list on top of `current` using anchored line patches, so a
 * file that changed after this entry can still be patched when the edits do not
 * overlap. Returns null when the surrounding lines no longer match.
 */
function patchText(
  current: string,
  before: string,
  after: string,
  direction: "forward" | "reverse",
): string | null {
  if (before === after) return current;

  const diff = diffLines(before, after);
  const parts = hunks(diff);
  if (parts.length === 0) return current;

  const lines = current.split("\n");
  let cursor = 0;

  for (const hunk of parts) {
    const leading: string[] = [];
    for (let index = hunk.from - 1; index >= 0 && diff[index].kind === "same" && leading.length < CONTEXT; index--) {
      leading.unshift(diff[index].text);
    }

    const trailing: string[] = [];
    for (let index = hunk.to + 1; index < diff.length && diff[index].kind === "same" && trailing.length < CONTEXT; index++) {
      trailing.push(diff[index].text);
    }

    const removed = diff
      .slice(hunk.from, hunk.to + 1)
      .filter((line) => line.kind === (direction === "forward" ? "del" : "add"))
      .map((line) => line.text);
    const added = diff
      .slice(hunk.from, hunk.to + 1)
      .filter((line) => line.kind === (direction === "forward" ? "add" : "del"))
      .map((line) => line.text);

    const expected = [...leading, ...removed, ...trailing];
    const replacement = [...leading, ...added, ...trailing];

    const at = findSequence(lines, expected, cursor);
    if (at === -1) return null;

    lines.splice(at, expected.length, ...replacement);
    cursor = at + replacement.length;
  }

  return lines.join("\n");
}

export type PatchResult =
  | { ok: true; files: ComponentFiles }
  | { ok: false; conflicts: string[] };

/**
 * Replays a change set on the given files. Fails atomically: if any file no
 * longer matches, nothing is written and the conflicting paths are returned.
 */
export function patchFiles(
  files: ComponentFiles,
  changes: AIChange[],
  direction: "forward" | "reverse",
): PatchResult {
  const next: ComponentFiles = { ...files };
  const conflicts: string[] = [];

  for (const change of changes) {
    const key = fileKey(change.path);
    const patched = patchText(next[key], change.before, change.after, direction);
    if (patched === null) conflicts.push(change.path);
    else next[key] = patched;
  }

  if (conflicts.length > 0) return { ok: false, conflicts };
  return { ok: true, files: next };
}

export function applyChangeSet(files: ComponentFiles, entry: AIChangeSet): PatchResult {
  return entry.checkpoint
    ? { ok: true, files: { ...entry.checkpoint } }
    : patchFiles(files, entry.changes, "forward");
}

export function revertChangeSet(files: ComponentFiles, entry: AIChangeSet): PatchResult {
  return patchFiles(files, entry.changes, "reverse");
}
