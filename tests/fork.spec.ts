import { test, expect, type Page } from '@playwright/test';
import { cloneButtonDNA, vanillaButtonDNA, createComponentFiles } from '../lib/component-model';
import { getSpec } from '../lib/components/registry';

const preview = (page: import('@playwright/test').Page) => page.frameLocator('iframe[title="Component preview"]');
const sidebar = (page: import('@playwright/test').Page) => page.locator('.left-sidebar');

async function openWorkspace(page: Page, ids: string[]) {
  const docs = Object.fromEntries(ids.map((id) => {
    const spec = getSpec(id);
    return [id, { name: `Untitled ${id}`, dna: cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent }), files: createComponentFiles(spec) }];
  }));
  await page.addInitScript((stored) => {
    if (sessionStorage.getItem('blank:test-seeded')) return;
    localStorage.setItem('blank:document:v2', stored);
    sessionStorage.setItem('blank:test-seeded', '1');
  }, JSON.stringify({ version: 2, activeSpecId: ids[0], docs, enabled: ids }));
  await page.goto('/');
}

test('forking a template creates a custom document with its own export name', async ({ page }) => {
  await openWorkspace(page, ['alert-dialog']);

  await page.getByRole('button', { name: 'Fork', exact: true }).click();

  await expect(preview(page).locator('.blank-alert-dialog__title')).toHaveText('Uh oh! Something went wrong');

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('blank:document:v2') ?? '{}'));
  const forkIds = Object.keys(stored.docs).filter((id) => id.startsWith('alert-dialog-fork-'));
  expect(forkIds).toHaveLength(1);
  const forkId = forkIds[0];
  expect(stored.docs[forkId].spec.fileName).toBe('AlertDialogCustom.tsx');
  expect(stored.docs[forkId].spec.exportName).toBe('AlertDialogCustom');
  expect(stored.docs[forkId].name).toBe('Alert Dialog Custom');
  expect(stored.activeSpecId).toBe(forkId);
  expect(stored.enabled).toContain(forkId);
});

test('the fork survives a reload and opens from the Custom section', async ({ page }) => {
  await openWorkspace(page, ['alert-dialog']);

  await page.getByRole('button', { name: 'Fork', exact: true }).click();
  await page.reload();

  await expect(sidebar(page).locator('.sidebar-item', { hasText: 'Alert Dialog Custom' })).toBeVisible();
  await expect(preview(page).locator('.blank-alert-dialog__title')).toHaveText('Uh oh! Something went wrong');

  // Both documents coexist: the template is still selectable.
  await sidebar(page).locator('.sidebar-item', { hasText: 'Alert Dialog' }).first().click();
  await expect(sidebar(page).locator('.sidebar-item', { hasText: 'Alert Dialog Custom' })).toBeVisible();
});

test('renaming the document updates the sidebar and layers immediately', async ({ page }) => {
  await openWorkspace(page, ['alert-dialog']);

  await page.getByRole('button', { name: 'Fork', exact: true }).click();

  await page.getByLabel('Document name', { exact: true }).fill('Broken fork');
  await expect(sidebar(page).locator('.sidebar-item', { hasText: 'Broken fork' })).toBeVisible();
  await expect(sidebar(page).locator('.layer-row', { hasText: 'Broken fork' })).toBeVisible();

  await page.reload();
  await expect(sidebar(page).locator('.sidebar-item', { hasText: 'Broken fork' })).toBeVisible();
});

test('the fork compiles and renders from its own vanilla source', async ({ page }) => {
  await openWorkspace(page, ['button']);

  await page.getByRole('button', { name: 'Fork', exact: true }).click();

  await expect(preview(page).locator('.blank-button__label')).toHaveText('Button');

  await page.reload();
  await expect(sidebar(page).locator('.sidebar-item', { hasText: 'Button Custom' })).toBeVisible();
  await expect(preview(page).locator('.blank-button__label')).toHaveText('Button');
});
