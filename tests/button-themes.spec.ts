import { test, expect } from '@playwright/test';
import { previewState } from './ui';
import { cloneButtonDNA, vanillaButtonDNA, createComponentFiles, createDefaultCSS, defaultButtonTSX, updateDNAStyle, resolveStyle, resetStateDNA, shareButtonStructure } from '../lib/component-model';
import { readCSSChanges, writeVisualChanges } from '../lib/code-sync';
import { getSpec } from '../lib/components/registry';

const preview = (page: import('@playwright/test').Page) => page.frameLocator('iframe[title="Component preview"]');

test('one button retains shared structure, isolated states and React identity across themes', async ({ page }) => {
  const spec = getSpec('button');
  const docs = { button: { name: 'Untitled button', dna: cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent }), files: createComponentFiles(spec) } };
  await page.addInitScript((stored) => {
    if (sessionStorage.getItem('blank:test-seeded')) return;
    localStorage.setItem('blank:document:v2', stored);
    sessionStorage.setItem('blank:test-seeded', '1');
  }, JSON.stringify({ version: 2, activeSpecId: 'button', docs, enabled: ['button'] }));
  await page.goto('/');
  const button = preview(page).getByRole('button', { name: 'Button', exact: true });
  await expect(button).toBeVisible();
  await button.evaluate(el => { (window as any).originalButton = el; });
  await page.getByLabel('Padding X value', { exact: true }).fill('24');
  await page.getByLabel('Radius value', { exact: true }).fill('12');
  await page.getByLabel('Fill color', { exact: true }).fill('#ff0000');
  await previewState(page, 'Pressed').click();
  await page.getByLabel('Scale value', { exact: true }).fill('96');
  await previewState(page, 'Hover').click();
  await page.getByLabel('Fill color', { exact: true }).fill('#0000ff');

  for (const theme of ['dark', 'light', 'dark']) {
    await page.getByRole('button', { name: theme === 'dark' ? 'Dark theme' : 'Light theme', exact: true }).click();
    await expect(page.locator('.canvas')).toHaveAttribute('data-theme', theme);
    for (const state of ['Default', 'Hover', 'Pressed', 'Focus', 'Disabled']) {
      await previewState(page, state).click();
      await expect(preview(page).getByRole('button')).toHaveCount(1);
      await expect(button).toHaveCSS('padding-left', '24px');
      await expect(button).toHaveCSS('border-radius', '12px');
      await expect(page.getByLabel('Padding X value', { exact: true })).toHaveValue('24');
      if (state === 'Pressed') await expect(button).toHaveCSS('transform', 'matrix(0.96, 0, 0, 0.96, 0, 0)');
      else await expect(button).toHaveCSS('transform', 'none');
      if (state === 'Disabled') await expect(button).toBeDisabled();
      else await expect(button).toBeEnabled();
      if (state === 'Focus') await expect(button).toHaveCSS('outline-style', 'auto');
      if (theme === 'dark') await expect(button).toHaveCSS('background-color', state === 'Hover' ? 'rgb(0, 0, 255)' : 'rgb(255, 0, 0)');
      else await expect(button).not.toHaveCSS('background-color', 'rgb(255, 0, 0)');
      expect(await button.evaluate(el => el === (window as any).originalButton)).toBe(true);
    }
  }
  await expect(page.getByText('Saved locally', { exact: true })).toBeVisible();
  await page.reload();
  await expect(button).toHaveCSS('padding-left', '24px');
  await page.getByRole('button', { name: 'Light theme', exact: true }).click();
  await expect(button).toHaveCSS('border-radius', '12px');
});

