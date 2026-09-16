import { test, expect, type Page } from '@playwright/test';
import { previewState } from './ui';
import {
  cloneButtonDNA,
  vanillaButtonDNA,
  createComponentFiles,
  createDefaultCSS,
  generateNodeCSS,
  normalizeNodeOverrides,
  updateDNAStyle,
  resolveStyle,
} from '../lib/component-model';
import { readContent, writeContent, readCSSChanges, writeVisualChanges } from '../lib/code-sync';
import { COMPONENT_SPECS, findSpecByName, getSpec } from '../lib/components/registry';
import { componentCatalog } from '../components/editor/component-catalog';

const preview = (page: import('@playwright/test').Page) => page.frameLocator('iframe[title="Component preview"]');
const sidebar = (page: import('@playwright/test').Page) => page.locator('.left-sidebar');

/** Opens the editor on a workspace that already includes the given components. */
async function openWorkspace(page: Page, ids: string[]) {
  const docs = Object.fromEntries(ids.map((id) => {
    const spec = getSpec(id);
    return [id, { name: `Untitled ${id}`, dna: cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent }), files: createComponentFiles(spec) }];
  }));
  await page.addInitScript((stored) => {
    // Only the first load is seeded, so a reload keeps what the test saved.
    if (sessionStorage.getItem('blank:test-seeded')) return;
    localStorage.setItem('blank:document:v2', stored);
    sessionStorage.setItem('blank:test-seeded', '1');
  }, JSON.stringify({ version: 2, activeSpecId: ids[0], docs, enabled: ids }));
  await page.goto('/');
}

/** Rounded preview-space boxes, to prove what did and did not move. */
const boxes = (page: Page, selectors: string[]) => preview(page).locator('body').evaluate((_, list) => Object.fromEntries(list.map((selector) => {
  const rect = document.querySelector(selector)!.getBoundingClientRect();
  return [selector, { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) }];
})), selectors);

/** A workspace with every catalog component enabled; docs are created on first select. */
async function openCatalogWorkspace(page: Page) {
  const spec = getSpec('button');
  const docs = { button: { name: 'Untitled button', dna: cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent }), files: createComponentFiles(spec) } };
  await page.addInitScript((stored) => {
    if (sessionStorage.getItem('blank:test-seeded')) return;
    localStorage.setItem('blank:document:v2', stored);
    sessionStorage.setItem('blank:test-seeded', '1');
  }, JSON.stringify({ version: 2, activeSpecId: 'button', docs, enabled: COMPONENT_SPECS.map((entry) => entry.id) }));
  await page.goto('/');
}

async function dragBy(page: Page, selector: string, dx: number, dy: number) {
  const box = (await preview(page).locator(selector).first().boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 8 });
  await page.mouse.up();
}

test('every spec is self-contained and namespaced', () => {
  const ids = new Set<string>();
  const classes = new Set<string>();
  const files = new Set<string>();
  const exports = new Set<string>();

  for (const spec of COMPONENT_SPECS) {
    expect(ids.has(spec.id), `duplicate id ${spec.id}`).toBe(false);
    expect(classes.has(spec.className), `duplicate className ${spec.className}`).toBe(false);
    expect(files.has(spec.fileName), `duplicate fileName ${spec.fileName}`).toBe(false);
    expect(exports.has(spec.exportName), `duplicate exportName ${spec.exportName}`).toBe(false);
    ids.add(spec.id);
    classes.add(spec.className);
    files.add(spec.fileName);
    exports.add(spec.exportName);

    expect(spec.vanillaTSX).toContain(`export const ${spec.exportName}`);
    expect(spec.vanillaTSX).toContain(`"${spec.className}"`);
    expect(spec.supportedStates).toContain('default');
    expect(findSpecByName(spec.name)).toBe(spec);
  }
});

test('every catalog entry resolves to a spec', () => {
  const missing = componentCatalog
    .filter((entry) => !findSpecByName(entry.name))
    .map((entry) => entry.name);

  expect(missing).toEqual([]);
  expect(COMPONENT_SPECS).toHaveLength(componentCatalog.length);
});

