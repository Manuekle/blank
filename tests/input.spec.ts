import { test, expect } from '@playwright/test';
import { previewState } from './ui';
import { cloneButtonDNA, vanillaButtonDNA, createComponentFiles, createDefaultCSS, updateDNAStyle, resolveStyle } from '../lib/component-model';
import { readCSSChanges, writeVisualChanges, writeContent, readContent } from '../lib/code-sync';
import { INPUT_SPEC, defaultInputTSX } from '../lib/components/input';
import { getSpec, hasSpec } from '../lib/components/registry';

const preview = (page: import('@playwright/test').Page) => page.frameLocator('iframe[title="Component preview"]');

/** Seeds a workspace with the button and input enabled, skipping the setup dialog. */
async function openInputWorkspace(page: import('@playwright/test').Page) {
  const docs = Object.fromEntries(['button', 'input'].map((id) => {
    const spec = getSpec(id);
    return [id, { name: `Untitled ${id}`, dna: cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent }), files: createComponentFiles(spec) }];
  }));
  await page.addInitScript((stored) => {
    if (sessionStorage.getItem('blank:test-seeded')) return;
    localStorage.setItem('blank:document:v2', stored);
    sessionStorage.setItem('blank:test-seeded', '1');
  }, JSON.stringify({ version: 2, activeSpecId: 'button', docs, enabled: ['button', 'input'] }));
  await page.goto('/');
}

test('input edits, states, persistence, placeholder sync, and reset', async ({ page }) => {
  await openInputWorkspace(page);
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Input', exact: true }).click();
  await expect(preview(page).getByRole('textbox')).toBeVisible();
  await expect(preview(page).getByPlaceholder('Input', { exact: true })).toBeVisible();

  await page.getByLabel('Placeholder', { exact: true }).fill('Search here');
  await expect(preview(page).getByPlaceholder('Search here', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Dark theme', exact: true }).click();
  await page.getByLabel('Fill color', { exact: true }).fill('#ff0000');
  await expect(preview(page).getByRole('textbox')).toHaveCSS('background-color', 'rgb(255, 0, 0)');

  await previewState(page, 'Hover').click();
  await page.getByLabel('Fill color', { exact: true }).fill('#0000ff');
  await expect(preview(page).getByRole('textbox')).toHaveCSS('background-color', 'rgb(0, 0, 255)');

  await previewState(page, 'Disabled').click();
  await expect(preview(page).getByRole('textbox')).toBeDisabled();

  await expect(page.getByText('Saved locally', { exact: true })).toBeVisible();
  await page.reload();
  await expect(preview(page).getByPlaceholder('Search here', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Reset component' }).click();
  await expect(preview(page).getByPlaceholder('Input', { exact: true })).toBeVisible();
});

test('input spec stays separate from the button spec', () => {
  expect(hasSpec('button')).toBe(true);
  expect(hasSpec('input')).toBe(true);
  expect(getSpec('input').className).toBe('blank-input');
  expect(getSpec('button').className).toBe('blank-button');

  const dna = cloneButtonDNA({ ...vanillaButtonDNA, content: INPUT_SPEC.defaultContent });
  expect(readContent(defaultInputTSX, 'placeholder')).toBe('Input');
  expect(writeContent(defaultInputTSX, 'placeholder', 'Email')).toContain('placeholder = "Email"');

  const styled = updateDNAStyle(dna, 'dark', 'default', 'radius', 12);
  expect(resolveStyle(styled, 'dark', 'default').radius).toBe(12);

  const css = createDefaultCSS(styled, INPUT_SPEC);
  expect(css).toContain('.blank-input');
  expect(css).toContain('border-radius: 12px');
  expect(css).not.toContain('.blank-button');

  const changed = css.replace('border-radius: 12px', 'border-radius: 20px');
  const decoded = readCSSChanges(css, changed, styled, INPUT_SPEC);
  expect(resolveStyle(decoded, 'dark', 'default').radius).toBe(20);

  const next = updateDNAStyle(decoded, 'dark', 'hover', 'paddingX', 18);
  const patched = writeVisualChanges(changed, decoded, next, INPUT_SPEC);
  expect(patched).toContain('padding-left: 18px');
});
