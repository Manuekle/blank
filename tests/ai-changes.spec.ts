import { test, expect, type Page } from '@playwright/test';
import { workspaceTab } from './ui';
import { createChangeSet, patchFiles } from '../lib/ai/change-set';
import type { ComponentFiles } from '../lib/component-model';

function lines(count: number, edits: Record<number, string> = {}): string {
  return Array.from({ length: count }, (_, index) => edits[index] ?? `line ${index + 1}`).join('\n');
}

/** Seeds a saved workspace so the setup dialog never opens. */
async function openAI(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      'blank:document:v2',
      JSON.stringify({ version: 2, activeSpecId: 'button', docs: {}, enabled: ['button'] }),
    );
  });
  await page.goto('/');
  await workspaceTab(page, 'AI').click();
}

async function mockAgent(page: Page, line: string) {
  await page.route('**/api/ai', async (route) => {
    const body = route.request().postDataJSON() as { files: ComponentFiles };
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        mode: 'agent',
        summary: 'Made the button compact',
        css: body.files.css.replace('/* blank:custom:start */', `/* blank:custom:start */\n${line}`),
        applied: true,
        files: ['css'],
      }),
    });
  });
}

test('reverting one change set keeps later non-overlapping edits', () => {
  const base: ComponentFiles = { tsx: lines(20), css: '' };
  const first = createChangeSet({
    componentId: 'button',
    prompt: 'rename line 2',
    summary: 'Renamed',
    specFileName: 'Button.tsx',
    before: base,
    after: { tsx: lines(20, { 1: 'renamed line 2' }), css: '' },
  });

  const later: ComponentFiles = { tsx: lines(20, { 1: 'renamed line 2', 14: 'later edit' }), css: '' };
  const reverted = patchFiles(later, first.changes, 'reverse');

  expect(reverted.ok).toBe(true);
  if (!reverted.ok) return;
  expect(reverted.files.tsx.split('\n')[1]).toBe('line 2');
  expect(reverted.files.tsx.split('\n')[14]).toBe('later edit');
});

test('reverting refuses when a newer edit overlaps the same lines', () => {
  const base: ComponentFiles = { tsx: lines(20), css: '' };
  const first = createChangeSet({
    componentId: 'button',
    prompt: 'rename line 2',
    summary: 'Renamed',
    specFileName: 'Button.tsx',
    before: base,
    after: { tsx: lines(20, { 1: 'renamed line 2' }), css: '' },
  });

  const overlapping: ComponentFiles = { tsx: lines(20, { 1: 'renamed line 2', 2: 'newer edit' }), css: '' };
  const reverted = patchFiles(overlapping, first.changes, 'reverse');

  expect(reverted.ok).toBe(false);
  if (reverted.ok) return;
  expect(reverted.conflicts).toEqual(['Button.tsx']);
});

test('AI change sets apply, diff, and revert through the workspace', async ({ page }) => {
  await mockAgent(page, '.blank-button { letter-spacing: 0.02em; }');
  await openAI(page);

  await expect(page.locator('.ai-empty-word')).toHaveText('blank');

  await page.getByLabel('Ask Blank AI').fill('Make the button more compact');
  await page.keyboard.press('Enter');

  await expect(page.getByText('Made the button compact').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'View changes' })).toBeVisible();

  await page.getByRole('button', { name: 'View changes' }).click();
  const diff = page.getByRole('dialog', { name: /Changes in/ });
  await expect(diff).toBeVisible();
  await expect(diff.locator('.ai-diff-line[data-kind="add"]')).toHaveCount(1);

  await diff.getByRole('button', { name: 'Revert' }).click();
  await expect(diff.getByRole('button', { name: 'Re-apply' })).toBeVisible();

  await diff.getByRole('button', { name: 'Close changes' }).click();
  await expect(page.getByRole('button', { name: 'Re-apply' })).toBeVisible();

  await page.getByRole('button', { name: 'Re-apply' }).click();
  await expect(page.getByRole('button', { name: 'Revert' })).toBeVisible();

  await page.waitForTimeout(400);
  const css = await page.evaluate(() => {
    const raw = localStorage.getItem('blank:document:v2');
    if (!raw) return '';
    const document = JSON.parse(raw) as { docs: Record<string, { files: { css: string } }> };
    return document.docs.button?.files.css ?? '';
  });
  expect(css).toContain('letter-spacing: 0.02em');
});

test('change history lists applied changes and checkpoints', async ({ page }) => {
  await mockAgent(page, '.blank-button { border-radius: 12px; }');
  await openAI(page);

  await page.getByLabel('Ask Blank AI').fill('Soften the radius');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Made the button compact').first()).toBeVisible();

  await page.getByRole('button', { name: /^Changes/ }).click();
  const history = page.getByRole('dialog', { name: 'Change history' });
  await expect(history).toBeVisible();
  await expect(history.getByText('Initial')).toBeVisible();
  await expect(history.getByText('Made the button compact').first()).toBeVisible();
  await expect(history.getByText('Current')).toBeVisible();

  await history.getByRole('button', { name: 'Checkpoint' }).click();
  await expect(history.getByText(/^Checkpoint ·/)).toBeVisible();
});

test('composer exposes Ask and Agent modes plus file context', async ({ page }) => {
  await openAI(page);

  await expect(page.getByText('2 files in context')).toBeVisible();

  await page.getByRole('button', { name: 'Mode: Agent' }).click();
  const modes = page.getByRole('dialog', { name: 'Mode' });
  await expect(modes).toBeVisible();
  await modes.getByRole('button', { name: /Ask/ }).click();
  await expect(page.getByRole('button', { name: 'Mode: Ask' })).toBeVisible();

  await page.getByRole('button', { name: '2 files in context' }).click();
  const context = page.getByRole('dialog', { name: 'Files in context' });
  await context.getByRole('checkbox', { name: /Button\.tsx/ }).uncheck();
  await expect(page.getByText('1 file in context')).toBeVisible();
});
