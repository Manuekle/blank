import { test, expect } from '@playwright/test';
import { previewState, workspaceTab } from './ui';
import { cloneButtonDNA, vanillaButtonDNA, createComponentFiles, createDefaultCSS, defaultButtonTSX, updateDNAStyle, resolveStyle } from '../lib/component-model';
import { readCSSChanges, writeVisualChanges, writeLabel } from '../lib/code-sync';
import { getSpec } from '../lib/components/registry';

const preview = (page: import('@playwright/test').Page) => page.frameLocator('iframe[title="Component preview"]');

/** Seeds the default button workspace, skipping the setup dialog. */
async function openButtonWorkspace(page: import('@playwright/test').Page) {
  const spec = getSpec('button');
  const docs = { button: { name: 'Untitled button', dna: cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent }), files: createComponentFiles(spec) } };
  await page.addInitScript((stored) => {
    if (sessionStorage.getItem('blank:test-seeded')) return;
    localStorage.setItem('blank:document:v2', stored);
    sessionStorage.setItem('blank:test-seeded', '1');
  }, JSON.stringify({ version: 2, activeSpecId: 'button', docs, enabled: ['button'] }));
  await page.goto('/');
}

async function pasteCode(page: import('@playwright/test').Page, content: string) {
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.evaluate(text => navigator.clipboard.writeText(text), content);
  await page.keyboard.press('ControlOrMeta+V');
}

