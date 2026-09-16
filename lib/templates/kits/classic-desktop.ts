import { css, html, type TemplateKit } from "../types";

const CHECK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='7' viewBox='0 0 7 7'%3E%3Cpath d='M0 2h1v1h1v1h1V3h1V2h1V1h1V0h1v3H6v1H5v1H4v1H3v1H2V6H1V5H0z'/%3E%3C/svg%3E")`;

export const classicDesktop: TemplateKit = {
  id: "classic-desktop",
  name: "Classic Desktop",
  period: "1995 – 2000",
  tagline: "Grey bevels, navy title bars and a Start button.",
  description:
    "The beveled desktop UI of the late 90s. Every control is built from four one-pixel edges: light on top and left, dark on bottom and right. Press it and the light flips.",
  context:
    "Pixels were expensive and screens were small, so depth was drawn by hand: one light edge, one dark edge, no anti-aliasing. Every platform of the decade — Windows 95, NeXTSTEP, Motif — agreed on the same grey.",
  tags: ["Bevel", "Pixel", "Desktop"],
  root: "w9x",
  palette: [
    { name: "Face", value: "#c0c0c0" },
    { name: "Highlight", value: "#ffffff" },
    { name: "Shadow", value: "#808080" },
    { name: "Title", value: "#000080" },
    { name: "Desktop", value: "#008080" },
  ],
  fonts: "Tahoma, \"MS Sans Serif\", Geneva — 12px, no smoothing",
  baseCss: css`
    .w9x {
      --w9x-face: #c0c0c0;
      --w9x-hi: #ffffff;
      --w9x-light: #dfdfdf;
      --w9x-shadow: #808080;
      --w9x-dark: #0a0a0a;
      --w9x-title: linear-gradient(90deg, #000080, #1084d0);
      --w9x-raised: inset -1px -1px var(--w9x-dark), inset 1px 1px var(--w9x-hi), inset -2px -2px var(--w9x-shadow), inset 2px 2px var(--w9x-light);
      --w9x-sunken: inset -1px -1px var(--w9x-hi), inset 1px 1px var(--w9x-shadow), inset -2px -2px var(--w9x-light), inset 2px 2px var(--w9x-dark);
      background: #008080;
      color: #000;
      font: 12px/1.4 Tahoma, "MS Sans Serif", Geneva, sans-serif;
      -webkit-font-smoothing: none;
    }
  `,
  showcase: html`
    <div class="w9x-window" style="width: 290px">
      <div class="w9x-titlebar">
        <span>Welcome</span>
        <div class="w9x-title-controls"><button aria-label="Close">×</button></div>
      </div>
      <div class="w9x-window-body">
        <p style="margin: 0 0 10px">Setup is ready to install.</p>
        <div class="w9x-progress" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"><span style="width: 60%"></span></div>
        <div style="display: flex; gap: 6px; justify-content: flex-end; margin-top: 12px">
          <button class="w9x-btn w9x-btn--default">Next &gt;</button>
          <button class="w9x-btn">Cancel</button>
        </div>
      </div>
    </div>
  `,
  components: [
    {
      id: "button",
      name: "Button",
      description: "Raised push button with the dotted focus rectangle and a default-button outline.",
      html: html`
        <div class="w9x-row">
          <button class="w9x-btn w9x-btn--default">OK</button>
          <button class="w9x-btn">Cancel</button>
          <button class="w9x-btn" disabled>Apply</button>
        </div>
      `,
      css: css`
        .w9x-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .w9x-btn {
          min-width: 75px;
          min-height: 23px;
          padding: 0 12px;
          border: 0;
          background: var(--w9x-face);
          box-shadow: var(--w9x-raised);
          color: #000;
          font: inherit;
          cursor: default;
        }
        .w9x-btn--default { outline: 1px solid #000; outline-offset: -1px; box-shadow: inset -2px -2px var(--w9x-dark), inset 2px 2px var(--w9x-hi), inset -3px -3px var(--w9x-shadow), inset 3px 3px var(--w9x-light); }
        .w9x-btn:active:not(:disabled) { box-shadow: var(--w9x-sunken); padding: 2px 11px 0 13px; }
        .w9x-btn:focus-visible { outline: 1px dotted #000; outline-offset: -5px; }
        .w9x-btn:disabled { color: var(--w9x-shadow); text-shadow: 1px 1px var(--w9x-hi); }
      `,
    },
    {
      id: "fields",
      name: "Text field & select",
      description: "Sunken white wells with an inset double bevel.",
      html: html`
        <div class="w9x-form">
          <label for="w9x-name">File name:</label>
          <input id="w9x-name" class="w9x-field" value="README.TXT">
          <label for="w9x-type">Save as type:</label>
          <select id="w9x-type" class="w9x-field">
            <option>Text Documents (*.txt)</option>
            <option>All Files (*.*)</option>
          </select>
        </div>
      `,
      css: css`
        .w9x-form { display: grid; grid-template-columns: auto 1fr; gap: 8px 10px; align-items: center; width: min(100%, 320px); padding: 12px; background: var(--w9x-face); box-shadow: var(--w9x-raised); }
        .w9x-field { min-height: 21px; padding: 3px 4px; border: 0; border-radius: 0; background: #fff; box-shadow: var(--w9x-sunken); color: #000; font: inherit; }
        .w9x-field:focus { outline: none; }
        select.w9x-field { appearance: none; padding-right: 20px; background: #fff linear-gradient(var(--w9x-face), var(--w9x-face)) no-repeat right 2px center / 16px 17px; }
      `,
    },
    {
      id: "checks",
      name: "Checkbox & radio",
      description: "Native inputs restyled to 13px wells with a pixel checkmark.",
      html: html`
        <fieldset class="w9x-fieldset">
          <legend>Options</legend>
          <label><input type="checkbox" class="w9x-check" checked> Show hidden files</label>
          <label><input type="checkbox" class="w9x-check"> Hide extensions</label>
          <label><input type="radio" name="w9x-view" class="w9x-radio" checked> Large icons</label>
          <label><input type="radio" name="w9x-view" class="w9x-radio"> Details</label>
        </fieldset>
      `,
      css: css`
        .w9x-fieldset { display: grid; gap: 6px; width: min(100%, 240px); margin: 0; padding: 10px 12px 12px; border: 0; background: var(--w9x-face); box-shadow: inset -1px -1px var(--w9x-hi), inset 1px 1px var(--w9x-shadow), inset -2px -2px var(--w9x-shadow), inset 2px 2px var(--w9x-hi); }
        .w9x-fieldset legend { padding: 0 3px; background: var(--w9x-face); }
        .w9x-fieldset label { display: flex; gap: 6px; align-items: center; }
        .w9x-check, .w9x-radio { appearance: none; width: 13px; height: 13px; margin: 0; background: #fff center no-repeat; box-shadow: var(--w9x-sunken); }
        .w9x-check:checked { background-image: ${CHECK}; }
        .w9x-radio { border-radius: 50%; box-shadow: inset 1px 1px var(--w9x-shadow), inset -1px -1px var(--w9x-hi); }
        .w9x-radio:checked { background-image: radial-gradient(#000 0 2px, transparent 2.5px); }
        .w9x-check:focus-visible + *, .w9x-radio:focus-visible { outline: 1px dotted #000; }
      `,
    },
    {
      id: "window",
      name: "Window",
      description: "Title bar with gradient, caption buttons, a menu bar and a sunken status bar.",
      html: html`
        <div class="w9x-window" role="dialog" aria-labelledby="w9x-window-title">
          <div class="w9x-titlebar">
            <span id="w9x-window-title">My Computer</span>
            <div class="w9x-title-controls">
              <button aria-label="Minimize">_</button>
              <button aria-label="Maximize">□</button>
              <button aria-label="Close">×</button>
            </div>
          </div>
          <div class="w9x-menubar"><span><u>F</u>ile</span><span><u>E</u>dit</span><span><u>V</u>iew</span><span><u>H</u>elp</span></div>
          <div class="w9x-window-body">
            <div class="w9x-panel">3½ Floppy (A:)<br>(C:)<br>Control Panel<br>Printers</div>
          </div>
          <div class="w9x-statusbar"><span>4 object(s)</span><span>1.2 GB free</span></div>
        </div>
      `,
      css: css`
        .w9x-window { width: min(100%, 340px); padding: 3px; background: var(--w9x-face); box-shadow: var(--w9x-raised); }
        .w9x-titlebar { display: flex; align-items: center; justify-content: space-between; height: 20px; padding: 0 2px 0 4px; background: var(--w9x-title); color: #fff; font-weight: 700; }
        .w9x-title-controls { display: flex; gap: 2px; }
        .w9x-title-controls button { width: 16px; height: 14px; padding: 0; border: 0; background: var(--w9x-face); box-shadow: var(--w9x-raised); color: #000; font: 700 10px/1 Tahoma, sans-serif; }
        .w9x-title-controls button:last-child { margin-left: 2px; }
        .w9x-title-controls button:active { box-shadow: var(--w9x-sunken); }
        .w9x-menubar { display: flex; gap: 2px; padding: 2px 0; }
        .w9x-menubar span { padding: 1px 6px; }
        .w9x-menubar span:hover { background: #000080; color: #fff; }
        .w9x-window-body { padding: 8px; }
        .w9x-panel { min-height: 90px; padding: 6px; background: #fff; box-shadow: var(--w9x-sunken); }
        .w9x-statusbar { display: flex; gap: 2px; margin-top: 2px; }
        .w9x-statusbar span { flex: 1; padding: 1px 4px; box-shadow: inset -1px -1px var(--w9x-hi), inset 1px 1px var(--w9x-shadow); }
      `,
    },
    {
      id: "toolbar",
      name: "Toolbar",
      description: "Flat icon buttons that only raise on hover, groove separators and a sunken address well.",
      html: html`
        <div class="w9x-toolbar">
          <button class="w9x-tool" aria-label="Back">&#9668;</button>
          <button class="w9x-tool" aria-label="Forward">&#9658;</button>
          <button class="w9x-tool" aria-label="Up one level">&#9650;</button>
          <span class="w9x-sep" aria-hidden="true"></span>
          <button class="w9x-tool" aria-label="Cut">&#9986;</button>
          <button class="w9x-tool" aria-label="Copy">&#9707;</button>
          <button class="w9x-tool" aria-label="Delete">&#10006;</button>
          <span class="w9x-sep" aria-hidden="true"></span>
          <label class="w9x-address">Address <input class="w9x-field" value="My Documents"></label>
        </div>
      `,
      css: css`
        .w9x-toolbar { display: flex; gap: 1px; align-items: center; width: min(100%, 420px); padding: 3px; background: var(--w9x-face); box-shadow: var(--w9x-raised); }
        .w9x-tool { width: 24px; height: 23px; padding: 0; border: 0; background: var(--w9x-face); color: #000; font: 12px/1 Tahoma, sans-serif; cursor: default; }
        .w9x-tool:hover { box-shadow: inset -1px -1px var(--w9x-shadow), inset 1px 1px var(--w9x-hi); }
        .w9x-tool:active { box-shadow: inset -1px -1px var(--w9x-hi), inset 1px 1px var(--w9x-shadow); }
        .w9x-tool:focus-visible { outline: 1px dotted #000; outline-offset: -3px; }
        .w9x-sep { width: 2px; height: 20px; margin: 0 3px; box-shadow: inset -1px 0 var(--w9x-hi), inset 1px 0 var(--w9x-shadow); }
        .w9x-address { display: flex; flex: 1; gap: 5px; align-items: center; min-width: 0; margin-left: 2px; }
        .w9x-address .w9x-field { flex: 1; min-width: 0; }
      `,
    },
    {
      id: "listview",
      name: "Details list",
      description: "Column headers that behave like buttons, a dotted focus row and a navy selection.",
      html: html`
        <div class="w9x-list" role="table" aria-label="Contents">
          <div class="w9x-list-head" role="row">
            <span role="columnheader">Name</span>
            <span role="columnheader">Size</span>
            <span role="columnheader">Type</span>
          </div>
          <div class="w9x-list-row" role="row" aria-selected="true"><span role="cell">README.TXT</span><span role="cell">4 KB</span><span role="cell">Text</span></div>
          <div class="w9x-list-row" role="row"><span role="cell">SETUP.EXE</span><span role="cell">612 KB</span><span role="cell">Application</span></div>
          <div class="w9x-list-row" role="row"><span role="cell">LOGO.BMP</span><span role="cell">88 KB</span><span role="cell">Bitmap</span></div>
        </div>
      `,
      css: css`
        .w9x-list { width: min(100%, 340px); background: #fff; box-shadow: var(--w9x-sunken); }
        .w9x-list-head, .w9x-list-row { display: grid; grid-template-columns: 1fr 70px 96px; }
        .w9x-list-head span { padding: 2px 6px; background: var(--w9x-face); box-shadow: var(--w9x-raised); font-weight: 400; text-align: left; }
        .w9x-list-head span:active { box-shadow: var(--w9x-sunken); }
        .w9x-list-row span { padding: 2px 6px; }
        .w9x-list-row[aria-selected="true"] { background: #000080; color: #fff; outline: 1px dotted #fff; outline-offset: -1px; }
      `,
    },
    {
      id: "scrollbar",
      name: "Scrollbar",
      description: "Dithered trough, raised thumb and two arrow buttons — the 50% checkerboard is a 2px conic gradient.",
      html: html`
        <div class="w9x-scroll">
          <div class="w9x-scroll-pane">Setup will now copy files to your hard disk. This may take several minutes depending on the speed of your computer.</div>
          <div class="w9x-scrollbar">
            <button class="w9x-tool w9x-scroll-arrow" aria-label="Scroll up">&#9650;</button>
            <span class="w9x-scroll-thumb" aria-hidden="true"></span>
            <button class="w9x-tool w9x-scroll-arrow w9x-scroll-arrow--end" aria-label="Scroll down">&#9660;</button>
          </div>
        </div>
      `,
      css: css`
        .w9x-scroll { display: flex; gap: 3px; width: min(100%, 320px); height: 118px; padding: 3px; background: var(--w9x-face); box-shadow: var(--w9x-raised); }
        .w9x-scroll-pane { flex: 1; padding: 5px; overflow: hidden; background: #fff; box-shadow: var(--w9x-sunken); }
        .w9x-scrollbar { display: flex; flex-direction: column; width: 16px; background: repeating-conic-gradient(var(--w9x-face) 0 25%, #fff 0 50%) 0 0 / 2px 2px; }
        .w9x-scroll-arrow { width: 16px; height: 16px; flex: none; box-shadow: var(--w9x-raised); font-size: 7px; }
        .w9x-scroll-arrow--end { margin-top: auto; }
        .w9x-scroll-thumb { height: 46px; margin-top: 18px; background: var(--w9x-face); box-shadow: var(--w9x-raised); }
      `,
    },
    {
      id: "tabs",
      name: "Property tabs",
      description: "Raised tabs that merge with the sheet below.",
      html: html`
        <div class="w9x-tabs">
          <div role="tablist" class="w9x-tablist">
            <button role="tab" aria-selected="true">General</button>
            <button role="tab" aria-selected="false">Hardware</button>
            <button role="tab" aria-selected="false">Performance</button>
          </div>
          <div role="tabpanel" class="w9x-tabpanel">System: Windows-ish 98<br>Registered to: You</div>
        </div>
      `,
      css: css`
        .w9x-tabs { width: min(100%, 320px); }
        .w9x-tablist { display: flex; padding-left: 2px; }
        .w9x-tablist button { position: relative; padding: 3px 10px 2px; border: 0; background: var(--w9x-face); box-shadow: inset 1px 1px var(--w9x-hi), inset -1px 0 var(--w9x-dark), inset -2px 0 var(--w9x-shadow); color: #000; font: inherit; }
        .w9x-tablist button[aria-selected="true"] { z-index: 1; margin: -2px -2px -1px; padding: 5px 12px 4px; }
        .w9x-tabpanel { padding: 14px 12px; background: var(--w9x-face); box-shadow: var(--w9x-raised); }
      `,
    },
    {
      id: "progress",
      name: "Progress bar",
      description: "Segmented navy blocks inside a sunken track.",
      html: html`
        <div class="w9x-copy">
          <p>Copying files…</p>
          <div class="w9x-progress" role="progressbar" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100"><span style="width: 64%"></span></div>
          <p>Estimated time left: 12 seconds</p>
        </div>
      `,
      css: css`
        .w9x-copy { width: min(100%, 300px); padding: 10px 12px; background: var(--w9x-face); box-shadow: var(--w9x-raised); }
        .w9x-copy p { margin: 4px 0; }
        .w9x-progress { height: 20px; padding: 3px; background: var(--w9x-face); box-shadow: inset -1px -1px var(--w9x-hi), inset 1px 1px var(--w9x-shadow); }
        .w9x-progress span { display: block; height: 100%; background: repeating-linear-gradient(90deg, #000080 0 9px, transparent 9px 11px); }
      `,
    },
    {
      id: "balloon",
      name: "Balloon tip",
      description: "The assistant's speech bubble: a bordered panel with a triangular tail cut into the left edge.",
      html: html`
        <div class="w9x-balloon" role="note">
          <p>It looks like you are writing a letter. Would you like help?</p>
          <div class="w9x-balloon-actions">
            <button class="w9x-btn">Yes</button>
            <button class="w9x-btn">No thanks</button>
          </div>
        </div>
      `,
      css: css`
        .w9x-balloon { position: relative; width: min(100%, 268px); margin-left: 14px; padding: 10px 12px; border: 1px solid #000; background: #fff; }
        .w9x-balloon::before, .w9x-balloon::after { position: absolute; content: ""; top: 18px; left: -14px; width: 14px; height: 18px; background: #000; clip-path: polygon(0 100%, 100% 0, 100% 100%); }
        .w9x-balloon::after { left: -12px; width: 12px; height: 16px; background: #fff; }
        .w9x-balloon p { margin: 0 0 10px; }
        .w9x-balloon-actions { display: flex; gap: 6px; justify-content: flex-end; }
      `,
    },
    {
      id: "taskbar",
      name: "Taskbar",
      description: "Start button, open task and a sunken clock tray.",
      html: html`
        <div class="w9x-taskbar">
          <button class="w9x-start"><span class="w9x-start-logo" aria-hidden="true"></span>Start</button>
          <button class="w9x-task" aria-pressed="true">My Computer</button>
          <div class="w9x-tray">4:20 PM</div>
        </div>
      `,
      css: css`
        .w9x-taskbar { display: flex; gap: 4px; align-items: center; width: min(100%, 420px); height: 30px; padding: 2px; background: var(--w9x-face); box-shadow: inset 0 1px var(--w9x-light), inset 0 2px var(--w9x-hi); }
        .w9x-start, .w9x-task { display: flex; gap: 4px; align-items: center; height: 22px; padding: 0 6px; border: 0; background: var(--w9x-face); box-shadow: var(--w9x-raised); color: #000; font: 700 12px Tahoma, sans-serif; }
        .w9x-start:active, .w9x-task[aria-pressed="true"] { box-shadow: var(--w9x-sunken); }
        .w9x-task { flex: 0 1 150px; font-weight: 400; background: repeating-conic-gradient(var(--w9x-face) 0 25%, #fff 0 50%) 0 0 / 2px 2px; }
        .w9x-start-logo { width: 14px; height: 12px; background: conic-gradient(from 90deg, #f35325 0 25%, #81bc06 0 50%, #ffba08 0 75%, #05a6f0 0); transform: skewY(-6deg); }
        .w9x-tray { margin-left: auto; padding: 0 10px; line-height: 22px; box-shadow: inset -1px -1px var(--w9x-hi), inset 1px 1px var(--w9x-shadow); }
      `,
    },
  ],
};
