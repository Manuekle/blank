import { css, html, type TemplateKit } from "../types";

export const vhs: TemplateKit = {
  id: "vhs-osd",
  name: "VHS On-Screen",
  period: "1980 – 1994",
  tagline: "White bitmap type burned onto a blue screen.",
  description:
    "The on-screen display of a tape deck. Everything is white, uppercase and monospaced on saturated blue; selection inverts the box instead of tinting it; and the whole panel sits behind scanlines, a glass vignette and a hair of chromatic fringing.",
  context:
    "The interface had to survive a composite signal at 240 lines, so it used the only things that stayed legible: pure white on saturated blue, one bitmap font, and blocks instead of outlines. Inversion was the only state a CRT could show reliably.",
  tags: ["CRT", "Bitmap", "Uppercase"],
  root: "vhs",
  palette: [
    { name: "Screen", value: "#1a1ad6" },
    { name: "Deep", value: "#0b0b8a" },
    { name: "Phosphor", value: "#f2f4ff" },
    { name: "Record", value: "#ff2d3a" },
    { name: "Fringe", value: "#00e5ff" },
  ],
  fonts: "Monospace, uppercase, +0.06em tracking — any bitmap face reads right",
  baseCss: css`
    .vhs {
      --vhs-screen: #1a1ad6;
      --vhs-deep: #0b0b8a;
      --vhs-ink: #f2f4ff;
      --vhs-dim: rgba(242, 244, 255, .45);
      --vhs-rec: #ff2d3a;
      /* Phosphor bloom plus a hair of NTSC colour fringing. */
      --vhs-glow: 0 0 7px rgba(210, 220, 255, .55), 1px 0 rgba(255, 0, 90, .32), -1px 0 rgba(0, 229, 255, .32);
      background: radial-gradient(120% 90% at 50% 0, #2a2aef, var(--vhs-screen) 55%, #12128f);
      color: var(--vhs-ink);
      font: 700 15px/1.3 ui-monospace, "SF Mono", "Courier New", monospace;
      letter-spacing: .06em;
      text-transform: uppercase;
      text-shadow: var(--vhs-glow);
    }
    .vhs-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `,
  showcase: html`
    <div class="vhs-screen" style="width: 280px">
      <div class="vhs-screen-art">
        <p class="vhs-title">VHS / VCR Menu</p>
        <div class="vhs-modes" role="radiogroup" aria-label="Speed">
          <label><input type="radio" name="vhs-speed" checked><span>SP</span></label>
          <label><input type="radio" name="vhs-speed"><span>EP</span></label>
          <label><input type="radio" name="vhs-speed"><span>SLP</span></label>
        </div>
        <p class="vhs-meter-label">Volume</p>
        <div class="vhs-meter"><span style="width: 62%"></span></div>
        <p class="vhs-timecode"><b>0:22:37</b><i>SP</i></p>
      </div>
    </div>
  `,
  components: [
    {
      id: "screen",
      name: "CRT screen",
      description: "The frame everything sits in: barrelled corners, scanlines, a glass vignette and a corner highlight.",
      html: html`
        <div class="vhs-screen">
          <div class="vhs-screen-art">
            <p class="vhs-title">VHS / VCR Menu</p>
            <p>Select with the arrow keys.<br>Press menu to end.</p>
          </div>
          <span class="vhs-led" aria-hidden="true"></span>
        </div>
      `,
      css: css`
        /* Two layers: a moulded plastic bezel, and the tube inside it. */
        .vhs-screen {
          position: relative;
          width: min(100%, 360px);
          padding: 15px 15px 26px;
          border-radius: 22px;
          background: linear-gradient(#34343d, #17171d 55%, #23232b);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, .16),
            inset 0 -1px 0 rgba(0, 0, 0, .6),
            0 30px 60px -26px rgba(0, 0, 0, .9);
        }
        .vhs-screen-art {
          position: relative;
          display: grid;
          gap: 14px;
          padding: 22px 20px;
          overflow: hidden;
          /* Elliptical radii bend the corners the way a tube does. */
          border-radius: 18px / 30px;
          background: radial-gradient(120% 90% at 50% 0, #2a2aef, #1a1ad6 55%, #12128f);
          box-shadow: inset 0 0 40px rgba(0, 0, 40, .75), 0 0 34px rgba(50, 50, 255, .35);
        }
        /* Scanlines and the vignette, then the sheen on the glass. */
        .vhs-screen-art::before {
          position: absolute;
          content: "";
          inset: 0;
          background:
            radial-gradient(150% 110% at 50% 50%, transparent 46%, rgba(0, 0, 40, .6)),
            repeating-linear-gradient(0deg, rgba(0, 0, 30, .26) 0 1px, transparent 1px 3px);
          pointer-events: none;
        }
        .vhs-screen-art::after {
          position: absolute;
          content: "";
          top: -60%;
          left: -25%;
          width: 85%;
          height: 140%;
          background: linear-gradient(105deg, rgba(255, 255, 255, .16), transparent 55%);
          rotate: -12deg;
          pointer-events: none;
        }
        .vhs-screen-art > * { position: relative; z-index: 1; margin: 0; }
        .vhs-title { padding: 5px 10px; background: var(--vhs-ink); color: var(--vhs-deep); text-align: center; text-shadow: none; }
        .vhs-led { position: absolute; bottom: 9px; left: 50%; width: 7px; height: 7px; translate: -50% 0; border-radius: 50%; background: #35ff7a; box-shadow: 0 0 10px rgba(53, 255, 122, .9); }
      `,
    },
    {
      id: "menu",
      name: "OSD menu",
      description: "Inverted title block, plain rows, and the selected row filled solid — the only state a composite signal could hold.",
      html: html`
        <div class="vhs-menu" role="menu" aria-label="Setup">
          <p class="vhs-title">Setup Menu</p>
          <button role="menuitem" class="vhs-item">Clock Set</button>
          <button role="menuitem" class="vhs-item" aria-current="true">Tuner Preset</button>
          <button role="menuitem" class="vhs-item">Audio Out</button>
          <button role="menuitem" class="vhs-item" disabled>Timer Rec</button>
        </div>
      `,
      css: css`
        .vhs-menu { display: grid; gap: 3px; width: min(100%, 300px); }
        .vhs-menu .vhs-title { margin: 0 0 7px; }
        .vhs-item { padding: 6px 10px; border: 0; background: transparent; color: var(--vhs-ink); font: inherit; letter-spacing: inherit; text-align: left; text-transform: inherit; text-shadow: var(--vhs-glow); }
        .vhs-item:hover:not(:disabled) { background: rgba(242, 244, 255, .16); }
        .vhs-item[aria-current="true"] { background: var(--vhs-ink); color: var(--vhs-deep); text-shadow: none; }
        .vhs-item:disabled { color: var(--vhs-dim); text-shadow: none; }
        .vhs-item:focus-visible { outline: 2px solid var(--vhs-ink); outline-offset: -2px; }
      `,
    },
    {
      id: "meters",
      name: "Volume & tracking",
      description: "A solid bar for level and a segmented bar for tracking — filled segments are blocks, empty ones are dashes.",
      html: html`
        <div class="vhs-meters">
          <p class="vhs-meter-label">Volume</p>
          <div class="vhs-meter" role="progressbar" aria-label="Volume" aria-valuenow="62" aria-valuemin="0" aria-valuemax="100"><span style="width: 62%"></span></div>
          <p class="vhs-meter-label">Tracking</p>
          <div class="vhs-segments" aria-hidden="true">
            <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
            <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
          </div>
        </div>
      `,
      css: css`
        .vhs-meters { display: grid; gap: 7px; width: min(100%, 320px); }
        .vhs-meter-label { margin: 6px 0 0; }
        .vhs-meter-label:first-child { margin-top: 0; }
        .vhs-meter { height: 17px; padding: 3px; border: 2px solid var(--vhs-ink); }
        .vhs-meter span { display: block; height: 100%; background: var(--vhs-ink); box-shadow: 0 0 8px rgba(210, 220, 255, .6); }
        .vhs-segments { display: flex; gap: 3px; height: 13px; }
        .vhs-segments i { flex: 1; background: var(--vhs-ink); box-shadow: 0 0 6px rgba(210, 220, 255, .5); }
        /* Past the set point the blocks thin out into dashes. */
        .vhs-segments i:nth-child(n + 11) { align-self: center; height: 2px; background: var(--vhs-dim); box-shadow: none; }
      `,
    },
    {
      id: "modes",
      name: "Mode selector",
      description: "Radio inputs where the checked label inverts into a solid block. Two rows: tape speed and colour system.",
      html: html`
        <div class="vhs-mode-stack">
          <div class="vhs-modes" role="radiogroup" aria-label="Tape speed">
            <label><input type="radio" name="vhs-speed" checked><span>SP</span></label>
            <label><input type="radio" name="vhs-speed"><span>EP</span></label>
            <label><input type="radio" name="vhs-speed"><span>SLP</span></label>
          </div>
          <div class="vhs-modes" role="radiogroup" aria-label="Colour system">
            <label><input type="radio" name="vhs-system" checked><span>Auto</span></label>
            <label><input type="radio" name="vhs-system"><span>PAL</span></label>
            <label><input type="radio" name="vhs-system"><span>Secam</span></label>
            <label><input type="radio" name="vhs-system"><span>NTSC</span></label>
          </div>
        </div>
      `,
      css: css`
        .vhs-mode-stack { display: grid; gap: 12px; }
        .vhs-modes { display: flex; flex-wrap: wrap; gap: 12px; }
        .vhs-modes input { position: absolute; opacity: 0; pointer-events: none; }
        .vhs-modes span { display: block; padding: 4px 9px; border: 2px solid transparent; cursor: pointer; }
        .vhs-modes input:checked + span { border-color: var(--vhs-ink); background: var(--vhs-ink); color: var(--vhs-deep); text-shadow: none; }
        .vhs-modes input:focus-visible + span { border-color: var(--vhs-ink); }
      `,
    },
    {
      id: "transport",
      name: "Transport & record",
      description: "Glyph buttons drawn with clip-path, plus a PLAY readout and a record dot that blinks once a second.",
      html: html`
        <div class="vhs-transport">
          <div class="vhs-keys" role="toolbar" aria-label="Transport">
            <button class="vhs-key" aria-label="Rewind"><i class="vhs-gl vhs-gl--rew"></i></button>
            <button class="vhs-key" aria-label="Play"><i class="vhs-gl vhs-gl--play"></i></button>
            <button class="vhs-key" aria-label="Pause"><i class="vhs-gl vhs-gl--pause"></i></button>
            <button class="vhs-key" aria-label="Stop"><i class="vhs-gl vhs-gl--stop"></i></button>
            <button class="vhs-key" aria-label="Fast forward"><i class="vhs-gl vhs-gl--ff"></i></button>
          </div>
          <p class="vhs-state"><b class="vhs-rec" aria-hidden="true"></b>Rec 11:35 PM</p>
        </div>
      `,
      css: css`
        .vhs-transport { display: grid; gap: 12px; width: min(100%, 360px); }
        .vhs-keys { display: flex; gap: 8px; }
        .vhs-key { display: grid; place-items: center; width: 38px; height: 32px; padding: 0; border: 2px solid var(--vhs-ink); background: transparent; }
        .vhs-key:hover, .vhs-key:focus-visible { background: var(--vhs-ink); outline: none; }
        .vhs-key:hover .vhs-gl, .vhs-key:focus-visible .vhs-gl { background: var(--vhs-deep); }
        .vhs-key:active { translate: 0 1px; }
        .vhs-gl { width: 14px; height: 14px; background: var(--vhs-ink); }
        .vhs-gl--play { clip-path: polygon(10% 0, 100% 50%, 10% 100%); }
        .vhs-gl--stop { clip-path: inset(10%); }
        .vhs-gl--pause { clip-path: polygon(8% 5%, 40% 5%, 40% 95%, 8% 95%, 8% 5%, 60% 5%, 92% 5%, 92% 95%, 60% 95%, 60% 5%); }
        .vhs-gl--ff { clip-path: polygon(0 5%, 48% 50%, 0 95%, 0 5%, 52% 5%, 100% 50%, 52% 95%); }
        .vhs-gl--rew { clip-path: polygon(100% 5%, 52% 50%, 100% 95%, 100% 5%, 48% 5%, 0 50%, 48% 95%); }
        .vhs-state { display: flex; gap: 9px; align-items: center; margin: 0; }
        .vhs-rec { width: 11px; height: 11px; border-radius: 50%; background: var(--vhs-rec); box-shadow: 0 0 9px rgba(255, 45, 58, .9); }
        @media (prefers-reduced-motion: no-preference) {
          .vhs-rec { animation: vhs-blink 1s steps(1, end) infinite; }
        }
        @keyframes vhs-blink { 50% { opacity: 0; } }
      `,
    },
    {
      id: "tape",
      name: "Tape scrubber",
      description: "Begin-to-end track with tick marks and a triangular head marker, timecode floating above it.",
      html: html`
        <div class="vhs-tape">
          <p class="vhs-timecode"><b>0:22:37</b><i>SP</i></p>
          <div class="vhs-track">
            <span class="vhs-head" style="left: 46%" aria-hidden="true"></span>
            <span class="vhs-fill" style="width: 46%"></span>
          </div>
          <p class="vhs-ends"><span>Begin</span><span>End</span></p>
        </div>
      `,
      css: css`
        .vhs-tape { display: grid; gap: 8px; width: min(100%, 320px); }
        .vhs-timecode { display: flex; gap: 10px; align-items: baseline; justify-content: flex-end; margin: 0; }
        .vhs-timecode b { font-size: 24px; letter-spacing: .04em; }
        .vhs-timecode i { font-style: normal; color: var(--vhs-dim); text-shadow: none; }
        .vhs-track { position: relative; height: 18px; margin-top: 10px; border: 2px solid var(--vhs-ink); background: repeating-linear-gradient(90deg, transparent 0 calc(12.5% - 2px), var(--vhs-ink) calc(12.5% - 2px) 12.5%); }
        .vhs-fill { display: block; height: 100%; background: rgba(242, 244, 255, .3); }
        .vhs-head { position: absolute; top: -12px; width: 12px; height: 9px; translate: -50% 0; background: var(--vhs-ink); clip-path: polygon(0 0, 100% 0, 50% 100%); }
        .vhs-ends { display: flex; justify-content: space-between; margin: 0; color: var(--vhs-dim); text-shadow: none; }
      `,
    },
    {
      id: "hint",
      name: "Hint bar",
      description: "The instruction strip along the bottom, with keycaps drawn as outlined capsules.",
      html: html`
        <p class="vhs-hint">
          Select with <kbd class="vhs-kbd">&#9650;&#9660;</kbd> and <kbd class="vhs-kbd">OK</kbd><br>
          Press <kbd class="vhs-kbd">Menu</kbd> to end
        </p>
      `,
      css: css`
        .vhs-hint { width: min(100%, 340px); margin: 0; padding: 10px 12px; border-top: 2px solid var(--vhs-ink); border-bottom: 2px solid var(--vhs-ink); line-height: 1.9; }
        .vhs-kbd { padding: 2px 8px; border: 2px solid var(--vhs-ink); border-radius: 999px; font: inherit; letter-spacing: .08em; }
      `,
    },
    {
      id: "banner",
      name: "Channel banner",
      description: "The overlay that flashed on a channel change: inverted number block, station name and a signal readout.",
      html: html`
        <div class="vhs-banner">
          <b class="vhs-banner-no">12</b>
          <span class="vhs-banner-name">Late Show</span>
          <span class="vhs-banner-meta">Stereo &middot; 11:35 PM</span>
          <span class="vhs-signal" aria-label="Signal strong"><i></i><i></i><i></i><i></i></span>
        </div>
      `,
      css: css`
        .vhs-banner { display: grid; grid-template-columns: auto 1fr auto; gap: 2px 14px; align-items: center; width: min(100%, 340px); padding: 12px; border: 2px solid var(--vhs-ink); }
        .vhs-banner-no { grid-row: span 2; display: grid; place-items: center; width: 54px; height: 54px; background: var(--vhs-ink); color: var(--vhs-deep); font-size: 28px; text-shadow: none; }
        .vhs-banner-name { font-size: 19px; }
        .vhs-banner-meta { grid-column: 2; color: var(--vhs-dim); font-size: 13px; text-shadow: none; }
        .vhs-signal { grid-row: span 2; display: flex; gap: 3px; align-items: flex-end; height: 26px; }
        .vhs-signal i { width: 5px; background: var(--vhs-ink); }
        .vhs-signal i:nth-child(1) { height: 30%; }
        .vhs-signal i:nth-child(2) { height: 55%; }
        .vhs-signal i:nth-child(3) { height: 80%; }
        .vhs-signal i:nth-child(4) { height: 100%; background: var(--vhs-dim); }
      `,
    },
  ],
};