test('visual edits, states, persistence, label sync, and undo reset', async ({ page }) => {
  await openButtonWorkspace(page);
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toBeVisible();
  await page.getByLabel('Label', { exact: true }).fill('Save changes');
  await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
  await page.getByLabel('Fill color', { exact: true }).fill('#ff0000');
  await expect(preview(page).getByRole('button', { name: 'Save changes' })).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  await previewState(page, 'Hover').click();
  await page.getByLabel('Fill color', { exact: true }).fill('#0000ff');
  await expect(preview(page).getByRole('button', { name: 'Save changes' })).toHaveCSS('background-color', 'rgb(0, 0, 255)');
  await previewState(page, 'Disabled').click();
  await expect(preview(page).getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await expect(page.getByText('Saved locally', { exact: true })).toBeVisible();
  await page.reload();
  await expect(preview(page).getByRole('button', { name: 'Save changes' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset component' }).click();
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Undo reset' }).click();
  await expect(preview(page).getByRole('button', { name: 'Save changes' })).toBeVisible();
});

test('real TSX logic and custom CSS execute without editor style leakage', async ({ page }) => {
  const dna = cloneButtonDNA(vanillaButtonDNA);
  const tsx = `import { useState } from "react"; import "./styles.css"; export function Button(props) { const [count,setCount] = useState(0); return <button {...props} className="blank-button" onClick={() => setCount(count+1)}>Count {count}</button>; }`;
  await page.addInitScript(({ dna, tsx, css }) => localStorage.setItem('blank:document:v1', JSON.stringify({ version: 1, name: 'Counter', dna, files: { tsx, css } })), { dna, tsx, css: createDefaultCSS(dna) + '\n.blank-button { background: rgb(0, 128, 0) !important; padding: 20px !important; }' });
  await page.goto('/');
  const button = preview(page).getByRole('button', { name: 'Count 0' });
  await expect(button).toHaveCSS('background-color', 'rgb(0, 128, 0)');
  await button.click();
  await expect(preview(page).getByRole('button', { name: 'Count 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Light theme', exact: true }).click();
  await expect(preview(page).getByRole('button', { name: 'Count 1' })).toBeVisible();
  await expect(page.getByLabel('Label', { exact: true })).toBeDisabled();
});

test('compile errors are visible and missing exports fail clearly', async ({ page }) => {
  const dna = cloneButtonDNA(vanillaButtonDNA);
  await page.addInitScript(({ dna, css }) => localStorage.setItem('blank:document:v1', JSON.stringify({ version: 1, name: 'Broken', dna, files: { tsx: 'export const Button = () => <button', css } })), { dna, css: createDefaultCSS(dna) });
  await page.goto('/');
  await expect(page.locator('.preview-error')).toContainText('Build failed');
});

test('mobile exposes inspector and state controls without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(previewState(page, 'Hover')).toBeVisible();
  await expect(page.getByLabel('Label', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true });
});

test('Monaco loads locally and changes TSX in the actual preview', async ({ page }) => {
  await openButtonWorkspace(page);
  await workspaceTab(page, 'Code').click();
  await expect(page.locator('.monaco-editor').first()).toBeVisible();
  await page.locator('.monaco-editor textarea').first().focus();
  await page.keyboard.press('ControlOrMeta+A');
  await pasteCode(page, 'export function Button(props) { return <button {...props}>Edited code</button>; }');
  await expect(preview(page).getByRole('button', { name: 'Edited code' })).toBeVisible();
  await page.screenshot({ path: 'test-results/code.png' });
});

test('managed CSS edits round trip while preserving custom declarations', () => {
  let dna = updateDNAStyle(cloneButtonDNA(vanillaButtonDNA), 'dark', 'default', 'radius', 20);
  const css = createDefaultCSS(dna);
  const edited = css.replaceAll('border-radius: 20px', 'border-radius: 35px') + '\n.blank-button { text-transform: capitalize; }';
  const decoded = readCSSChanges(css, edited, dna);
  expect(resolveStyle(decoded, 'dark', 'default').radius).toBe(35);
  const next = updateDNAStyle(decoded, 'dark', 'hover', 'paddingX', 22);
  const patched = writeVisualChanges(edited, decoded, next);
  expect(patched).toContain('text-transform: capitalize');
  expect(patched).toContain('border-radius: 35px');
  expect(patched).toContain('padding-left: 22px');
  expect(writeLabel(defaultButtonTSX, 'Say "hi"\nNext')).toContain('children = "Say \\"hi\\"\\nNext"');
});

test('explicit themes override system states and zero values override native padding', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await openButtonWorkspace(page);
  await previewState(page, 'Hover').click();
  await page.getByLabel('Fill color', { exact: true }).fill('#ff0000');
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  await page.getByRole('button', { name: 'Light theme', exact: true }).click();
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).not.toHaveCSS('background-color', 'rgb(255, 0, 0)');
  await previewState(page, 'Default').click();
  await page.getByLabel('Padding X value', { exact: true }).fill('1');
  await page.getByLabel('Padding X value', { exact: true }).fill('0');
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toHaveCSS('padding-left', '0px');
  await previewState(page, 'Focus').click();
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toHaveCSS('outline-style', 'auto');
});

test('editing one managed CSS rule syncs inspector and preview, preserving custom CSS', async ({ page }) => {
  await openButtonWorkspace(page);
  await page.getByLabel('Radius value', { exact: true }).fill('20');
  await workspaceTab(page, 'Code').click();
  await page.getByRole('button', { name: 'styles.css', exact: true }).click();
  await expect(page.locator('.monaco-editor textarea.inputarea')).toBeVisible();
  const css = await page.evaluate(() => JSON.parse(localStorage.getItem('blank:document:v2')!).docs.button.files.css as string);
  await page.locator('.monaco-editor textarea.inputarea').focus();
  await page.keyboard.press('ControlOrMeta+A');
  await pasteCode(page, css.replace('border-radius: 20px', 'border-radius: 35px') + '\n.blank-button { text-transform: capitalize; }');
  await expect(page.getByLabel('Radius value', { exact: true })).toHaveValue('35');
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toHaveCSS('border-radius', '35px');
  await page.getByLabel('Padding X value', { exact: true }).fill('16');
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toHaveCSS('text-transform', 'capitalize');
});

test('runtime errors, invalid CSS recovery, and export work', async ({ page }) => {
  await openButtonWorkspace(page);
  await workspaceTab(page, 'Code').click();
  await expect(page.locator('.monaco-editor textarea.inputarea')).toBeVisible();
  const input = page.locator('.monaco-editor textarea.inputarea');
  await input.focus(); await page.keyboard.press('ControlOrMeta+A');
  await pasteCode(page, 'throw new Error("Top level failure"); export function Button() { return <button />; }');
  await expect(page.locator('.preview-error')).toContainText('Top level failure');
  await input.focus(); await page.keyboard.press('ControlOrMeta+A'); await pasteCode(page, defaultButtonTSX);
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toBeVisible();
  await expect(page.locator('.preview-error')).toHaveCount(0);
  await page.getByRole('button', { name: 'styles.css', exact: true }).click();
  await input.focus(); await page.keyboard.press('ControlOrMeta+A'); await pasteCode(page, 'broken {');
  await expect(page.getByLabel('Radius value', { exact: true })).toBeDisabled();
  await input.focus(); await page.keyboard.press('ControlOrMeta+A'); await pasteCode(page, createDefaultCSS());
  await expect(page.getByLabel('Radius value', { exact: true })).toBeEnabled();
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export files', exact: true }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('blank-design-system.zip');
});

test('label edits target syntax, including single quotes, and preserve comments', () => {
  const code = `// children = "comment"\nexport function Button({children = 'Hello'}) { return <button>{children}</button>; }`;
  const result = writeLabel(code, 'Updated');
  expect(result).toContain('// children = "comment"');
  expect(result).toContain('children = "Updated"');
});
