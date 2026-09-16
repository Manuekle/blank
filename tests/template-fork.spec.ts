import { test, expect, type Page } from '@playwright/test';
import { workspaceTab } from './ui';
import { kitComponentSpec, TEMPLATE_KITS } from '../lib/templates';
import { createComponentFiles } from '../lib/component-model';

const preview = (page: import('@playwright/test').Page) => page.frameLocator('iframe[title="Component preview"]');
const sidebar = (page: import('@playwright/test').Page) => page.locator('.left-sidebar');

test('kit fork spec is code-only and carries the kit design', () => {
  const kit = TEMPLATE_KITS.find((entry) => entry.id === 'vhs-osd')!;
  const component = kit.components.find((entry) => entry.id === 'screen')!;
  const spec = kitComponentSpec(kit, component);
  const files = createComponentFiles(spec);

  expect(spec.id).toBe('kit-vhs-osd-screen');
  expect(spec.className).toBe('vhs-screen');
  expect(spec.fileName).toBe('VHSOnScreenCRTScreen.tsx');
  expect(spec.visual).toBe(false);
  expect(spec.contentProp).toBeNull();
  expect(files.tsx).toContain('export function VHSOnScreenCRTScreen()');
  expect(files.tsx).toContain('import "./styles.css";');
  expect(files.css).toContain('blank:generated:start');
  expect(files.css).toContain('.vhs-screen');
  expect(files.css).not.toContain('background: ButtonFace');
});

test('forking from a template page opens the editor with the component', async ({ page }: { page: Page }) => {
  await page.goto('/templates/vhs-osd');

  await page.locator('.tpl-fork-button').first().click();
  await page.waitForURL('/');

  await expect(sidebar(page).locator('.sidebar-item', { hasText: 'CRT screen' })).toBeVisible();
  await expect(preview(page).locator('.vhs-screen')).toBeVisible();

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('blank:document:v2') ?? '{}'));
  const fork = stored.docs['kit-vhs-osd-screen'];
  expect(fork.spec.visual).toBe(false);
  expect(stored.activeSpecId).toBe('kit-vhs-osd-screen');

  await page.reload();
  await expect(sidebar(page).locator('.sidebar-item', { hasText: 'CRT screen' })).toBeVisible();
  await expect(preview(page).locator('.vhs-screen')).toBeVisible();
});

test('forked template CSS stays editable in the code workspace', async ({ page }: { page: Page }) => {
  await page.goto('/templates/vhs-osd');
  await page.locator('.tpl-fork-button').first().click();
  await page.waitForURL('/');

  await workspaceTab(page, 'Code').click();
  await expect(page.locator('.monaco-editor').first()).toBeVisible({ timeout: 15_000 });

  await page.getByRole('button', { name: 'styles.css', exact: true }).click();
  await expect(page.locator('.monaco-editor textarea').first()).toBeVisible();
});
