"use client";

import { useEffect, useState } from "react";
import { play } from "cuelume";

import { GitHubIcon } from "@/components/icons/github";
import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";

import type { ComponentFiles, ComponentSpec } from "@/lib/component-model";
import type { AIChangeSet } from "@/lib/ai/change-set";
import { changedFiles } from "@/lib/ai/change-set";
import {
  commitFilesToGitHub,
  emptyGitHubConfig,
  githubConfigured,
  loadGitHubConfig,
  saveGitHubConfig,
  type GitHubConfig,
} from "@/lib/github";

import { celebrate } from "../feedback";
import { AIPopover } from "./ai-popover";

type GitHubControlProps = {
  spec: ComponentSpec;
  files: ComponentFiles;
  uncommitted: AIChangeSet[];
  onCommitted: (ids: string[], sha: string, url: string) => void;
};

export function GitHubControl({ spec, files, uncommitted, onCommitted }: GitHubControlProps) {
  const [config, setConfig] = useState<GitHubConfig>(emptyGitHubConfig);
  const [open, setOpen] = useState(false);
  const [commitOpen, setCommitOpen] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [message, setMessage] = useState("");
  const [state, setState] = useState("");
  const [committed, setCommitted] = useState<{ url: string } | null>(null);

  useEffect(() => {
    setConfig(loadGitHubConfig());
  }, []);

  const connected = githubConfigured(config);
  const paths = [spec.fileName, "styles.css"];
  const changed = [...new Set(uncommitted.flatMap(changedFiles))];

  function connect() {
    saveGitHubConfig(config);
    setOpen(false);
    setState("");
  }

  function disconnect() {
    const next = { ...emptyGitHubConfig, branch: config.branch };
    setConfig(next);
    saveGitHubConfig(next);
    setOpen(false);
    setState("");
  }

  function openCommit() {
    const latest = uncommitted[uncommitted.length - 1];
    setMessage(latest ? `Update ${spec.name}: ${latest.summary}` : `Update ${spec.name}`);
    setCommitted(null);
    setState("");
    setOpen(false);
    setCommitOpen(true);
  }

  function closeCommit() {
    if (committing) return;
    setCommitOpen(false);
    setState("");
    setCommitted(null);
  }

  async function commit() {
    if (!message.trim() || committing) return;
    setCommitting(true);
    setState("");
    try {
      const result = await commitFilesToGitHub(
        config,
        { [spec.fileName]: files.tsx, "styles.css": files.css },
        message.trim(),
      );
      onCommitted(uncommitted.map((entry) => entry.id), result.sha, result.url);
      setCommitted({ url: result.url });
      setState(`Committed ${result.sha.slice(0, 7)}.`);
      celebrate();
    } catch (error) {
      play("error");
      setState(error instanceof Error ? error.message : "The commit failed.");
    } finally {
      setCommitting(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<GitHubIcon size={14} />}
        rightIcon={connected ? <i className="ai-status-dot" aria-hidden="true" /> : undefined}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {connected ? `${config.owner}/${config.repo}` : "Connect"}
      </Button>

      <AIPopover open={open} onClose={() => setOpen(false)} label="GitHub">
        {connected ? (
          <div className="ai-github-panel">
            <div className="ai-github-repo">
              <strong>{config.owner}/{config.repo}</strong>
              <small>branch · {config.branch}</small>
            </div>

            {uncommitted.length > 0 ? (
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                leftIcon={<SFSymbol name="arrow.up.right" size={12} />}
                rightIcon={<span className="ai-github-commit-count">{changed.length || paths.length} file{changed.length === 1 ? "" : "s"}</span>}
                onClick={openCommit}
              >
                Create commit
              </Button>
            ) : (
              <p className="ai-popover-note">No uncommitted AI changes.</p>
            )}

            <div className="ai-popover-footer">
              <a href={`https://github.com/${config.owner}/${config.repo}/tree/${config.branch}`} target="_blank" rel="noreferrer">
                Open repository
              </a>

              <button type="button" onClick={disconnect}>Disconnect</button>
            </div>
          </div>
        ) : (
          <div className="ai-github-panel">
            <p className="ai-popover-note">
              Connect with a fine-grained token that has <code>contents:write</code> on the repository.
            </p>

            <label className="ai-field">
              <span>Token</span>
              <input
                type="password"
                value={config.token}
                placeholder="github_pat_…"
                aria-label="GitHub token"
                onChange={(event) => setConfig({ ...config, token: event.target.value })}
              />
            </label>

            <div className="ai-field-row">
              <label className="ai-field">
                <span>Owner</span>
                <input
                  value={config.owner}
                  placeholder="you"
                  aria-label="GitHub owner"
                  onChange={(event) => setConfig({ ...config, owner: event.target.value })}
                />
              </label>

              <label className="ai-field">
                <span>Repository</span>
                <input
                  value={config.repo}
                  placeholder="design-system"
                  aria-label="GitHub repository"
                  onChange={(event) => setConfig({ ...config, repo: event.target.value })}
                />
              </label>
            </div>

            <label className="ai-field">
              <span>Branch</span>
              <input
                value={config.branch}
                placeholder="main"
                aria-label="GitHub branch"
                onChange={(event) => setConfig({ ...config, branch: event.target.value })}
              />
            </label>

            <div className="ai-popover-footer">
              <span className="ai-popover-note">Stored in this browser only.</span>

              <Button variant="primary" size="sm" disabled={!connected} onClick={connect}>
                Connect
              </Button>
            </div>
          </div>
        )}
      </AIPopover>

      <AIPopover open={commitOpen} onClose={closeCommit} label="Commit changes" className="ai-commit-dialog">
        <div className="ai-github-panel">
          <strong className="ai-popover-title">Commit changes</strong>

          <label className="ai-field">
            <span>Message</span>
            <input
              value={message}
              aria-label="Commit message"
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>

          <ul className="ai-commit-files">
            {(changed.length > 0 ? changed : paths).map((path) => <li key={path}>{path}</li>)}
          </ul>

          {state && <p className="ai-commit-state">{state}</p>}

          <div className="ai-popover-footer">
            {committed ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => window.open(committed.url, "_blank", "noreferrer")}
                >
                  View commit
                </Button>
                <Button variant="ghost" size="sm" onClick={closeCommit}>Done</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={closeCommit} disabled={committing}>
                  Cancel
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  disabled={committing || !message.trim()}
                  onClick={commit}
                >
                  {committing ? "Committing…" : "Commit"}
                </Button>
              </>
            )}
          </div>
        </div>
      </AIPopover>
    </>
  );
}
