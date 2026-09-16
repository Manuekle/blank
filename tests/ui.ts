import type { Page } from '@playwright/test';

/**
 * The editor's segmented controls are radio groups: one choice is always
 * active, arrow keys move the selection, and only the active option is a tab
 * stop. Both groups below expose the same state names, so every lookup is
 * scoped to its group.
 */

/** Canvas control that switches the previewed state. */
export const previewState = (page: Page, name: string) =>
  page.getByRole('radiogroup', { name: 'Preview state' }).getByRole('radio', { name, exact: true });

/** Topbar control that switches between Design, Code and AI. */
export const workspaceTab = (page: Page, name: string) =>
  page.getByRole('radiogroup', { name: 'Workspace' }).getByRole('radio', { name, exact: true });
