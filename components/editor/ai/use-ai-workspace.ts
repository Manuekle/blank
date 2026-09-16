"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ComponentFiles, ComponentSpec } from "@/lib/component-model";
import {
  applyChangeSet,
  createChangeSet,
  createCheckpoint,
  isCheckpoint,
  newChangeId,
  revertChangeSet,
  type AIChangeSet,
  type AIComposerMode,
  type AIMessage,
} from "@/lib/ai/change-set";
import {
  ensureInitialCheckpoint,
  loadAIHistory,
  markCommitted,
  pushChangeSet,
  replaceEntry,
  saveAIHistory,
  type AIHistory,
} from "@/lib/ai/change-history";

export type AIWorkspacePhase = "idle" | "working" | "done";

export type AIWorkspaceStatus = {
  phase: AIWorkspacePhase;
  text: string;
};

type UseAIWorkspaceOptions = {
  spec: ComponentSpec;
  files: ComponentFiles;
  /** Routes AI output through the editor's code-sync pipeline. Null means rejected. */
  applyFiles: (files: ComponentFiles) => ComponentFiles | null;
  onNotice: (message: string) => void;
};

export function useAIWorkspace({ spec, files, applyFiles, onNotice }: UseAIWorkspaceOptions) {
  const [history, setHistory] = useState<AIHistory>({});
  const [messages, setMessages] = useState<Record<string, AIMessage[]>>({});
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<AIWorkspaceStatus>({ phase: "idle", text: "" });
  const [mode, setMode] = useState<AIComposerMode>("agent");
  const [context, setContext] = useState<string[]>(["tsx", "css"]);

  const filesRef = useRef(files);
  filesRef.current = files;
  const specRef = useRef(spec);
  specRef.current = spec;
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHistory(loadAIHistory());
    return () => {
      if (doneTimer.current) clearTimeout(doneTimer.current);
    };
  }, []);

  useEffect(() => {
    saveAIHistory(history);
  }, [history]);

  const changeSets = useMemo(() => history[spec.id] ?? [], [history, spec.id]);
  const componentMessages = messages[spec.id] ?? [];

  const appendMessage = useCallback((componentId: string, message: AIMessage) => {
    setMessages((current) => ({
      ...current,
      [componentId]: [...(current[componentId] ?? []), message],
    }));
  }, []);

  const flash = useCallback((text: string) => {
    setStatus({ phase: "done", text });
    if (doneTimer.current) clearTimeout(doneTimer.current);
    doneTimer.current = setTimeout(() => setStatus({ phase: "idle", text: "" }), 900);
  }, []);

  const push = useCallback((componentId: string, entry: AIChangeSet, before: ComponentFiles) => {
    setHistory((current) => {
      const list = ensureInitialCheckpoint(current[componentId] ?? [], componentId, before);
      return { ...current, [componentId]: pushChangeSet(list, entry) };
    });
  }, []);

  const send = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || busy) return;

      const component = specRef.current;
      const currentFiles = filesRef.current;
      const userMessage: AIMessage = {
        id: newChangeId("user"),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

      appendMessage(component.id, userMessage);
      setBusy(true);
      setStatus({ phase: "working", text: `Analyzing ${component.name}…` });

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode,
            context,
            messages: [...componentMessages, userMessage].map(({ role, content }) => ({ role, content })),
            files: currentFiles,
            spec: { id: component.id, name: component.name, contentProp: component.contentProp },
          }),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          appendMessage(component.id, {
            id: newChangeId("error"),
            role: "assistant",
            content: String(result.error ?? "The assistant could not answer."),
            createdAt: Date.now(),
            tone: "error",
          });
          return;
        }

        if (mode === "ask" || !result.applied) {
          appendMessage(component.id, {
            id: newChangeId("info"),
            role: "assistant",
            content: String(result.summary ?? "No changes were suggested."),
            createdAt: Date.now(),
            tone: result.applied ? undefined : "info",
          });
          return;
        }

        const labels: string[] = Array.isArray(result.files) && result.files.includes("css") ? ["styles.css"] : [];
        if (Array.isArray(result.files) && result.files.includes("tsx")) labels.unshift(component.fileName);
        setStatus({ phase: "working", text: `Updating ${labels.join(" and ") || component.fileName}…` });

        const synced = applyFiles({
          tsx: typeof result.tsx === "string" ? result.tsx : currentFiles.tsx,
          css: typeof result.css === "string" ? result.css : currentFiles.css,
        });

        if (!synced) return;

        const entry = createChangeSet({
          componentId: component.id,
          prompt: trimmed,
          summary: String(result.summary ?? "Updated the component."),
          specFileName: component.fileName,
          before: currentFiles,
          after: synced,
        });

        if (entry.changes.length > 0) push(component.id, entry, currentFiles);

        appendMessage(component.id, {
          id: newChangeId("assistant"),
          role: "assistant",
          content: entry.summary,
          createdAt: Date.now(),
          changeSetId: entry.changes.length > 0 ? entry.id : undefined,
        });

        flash(`Done · ${entry.changes.length} file${entry.changes.length === 1 ? "" : "s"} updated`);
      } catch (error) {
        appendMessage(component.id, {
          id: newChangeId("error"),
          role: "assistant",
          content: error instanceof Error ? error.message : "Unable to reach the assistant.",
          createdAt: Date.now(),
          tone: "error",
        });
      } finally {
        setBusy(false);
      }
    },
    [appendMessage, applyFiles, busy, componentMessages, context, flash, mode, push],
  );

  const revert = useCallback(
    (entry: AIChangeSet) => {
      const component = specRef.current;
      const currentFiles = filesRef.current;

      if (isCheckpoint(entry)) {
        if (!applyFiles(entry.checkpoint ?? currentFiles)) return;
        onNotice(`Restored “${entry.prompt}”.`);
        flash("Done · checkpoint restored");
        return;
      }

      const result = revertChangeSet(currentFiles, entry);
      if (!result.ok) {
        onNotice(`“${entry.prompt}” conflicts with newer edits (${result.conflicts.join(", ")}). Revert the newer change first.`);
        return;
      }

      const synced = applyFiles(result.files);
      if (!synced) return;

      setHistory((current) => ({
        ...current,
        [component.id]: replaceEntry(current[component.id] ?? [], { ...entry, status: "reverted" }),
      }));
      onNotice(`Reverted “${entry.prompt}”.`);
      flash("Done · change reverted");
    },
    [applyFiles, flash, onNotice],
  );

  const reapply = useCallback(
    (entry: AIChangeSet) => {
      const component = specRef.current;
      const result = applyChangeSet(filesRef.current, entry);
      if (!result.ok) {
        onNotice(`“${entry.prompt}” no longer applies cleanly (${result.conflicts.join(", ")}).`);
        return;
      }

      const synced = applyFiles(result.files);
      if (!synced) return;

      setHistory((current) => ({
        ...current,
        [component.id]: replaceEntry(current[component.id] ?? [], { ...entry, status: "applied" }),
      }));
      onNotice(isCheckpoint(entry) ? `Restored “${entry.prompt}”.` : `Re-applied “${entry.prompt}”.`);
      flash("Done · change applied");
    },
    [applyFiles, flash, onNotice],
  );

  const addCheckpoint = useCallback(() => {
    const component = specRef.current;
    const label = `Checkpoint · ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    push(component.id, createCheckpoint(component.id, label, filesRef.current), filesRef.current);
    onNotice("Checkpoint created.");
  }, [onNotice, push]);

  const clearConversation = useCallback(() => {
    setMessages((current) => ({ ...current, [specRef.current.id]: [] }));
  }, []);

  const commit = useCallback((ids: string[], sha: string, url: string) => {
    const component = specRef.current;
    setHistory((current) => ({
      ...current,
      [component.id]: markCommitted(current[component.id] ?? [], ids, { sha, url, at: Date.now() }),
    }));
  }, []);

  const uncommitted = useMemo(
    () => changeSets.filter((entry) => !isCheckpoint(entry) && !entry.commit),
    [changeSets],
  );

  return {
    messages: componentMessages,
    changeSets,
    uncommitted,
    busy,
    status,
    mode,
    setMode,
    context,
    setContext,
    send,
    revert,
    reapply,
    addCheckpoint,
    clearConversation,
    commit,
  };
}
