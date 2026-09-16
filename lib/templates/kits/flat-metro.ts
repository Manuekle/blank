import { css, html, type TemplateKit } from "../types";

/** Forty stacked shadows at 45°, the 2013 way to fake depth without a gradient. */
const longShadow = Array.from({ length: 44 }, (_, i) => `${i + 1}px ${i + 1}px #007c7b`).join(", ");

export const flatMetro: TemplateKit = {
  id: "flat-metro",
  name: "Flat & Metro",
  period: "2011 – 2016",
  tagline: "Ultralight type, live tiles and zero radius.",
  description:
    "Content instead of chrome. Nothing is rounded, nothing is shaded: hierarchy comes from weight and whitespace — 200-weight headlines the size of a hand next to 600-weight labels the size of a fingernail — and colour arrives in full-strength blocks or not at all.",
  context:
    "Retina screens made bevels look cheap and responsive layouts made sliced images unusable, so Metro and iOS 7 threw out every gradient at once. Motion carried the weight the shading used to: tiles flip, controls tilt, panoramas slide.",
  tags: ["Metro", "Tiles", "Ultralight"],
  root: "ft",
  palette: [
    { name: "Teal", value: "#00aba9" },
    { name: "Cobalt", value: "#0050ef" },
    { name: "Magenta", value: "#d80073" },
    { name: "Lime", value: "#a4c400" },
    { name: "Amber", value: "#f0a30a" },
  ],
  fonts: "\"Segoe UI\" 200 / 300 / 600 — the whole system is three weights",
  baseCss: css`
    .ft {
      /* The shipped accent set: full strength, never tinted. */
      --ft-teal: #00aba9;
      --ft-cobalt: #0050ef;
      --ft-magenta: #d80073;
      --ft-lime: #a4c400;
      --ft-amber: #f0a30a;
      --ft-crimson: #e51400;
      --ft-violet: #aa00ff;
      --ft-ink: #1b1b1b;
      --ft-muted: #8a8a8a;
      --ft-chrome: #f4f4f4;
      --ft-line: #d8d8d8;
      /* Every control points at this, so one line re-themes the kit. */
      --ft-accent: var(--ft-teal);
      background: var(--ft-chrome);
      color: var(--ft-ink);
      font: 300 15px/1.5 "Segoe UI", "Segoe UI Light", -apple-system, "Helvetica Neue", Arial, sans-serif;
      letter-spacing: -.005em;
    }
    /* Metro's press feedback: the surface tilts back into the screen. */
    .ft-tilt { transition: transform 120ms cubic-bezier(.2, .8, .2, 1); }
    .ft-tilt:active { transform: perspective(700px) translateZ(-12px) rotateX(3deg) scale(.985); }
    .ft-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `,
  showcase: html`
    <div style="display: grid; gap: 16px; width: 300px">
      <header class="ft-pivot">
        <p class="ft-pivot-app">Twitter</p>
        <nav class="ft-pivot-nav" aria-label="Sections"><a href="#" aria-current="page">timeline</a><a href="#">view</a><a href="#">lists</a></nav>
      </header>
      <div class="ft-tiles" style="width: 100%">
        <a class="ft-tile ft-tile--wide" href="#" style="--ft-tile: var(--ft-teal)"><span class="ft-tile-glyph">&#9729;</span><b class="ft-tile-big">24&deg;</b><span class="ft-tile-label">Weather</span></a>
        <a class="ft-tile" href="#" style="--ft-tile: var(--ft-magenta)"><span class="ft-tile-glyph">&#9993;</span><span class="ft-tile-count">12</span><span class="ft-tile-label">Mail</span></a>
        <a class="ft-tile" href="#" style="--ft-tile: var(--ft-lime)"><span class="ft-tile-glyph">&#9834;</span><span class="ft-tile-label">Music</span></a>
      </div>
    </div>
  `,
  components: [
    {
      id: "pivot",
      name: "Pivot header",
      description: "The signature move: a tiny caps app name over 200-weight section titles, the next one greyed and clipped at the edge so you know to swipe.",
      html: html`
        <header class="ft-pivot">
          <p class="ft-pivot-app">Twitter</p>
          <nav class="ft-pivot-nav" aria-label="Sections">
            <a href="#" aria-current="page">timeline</a>
            <a href="#">view</a>
            <a href="#">mentions</a>
          </nav>
          <p class="ft-pivot-date"><b>Saturday,</b> 13</p>
        </header>
      `,
      css: css`
        .ft-pivot { width: min(100%, 340px); overflow: hidden; padding: 20px 0 14px 18px; background: #fff; }
        .ft-pivot-app { margin: 0 0 6px; color: var(--ft-muted); font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; }
        .ft-pivot-nav { display: flex; gap: 18px; white-space: nowrap; }
        .ft-pivot-nav a { color: #c9c9c9; font-size: 40px; font-weight: 200; letter-spacing: -.035em; line-height: 1.05; text-decoration: none; transition: color 180ms ease; }
        .ft-pivot-nav a[aria-current="page"] { color: var(--ft-ink); }
        .ft-pivot-nav a:hover { color: var(--ft-accent); }
        .ft-pivot-date { margin: 10px 18px 0 0; color: var(--ft-muted); font-size: 26px; font-weight: 200; letter-spacing: -.03em; text-align: right; }
        .ft-pivot-date b { font-weight: 200; color: var(--ft-ink); }
      `,
    },
    {
      id: "tiles",
      name: "Live tiles",
      description: "A strict 6px grid of squares and double-wides. Glyph top-left, label bottom-left, count top-right — and the wide tile flips to its back face on a loop.",
      html: html`
        <div class="ft-tiles">
          <a class="ft-tile ft-tile--wide ft-tile--live ft-tilt" href="#" style="--ft-tile: var(--ft-teal)">
            <span class="ft-tile-face">
              <span class="ft-tile-glyph">&#9729;</span>
              <b class="ft-tile-big">24&deg;</b>
              <span class="ft-tile-label">Weather</span>
            </span>
            <span class="ft-tile-face ft-tile-face--back">
              <span class="ft-tile-head">Tomorrow</span>
              <b class="ft-tile-big">18&deg;</b>
              <span class="ft-tile-label">Light rain</span>
            </span>
          </a>
          <a class="ft-tile ft-tilt" href="#" style="--ft-tile: var(--ft-magenta)"><span class="ft-tile-glyph">&#9993;</span><span class="ft-tile-count">12</span><span class="ft-tile-label">Mail</span></a>
          <a class="ft-tile ft-tilt" href="#" style="--ft-tile: var(--ft-lime)"><span class="ft-tile-glyph">&#9834;</span><span class="ft-tile-label">Music</span></a>
          <a class="ft-tile ft-tilt" href="#" style="--ft-tile: var(--ft-cobalt)"><span class="ft-tile-glyph">&#9786;</span><span class="ft-tile-label">People</span></a>
          <a class="ft-tile ft-tilt" href="#" style="--ft-tile: var(--ft-violet)"><span class="ft-tile-glyph">&#9635;</span><span class="ft-tile-label">Store</span></a>
          <a class="ft-tile ft-tile--wide ft-tilt" href="#" style="--ft-tile: var(--ft-amber)"><span class="ft-tile-glyph">&#128247;</span><span class="ft-tile-label">Photos</span></a>
        </div>
      `,
      css: css`
        .ft-tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; width: min(100%, 320px); perspective: 900px; }
        .ft-tile { position: relative; aspect-ratio: 1; background: var(--ft-tile, var(--ft-accent)); color: #fff; text-decoration: none; transform-style: preserve-3d; }
        .ft-tile--wide { grid-column: span 2; aspect-ratio: 2.06; }
        .ft-tile-face, .ft-tile:not(.ft-tile--live) { display: flex; flex-direction: column; justify-content: flex-end; padding: 10px 11px; }
        .ft-tile-face { position: absolute; inset: 0; backface-visibility: hidden; background: inherit; }
        .ft-tile-face--back { transform: rotateX(180deg); }
        .ft-tile-glyph { position: absolute; top: 9px; left: 11px; font-size: 21px; line-height: 1; opacity: .95; }
        .ft-tile-head { position: absolute; top: 9px; left: 11px; font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; opacity: .8; }
        .ft-tile-count { position: absolute; top: 8px; right: 11px; font-size: 22px; font-weight: 200; line-height: 1; }
        .ft-tile-big { margin-bottom: 2px; font-size: 34px; font-weight: 200; letter-spacing: -.04em; line-height: 1; }
        .ft-tile-label { font-size: 12.5px; font-weight: 400; }
        .ft-tile:focus-visible { outline: 3px solid var(--ft-ink); outline-offset: 2px; }
        @media (prefers-reduced-motion: no-preference) {
          .ft-tile--live { animation: ft-flip 9s ease-in-out infinite; }
        }
        @keyframes ft-flip {
          0%, 42% { transform: rotateX(0deg); }
          50%, 92% { transform: rotateX(-180deg); }
          100% { transform: rotateX(-360deg); }
        }
      `,
    },
    {
      id: "button",
      name: "Buttons",
      description: "A 3px border and nothing else. The solid variant fills with the accent; both tilt back on press instead of dimming.",
      html: html`
        <div class="ft-row">
          <button class="ft-btn ft-btn--solid ft-tilt">save</button>
          <button class="ft-btn ft-tilt">cancel</button>
          <button class="ft-btn ft-btn--danger ft-tilt">delete</button>
          <button class="ft-btn" disabled>apply</button>
        </div>
      `,
      css: css`
        .ft-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
        .ft-btn { min-width: 108px; height: 42px; padding: 0 18px; border: 3px solid var(--ft-ink); background: transparent; color: var(--ft-ink); font: 400 15px "Segoe UI", -apple-system, Arial, sans-serif; transition: background-color 140ms ease, color 140ms ease, border-color 140ms ease; }
        .ft-btn:hover:not(:disabled) { background: var(--ft-ink); color: #fff; }
        .ft-btn--solid { border-color: var(--ft-accent); background: var(--ft-accent); color: #fff; }
        .ft-btn--solid:hover { background: transparent; color: var(--ft-accent); }
        .ft-btn--danger { border-color: var(--ft-crimson); color: var(--ft-crimson); }
        .ft-btn--danger:hover { background: var(--ft-crimson); color: #fff; }
        .ft-btn:disabled { border-color: var(--ft-line); color: #b4b4b4; }
        .ft-btn:focus-visible { outline: 3px solid var(--ft-accent); outline-offset: 3px; }
      `,
    },
    {
      id: "list",
      name: "List",
      description: "No rules, no cards — a square accent thumbnail, an accent-coloured name and a right-aligned timestamp, separated by air alone.",
      html: html`
        <div class="ft-list">
          <p class="ft-list-group">Saturday</p>
          <a class="ft-list-item ft-tilt" href="#">
            <span class="ft-thumb" style="--ft-tile: var(--ft-cobalt)" aria-hidden="true">R</span>
            <span class="ft-list-body"><b>reddit</b>Forget desktops, forget laptops. 201 points, submitted by 4erlik</span>
            <time>13:00</time>
          </a>
          <a class="ft-list-item ft-tilt" href="#">
            <span class="ft-thumb" style="--ft-tile: var(--ft-teal)" aria-hidden="true">E</span>
            <span class="ft-list-body"><b>engadget</b>Windows Phone 7 beats iPhone 4 and Android in a grilling contest</span>
            <time>12:47</time>
          </a>
          <a class="ft-list-item ft-tilt" href="#">
            <span class="ft-thumb" style="--ft-tile: var(--ft-crimson)" aria-hidden="true">C</span>
            <span class="ft-list-body"><b>CNN</b>Myanmar activist Aung San Suu Kyi released</span>
            <time>11:23</time>
          </a>
        </div>
      `,
      css: css`
        .ft-list { display: grid; gap: 2px; width: min(100%, 360px); }
        .ft-list-group { margin: 0 0 6px; font-size: 26px; font-weight: 200; letter-spacing: -.03em; }
        .ft-list-item { display: grid; grid-template-columns: 46px 1fr auto; gap: 12px; padding: 8px; color: inherit; text-decoration: none; }
        .ft-list-item:hover { background: #fff; }
        .ft-thumb { display: grid; place-items: center; width: 46px; height: 46px; background: var(--ft-tile, var(--ft-accent)); color: #fff; font-size: 20px; font-weight: 600; }
        .ft-list-body { display: grid; gap: 1px; min-width: 0; font-size: 13px; line-height: 1.4; color: var(--ft-muted); }
        .ft-list-body b { color: var(--ft-accent); font-size: 16px; font-weight: 400; }
        .ft-list-item time { color: #b4b4b4; font-size: 11.5px; font-variant-numeric: tabular-nums; }
        .ft-list-item:focus-visible { outline: 3px solid var(--ft-accent); outline-offset: -3px; }
      `,
    },
    {
      id: "form",
      name: "Input & toggle",
      description: "Border-only field that turns accent on focus, and the rectangular toggle that spells its own state out beside it.",
      html: html`
        <div class="ft-form">
          <label class="ft-field">
            <span>Your name</span>
            <input class="ft-input" type="text" placeholder="type here">
          </label>
          <label class="ft-toggle">
            <input type="checkbox" checked>
            <span class="ft-toggle-track" aria-hidden="true"></span>
            <span class="ft-toggle-text">Email notifications<b data-on="On" data-off="Off"></b></span>
          </label>
        </div>
      `,
      css: css`
        .ft-form { display: grid; gap: 20px; width: min(100%, 300px); }
        .ft-field { display: grid; gap: 6px; }
        .ft-field > span { color: var(--ft-muted); font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
        .ft-input { height: 44px; padding: 0 12px; border: 3px solid var(--ft-line); background: #fff; color: var(--ft-ink); font: 300 16px "Segoe UI", -apple-system, Arial, sans-serif; transition: border-color 140ms ease; }
        .ft-input::placeholder { color: #b4b4b4; }
        .ft-input:focus { outline: none; border-color: var(--ft-accent); }
        .ft-toggle { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: center; cursor: pointer; }
        .ft-toggle input { position: absolute; opacity: 0; pointer-events: none; }
        .ft-toggle-track { position: relative; width: 56px; height: 24px; border: 3px solid var(--ft-ink); background: transparent; }
        .ft-toggle-track::after { position: absolute; content: ""; top: 0; left: 0; width: 14px; height: 100%; background: var(--ft-ink); transition: translate 160ms cubic-bezier(.2, .8, .2, 1); }
        .ft-toggle input:checked + .ft-toggle-track { border-color: var(--ft-accent); background: var(--ft-accent); }
        .ft-toggle input:checked + .ft-toggle-track::after { background: #fff; translate: 28px 0; }
        .ft-toggle-text { display: grid; font-size: 14px; }
        /* The state word comes from the input, not from the markup. */
        .ft-toggle-text b { color: var(--ft-muted); font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
        .ft-toggle-text b::before { content: attr(data-off); }
        .ft-toggle input:checked ~ .ft-toggle-text b::before { content: attr(data-on); }
        .ft-toggle input:checked ~ .ft-toggle-text b { color: var(--ft-accent); }
        .ft-toggle input:focus-visible + .ft-toggle-track { outline: 3px solid var(--ft-accent); outline-offset: 3px; }
      `,
    },
    {
      id: "appbar",
      name: "App bar",
      description: "Thin-outline circular glyphs with lowercase labels, the overflow ellipsis pinned right.",
      html: html`
        <div class="ft-appbar" role="toolbar" aria-label="Commands">
          <button class="ft-tilt"><span aria-hidden="true">&#43;</span>new</button>
          <button class="ft-tilt"><span aria-hidden="true">&#9998;</span>edit</button>
          <button class="ft-tilt"><span aria-hidden="true">&#10005;</span>delete</button>
          <button class="ft-appbar-more" aria-label="More commands">&#8943;</button>
        </div>
      `,
      css: css`
        .ft-appbar { display: flex; gap: 20px; align-items: flex-start; width: min(100%, 340px); padding: 14px 16px; background: var(--ft-ink); }
        .ft-appbar button { display: grid; gap: 7px; justify-items: center; padding: 0; border: 0; background: none; color: #fff; font: 400 11.5px "Segoe UI", -apple-system, Arial, sans-serif; }
        .ft-appbar button span { display: grid; place-items: center; width: 42px; height: 42px; border: 2px solid #fff; border-radius: 50%; font-size: 17px; transition: background-color 140ms ease, color 140ms ease; }
        .ft-appbar button:hover span { background: #fff; color: var(--ft-ink); }
        .ft-appbar button:focus-visible { outline: 2px solid var(--ft-accent); outline-offset: 3px; }
        .ft-appbar .ft-appbar-more { margin-left: auto; align-self: center; font-size: 22px; line-height: 1; }
      `,
    },
    {
      id: "dialog",
      name: "Message dialog",
      description: "Full-width sheet pinned to the top of the screen, accent band above the title, two equal flat actions.",
      html: html`
        <div class="ft-dialog-scrim">
          <div class="ft-dialog" role="alertdialog" aria-labelledby="ft-dialog-title">
            <h3 id="ft-dialog-title">Delete this album?</h3>
            <p>The 24 photos inside it stay on your phone. Only the album is removed.</p>
            <div class="ft-dialog-actions">
              <button class="ft-tilt">delete</button>
              <button class="ft-tilt">cancel</button>
            </div>
          </div>
        </div>
      `,
      css: css`
        .ft-dialog-scrim { width: min(100%, 340px); padding-bottom: 46px; background: rgba(27, 27, 27, .55); }
        .ft-dialog { padding: 20px 18px 0; background: var(--ft-ink); border-top: 5px solid var(--ft-accent); color: #fff; }
        .ft-dialog h3 { margin: 0 0 8px; font-size: 24px; font-weight: 200; letter-spacing: -.03em; }
        .ft-dialog p { margin: 0 0 18px; color: rgba(255, 255, 255, .62); font-size: 14px; }
        .ft-dialog-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding-bottom: 18px; }
        .ft-dialog-actions button { height: 42px; border: 3px solid #fff; background: transparent; color: #fff; font: 400 15px "Segoe UI", -apple-system, Arial, sans-serif; transition: background-color 140ms ease, color 140ms ease; }
        .ft-dialog-actions button:hover { background: #fff; color: var(--ft-ink); }
      `,
    },
    {
      id: "progress",
      name: "Dot loader & progress",
      description: "The five dots that crossed the screen while you waited, plus the determinate bar for when the length was known.",
      html: html`
        <div class="ft-stack">
          <p class="ft-stack-label">Loading</p>
          <div class="ft-dots" role="status" aria-label="Loading"><i></i><i></i><i></i><i></i><i></i></div>
          <p class="ft-stack-label">Uploading &mdash; 72%</p>
          <div class="ft-progress" role="progressbar" aria-label="Uploading" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100"><span style="width: 72%"></span></div>
        </div>
      `,
      css: css`
        .ft-stack { display: grid; gap: 10px; width: min(100%, 340px); }
        .ft-stack-label { margin: 8px 0 0; color: var(--ft-muted); font-size: 12px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; }
        .ft-stack-label:first-child { margin-top: 0; }
        .ft-dots { position: relative; height: 6px; overflow: hidden; }
        .ft-dots i { position: absolute; top: 0; width: 6px; height: 6px; background: var(--ft-accent); }
        @media (prefers-reduced-motion: no-preference) {
          .ft-dots i { animation: ft-travel 2.8s cubic-bezier(.62, 0, .38, 1) infinite; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ft-dots i { left: calc(var(--ft-i) * 14px); }
        }
        .ft-dots i:nth-child(1) { --ft-i: 0; animation-delay: 0s; }
        .ft-dots i:nth-child(2) { --ft-i: 1; animation-delay: .14s; }
        .ft-dots i:nth-child(3) { --ft-i: 2; animation-delay: .28s; }
        .ft-dots i:nth-child(4) { --ft-i: 3; animation-delay: .42s; }
        .ft-dots i:nth-child(5) { --ft-i: 4; animation-delay: .56s; }
        @keyframes ft-travel { from { left: -8px; } to { left: 100%; } }
        .ft-progress { height: 6px; background: #dcdcdc; }
        .ft-progress span { display: block; height: 100%; background: var(--ft-accent); }
      `,
    },
    {
      id: "long-shadow",
      name: "Long shadow icon",
      description: "The other half of the era: a 45° shadow built from forty-four stacked text-shadows, clipped by the circle.",
      html: html`
        <div class="ft-longshadow"><span>&#10003;</span></div>
      `,
      css: css`
        .ft-longshadow { display: grid; place-items: center; width: 140px; height: 140px; overflow: hidden; border-radius: 50%; background: var(--ft-teal); }
        .ft-longshadow span { color: #fff; font-size: 64px; font-weight: 600; line-height: 1; text-shadow: ${longShadow}; }
      `,
    },
  ],
};
