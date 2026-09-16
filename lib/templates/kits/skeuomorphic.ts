import { css, html, type TemplateKit } from "../types";

export const skeuomorphic: TemplateKit = {
  id: "skeuomorphic-ios",
  name: "Skeuomorphic Mobile",
  period: "2007 – 2013",
  tagline: "Linen, gloss and slide to unlock.",
  description:
    "Early smartphone UI that imitated the physical world: glossy navigation bars, embossed text, pinstripe tables, ON/OFF switches and a shimmering slide-to-unlock track.",
  context:
    "Touch screens had no affordances, so buttons had to look pressable. Linen, leather, felt and glass taught a billion first-time users where to tap, then got dropped the moment they knew.",
  tags: ["Skeuomorphism", "Gloss", "Mobile"],
  root: "sk",
  palette: [
    { name: "Nav steel", value: "#6d84a2" },
    { name: "Table stripe", value: "#c5ccd4" },
    { name: "Switch on", value: "#1a73e8" },
    { name: "Badge", value: "#e3170d" },
    { name: "Glass black", value: "#1b1b1b" },
  ],
  fonts: "\"Helvetica Neue\", Helvetica, Arial",
  baseCss: css`
    .sk {
      --sk-nav: linear-gradient(#b0bccd, #889bb3 50%, #8195af 51%, #6d84a2);
      --sk-emboss: 0 1px 0 rgba(255, 255, 255, .8);
      --sk-deboss: 0 -1px 0 rgba(0, 0, 0, .5);
      background: repeating-linear-gradient(90deg, #c5ccd4 0 5px, #cbd2d8 5px 9px);
      color: #000;
      font: 15px/1.3 "Helvetica Neue", Helvetica, Arial, sans-serif;
    }
    .sk-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `,
  showcase: html`
    <div style="display: grid; gap: 16px; width: 290px">
      <div class="sk-navbar"><button class="sk-back">Settings</button><h3 class="sk-nav-title">Wi-Fi</h3></div>
      <div class="sk-group" style="margin: 0 10px">
        <label class="sk-cell">Wi-Fi <span class="sk-switch"><input type="checkbox" checked><span class="sk-switch-track" aria-hidden="true"><b>ON</b><i></i><b>OFF</b></span></span></label>
        <div class="sk-cell">Notifications <span class="sk-badge">3</span></div>
      </div>
    </div>
  `,
  components: [
    {
      id: "navbar",
      name: "Navigation bar",
      description: "Steel-blue glossy bar with a debossed title and an arrow-shaped back button.",
      html: html`
        <header class="sk-navbar">
          <button class="sk-back">Settings</button>
          <h3 class="sk-nav-title">General</h3>
          <button class="sk-bar-btn">Edit</button>
        </header>
      `,
      css: css`
        .sk-navbar { position: relative; display: flex; align-items: center; justify-content: space-between; width: min(100%, 320px); height: 44px; padding: 0 6px; border-bottom: 1px solid #2d3642; background: var(--sk-nav); box-shadow: inset 0 1px rgba(255, 255, 255, .45); }
        .sk-nav-title { position: absolute; inset: 0; display: grid; place-items: center; margin: 0; color: #fff; font-size: 20px; font-weight: 700; text-shadow: var(--sk-deboss); pointer-events: none; }
        .sk-back, .sk-bar-btn { position: relative; z-index: 1; height: 30px; padding: 0 10px; border: 1px solid #3b4b63; border-radius: 5px; background: linear-gradient(#8ea2bc, #6f86a5 50%, #5f789a 51%, #4a6690); box-shadow: inset 0 1px rgba(255, 255, 255, .35), 0 1px rgba(255, 255, 255, .25); color: #fff; font: 700 12px "Helvetica Neue", Arial, sans-serif; text-shadow: var(--sk-deboss); }
        .sk-back { margin-left: 8px; padding-left: 6px; border-left: 0; border-radius: 0 5px 5px 0; }
        .sk-back::before { position: absolute; content: ""; top: 3px; left: -11px; width: 21px; height: 21px; border-left: 1px solid #3b4b63; border-bottom: 1px solid #3b4b63; border-radius: 0 0 0 4px; background: linear-gradient(135deg, #8ea2bc, #6f86a5 50%, #5f789a 51%, #4a6690); rotate: 45deg; z-index: -1; }
        .sk-back:active, .sk-bar-btn:active { filter: brightness(.8); }
      `,
    },
    {
      id: "bar-buttons",
      name: "Bar buttons & stepper",
      description: "The toolbar set: a tinted action, a red destructive, a two-half stepper and a disclosure pill.",
      html: html`
        <div class="sk-btns">
          <button class="sk-btn sk-btn--tint">Label</button>
          <button class="sk-btn sk-btn--danger">Delete</button>
          <div class="sk-stepper" role="group" aria-label="Quantity">
            <button aria-label="Increase">&#9650;</button>
            <button aria-label="Decrease">&#9660;</button>
          </div>
          <a class="sk-disclosure" href="#">Geoff Teehan</a>
        </div>
      `,
      css: css`
        .sk-btns { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
        .sk-btn { height: 34px; padding: 0 18px; border: 1px solid #2f4a75; border-radius: 6px; background: linear-gradient(#7fa8e0, #4f7fc8 50%, #3e6fbb 51%, #679ad8); box-shadow: inset 0 1px rgba(255, 255, 255, .45), 0 1px rgba(255, 255, 255, .3); color: #fff; font: 700 16px "Helvetica Neue", Arial, sans-serif; text-shadow: var(--sk-deboss); }
        .sk-btn--tint { border-color: #1a4fa0; background: linear-gradient(#6fa8ff, #2f6fe8 50%, #1f5fd8 51%, #4d8dfa); }
        .sk-btn--danger { border-color: #7d100a; background: linear-gradient(#e8736a, #c42a1e 50%, #ab1f14 51%, #d4574a); }
        .sk-btn:active { filter: brightness(.82); }
        .sk-stepper { display: inline-flex; overflow: hidden; border: 1px solid #3b4b63; border-radius: 6px; }
        .sk-stepper button { width: 46px; height: 34px; border: 0; background: linear-gradient(#c3ceda, #9aabc0 50%, #8b9eb6 51%, #a9bacd); color: #33475f; font-size: 13px; }
        .sk-stepper button + button { border-left: 1px solid #3b4b63; }
        .sk-stepper button:active { filter: brightness(.85); }
        .sk-disclosure { display: inline-flex; gap: 10px; align-items: center; height: 32px; padding: 0 12px 0 16px; border: 1px solid #6f8db8; border-radius: 16px; background: linear-gradient(#dce7f5, #b6cbe6); box-shadow: inset 0 1px rgba(255, 255, 255, .8); color: #1d2733; font: 700 16px "Helvetica Neue", Arial, sans-serif; text-decoration: none; }
        .sk-disclosure::after { content: ""; width: 7px; height: 7px; border-top: 2.5px solid #2f6fe8; border-right: 2.5px solid #2f6fe8; rotate: 45deg; }
      `,
    },
    {
      id: "segmented",
      name: "Segmented control",
      description: "Joined glossy segments; the selected one fills with blue and loses its top highlight.",
      html: html`
        <div class="sk-segs">
          <div class="sk-seg" role="radiogroup" aria-label="Range">
            <label><input type="radio" name="sk-range" checked><span>First</span></label>
            <label><input type="radio" name="sk-range"><span>Second</span></label>
          </div>
          <div class="sk-seg sk-seg--dark" role="radiogroup" aria-label="Page">
            <label><input type="radio" name="sk-page" checked><span>Previous</span></label>
            <label><input type="radio" name="sk-page"><span>Next</span></label>
          </div>
        </div>
      `,
      css: css`
        .sk-segs { display: grid; gap: 14px; justify-items: start; }
        .sk-seg { display: inline-flex; overflow: hidden; border: 1px solid #3b4b63; border-radius: 6px; box-shadow: 0 1px rgba(255, 255, 255, .35); }
        .sk-seg label + label { border-left: 1px solid #3b4b63; }
        .sk-seg input { position: absolute; opacity: 0; pointer-events: none; }
        .sk-seg span { display: block; padding: 7px 20px; background: linear-gradient(#c3ceda, #9aabc0 50%, #8b9eb6 51%, #a9bacd); color: #1d2733; font: 700 15px "Helvetica Neue", Arial, sans-serif; text-shadow: var(--sk-emboss); }
        .sk-seg input:checked + span { background: linear-gradient(#5f7590, #445b79 50%, #3a5170 51%, #4e6688); color: #fff; text-shadow: var(--sk-deboss); }
        .sk-seg input:focus-visible + span { box-shadow: inset 0 0 0 2px rgba(26, 115, 232, .8); }
        .sk-seg--dark { border-color: #000; }
        .sk-seg--dark label + label { border-left-color: #000; }
        .sk-seg--dark span { background: linear-gradient(#4a4a4a, #2a2a2a 50%, #1c1c1c 51%, #333); color: #9a9a9a; text-shadow: var(--sk-deboss); }
        .sk-seg--dark input:checked + span { background: linear-gradient(#111, #000); color: #fff; }
      `,
    },
    {
      id: "switch",
      name: "ON/OFF switch",
      description: "Pill that slides between a blue ON and grey OFF face with a glossy knob.",
      html: html`
        <label class="sk-switch">
          <input type="checkbox" checked>
          <span class="sk-switch-track" aria-hidden="true"><b>ON</b><i></i><b>OFF</b></span>
          <span class="sk-sr">Wi-Fi</span>
        </label>
      `,
      css: css`
        .sk-switch { position: relative; display: inline-block; width: 77px; height: 27px; margin-left: auto; overflow: hidden; border-radius: 14px; box-shadow: inset 0 1px 3px rgba(0, 0, 0, .5), 0 1px rgba(255, 255, 255, .6); }
        .sk-switch input { position: absolute; inset: 0; z-index: 1; margin: 0; opacity: 0; cursor: pointer; }
        .sk-switch-track { display: flex; align-items: center; width: 127px; height: 100%; translate: -50px 0; transition: translate .2s ease-out; }
        .sk-switch input:checked + .sk-switch-track { translate: 0 0; }
        .sk-switch-track b { flex: 0 0 50px; height: 100%; display: grid; place-items: center; font-size: 16px; }
        .sk-switch-track b:first-child { background: linear-gradient(#0d5fd9, #3b8ff6); color: #fff; text-shadow: var(--sk-deboss); }
        .sk-switch-track b:last-child { background: linear-gradient(#e0e0e0, #fbfbfb); color: #7f7f7f; }
        .sk-switch-track i { flex: 0 0 27px; height: 27px; border: 1px solid #a3a3a3; border-radius: 50%; background: linear-gradient(#cfcfcf, #fcfcfc); box-shadow: 0 1px 3px rgba(0, 0, 0, .35); }
        .sk-switch input:focus-visible + .sk-switch-track i { box-shadow: 0 0 0 3px rgba(26, 115, 232, .6); }
      `,
    },
    {
      id: "slider",
      name: "Slider",
      description: "Native range input with a recessed white track, a blue filled left half and a domed knob.",
      html: html`
        <label class="sk-slider">
          <span class="sk-sr">Position</span>
          <input type="range" min="0" max="100" value="55">
        </label>
      `,
      css: css`
        .sk-slider { display: block; width: min(100%, 300px); }
        .sk-slider input { width: 100%; height: 28px; margin: 0; appearance: none; background: transparent; }
        .sk-slider input::-webkit-slider-runnable-track { height: 10px; border: 1px solid #9aa3ad; border-radius: 5px; background: linear-gradient(#e6e6e6, #fbfbfb); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .3); }
        .sk-slider input::-moz-range-track { height: 10px; border: 1px solid #9aa3ad; border-radius: 5px; background: linear-gradient(#e6e6e6, #fbfbfb); box-shadow: inset 0 1px 2px rgba(0, 0, 0, .3); }
        .sk-slider input::-moz-range-progress { height: 10px; border-radius: 5px; background: linear-gradient(#0d5fd9, #3b8ff6); }
        .sk-slider input::-webkit-slider-thumb { width: 26px; height: 26px; margin-top: -9px; appearance: none; border: 1px solid #a3a3a3; border-radius: 50%; background: linear-gradient(#fdfdfd, #d2d2d2); box-shadow: 0 1px 3px rgba(0, 0, 0, .45); }
        .sk-slider input::-moz-range-thumb { width: 24px; height: 24px; border: 1px solid #a3a3a3; border-radius: 50%; background: linear-gradient(#fdfdfd, #d2d2d2); }
        .sk-slider input:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(26, 115, 232, .6); border-radius: 14px; }
      `,
    },
    {
      id: "table",
      name: "Grouped table",
      description: "White rounded group floating on pinstripes, with chevrons and an ON/OFF switch.",
      html: html`
        <div class="sk-group">
          <label class="sk-cell">Airplane Mode
            <span class="sk-switch"><input type="checkbox"><span class="sk-switch-track" aria-hidden="true"><b>ON</b><i></i><b>OFF</b></span></span>
          </label>
          <a class="sk-cell" href="#">Wi-Fi <span class="sk-detail">Home</span></a>
          <a class="sk-cell" href="#">Notifications</a>
        </div>
      `,
      css: css`
        .sk-group { width: min(100%, 300px); overflow: hidden; border: 1px solid #a9abad; border-radius: 10px; background: #fff; box-shadow: var(--sk-emboss); }
        .sk-cell { position: relative; display: flex; gap: 8px; align-items: center; min-height: 44px; padding: 0 30px 0 10px; color: #000; font-weight: 700; text-decoration: none; }
        .sk-cell + .sk-cell { border-top: 1px solid #d9d9d9; }
        a.sk-cell::after { position: absolute; content: ""; right: 14px; width: 8px; height: 8px; border-top: 3px solid #7f7f7f; border-right: 3px solid #7f7f7f; rotate: 45deg; }
        a.sk-cell:active { background: linear-gradient(#058cf5, #015fe6); color: #fff; }
        label.sk-cell { padding-right: 10px; }
        .sk-detail { margin-left: auto; color: #385487; font-weight: 400; }
      `,
    },
    {
      id: "toolbar",
      name: "Glass toolbar",
      description: "Dark glass bar with embossed glyph buttons and the page dots that sat above it.",
      html: html`
        <div class="sk-toolbar-wrap">
          <div class="sk-dots" role="tablist" aria-label="Pages">
            <button role="tab" aria-selected="true" aria-label="Page 1"></button>
            <button role="tab" aria-selected="false" aria-label="Page 2"></button>
            <button role="tab" aria-selected="false" aria-label="Page 3"></button>
            <button role="tab" aria-selected="false" aria-label="Page 4"></button>
          </div>
          <div class="sk-toolbar" role="toolbar" aria-label="Actions">
            <button aria-label="Compose">&#9998;</button>
            <button aria-label="Reply">&#8617;</button>
            <button aria-label="Share">&#8618;</button>
            <button aria-label="Archive">&#9744;</button>
            <button aria-label="Delete">&#9851;</button>
          </div>
        </div>
      `,
      css: css`
        .sk-toolbar-wrap { display: grid; gap: 12px; justify-items: center; width: min(100%, 320px); padding: 14px 0 0; border-radius: 10px; background: linear-gradient(#3a3a3a, #202020); }
        .sk-dots { display: flex; gap: 9px; }
        .sk-dots button { width: 8px; height: 8px; padding: 0; border: 0; border-radius: 50%; background: rgba(255, 255, 255, .32); box-shadow: inset 0 1px 1px rgba(0, 0, 0, .6); }
        .sk-dots button[aria-selected="true"] { background: #fff; }
        .sk-toolbar { display: flex; gap: 6px; justify-content: space-around; width: 100%; padding: 7px 10px; border-top: 1px solid rgba(255, 255, 255, .18); background: linear-gradient(rgba(255, 255, 255, .22), rgba(255, 255, 255, .06) 50%, rgba(0, 0, 0, .12) 51%, rgba(255, 255, 255, .08)); }
        .sk-toolbar button { display: grid; place-items: center; width: 44px; height: 32px; border: 1px solid rgba(0, 0, 0, .55); border-radius: 5px; background: linear-gradient(#8ea2bc, #6f86a5 50%, #5f789a 51%, #4a6690); box-shadow: inset 0 1px rgba(255, 255, 255, .4), 0 1px rgba(255, 255, 255, .15); color: #fff; font-size: 16px; text-shadow: var(--sk-deboss); }
        .sk-toolbar button:active { filter: brightness(.8); }
        .sk-toolbar button:focus-visible { outline: 2px solid #3b8ff6; outline-offset: 1px; }
      `,
    },
    {
      id: "alert",
      name: "Alert view",
      description: "Dark blue glass panel with a glossy crest, white stroke and paired buttons.",
      html: html`
        <div class="sk-alert" role="alertdialog" aria-labelledby="sk-alert-title">
          <h3 id="sk-alert-title">Cellular Data Is Turned Off</h3>
          <p>You can turn on cellular data for this app in Settings.</p>
          <div class="sk-alert-actions">
            <button>Settings</button>
            <button class="sk-alert-default">OK</button>
          </div>
        </div>
      `,
      css: css`
        .sk-alert { position: relative; width: min(100%, 284px); padding: 16px 12px 12px; overflow: hidden; border: 2px solid rgba(255, 255, 255, .85); border-radius: 12px; background: rgba(4, 18, 69, .82); box-shadow: 0 4px 16px rgba(0, 0, 0, .6); color: #fff; text-align: center; text-shadow: var(--sk-deboss); }
        .sk-alert::before { position: absolute; content: ""; top: -120px; left: -50%; width: 200%; height: 160px; border-radius: 50%; background: linear-gradient(rgba(255, 255, 255, .35), rgba(255, 255, 255, .08)); pointer-events: none; }
        .sk-alert h3 { margin: 0 0 8px; font-size: 17px; }
        .sk-alert p { margin: 0 0 14px; font-size: 15px; }
        .sk-alert-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .sk-alert-actions button { height: 42px; border: 1px solid rgba(0, 0, 0, .6); border-radius: 6px; background: linear-gradient(rgba(255, 255, 255, .35), rgba(255, 255, 255, .1) 50%, rgba(255, 255, 255, .02) 51%, rgba(255, 255, 255, .12)); box-shadow: inset 0 1px rgba(255, 255, 255, .3); color: #fff; font: 700 17px "Helvetica Neue", Arial, sans-serif; text-shadow: var(--sk-deboss); }
        .sk-alert-actions .sk-alert-default { background: linear-gradient(rgba(255, 255, 255, .5), rgba(255, 255, 255, .22) 50%, rgba(255, 255, 255, .12) 51%, rgba(255, 255, 255, .25)); }
        .sk-alert-actions button:active { background: rgba(0, 0, 0, .3); }
      `,
    },
    {
      id: "badge",
      name: "Badge & app icon",
      description: "Rounded app icon with gloss plus the red notification badge with a white ring.",
      html: html`
        <div class="sk-icon">
          <span class="sk-icon-art" aria-hidden="true">✉</span>
          <span class="sk-badge">12</span>
          <span class="sk-icon-label">Mail</span>
        </div>
      `,
      css: css`
        .sk-icon { position: relative; display: grid; justify-items: center; gap: 4px; width: 76px; }
        .sk-icon-art { position: relative; display: grid; place-items: center; width: 57px; height: 57px; overflow: hidden; border-radius: 12px; background: linear-gradient(#5fb9fb, #1567d3); box-shadow: 0 2px 4px rgba(0, 0, 0, .5); color: #fff; font-size: 32px; }
        .sk-icon-art::after { position: absolute; content: ""; top: -40%; left: -25%; width: 150%; height: 90%; border-radius: 50%; background: linear-gradient(rgba(255, 255, 255, .6), rgba(255, 255, 255, .1)); }
        .sk-badge { display: inline-grid; place-items: center; min-width: 26px; height: 26px; padding: 0 7px; border: 2px solid #fff; border-radius: 13px; background: radial-gradient(ellipse at 50% 0, #ff8a80 0, transparent 60%), linear-gradient(#f5412b, #b30b00); box-shadow: 0 2px 3px rgba(0, 0, 0, .5); color: #fff; font: 700 14px "Helvetica Neue", Arial, sans-serif; }
        .sk-icon .sk-badge { position: absolute; top: -8px; right: 0; }
        .sk-icon-label { color: #fff; font-size: 12px; font-weight: 700; text-shadow: 0 1px 2px rgba(0, 0, 0, .9); }
      `,
    },
    {
      id: "unlock",
      name: "Slide to unlock",
      description: "Recessed glass track with a knob and a shimmer sweeping through the label.",
      html: html`
        <div class="sk-unlock">
          <span class="sk-unlock-knob" aria-hidden="true"></span>
          <span class="sk-unlock-text">slide to unlock</span>
        </div>
      `,
      css: css`
        .sk-unlock { position: relative; display: flex; align-items: center; width: min(100%, 300px); height: 62px; padding: 4px; border: 1px solid #000; border-radius: 12px; background: linear-gradient(rgba(0, 0, 0, .75), rgba(40, 40, 40, .75)); box-shadow: 0 1px rgba(255, 255, 255, .25); }
        .sk-unlock-knob { position: relative; width: 72px; height: 52px; border-radius: 9px; background: linear-gradient(#fdfdfd, #c9c9c9); box-shadow: inset 0 -1px 2px rgba(0, 0, 0, .3); }
        .sk-unlock-knob::after { position: absolute; content: ""; inset: 0; margin: auto; width: 30px; height: 18px; background: linear-gradient(#9a9a9a, #6e6e6e); clip-path: polygon(0 35%, 55% 35%, 55% 0, 100% 50%, 55% 100%, 55% 65%, 0 65%); }
        .sk-unlock-text { flex: 1; text-align: center; font-size: 22px; background: linear-gradient(90deg, #6d6d6d 0 40%, #fff 50%, #6d6d6d 60% 100%) 0 0 / 250% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; }
        @media (prefers-reduced-motion: no-preference) {
          .sk-unlock-text { animation: sk-shimmer 2.2s linear infinite; }
        }
        @keyframes sk-shimmer { from { background-position: 100% 0; } to { background-position: -50% 0; } }
      `,
    },
  ],
};
