import { cloneButtonDNA, vanillaButtonDNA, type ComponentFiles, type ComponentSpec } from "@/lib/component-model";

/**
 * Fork handoff from the templates pages: seeds the fork into the editor's
 * stored workspace, then opens the editor on the forked component.
 */
export function sendForkToEditor(spec: ComponentSpec, files: ComponentFiles): void {
  const doc = {
    name: spec.name,
    dna: cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent }),
    files,
    spec,
  };

  let stored: { version: number; activeSpecId: string; docs: Record<string, unknown>; enabled?: string[] } | null = null;
  try {
    const raw = localStorage.getItem("blank:document:v2");
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    stored = null;
  }

  if (stored?.version === 2 && stored.docs && typeof stored.docs === "object") {
    stored.docs[spec.id] = doc;
    stored.enabled = [...new Set([...(stored.enabled ?? []), spec.id])];
    stored.activeSpecId = spec.id;
  } else {
    stored = { version: 2, activeSpecId: spec.id, docs: { [spec.id]: doc }, enabled: [spec.id] };
  }

  try {
    localStorage.setItem("blank:document:v2", JSON.stringify(stored));
  } catch {
    // Storage may be unavailable; the editor still opens with its default workspace.
  }

  window.location.href = "/";
}
