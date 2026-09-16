"use client";

import { useEffect, useRef, useState } from "react";

import { LogoMark } from "@/components/icons/logo";
import { SFSymbol } from "@/components/icons/sf-symbol";

import type { ComponentSpec } from "@/lib/component-model";
import type { AIChangeSet, AIMessage } from "@/lib/ai/change-set";

import { AIMessageRow } from "./ai-message";
import type { AIWorkspaceStatus } from "./use-ai-workspace";

type AIConversationProps = {
  spec: ComponentSpec;
  messages: AIMessage[];
  changeSets: AIChangeSet[];
  busy: boolean;
  status: AIWorkspaceStatus;
  onView: (entry: AIChangeSet) => void;
  onRevert: (entry: AIChangeSet) => void;
  onReapply: (entry: AIChangeSet) => void;
};

function EmptyState() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="ai-conversation ai-conversation-empty">
      <div className={`ai-empty-state t-stagger ${shown ? "is-shown" : ""}`}>
        <span className="ai-empty-logo t-stagger-line t-stagger-line--1" aria-hidden="true">
          <LogoMark size={18} />
        </span>

        <span className="ai-empty-word t-stagger-line t-stagger-line--2">blank</span>
      </div>
    </div>
  );
}

export function AIConversation({
  spec,
  messages,
  changeSets,
  busy,
  status,
  onView,
  onRevert,
  onReapply,
}: AIConversationProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    endRef.current?.scrollIntoView({ block: "end", behavior: reduce ? "auto" : "smooth" });
  }, [messages.length, busy, status.text]);

  if (messages.length === 0 && !busy) {
    return <EmptyState />;
  }

  return (
    <div className="ai-conversation" aria-live="polite" aria-relevant="additions">
      <div className="ai-messages-list">
        {messages.map((message) => (
          <AIMessageRow
            key={message.id}
            message={message}
            changeSet={changeSets.find((entry) => entry.id === message.changeSetId)}
            onView={onView}
            onRevert={onRevert}
            onReapply={onReapply}
          />
        ))}

        {busy && (
          <div className="ai-message ai-message-assistant" role="status">
            <div className="ai-message-heading">
              <span className="ai-message-mark" aria-hidden="true">
                <SFSymbol name="sparkles" size={11} />
              </span>

              <strong>Blank</strong>
            </div>

            <span className="t-shimmer ai-busy-status" data-text={status.text || `Analyzing ${spec.name}…`}>
              {status.text || `Analyzing ${spec.name}…`}
            </span>
          </div>
        )}

        <div ref={endRef} />
      </div>
    </div>
  );
}