test('CSS edits and resets share geometry while preserving theme colors and custom CSS', () => {
  let dna = updateDNAStyle(cloneButtonDNA(vanillaButtonDNA), 'dark', 'default', 'radius', 12);
  dna = updateDNAStyle(dna, 'light', 'default', 'background', '#ffffff');
  const css = createDefaultCSS(dna) + '\n.blank-button { text-transform: capitalize; }';
  const edited = css.replace('border-radius: 12px', 'border-radius: 20px');
  const next = readCSSChanges(css, edited, dna);
  for (const theme of ['dark', 'light'] as const) expect(resolveStyle(next, theme, 'hover').radius).toBe(20);
  const patched = writeVisualChanges(edited, dna, next);
  expect(patched).not.toContain('border-radius: 12px');
  expect(patched).toContain('text-transform: capitalize');
  const removed = readCSSChanges(patched, patched.replace('border-radius: 20px;', ''), next);
  expect(removed.themes.dark.base.radius).toBe(0);
  expect(removed.themes.light.base.radius).toBe(0);
  const active = updateDNAStyle(next, 'light', 'active', 'scale', 96);
  expect(resolveStyle(active, 'dark', 'active').scale).toBe(96);
  const reset = resetStateDNA(active, 'dark', 'active');
  expect(resolveStyle(reset, 'light', 'active').scale).toBe(100);
  expect(reset.themes.light.base.background).toBe('#ffffff');
  const baseReset = resetStateDNA(reset, 'dark', 'default');
  expect(baseReset.themes.light.base.radius).toBe(0);
  expect(baseReset.themes.light.base.background).toBe('#ffffff');
});

test('saved independent themes upgrade to shared structure without losing custom CSS', async ({ page }) => {
  const dna = cloneButtonDNA(vanillaButtonDNA);
  dna.themes.dark.base.paddingX = 24;
  dna.themes.light.base.radius = 12;
  dna.themes.dark.states.active.scale = 96;
  const shared = shareButtonStructure(dna);
  expect(shareButtonStructure(shared)).toEqual(shared);
  await page.addInitScript(({ dna, css, tsx }) => localStorage.setItem('blank:document:v1', JSON.stringify({ version: 1, name: 'Saved button', dna, files: { css, tsx } })), { dna, css: createDefaultCSS(dna) + '\n.blank-button { text-transform: capitalize; }', tsx: defaultButtonTSX });
  await page.goto('/');
  const button = preview(page).getByRole('button');
  await expect(button).toHaveCSS('border-radius', '12px');
  await page.getByRole('button', { name: 'Light theme', exact: true }).click();
  await expect(button).toHaveCSS('padding-left', '24px');
  await previewState(page, 'Pressed').click();
  await expect(button).toHaveCSS('transform', 'matrix(0.96, 0, 0, 0.96, 0, 0)');
  await expect(button).toHaveCSS('text-transform', 'capitalize');
});

test('Disabled inherits Default colors, accepts overrides and blocks clicks in both themes', async ({ page }) => {
  // Reproduce a saved document created before explicit native base colors.
  const dna = cloneButtonDNA(vanillaButtonDNA);
  const css = createDefaultCSS(dna).replace(/^\s*(?:background: ButtonFace|color: ButtonText|border-color: ButtonBorder);\n/gm, '\n');
  await page.addInitScript(({ dna, css, tsx }) => localStorage.setItem('blank:document:v1', JSON.stringify({ version: 1, name: 'Disabled regression', dna, files: { css, tsx } })), { dna, css, tsx: defaultButtonTSX });
  await page.goto('/');
  const button = preview(page).getByRole('button');
  await expect(button).toBeVisible();
  const colors = () => button.evaluate(el => {
    const style = getComputedStyle(el);
    return [style.backgroundColor, style.color, style.borderColor];
  });
  for (const theme of ['dark', 'light']) {
    await page.getByRole('button', { name: theme === 'dark' ? 'Dark theme' : 'Light theme', exact: true }).click();
    await expect(page.locator('.canvas')).toHaveAttribute('data-theme', theme);
    await previewState(page, 'Default').click();
    await expect(button).toBeEnabled();
    const base = await colors();
    await previewState(page, 'Disabled').click();
    await expect(button).toBeDisabled();
    await expect.poll(colors).toEqual(base);
    await button.evaluate(el => {
      (window as any).disabledClicks = 0;
      el.addEventListener('click', () => (window as any).disabledClicks++);
    });
    const box = (await button.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    expect(await button.evaluate(() => (window as any).disabledClicks)).toBe(0);
    await page.getByLabel('Fill color', { exact: true }).fill('#123456');
    await page.getByLabel('Opacity value', { exact: true }).fill('45');
    await expect(button).toHaveCSS('background-color', 'rgb(18, 52, 86)');
    await expect(button).toHaveCSS('opacity', '0.45');
    await page.getByRole('button', { name: 'Reset state overrides', exact: true }).click();
    await expect.poll(colors).toEqual(base);
    await expect(button).toHaveCSS('opacity', '1');
    await previewState(page, 'Default').click();
    await expect(button).toBeEnabled();
  }
});
