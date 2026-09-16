"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CodeHighlight, type HighlightLang } from "./code-highlight";
import { CopyButton } from "./copy-button";
import { sendForkToEditor } from "@/lib/fork-handoff";
import type { ComponentFiles, ComponentSpec } from "@/lib/component-model";

type Tab = "preview" | "html" | "css" | "react";

const TABS: { id: Tab; label: string }[] = [
  { id: "preview", label: "Preview" },
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "react", label: "React" },
];

type ComponentBlockProps = {
  id: string;
  root: string;
  name: string;
  description: string;
  snippet: string;
  code: { html: string; css: string; react: string };
  /** When present, the component can be forked straight into the editor. */
  fork?: { spec: ComponentSpec; files: ComponentFiles };
};

export function ComponentBlock({ id, root, name, description, snippet, code, fork }: ComponentBlockProps) {
  const [tab, setTab] = useState<Tab>("preview");
  const baseId = useId();
  const combined = `<style>\n${code.css}\n</style>\n\n${code.html}`;
  const tabsRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  // Sliding pill (transitions.dev — tabs sliding). Positions are
  // measured from the active tab; the transition is suspended on the
  // first paint so the pill snaps into place instead of flying in.
  const movePill = (animate: boolean) => {
    const bar = tabsRef.current;
    const pill = pillRef.current;
    if (!bar || !pill) return;
    const active = bar.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!active) return;
    if (!animate) {
      const previous = pill.style.transition;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = previous;
    } else {
      pill.style.transform = `translateX(${active.offsetLeft}px)`;
      pill.style.width = `${active.offsetWidth}px`;
    }
  };

  useEffect(() => {
    movePill(!first.current);
    first.current = false;
  }, [tab]);

  useEffect(() => {
    const onResize = () => movePill(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <section id={id} className="tpl-block" aria-labelledby={`${baseId}-title`}>
      <header className="tpl-block-header">
        <h2 id={`${baseId}-title`}>{name}</h2>
        <p>{description}</p>

        {fork && (
          <button
            type="button"
            className="tpl-fork-button"
            onClick={() => sendForkToEditor(fork.spec, fork.files)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="6" cy="5" r="2.4" />
              <circle cx="6" cy="19" r="2.4" />
              <circle cx="18" cy="12" r="2.4" />
              <path d="M8.2 6.2L15.6 10.9" />
              <path d="M8.6 17.8L15.4 13.3" />
            </svg>
            Fork to editor
          </button>
        )}
      </header>

      <div className="tpl-frame">
        <div className="tpl-toolbar">
          <div ref={tabsRef} role="tablist" aria-label={`${name} views`} className="tpl-tabs">
            <span ref={pillRef} className="tpl-tabs-pill" aria-hidden="true" />
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${item.id}`}
                aria-selected={tab === item.id}
                aria-controls={`${baseId}-panel`}
                tabIndex={tab === item.id ? 0 : -1}
                className="tpl-tab"
                onClick={() => setTab(item.id)}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
                  const index = TABS.findIndex((entry) => entry.id === tab);
                  const next = TABS[(index + (event.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
                  setTab(next.id);
                  document.getElementById(`${baseId}-tab-${next.id}`)?.focus();
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          {tab === "preview" ? (
            <CopyButton text={combined} label="Copy HTML + CSS" />
          ) : (
            <CopyButton text={code[tab]} label={`Copy ${TABS.find((item) => item.id === tab)!.label}`} />
          )}
        </div>

        <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tab}`}>
          {/* Preview stays mounted so form state survives a peek at the code. */}
          <div className={`tpl-stage ${root}`} hidden={tab !== "preview"} dangerouslySetInnerHTML={{ __html: snippet }} />
          {tab !== "preview" && (
            <pre className="tpl-code t-panel-in" key={tab} tabIndex={0}>
              <code>
                <CodeHighlight lang={tab as HighlightLang} code={code[tab]} />
              </code>
            </pre>
          )}
        </div>
      </div>
    </section>
  );
}
