import {
  BUTTON_SPEC,
  type ComponentDNA,
  type ComponentFiles,
  type ComponentSpec,
  type ButtonStyleDNA,
  type ThemeName,
  normalizeNodeOverrides,
  shareButtonStructure,
  vanillaButtonDNA,
} from "./component-model";
import { getSpec, registerForkSpec } from "./components/registry";

export type StoredDocument = {
  name: string;
  dna: ComponentDNA;
  files: ComponentFiles;
  /** Assistant snapshots, newest last. Malformed entries are dropped on load. */
  revisions?: Array<{ id: string; at: number; label: string; summary: string; files: ComponentFiles }>;
  /** Forked components carry their spec, so the document resolves without a registry entry. */
  spec?: ComponentSpec;
};

export type LoadedDocument = {
  activeSpecId: string;
  docs: Record<string, StoredDocument>;
  /** Components the user chose for this workspace; undefined means "not set up yet". */
  enabled?: string[];
};

function readEnabled(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error("Invalid workspace components");
  const ids = value.filter((id): id is string => typeof id === "string").map((id) => getSpec(id).id);
  return [...new Set(ids)];
}

const STORAGE_KEY = "blank:document:v2";
const LEGACY_KEY = "blank:document:v1";

function validateTheme(data: unknown, themeName: ThemeName) {
  const theme = data as { base?: Record<string, unknown>; states?: Record<string, Record<string, unknown>>; modified?: unknown };
  if (!theme?.base || !theme.states) throw new Error("Invalid theme");
  if (
    theme.modified !== undefined &&
    (!Array.isArray(theme.modified) ||
      theme.modified.some((key: unknown) => typeof key !== "string" || !(key in vanillaButtonDNA.themes.light.base)))
  ) {
    throw new Error("Invalid modified styles");
  }
  const vanilla = vanillaButtonDNA.themes[themeName].base;
  // Styles added after a document was saved start from their vanilla value; retired ones are dropped.
  for (const key of Object.keys(theme.base)) if (!(key in vanilla)) delete theme.base[key];
  for (const [key, fallback] of Object.entries(vanilla)) {
    if (theme.base[key] === undefined) {
      theme.base[key] = fallback;
      continue;
    }
    const entry = theme.base[key];
    if (typeof entry !== typeof fallback || (typeof entry === "number" && !Number.isFinite(entry))) {
      throw new Error("Invalid style");
    }
  }
  for (const state of ["hover", "active", "focus", "disabled"] as const) {
    const entry = theme.states[state];
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Invalid state");
    for (const [key, value] of Object.entries(entry)) {
      const fallback = vanillaButtonDNA.themes.light.base[key as keyof ButtonStyleDNA];
      if (fallback === undefined || typeof value !== typeof fallback || (typeof value === "number" && !Number.isFinite(value))) {
        throw new Error("Invalid state style");
      }
    }
  }
}

function validateDna(dna: unknown) {
  const value = dna as ComponentDNA & { label?: unknown };
  // Version 1 documents called the editable text "label".
  if (value && typeof value.content !== "string" && typeof value.label === "string") {
    value.content = value.label;
    delete value.label;
  }
  if (typeof value?.content !== "string") throw new Error("Invalid saved document");
  if (value.props !== undefined && (typeof value.props !== "object" || value.props === null || Object.values(value.props).some((entry) => typeof entry !== "string"))) {
    throw new Error("Invalid props");
  }
  for (const theme of ["light", "dark"] as const) {
    validateTheme(value.themes?.[theme], theme);
  }
  // Child overrides are optional; invalid entries are dropped rather than failing the document.
  const nodes = normalizeNodeOverrides(value.nodes);
  if (nodes) value.nodes = nodes;
  else delete value.nodes;
}

/** Forked specs are trusted after a structural check; anything else fails the document. */
function validateStoredSpec(spec: unknown, specId: string): ComponentSpec {
  const value = spec as ComponentSpec;
  if (
    !value ||
    typeof value !== "object" ||
    value.id !== specId ||
    typeof value.name !== "string" ||
    typeof value.fileName !== "string" ||
    typeof value.exportName !== "string" ||
    !/^[A-Za-z_$][\w$]*$/.test(value.exportName) ||
    typeof value.className !== "string" ||
    typeof value.vanillaTSX !== "string" ||
    typeof value.subCSS !== "string"
  ) {
    throw new Error("Invalid forked component");
  }
  return value;
}

export function loadDocument(raw: string | null): LoadedDocument | null {
  if (!raw) return null;
  const value = JSON.parse(raw);

  if (value?.version === 2 && value.docs && typeof value.activeSpecId === "string") {
    const docs: Record<string, StoredDocument> = {};
    for (const [specId, doc] of Object.entries(value.docs as Record<string, StoredDocument>)) {
      // Forked specs register first, so the lookups below resolve them.
      if (doc?.spec) registerForkSpec(validateStoredSpec(doc.spec, specId));
      const spec: ComponentSpec = getSpec(specId);
      if (typeof doc?.name !== "string" || typeof doc.files?.tsx !== "string" || typeof doc.files?.css !== "string") {
        throw new Error("Invalid saved document");
      }
      validateDna(doc.dna);
      const revisions = Array.isArray(doc.revisions)
        ? doc.revisions.filter(
            (entry) =>
              entry &&
              typeof entry.id === "string" &&
              typeof entry.label === "string" &&
              typeof entry.summary === "string" &&
              typeof entry.files?.tsx === "string" &&
              typeof entry.files?.css === "string",
          )
        : undefined;
      // Older documents stored geometry per theme; unify it on load.
      docs[spec.id] = {
        ...doc,
        dna: shareButtonStructure(doc.dna),
        ...(revisions ? { revisions } : {}),
      };
    }
    return { activeSpecId: getSpec(value.activeSpecId).id, docs, enabled: readEnabled(value.enabled) };
  }

  // Legacy single-component documents were always the button.
  if (value?.version === 1 && typeof value.name === "string" && typeof value.files?.tsx === "string" && typeof value.files?.css === "string") {
    validateDna(value.dna);
    return {
      activeSpecId: BUTTON_SPEC.id,
      docs: {
        [BUTTON_SPEC.id]: {
          name: value.name,
          dna: shareButtonStructure(value.dna),
          files: value.files,
        },
      },
      enabled: [BUTTON_SPEC.id],
    };
  }

  throw new Error("Invalid saved document");
}

export function saveDocument(document: LoadedDocument): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, ...document }));
}

export function readStoredDocument(): LoadedDocument | null {
  const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
  return loadDocument(raw);
}

export function recoveryKey(): string {
  return "blank:document:recovery";
}