test('each spec generates CSS only for its own namespace', () => {
  for (const spec of COMPONENT_SPECS) {
    const dna = updateDNAStyle(
      cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent }),
      'dark',
      'default',
      'radius',
      10,
    );
    const css = createDefaultCSS(dna, spec);

    expect(css).toContain(`.${spec.className}`);
    expect(css).toContain('border-radius: 10px');
    expect(css).toContain('blank:generated:start');
    expect(css).toContain('blank:custom:start');

    for (const other of COMPONENT_SPECS) {
      if (other.id === spec.id) continue;
      expect(new RegExp(`\\.${other.className}(?![\\w-])`).test(css), `${spec.id} leaked ${other.className}`).toBe(false);
    }
  }
});

test('editable content round trips through the component source', () => {
  for (const spec of COMPONENT_SPECS) {
    if (!spec.contentProp) continue;
    expect(readContent(spec.vanillaTSX, spec.contentProp)).toBe(spec.defaultContent);
    expect(writeContent(spec.vanillaTSX, spec.contentProp, 'Changed')).toContain('Changed');
  }
  expect(getSpec('checkbox').contentProp).toBeNull();
  expect(getSpec('switch').contentProp).toBeNull();
});

test('CSS edits and state overrides stay scoped per component', () => {
  const spec = getSpec('textarea');
  const dna = cloneButtonDNA({ ...vanillaButtonDNA, content: spec.defaultContent });
  const css = createDefaultCSS(dna, spec);

  const edited = css.replace(/@layer blank \{/, '@layer blank {\n/* touched */');
  const decoded = readCSSChanges(css, edited, dna, spec);
  expect(resolveStyle(decoded, 'dark', 'default').radius).toBe(resolveStyle(dna, 'dark', 'default').radius);

  const next = updateDNAStyle(decoded, 'dark', 'focus', 'paddingX', 14);
  const patched = writeVisualChanges(edited, decoded, next, spec);
  expect(patched).toContain('padding-left: 14px');
  expect(patched).toContain('blank:custom:start');
});

test('switching primitives keeps a document per component', async ({ page }) => {
  await openCatalogWorkspace(page);
  await expect(preview(page).getByRole('button', { name: 'Button', exact: true })).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Textarea', exact: true }).click();
  await expect(preview(page).getByRole('textbox')).toBeVisible();
  await page.getByLabel('Placeholder', { exact: true }).fill('Message');
  await expect(preview(page).getByPlaceholder('Message', { exact: true })).toBeVisible();
  await page.getByLabel('Radius value', { exact: true }).fill('8');
  await expect(preview(page).getByRole('textbox')).toHaveCSS('border-radius', '8px');

  await sidebar(page).getByRole('button', { name: 'Checkbox', exact: true }).click();
  await expect(preview(page).getByRole('checkbox')).toBeVisible();
  await expect(page.getByLabel('Placeholder', { exact: true })).toHaveCount(0);
  await page.getByLabel('Fill color', { exact: true }).fill('#00ff00');
  await expect(preview(page).getByRole('checkbox')).toHaveCSS('background-color', 'rgb(0, 255, 0)');
  await previewState(page, 'Disabled').click();
  await expect(preview(page).getByRole('checkbox')).toBeDisabled();

  // The button document is untouched: no green, no disabled state.
  await sidebar(page).getByRole('button', { name: 'Button', exact: true }).click();
  const button = preview(page).getByRole('button', { name: 'Button', exact: true });
  await expect(button).toBeEnabled();
  await expect(button).not.toHaveCSS('background-color', 'rgb(0, 255, 0)');

  // The textarea document kept its placeholder and radius.
  await sidebar(page).getByRole('button', { name: 'Textarea', exact: true }).click();
  await expect(preview(page).getByPlaceholder('Message', { exact: true })).toHaveCSS('border-radius', '8px');

  await expect(page.getByText('Saved locally', { exact: true })).toBeVisible();
  await page.reload();
  await expect(preview(page).getByPlaceholder('Message', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Radius value', { exact: true })).toHaveValue('8');
});

test('interactive primitives render and propagate disabled', async ({ page }) => {
  await openCatalogWorkspace(page);

  await sidebar(page).getByRole('button', { name: 'Progress', exact: true }).click();
  await expect(preview(page).getByRole('progressbar')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Slider', exact: true }).click();
  await expect(preview(page).getByRole('slider')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Native Select', exact: true }).click();
  await expect(preview(page).getByRole('combobox')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Select', exact: true }).click();
  await expect(preview(page).locator('.blank-select select')).toBeVisible();
  await page.getByLabel('Radius value', { exact: true }).fill('10');
  await expect(preview(page).locator('.blank-select')).toHaveCSS('border-radius', '10px');

  await sidebar(page).getByRole('button', { name: 'Radio Group', exact: true }).click();
  await expect(preview(page).getByRole('radio')).toHaveCount(3);
  await previewState(page, 'Disabled').click();
  await expect(preview(page).getByRole('radio').first()).toBeDisabled();

  await sidebar(page).getByRole('button', { name: 'Toggle', exact: true }).click();
  await expect(preview(page).getByRole('button', { name: 'Toggle', exact: true })).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Toggle Group', exact: true }).click();
  await expect(preview(page).getByRole('button', { name: 'Center', exact: true })).toBeVisible();
});

test('display primitives render their structure', async ({ page }) => {
  await openCatalogWorkspace(page);

  await sidebar(page).getByRole('button', { name: 'Avatar', exact: true }).click();
  await expect(preview(page).locator('.blank-avatar')).toHaveText('AB');
  await page.getByLabel('Initials', { exact: true }).fill('CD');
  await expect(preview(page).locator('.blank-avatar')).toHaveText('CD');

  await sidebar(page).getByRole('button', { name: 'Typography', exact: true }).click();
  await expect(preview(page).locator('.blank-typography')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Table', exact: true }).click();
  await expect(preview(page).locator('.blank-table th')).toHaveCount(3);
  await expect(preview(page).locator('.blank-table tbody tr')).toHaveCount(2);

  await sidebar(page).getByRole('button', { name: 'Tabs', exact: true }).click();
  await expect(preview(page).locator('.blank-tabs [role="tab"]')).toHaveCount(3);
  await expect(preview(page).locator('.blank-tabs [role="tabpanel"]')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Button Group', exact: true }).click();
  await expect(preview(page).locator('.blank-button-group__item')).toHaveCount(3);

  await sidebar(page).getByRole('button', { name: 'Input Group', exact: true }).click();
  await expect(preview(page).locator('.blank-input-group__control')).toBeVisible();
  await previewState(page, 'Disabled').click();
  await expect(preview(page).locator('.blank-input-group__control')).toBeDisabled();

  await sidebar(page).getByRole('button', { name: 'Input OTP', exact: true }).click();
  await expect(preview(page).locator('.blank-input-otp__slot')).toHaveCount(6);
  await previewState(page, 'Disabled').click();
  await expect(preview(page).locator('.blank-input-otp__slot').first()).toBeDisabled();

  await sidebar(page).getByRole('button', { name: 'Field', exact: true }).click();
  await expect(preview(page).locator('.blank-field__control')).toBeVisible();
  await expect(page.getByLabel('Label', { exact: true })).toHaveValue('Field');

  await sidebar(page).getByRole('button', { name: 'Item', exact: true }).click();
  await expect(preview(page).locator('.blank-item__content')).toHaveText('Item');

  await sidebar(page).getByRole('button', { name: 'Marker', exact: true }).click();
  await expect(preview(page).locator('.blank-marker')).toHaveText('Marker');
});

test('composition primitives render their structure', async ({ page }) => {
  await openCatalogWorkspace(page);

  await sidebar(page).getByRole('button', { name: 'Card', exact: true }).click();
  await expect(preview(page).locator('.blank-card__title')).toHaveText('Card title');
  await page.getByLabel('Title', { exact: true }).fill('Profile');
  await expect(preview(page).locator('.blank-card__title')).toHaveText('Profile');

  await sidebar(page).getByRole('button', { name: 'Alert', exact: true }).click();
  await expect(preview(page).locator('.blank-alert__description')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Accordion', exact: true }).click();
  await expect(preview(page).locator('.blank-accordion__item')).toHaveCount(3);
  await expect(preview(page).locator('.blank-accordion__item[open]')).toHaveCount(1);

  await sidebar(page).getByRole('button', { name: 'Collapsible', exact: true }).click();
  await page.getByLabel('Trigger', { exact: true }).fill('More');
  await expect(preview(page).locator('.blank-collapsible__trigger')).toHaveText('More');

  await sidebar(page).getByRole('button', { name: 'Dialog', exact: true }).click();
  await expect(preview(page).locator('.blank-dialog__action')).toHaveCount(2);

  await sidebar(page).getByRole('button', { name: 'Alert Dialog', exact: true }).click();
  await expect(preview(page).locator('.blank-alert-dialog__action')).toHaveCount(2);

  await sidebar(page).getByRole('button', { name: 'Drawer', exact: true }).click();
  await expect(preview(page).locator('.blank-drawer__content')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Sheet', exact: true }).click();
  await expect(preview(page).locator('.blank-sheet__close')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Toast', exact: true }).click();
  await expect(preview(page).locator('.blank-toast__title')).toHaveText('Saved');

  await sidebar(page).getByRole('button', { name: 'Tooltip', exact: true }).click();
  await expect(preview(page).locator('.blank-tooltip__content')).toHaveText('Tooltip');

  await sidebar(page).getByRole('button', { name: 'Popover', exact: true }).click();
  await expect(preview(page).locator('.blank-popover__content')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Dropdown Menu', exact: true }).click();
  await expect(preview(page).locator('.blank-dropdown-menu__item')).toHaveCount(3);
});

test('layout and messaging primitives render their structure', async ({ page }) => {
  await openCatalogWorkspace(page);

  await sidebar(page).getByRole('button', { name: 'Aspect Ratio', exact: true }).click();
  await expect(preview(page).locator('.blank-aspect-ratio')).toHaveCSS('aspect-ratio', '16 / 9');

  await sidebar(page).getByRole('button', { name: 'Attachment', exact: true }).click();
  await page.getByLabel('File name', { exact: true }).fill('specs.zip');
  await expect(preview(page).locator('.blank-attachment__name')).toHaveText('specs.zip');

  await sidebar(page).getByRole('button', { name: 'Breadcrumb', exact: true }).click();
  await expect(preview(page).locator('.blank-breadcrumb__item')).toHaveCount(3);

  await sidebar(page).getByRole('button', { name: 'Bubble', exact: true }).click();
  await page.getByLabel('Message', { exact: true }).fill('On my way');
  await expect(preview(page).locator('.blank-bubble__content')).toHaveText('On my way');

  await sidebar(page).getByRole('button', { name: 'Empty', exact: true }).click();
  await expect(preview(page).locator('.blank-empty__title')).toHaveText('No results');

  await sidebar(page).getByRole('button', { name: 'Pagination', exact: true }).click();
  await expect(preview(page).locator('.blank-pagination__item')).toHaveCount(5);

  await sidebar(page).getByRole('button', { name: 'Scroll Area', exact: true }).click();
  await expect(preview(page).locator('.blank-scroll-area__row')).toHaveCount(12);

  await sidebar(page).getByRole('button', { name: 'Message', exact: true }).click();
  await expect(preview(page).locator('.blank-message__author')).toHaveText('Ada');

  await sidebar(page).getByRole('button', { name: 'Message Scroller', exact: true }).click();
  await expect(preview(page).locator('.blank-message-scroller__row')).toHaveCount(4);

  await sidebar(page).getByRole('button', { name: 'Direction', exact: true }).click();
  await expect(preview(page).locator('.blank-direction')).toHaveAttribute('dir', 'rtl');

  await sidebar(page).getByRole('button', { name: 'Resizable', exact: true }).click();
  await expect(preview(page).locator('.blank-resizable__handle')).toBeVisible();

  await sidebar(page).getByRole('button', { name: 'Carousel', exact: true }).click();
  await expect(preview(page).locator('.blank-carousel__slide')).toHaveCount(4);
});

test('remaining composition primitives render their structure', async ({ page }) => {
  await openCatalogWorkspace(page);

  await sidebar(page).getByRole('button', { name: 'Calendar', exact: true }).click();
  await expect(preview(page).locator('.blank-calendar__day')).toHaveCount(30);
  await expect(preview(page).locator('.blank-calendar__weekday')).toHaveCount(7);

  await sidebar(page).getByRole('button', { name: 'Chart', exact: true }).click();
  await expect(preview(page).locator('.blank-chart__bar')).toHaveCount(6);

  await sidebar(page).getByRole('button', { name: 'Combobox', exact: true }).click();
  await expect(preview(page).locator('.blank-combobox__option')).toHaveCount(3);
  await previewState(page, 'Disabled').click();
  await expect(preview(page).locator('.blank-combobox__input')).toBeDisabled();

  await sidebar(page).getByRole('button', { name: 'Command', exact: true }).click();
  await expect(preview(page).locator('.blank-command__item')).toHaveCount(3);
  await expect(preview(page).locator('.blank-command__shortcut').first()).toHaveText('⌘N');

  await sidebar(page).getByRole('button', { name: 'Context Menu', exact: true }).click();
  await expect(preview(page).locator('.blank-context-menu__item')).toHaveCount(4);

  await sidebar(page).getByRole('button', { name: 'Data Table', exact: true }).click();
  await expect(preview(page).locator('.blank-data-table th')).toHaveCount(3);
  await expect(preview(page).locator('.blank-data-table tbody tr')).toHaveCount(3);

  await sidebar(page).getByRole('button', { name: 'Date Picker', exact: true }).click();
  await expect(preview(page).locator('.blank-date-picker__day')).toHaveCount(14);

  await sidebar(page).getByRole('button', { name: 'Hover Card', exact: true }).click();
  await page.getByLabel('Trigger', { exact: true }).fill('@grace');
  await expect(preview(page).locator('.blank-hover-card__trigger')).toHaveText('@grace');

  await sidebar(page).getByRole('button', { name: 'Menubar', exact: true }).click();
  await expect(preview(page).locator('.blank-menubar__item')).toHaveCount(4);

  await sidebar(page).getByRole('button', { name: 'Navigation Menu', exact: true }).click();
  await expect(preview(page).locator('.blank-navigation-menu__link')).toHaveCount(3);

  await sidebar(page).getByRole('button', { name: 'Questionnaire', exact: true }).click();
  await page.getByLabel('Question', { exact: true }).fill('Ready to ship?');
  await expect(preview(page).locator('.blank-questionnaire__question')).toHaveText('Ready to ship?');
  await expect(preview(page).locator('.blank-questionnaire__option')).toHaveCount(3);

  await sidebar(page).getByRole('button', { name: 'Sidebar', exact: true }).click();
  await expect(preview(page).locator('.blank-sidebar__item')).toHaveCount(3);
  await page.getByLabel('Title', { exact: true }).fill('Workspace');
  await expect(preview(page).locator('.blank-sidebar__header')).toHaveText('Workspace');
});

test('selecting a child node writes overrides into its own CSS section', async ({ page }) => {
  await openWorkspace(page, ['card']);
  const action = preview(page).locator('.blank-card__action');
  await expect(preview(page).locator('.blank-card__title')).toBeVisible();

  await action.click();
  await expect(page.getByText('card · action', { exact: true })).toBeVisible();
  // Properties the child does not override show what the preview measured.
  const height = page.getByLabel('Child height value', { exact: true });
  await expect.poll(async () => Number(await height.inputValue())).toBeGreaterThan(0);

  await page.getByLabel('Child X value', { exact: true }).fill('16');
  await expect(action).toHaveCSS('translate', /^16px( 0px)?$/);

  await page.getByLabel('Child radius value', { exact: true }).fill('8');
  await expect(action).toHaveCSS('border-radius', '8px');

  const readCSS = () => page.evaluate(() => JSON.parse(localStorage.getItem('blank:document:v2')!).docs.card.files.css as string);
  await expect.poll(readCSS, { timeout: 10_000 }).toContain('.blank-card .blank-card__action');
  const saved = await readCSS();
  expect(saved).toContain('blank:nodes:start');
  expect(saved).toContain('translate: 16px 0px;');
  expect(saved).not.toContain('margin:');

  // One property resets on its own and leaves the others.
  await page.getByRole('button', { name: 'Reset Child radius to the component CSS', exact: true }).click();
  await expect(action).not.toHaveCSS('border-radius', '8px');
  await expect(action).toHaveCSS('translate', /^16px( 0px)?$/);

  await page.getByRole('button', { name: 'Reset child overrides', exact: true }).click();
  await expect(action).toHaveCSS('translate', 'none');
});

test('dragging a child moves only that child, snapped to the 8px grid', async ({ page }) => {
  await openWorkspace(page, ['card']);
  const action = preview(page).locator('.blank-card__action');
  await expect(action).toBeVisible();

  const layout = ['.blank-card', '.blank-card__header', '.blank-card__content', '.blank-card__footer'];
  const before = await boxes(page, [...layout, '.blank-card__action']);

  // The first gesture on a preview that does not have focus yet must register.
  await dragBy(page, '.blank-card__action', 17, 9);
  const dropped = await boxes(page, ['.blank-card__action']);
  expect(dropped['.blank-card__action'].x, 'the node stays where it was dropped').toBe(before['.blank-card__action'].x + 16);

  await expect(action).toHaveCSS('translate', '16px 8px');
  await expect(page.getByLabel('Child X value', { exact: true })).toHaveValue('16');
  await expect(page.getByLabel('Child Y value', { exact: true })).toHaveValue('8');

  const after = await boxes(page, [...layout, '.blank-card__action']);
  for (const selector of layout) expect(after[selector], `${selector} keeps its box`).toEqual(before[selector]);
  expect(after['.blank-card__action']).toEqual({ ...before['.blank-card__action'], x: before['.blank-card__action'].x + 16, y: before['.blank-card__action'].y + 8 });

  // A second drag continues from the dropped offset. It stays clear of the
  // centre-snap zone around the component's middle, which may otherwise
  // finish the drop a few pixels off the grid on purpose.
  await dragBy(page, '.blank-card__action', 16, 0);
  await expect(action).toHaveCSS('translate', '32px 8px');

  // Arrow keys nudge the selected child by 1px, or 8px with Shift.
  await page.keyboard.press('ArrowLeft');
  await expect(action).toHaveCSS('translate', '31px 8px');
  await page.keyboard.press('Shift+ArrowDown');
  await expect(action).toHaveCSS('translate', '31px 16px');

  const readCSS = () => page.evaluate(() => JSON.parse(localStorage.getItem('blank:document:v2')!).docs.card.files.css as string);
  await expect.poll(readCSS, { timeout: 10_000 }).toContain('translate: 31px 16px;');
  expect(await readCSS()).not.toContain('margin:');
  for (const selector of layout) expect((await boxes(page, [selector]))[selector], `${selector} still keeps its box`).toEqual(before[selector]);

  // Dragging back to the layout position removes the offset instead of storing zeros.
  await page.getByLabel('Child X value', { exact: true }).fill('0');
  await page.getByLabel('Child Y value', { exact: true }).fill('0');
  await dragBy(page, '.blank-card__action', 8, 0);
  await dragBy(page, '.blank-card__action', -8, 0);
  await expect.poll(readCSS, { timeout: 10_000 }).not.toContain('translate:');
});

test('layers list the preview children and select them', async ({ page }) => {
  await openWorkspace(page, ['card']);
  const layers = page.locator('.layer-tree');

  await expect(layers.getByRole('button', { name: 'action', exact: true })).toBeVisible();
  await layers.getByRole('button', { name: 'footer', exact: true }).click();
  await expect(page.getByText('card · footer', { exact: true })).toBeVisible();
  await expect(layers.getByRole('button', { name: 'footer', exact: true })).toHaveAttribute('aria-pressed', 'true');

  // The component row clears the child selection; it carries the document name.
  await layers.getByRole('button', { name: 'Untitled card', exact: true }).click();
  await expect(page.getByText('card · footer', { exact: true })).toHaveCount(0);
});

test('grid and guide settings survive theme and state updates', async ({ page }) => {
  await openWorkspace(page, ['card']);
  await expect(preview(page).locator('.blank-card__action')).toBeVisible();
  const flags = () => preview(page).locator('body').evaluate(() => {
    const view = window as unknown as { blankGrid?: boolean; blankGuides?: boolean };
    return { grid: view.blankGrid, guides: view.blankGuides };
  });

  await page.getByRole('button', { name: 'Grid', exact: true }).click();
  await page.getByRole('button', { name: 'Guides', exact: true }).click();
  await expect.poll(flags).toEqual({ grid: false, guides: true });

  await page.getByRole('button', { name: 'Light theme', exact: true }).click();
  await expect(page.locator('.canvas')).toHaveAttribute('data-theme', 'light');
  await page.waitForTimeout(300);
  expect(await flags()).toEqual({ grid: false, guides: true });
});

test('child overrides from older documents load as offsets with only the properties they set', () => {
  const legacy = {
    'blank-card__action': { marginX: 16, marginY: 8, paddingX: 0, paddingY: 0, width: null, height: null, background: 'transparent', color: 'inherit', radius: 4, opacity: 100, fontSize: 0, fontWeight: 400, letterSpacing: 0, alignSelf: 'auto', textAlign: 'start' },
    'blank-card__title': { color: 'red; } body { color: blue' },
    'not a node {': { radius: 2 },
  };

  const nodes = normalizeNodeOverrides(legacy);
  expect(nodes).toEqual({ 'blank-card__action': { x: 16, y: 8, radius: 4 } });

  const css = generateNodeCSS({ ...cloneButtonDNA(vanillaButtonDNA), nodes }, getSpec('card'));
  expect(css).toContain('translate: 16px 8px;');
  expect(css).toContain('border-radius: 4px;');
  expect(css).not.toContain('margin');
});

test('blueprint grid and guides toggle from the canvas', async ({ page }) => {
  await openCatalogWorkspace(page);
  await expect(preview(page).locator('.blank-button')).toBeVisible();

  // The 24px blueprint grid belongs to the canvas, not to the preview iframe.
  await expect(preview(page).locator('#blank-grid')).toHaveCount(0);
  const gridVisible = () => page.locator('.canvas').evaluate((el) => {
    const overlay = getComputedStyle(el, '::before');
    return overlay.opacity === '1' && overlay.backgroundImage.includes('gradient');
  });
  await expect.poll(gridVisible).toBe(true);

  const guidesOn = () => preview(page).locator('body').evaluate(() => Boolean((window as unknown as { blankGuides?: boolean }).blankGuides));
  expect(await guidesOn()).toBe(false);

  await page.getByRole('button', { name: 'Guides', exact: true }).click();
  await expect.poll(guidesOn).toBe(true);

  await page.getByRole('button', { name: 'Guides', exact: true }).click();
  await expect.poll(guidesOn).toBe(false);
});

test('decorative primitives render without a content field', async ({ page }) => {
  await openCatalogWorkspace(page);

  await sidebar(page).getByRole('button', { name: 'Separator', exact: true }).click();
  await expect(preview(page).locator('hr')).toBeVisible();
  await expect(page.getByLabel('Label', { exact: true })).toHaveCount(0);

  await sidebar(page).getByRole('button', { name: 'Badge', exact: true }).click();
  await expect(preview(page).getByText('Badge', { exact: true })).toBeVisible();
  await page.getByLabel('Label', { exact: true }).fill('New');
  await expect(preview(page).getByText('New', { exact: true })).toBeVisible();
});
