import type { ComponentFiles } from "./component-model";

export type Revision = {
  id: string;
  at: number;
  /** What produced this snapshot: a user prompt, or "Initial". */
  label: string;
  /** Short model summary of the change. */
  summary: string;
  files: ComponentFiles;
};

const MAX_REVISIONS = 20;

export function createRevision(
  label: string,
  summary: string,
  files: ComponentFiles,
): Revision {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `rev-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return { id, at: Date.now(), label, summary, files: { ...files } };
}

export function pushRevision(list: Revision[], revision: Revision): Revision[] {
  const next = [...list, revision];
  return next.length > MAX_REVISIONS ? next.slice(next.length - MAX_REVISIONS) : next;
}

export type DiffLine = {
  kind: "same" | "add" | "del";
  text: string;
};

/**
 * Line diff for the revision viewer. Small inputs only (component files), so a
 * straightforward LCS table is plenty.
 */
export function diffLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");

  if (a.length * b.length > 4_000_000) {
    return [
      ...a.map((text) => ({ kind: "del" as const, text })),
      ...b.map((text) => ({ kind: "add" as const, text })),
    ];
  }

  const table: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0),
  );

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      result.push({ kind: "same", text: a[i] });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      result.push({ kind: "del", text: a[i] });
      i++;
    } else {
      result.push({ kind: "add", text: b[j] });
      j++;
    }
  }

  while (i < a.length) result.push({ kind: "del", text: a[i++] });
  while (j < b.length) result.push({ kind: "add", text: b[j++] });

  return result;
}

export function diffStats(lines: DiffLine[]) {
  return {
    added: lines.filter((line) => line.kind === "add").length,
    removed: lines.filter((line) => line.kind === "del").length,
  };
}
