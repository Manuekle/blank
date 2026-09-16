import { css, html, type TemplateKit } from "../types";

export const aqua: TemplateKit = {
  id: "aqua",
  name: "Aqua",
  period: "2001 – 2007",
  tagline: "Lickable gel buttons on pinstripes.",
  description:
    "The glossy desktop look of the early 2000s: translucent blue gel, candy traffic lights, pinstriped windows and barber-pole progress. Two gradients per control, one for color and one for the wet highlight.",
  context:
    "Displays got colour depth and GPUs got cheap, so interfaces started imitating wet plastic. Apple shipped it in Mac OS X, Windows answered with Luna, and every media player skin on the internet copied the brushed-metal frame.",
  tags: ["Gloss", "Gel", "Pinstripe"],
  root: "aq",
  palette: [
    { name: "Gel blue", value: "#3a8ef0" },
    { name: "Gel light", value: "#b9dcff" },
    { name: "Pinstripe", value: "#ececec" },
    { name: "Close", value: "#f25b52" },
    { name: "Zoom", value: "#6fcf5b" },
  ],
  fonts: "\"Lucida Grande\", -apple-system, Helvetica — 13px",
  baseCss: css`
    .aq {
      --aq-blue: #3a8ef0;
      --aq-edge: #1d4f9c;
      --aq-gel: linear-gradient(180deg, #c5e3ff 0%, #6fb3f7 48%, #2f86ee 50%, #6cc0ff 100%);
      --aq-glass: linear-gradient(180deg, #ffffff 0%, #ececec 48%, #dcdcdc 50%, #f5f5f5 100%);
      background: repeating-linear-gradient(0deg, #ececec 0 2px, #f7f7f7 2px 4px);
      color: #111;
      font: 13px/1.35 "Lucida Grande", -apple-system, Helvetica, sans-serif;
    }
  `,
  showcase: html`
    <div class="aq-window" style="width: 280px">
      <div class="aq-titlebar">
        <div class="aq-lights"><span class="aq-light aq-light--close"></span><span class="aq-light aq-light--min"></span><span class="aq-light aq-light--zoom"></span></div>
        <span class="aq-window-title">Software Update</span>
      </div>
      <div class="aq-window-body">
        <div class="aq-progress" role="progressbar" aria-label="Downloading"><span style="width: 70%"></span></div>
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 14px">
          <button class="aq-btn">Cancel</button>
          <button class="aq-btn aq-btn--primary">Install</button>
        </div>
      </div>
    </div>
  `,
  components: [
    {
      id: "button",
      name: "Gel button",
      description: "Capsule button with a two-stop gloss and a wet highlight. The default button pulses.",
      html: html`
        <div class="aq-row">
          <button class="aq-btn">Cancel</button>
          <button class="aq-btn aq-btn--primary">Save</button>
          <button class="aq-btn" disabled>Revert</button>
        </div>
      `,
      css: css`
        .aq-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .aq-btn {
          position: relative;
          min-width: 72px;
          height: 22px;
          padding: 0 18px;
          border: 1px solid #7b8494;
          border-radius: 11px;
          background: var(--aq-glass);
          box-shadow: 0 1px 2px rgba(0, 0, 0, .28), inset 0 -1px 2px rgba(255, 255, 255, .8);
          color: #000;
          font: inherit;
        }
        .aq-btn::before { position: absolute; content: ""; inset: 1px 7px 50%; border-radius: 10px 10px 4px 4px; background: linear-gradient(rgba(255, 255, 255, .95), rgba(255, 255, 255, .15)); pointer-events: none; }
        .aq-btn--primary { border-color: var(--aq-edge); background: var(--aq-gel); }
        .aq-btn:active:not(:disabled) { filter: brightness(.88) saturate(1.2); }
        .aq-btn:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(90, 160, 245, .65); }
        .aq-btn:disabled { color: #999; opacity: .7; }
        @media (prefers-reduced-motion: no-preference) {
          .aq-btn--primary { animation: aq-pulse 1.4s ease-in-out infinite alternate; }
        }
        @keyframes aq-pulse { to { filter: brightness(1.12) saturate(.85); } }
      `,
    },
    {
      id: "fields",
      name: "Search & text field",
      description: "Inset text well with the soft blue focus halo and a rounded search field.",
      html: html`
        <div class="aq-form">
          <label class="aq-label" for="aq-email">Email</label>
          <input id="aq-email" class="aq-field" type="email" placeholder="you@mac.com">
          <input class="aq-field aq-field--search" type="search" placeholder="Spotlight" aria-label="Search">
        </div>
      `,
      css: css`
        .aq-form { display: grid; gap: 8px; width: min(100%, 260px); }
        .aq-label { font-weight: 700; font-size: 11px; }
        .aq-field { height: 22px; padding: 2px 6px; border: 1px solid #8e8e8e; border-top-color: #606060; background: #fff; box-shadow: inset 0 1px 2px rgba(0, 0, 0, .25); color: #000; font: inherit; }
        .aq-field:focus { outline: none; border-color: #5a8fd6; box-shadow: inset 0 1px 2px rgba(0, 0, 0, .25), 0 0 0 3px rgba(90, 160, 245, .6); }
        .aq-field--search { border-radius: 11px; padding-left: 12px; margin-top: 8px; }
      `,
    },
    {
      id: "checkbox",
      name: "Gel checkbox",
      description: "Rounded glossy boxes that fill with blue gel when checked.",
      html: html`
        <div class="aq-checks">
          <label><input type="checkbox" class="aq-check" checked> Show volume in menu bar</label>
          <label><input type="checkbox" class="aq-check"> Play feedback when changed</label>
        </div>
      `,
      css: css`
        .aq-checks { display: grid; gap: 8px; }
        .aq-checks label { display: flex; gap: 8px; align-items: center; }
        .aq-check { appearance: none; width: 14px; height: 14px; margin: 0; border: 1px solid #7b8494; border-radius: 3px; background: var(--aq-glass); box-shadow: 0 1px 1px rgba(0, 0, 0, .2); }
        .aq-check:checked { border-color: var(--aq-edge); background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'%3E%3Cpath d='M3 7.5l2.5 2.5L11 3.5' fill='none' stroke='%23000' stroke-width='2'/%3E%3C/svg%3E") center / 12px no-repeat, var(--aq-gel); }
        .aq-check:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(90, 160, 245, .6); }
      `,
    },
    {
      id: "segmented",
      name: "Segmented control",
      description: "Glossy joined segments. Radio inputs keep it keyboard accessible.",
      html: html`
        <div class="aq-segmented" role="radiogroup" aria-label="View">
          <label><input type="radio" name="aq-view" checked><span>Icons</span></label>
          <label><input type="radio" name="aq-view"><span>List</span></label>
          <label><input type="radio" name="aq-view"><span>Columns</span></label>
        </div>
      `,
      css: css`
        .aq-segmented { display: inline-flex; overflow: hidden; border: 1px solid #7b8494; border-radius: 11px; box-shadow: 0 1px 2px rgba(0, 0, 0, .25); }
        .aq-segmented label + label { border-left: 1px solid #7b8494; }
        .aq-segmented input { position: absolute; opacity: 0; pointer-events: none; }
        .aq-segmented span { display: block; padding: 2px 16px; background: var(--aq-glass); }
        .aq-segmented input:checked + span { background: var(--aq-gel); }
        .aq-segmented input:focus-visible + span { box-shadow: inset 0 0 0 2px rgba(29, 79, 156, .6); }
      `,
    },
    {
      id: "slider",
      name: "Gel slider",
      description: "Native range input: recessed track, blue gel fill on the left and a domed knob.",
      html: html`
        <label class="aq-slider">
          <span>Volume</span>
          <input type="range" min="0" max="100" value="62">
        </label>
      `,
      css: css`
        .aq-slider { display: grid; gap: 6px; width: min(100%, 260px); }
        .aq-slider > span { font-size: 11px; font-weight: 700; }
        .aq-slider input { width: 100%; height: 18px; margin: 0; appearance: none; background: transparent; }
        .aq-slider input::-webkit-slider-runnable-track { height: 8px; border: 1px solid #8a8a8a; border-radius: 4px; background: linear-gradient(#cfcfcf, #f2f2f2); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .3); }
        .aq-slider input::-moz-range-track { height: 8px; border: 1px solid #8a8a8a; border-radius: 4px; background: linear-gradient(#cfcfcf, #f2f2f2); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .3); }
        .aq-slider input::-moz-range-progress { height: 8px; border-radius: 4px; background: var(--aq-gel); }
        .aq-slider input::-webkit-slider-thumb { width: 17px; height: 17px; margin-top: -6px; appearance: none; border: 1px solid #7b8494; border-radius: 50%; background: radial-gradient(circle at 50% 25%, #fff, rgba(255, 255, 255, 0) 55%), linear-gradient(#f7f7f7, #cdcdcd); box-shadow: 0 1px 2px rgba(0, 0, 0, .35); }
        .aq-slider input::-moz-range-thumb { width: 15px; height: 15px; border: 1px solid #7b8494; border-radius: 50%; background: linear-gradient(#f7f7f7, #cdcdcd); }
        .aq-slider input:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(90, 160, 245, .6); border-radius: 9px; }
      `,
    },
    {
      id: "window",
      name: "Window",
      description: "Pinstriped window with traffic-light gel buttons and a glossy title bar.",
      html: html`
        <div class="aq-window" role="dialog" aria-labelledby="aq-window-title">
          <div class="aq-titlebar">
            <div class="aq-lights">
              <button class="aq-light aq-light--close" aria-label="Close"></button>
              <button class="aq-light aq-light--min" aria-label="Minimize"></button>
              <button class="aq-light aq-light--zoom" aria-label="Zoom"></button>
            </div>
            <span id="aq-window-title" class="aq-window-title">Preferences</span>
          </div>
          <div class="aq-window-body">
            <p>Your changes will take effect the next time you log in.</p>
          </div>
        </div>
      `,
      css: css`
        .aq-window { width: min(100%, 340px); overflow: hidden; border: 1px solid #8e8e8e; border-radius: 6px 6px 3px 3px; background: repeating-linear-gradient(0deg, #ededed 0 2px, #f8f8f8 2px 4px); box-shadow: 0 12px 30px rgba(0, 0, 0, .35); }
        .aq-titlebar { position: relative; display: flex; align-items: center; height: 22px; padding: 0 8px; border-bottom: 1px solid #9a9a9a; background: linear-gradient(#f2f2f2, #d2d2d2); }
        .aq-window-title { position: absolute; inset: 0; display: grid; place-items: center; color: #222; text-shadow: 0 1px #fff; pointer-events: none; }
        .aq-lights { position: relative; z-index: 1; display: flex; gap: 7px; }
        .aq-light { width: 13px; height: 13px; padding: 0; border: 1px solid rgba(0, 0, 0, .35); border-radius: 50%; background: radial-gradient(circle at 50% 30%, rgba(255, 255, 255, .95) 0 2px, transparent 5px), radial-gradient(circle at 50% 110%, rgba(255, 255, 255, .7), transparent 60%), var(--aq-light, #bbb); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .35); }
        .aq-light--close { --aq-light: #f25b52; }
        .aq-light--min { --aq-light: #f7c04a; }
        .aq-light--zoom { --aq-light: #6fcf5b; }
        .aq-window-body { padding: 14px 18px 18px; }
        .aq-window-body p { margin: 0; }
      `,
    },
    {
      id: "tabbar",
      name: "Metal tab bar",
      description: "The 2001 site nav: brushed-metal strip, capsule tabs, and the current tab lifted to white.",
      html: html`
        <nav class="aq-tabbar" aria-label="Sections">
          <a class="aq-tab" href="#" aria-label="Home">&#63743;</a>
          <a class="aq-tab" href="#">Store</a>
          <a class="aq-tab" href="#" aria-current="page">Mac OS X</a>
          <a class="aq-tab" href="#">QuickTime</a>
          <a class="aq-tab" href="#">Support</a>
        </nav>
      `,
      css: css`
        .aq-tabbar { display: flex; gap: 2px; width: min(100%, 420px); padding: 4px 6px 0; border: 1px solid #909090; border-radius: 6px 6px 0 0; background: linear-gradient(#fbfbfb, #d8d8d8 55%, #c8c8c8), repeating-linear-gradient(90deg, rgba(0, 0, 0, .05) 0 1px, transparent 1px 3px); }
        .aq-tab { padding: 5px 14px 6px; border: 1px solid #9a9a9a; border-bottom: 0; border-radius: 7px 7px 0 0; background: linear-gradient(#f6f6f6, #d6d6d6); color: #1a1a1a; font-size: 12px; text-decoration: none; text-shadow: 0 1px #fff; }
        .aq-tab:hover { background: linear-gradient(#fff, #e6e6e6); }
        .aq-tab[aria-current="page"] { position: relative; z-index: 1; background: linear-gradient(#fff, #f2f2f2); box-shadow: 0 -1px 2px rgba(0, 0, 0, .18); font-weight: 700; }
        .aq-tab:focus-visible { outline: 2px solid rgba(58, 142, 240, .8); outline-offset: -2px; }
      `,
    },
    {
      id: "progress",
      name: "Barber-pole progress",
      description: "Glossy blue stripes that march while the task runs.",
      html: html`
        <div class="aq-progress" role="progressbar" aria-label="Copying" aria-valuenow="58" aria-valuemin="0" aria-valuemax="100"><span style="width: 58%"></span></div>
      `,
      css: css`
        .aq-progress { width: min(100%, 280px); height: 14px; overflow: hidden; border: 1px solid #8a8a8a; border-radius: 7px; background: linear-gradient(#d4d4d4, #f4f4f4); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .25); }
        .aq-progress span { display: block; height: 100%; border-radius: 7px; background: linear-gradient(rgba(255, 255, 255, .7), rgba(255, 255, 255, 0) 50%, rgba(0, 0, 0, .08) 51%, rgba(255, 255, 255, .25)), repeating-linear-gradient(-45deg, #2f86ee 0 8px, #7fc0ff 8px 16px); background-size: 100% 100%, 22.6px 100%; }
        @media (prefers-reduced-motion: no-preference) {
          .aq-progress span { animation: aq-march .6s linear infinite; }
        }
        @keyframes aq-march { to { background-position: 0 0, 22.6px 0; } }
      `,
    },
    {
      id: "player",
      name: "Brushed-metal player",
      description: "The skinnable media player of the era: metal shell, inset LCD readout, gel transport and a spectrum strip.",
      html: html`
        <div class="aq-metal">
          <div class="aq-lcd">
            <b>00:12</b>
            <span class="aq-lcd-track">Welcome Home &#8212; 44 kHz &#8212; stereo</span>
            <span class="aq-lcd-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
          </div>
          <div class="aq-transport">
            <button class="aq-knob" aria-label="Previous">&#9198;</button>
            <button class="aq-knob aq-knob--main" aria-label="Play">&#9654;</button>
            <button class="aq-knob" aria-label="Pause">&#9208;</button>
            <button class="aq-knob" aria-label="Stop">&#9632;</button>
            <button class="aq-knob" aria-label="Next">&#9197;</button>
          </div>
        </div>
      `,
      css: css`
        .aq-metal { display: grid; gap: 12px; width: min(100%, 340px); padding: 12px; border: 1px solid #8c8c8c; border-radius: 8px; background: linear-gradient(#f4f4f4, #cfcfcf 50%, #c2c2c2 51%, #dedede), repeating-linear-gradient(90deg, rgba(0, 0, 0, .045) 0 1px, transparent 1px 3px); box-shadow: inset 0 1px rgba(255, 255, 255, .9), 0 10px 24px rgba(0, 0, 0, .3); }
        .aq-lcd { display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; align-items: center; padding: 8px 10px; border: 1px solid #5c6b78; border-radius: 4px; background: linear-gradient(#93a7b4, #b7c8d2 40%, #8fa3b1); box-shadow: inset 0 2px 4px rgba(0, 0, 0, .35); color: #16242e; }
        .aq-lcd b { font: 700 22px/1 "Lucida Console", Monaco, monospace; letter-spacing: -1px; }
        .aq-lcd-track { overflow: hidden; font-size: 11px; white-space: nowrap; text-overflow: ellipsis; }
        .aq-lcd-bars { grid-column: 1 / -1; display: flex; gap: 2px; align-items: flex-end; height: 16px; }
        .aq-lcd-bars i { flex: 1; background: linear-gradient(#16242e, #3c5a6d); }
        /* Fixed band heights so the strip reads as a spectrum, not a barcode. */
        .aq-lcd-bars i:nth-child(1) { height: 100%; }
        .aq-lcd-bars i:nth-child(2) { height: 62%; }
        .aq-lcd-bars i:nth-child(3) { height: 88%; }
        .aq-lcd-bars i:nth-child(4) { height: 44%; }
        .aq-lcd-bars i:nth-child(5) { height: 75%; }
        .aq-lcd-bars i:nth-child(6) { height: 31%; }
        .aq-lcd-bars i:nth-child(7) { height: 94%; }
        .aq-lcd-bars i:nth-child(8) { height: 56%; }
        .aq-lcd-bars i:nth-child(9) { height: 38%; }
        .aq-lcd-bars i:nth-child(10) { height: 69%; }
        .aq-lcd-bars i:nth-child(11) { height: 25%; }
        .aq-lcd-bars i:nth-child(12) { height: 50%; }
        .aq-lcd-bars i:nth-child(13) { height: 19%; }
        .aq-lcd-bars i:nth-child(14) { height: 34%; }
        .aq-transport { display: flex; gap: 8px; justify-content: center; }
        .aq-knob { display: grid; place-items: center; width: 34px; height: 34px; padding: 0; border: 1px solid #8892a0; border-radius: 50%; background: radial-gradient(circle at 50% 22%, rgba(255, 255, 255, .95), rgba(255, 255, 255, 0) 60%), linear-gradient(#e8eef5, #b9c6d4); box-shadow: 0 1px 2px rgba(0, 0, 0, .3), inset 0 -2px 3px rgba(255, 255, 255, .7); color: #2a3a4a; font-size: 13px; }
        .aq-knob--main { width: 42px; height: 42px; border-color: var(--aq-edge); background: radial-gradient(circle at 50% 22%, rgba(255, 255, 255, .9), rgba(255, 255, 255, 0) 58%), var(--aq-gel); color: #fff; font-size: 16px; }
        .aq-knob:active { filter: brightness(.88); }
        .aq-knob:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(90, 160, 245, .65); }
      `,
    },
  ],
};
