"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { play, setEnabled } from "cuelume";

import { GitHubIcon } from "@/components/icons/github";
import { SFSymbol, type SFSymbolName } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";
import { setPreferences } from "@/lib/preferences";

import { usePreferences } from "./feedback";
import { useDialog } from "./use-dialog";
import { useExitPhase } from "./use-presence";

import "./settings-dialog.css";

export type SettingsSection = "account" | "preferences" | "components";

/** A component in the workspace, as the Components section lists it. */
export type WorkspaceComponent = {
  id: string;
  name: string;
  fileName: string;
  icon: SFSymbolName;
  custom: boolean;
  open: boolean;
};

type SettingsDialogProps = {
  components: WorkspaceComponent[];
  onDeleteComponent: (id: string, name: string) => void;
  onAddComponents: () => void;
  onClose: () => void;
};

const CLOSE_MS = 150;

const SECTIONS: Array<{ group: string; items: Array<{ id: SettingsSection; label: string; icon: SFSymbolName }> }> = [
  {
    group: "Personal",
    items: [
      { id: "account", label: "Account", icon: "person.crop.circle" },
      { id: "preferences", label: "Preferences", icon: "slider.horizontal.3" },
    ],
  },
  {
    group: "Workspace",
    items: [{ id: "components", label: "Components", icon: "square.grid.2x2" }],
  },
];

const TITLES: Record<SettingsSection, string> = {
  account: "Account",
  preferences: "Preferences",
  components: "Components",
};

