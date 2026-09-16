"use client";

import { SFSymbol } from "@/components/icons/sf-symbol";

import type { AIChangeSet, AIMessage } from "@/lib/ai/change-set";

import { ChangeCard } from "./change-card";

type AIMessageRowProps = {
  message: AIMessage;
  changeSet?: AIChangeSet;
  onView: (entry: AIChangeSet) => void;
  onRevert: (entry: AIChangeSet) => void;
  onReapply: (entry: AIChangeSet) => void;
};

function time(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AIMessageRow({ message, changeSet, onView, onRevert, onReapply }: AIMessageRowProps) {
  if (message.role === "user") {
    return (
      <article className="ai-message ai-message-user">
        <div className="ai-message-surface">
          <p>{message.content}</p>
        </div>

        <time dateTime={new Date(message.createdAt).toISOString()}>{time(message.createdAt)}</time>
      </article>
    );
  }

  return (
    <article className="ai-message ai-message-assistant" data-tone={message.tone}>
      <div className="ai-message-heading">
        <span className="ai-message-mark" aria-hidden="true">
          <SFSymbol name="sparkles" size={11} />
        </span>

        <strong>Blank</strong>

        <time dateTime={new Date(message.createdAt).toISOString()}>{time(message.createdAt)}</time>
      </div>

      <p className="ai-message-copy">{message.content}</p>

      {changeSet && (
        <ChangeCard entry={changeSet} onView={onView} onRevert={onRevert} onReapply={onReapply} />
      )}
    </article>
  );
}