export function SettingsDialog({ components, onDeleteComponent, onAddComponents, onClose }: SettingsDialogProps) {
  const [section, setSection] = useState<SettingsSection>("account");
  // Mounted only while open: the surface plays its enter after mount and its exit before unmounting.
  const { phase, leave } = useExitPhase(CLOSE_MS);

  function close() {
    play("droplet");
    leave(onClose);
  }

  const panelRef = useDialog<HTMLDivElement>(true, { onClose: close });

  return (
    <div
      className="settings-dialog"
      data-state={phase}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        className={`settings-panel t-modal ${phase === "open" ? "is-open" : phase === "closing" ? "is-closing" : ""}`}
        inert={phase === "closing"}
      >
        <nav className="settings-nav" aria-label="Settings sections">
          {SECTIONS.map((group) => (
            <div key={group.group} className="settings-nav-group">
              <p>{group.group}</p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="settings-nav-item"
                  aria-current={section === item.id ? "page" : undefined}
                  data-cuelume-hover="tick"
                  data-cuelume-toggle="whisper"
                  onClick={() => setSection(item.id)}
                >
                  <SFSymbol name={item.icon} size={14} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <section className="settings-content" aria-label={TITLES[section]}>
          <header className="settings-header">
            <h2>{TITLES[section]}</h2>
            <Button variant="ghost" size="icon-sm" aria-label="Close settings" onClick={close}>
              <SFSymbol name="xmark" size={12} />
            </Button>
          </header>

          <div className="settings-body">
            {section === "account" && <AccountSection />}
            {section === "preferences" && <PreferencesSection />}
            {section === "components" && (
              <ComponentsSection
                components={components}
                onDeleteComponent={onDeleteComponent}
                onAddComponents={() => leave(onAddComponents)}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function AccountSection() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <p className="settings-note" role="status">
        Loading your account…
      </p>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="settings-card settings-account">
        <span className="settings-account-mark" aria-hidden="true">
          <GitHubIcon size={18} />
        </span>
        <div className="settings-account-text">
          <strong>Not signed in</strong>
          <small>Sign in with your GitHub account. Your workspace stays saved in this browser either way.</small>
        </div>
        <Button variant="primary" size="sm" leftIcon={<GitHubIcon size={13} />} onClick={() => router.push("/sign-in")}>
          Sign in
        </Button>
      </div>
    );
  }

  const github = user.externalAccounts.find((account) => account.provider === "github");

  return (
    <div className="settings-card settings-account">
      <img className="settings-avatar" src={user.imageUrl} alt="" width={40} height={40} />
      <div className="settings-account-text">
        <strong>{user.fullName || github?.username || "Signed in"}</strong>
        <small>
          {user.primaryEmailAddress?.emailAddress}
          {github?.username && (
            <span className="settings-badge">
              <GitHubIcon size={10} />
              {github.username}
            </span>
          )}
        </small>
      </div>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<SFSymbol name="rectangle.portrait.and.arrow.right" size={12} />}
        onClick={() => signOut({ redirectUrl: "/" })}
      >
        Sign out
      </Button>
    </div>
  );
}

function PreferencesSection() {
  const preferences = usePreferences();
  const volume = Math.round(preferences.volume * 100);

  return (
    <div className="settings-list">
      <SettingRow
        icon="speaker.wave.2"
        title="Interface sounds"
        description="Soft cues for clicks, toggles and finished actions."
      >
        <Switch
          label="Interface sounds"
          checked={preferences.sounds}
          onChange={(sounds) => {
            // Applied before cuelume handles this click, so turning sounds
            // on confirms with a sound and turning them off stays silent.
            setEnabled(sounds);
            setPreferences({ sounds });
          }}
        />
      </SettingRow>

      <SettingRow title="Volume" description="How loud the cues play." disabled={!preferences.sounds}>
        <span className="settings-range">
          <input
            aria-label="Sound volume"
            className="property-range"
            type="range"
            min={0}
            max={100}
            step={5}
            value={volume}
            disabled={!preferences.sounds}
            style={{ "--range-from": "0%", "--range-to": `${volume}%` } as CSSProperties}
            onChange={(event) => setPreferences({ volume: Number(event.target.value) / 100 })}
            onPointerUp={() => play("tick")}
            onKeyUp={() => play("tick")}
          />
          <output>{volume}%</output>
        </span>
      </SettingRow>

      <SettingRow icon="party.popper" title="Confetti" description="Celebrate exports, commits and a new workspace.">
        <Switch label="Confetti" checked={preferences.confetti} onChange={(confetti) => setPreferences({ confetti })} />
      </SettingRow>
    </div>
  );
}

function ComponentsSection({
  components,
  onDeleteComponent,
  onAddComponents,
}: {
  components: WorkspaceComponent[];
  onDeleteComponent: (id: string, name: string) => void;
  onAddComponents: () => void;
}) {
  const last = components.length <= 1;

  return (
    <>
      <div className="settings-table">
        <div className="settings-table-head" aria-hidden="true">
          <span>Component</span>
          <span>File</span>
        </div>

        <ul>
          {components.map((component) => (
            <li key={component.id} className="settings-table-row">
              <span className="settings-component">
                <SFSymbol name={component.icon} size={14} />
                <strong>{component.name}</strong>
                {component.custom && <em>Custom</em>}
                {component.open && <em data-tone="blue">Open</em>}
              </span>
              <code>{component.fileName}</code>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Delete ${component.name}`}
                title={last ? "A workspace keeps at least one component" : `Delete ${component.name}`}
                disabled={last}
                onClick={() => onDeleteComponent(component.id, component.name)}
              >
                <SFSymbol name="trash" size={12} />
              </Button>
            </li>
          ))}
        </ul>

        <button type="button" className="settings-table-add" onClick={onAddComponents}>
          <SFSymbol name="plus" size={12} />
          Add components
        </button>
      </div>

      <p className="settings-note">Right-click a component in the sidebar to delete it too. ⌘Z brings it back.</p>
    </>
  );
}

function SettingRow({
  icon,
  title,
  description,
  disabled = false,
  children,
}: {
  icon?: SFSymbolName;
  title: string;
  description: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="settings-row" data-disabled={disabled || undefined}>
      <span className="settings-row-icon" aria-hidden="true">
        {icon && <SFSymbol name={icon} size={14} />}
      </span>
      <span className="settings-row-text">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      {children}
    </div>
  );
}

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="settings-switch"
      data-cuelume-toggle=""
      onClick={() => onChange(!checked)}
    >
      <span aria-hidden="true" />
    </button>
  );
}
