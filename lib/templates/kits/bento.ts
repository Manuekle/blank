import { css, html, type TemplateKit } from "../types";

/** Fractal noise as a data URI — the grain every dark surface in this kit sits under. */
const GRAIN =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const bento: TemplateKit = {
  id: "bento-saas",
  name: "Bento SaaS",
  period: "2017 – 2024",
  tagline: "Glass tiles lit by a prism, dusted with grain.",
  description:
    "Nothing here is a solid fill. Surfaces are translucent glass over a near-black ground, edges are a one-pixel gradient rather than a border, colour arrives as light — a bloom, a beam, a spill — and a layer of fractal grain sits over all of it so the gradients never band.",
  context:
    "Design tokens, dark mode and component libraries turned the interface into a system, so the personality moved into the lighting. Layout went to tiled bento grids, type went tight and two-tone, and the only chrome left was the glow.",
  tags: ["Glass", "Bloom", "Grain"],
  root: "bn",
  palette: [
    { name: "Void", value: "#08080b" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Cyan", value: "#22d3ee" },
    { name: "Amber", value: "#fbbf24" },
    { name: "Haze", value: "#a1a1aa" },
  ],
  fonts: "Inter / Geist — 600 weight, −0.045em tracking on anything large",
  baseCss: css`
    .bn {
      --bn-void: #08080b;
      --bn-text: #fafafa;
      --bn-haze: #8f8f99;
      --bn-violet: #8b5cf6;
      --bn-cyan: #22d3ee;
      --bn-amber: #fbbf24;
      /* Glass is one recipe: a translucent fill, a blur, and a gradient edge
         that is brighter where the light lands. */
      --bn-fill: rgba(255, 255, 255, .045);
      --bn-blur: blur(18px) saturate(1.5);
      --bn-edge: linear-gradient(145deg, rgba(255, 255, 255, .3), rgba(255, 255, 255, .03) 42%, rgba(255, 255, 255, .14));
      --bn-lift: 0 1px 0 0 rgba(255, 255, 255, .07) inset, 0 20px 50px -24px rgba(0, 0, 0, .9);
      --bn-spectrum: linear-gradient(100deg, #8b5cf6, #22d3ee 38%, #4ade80 56%, #fbbf24 74%, #fb7185);
      --bn-grain: ${GRAIN};
      position: relative;
      isolation: isolate;
      background:
        radial-gradient(70% 55% at 50% -12%, rgba(139, 92, 246, .3), transparent 68%),
        radial-gradient(45% 40% at 88% 8%, rgba(34, 211, 238, .16), transparent 70%),
        var(--bn-void);
      color: var(--bn-text);
      font: 14px/1.55 Inter, Geist, system-ui, sans-serif;
      font-feature-settings: "cv11", "ss01";
      letter-spacing: -.01em;
    }
    /* Grain over everything, under nothing. Screen blend keeps it a dusting
       rather than a grey film. */
    .bn::after {
      position: absolute;
      content: "";
      inset: 0;
      z-index: 2;
      background: var(--bn-grain);
      mix-blend-mode: screen;
      opacity: .07;
      pointer-events: none;
    }
    .bn-glass {
      position: relative;
      border: 1px solid transparent;
      background: linear-gradient(var(--bn-fill), var(--bn-fill)) padding-box, var(--bn-edge) border-box;
      backdrop-filter: var(--bn-blur);
      -webkit-backdrop-filter: var(--bn-blur);
      box-shadow: var(--bn-lift);
    }
    .bn-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `,
  showcase: html`
    <div style="display: grid; gap: 18px; justify-items: center; padding: 8px 0">
      <a class="bn-pill bn-glass" href="#"><i class="bn-pill-dot" aria-hidden="true"></i>Agents are here<span aria-hidden="true">&#8594;</span></a>
      <h3 class="bn-display">Ship faster,<br><span>think less</span></h3>
      <div class="bn-row"><button class="bn-btn bn-btn--primary">Get started</button><button class="bn-btn bn-glass">Book a demo</button></div>
    </div>
  `,
  components: [
    {
      id: "display",
      name: "Display type & pill",
      description: "The two-tone headline the era ran on: 600 weight at −0.045em, the second clause dropped to haze. The pill above it is glass with a glowing dot.",
      html: html`
        <div class="bn-hero">
          <a class="bn-pill bn-glass" href="#"><i class="bn-pill-dot" aria-hidden="true"></i>Agents are here<span aria-hidden="true">&#8594;</span></a>
          <h2 class="bn-display">Stay focused,<br><span>get more done</span></h2>
          <p class="bn-lede">One workspace for the work, the context and the people doing it.</p>
        </div>
      `,
      css: css`
        .bn-hero { display: grid; gap: 18px; justify-items: center; width: min(100%, 460px); text-align: center; }
        .bn-pill { display: inline-flex; gap: 9px; align-items: center; padding: 6px 14px 6px 11px; border-radius: 999px; color: var(--bn-text); font-size: 12.5px; text-decoration: none; }
        .bn-pill span { color: var(--bn-haze); transition: translate .2s var(--bn-ease, ease); }
        .bn-pill:hover span { translate: 3px 0; }
        .bn-pill-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--bn-cyan); box-shadow: 0 0 10px 1px rgba(34, 211, 238, .9); }
        .bn-display { margin: 0; font-size: clamp(34px, 6vw, 46px); font-weight: 600; letter-spacing: -.045em; line-height: 1.02; }
        /* The fade is the whole trick: same size, same weight, less light. */
        .bn-display span { color: var(--bn-haze); }
        .bn-lede { max-width: 340px; margin: 0; color: var(--bn-haze); font-size: 14px; }
      `,
    },
    {
      id: "buttons",
      name: "Buttons",
      description: "A white primary that casts its own light, a glass secondary, and a spectrum-edge variant where the border is the only colour.",
      html: html`
        <div class="bn-row">
          <button class="bn-btn bn-btn--primary">Get started</button>
          <button class="bn-btn bn-glass">Documentation</button>
          <button class="bn-btn bn-btn--spectrum">Upgrade <span aria-hidden="true">&#10022;</span></button>
        </div>
      `,
      css: css`
        .bn-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: center; }
        .bn-btn { display: inline-flex; gap: 7px; align-items: center; height: 40px; padding: 0 18px; border: 1px solid transparent; border-radius: 12px; color: var(--bn-text); font: 500 14px Inter, system-ui, sans-serif; transition: scale .12s ease, box-shadow .25s ease, filter .25s ease; }
        .bn-btn:active { scale: .975; }
        .bn-btn:focus-visible { outline: 2px solid var(--bn-cyan); outline-offset: 3px; }
        .bn-btn.bn-glass:hover { filter: brightness(1.5); }
        /* The primary is a light source: a white face with a bloom under it. */
        .bn-btn--primary { background: linear-gradient(#ffffff, #d7d7de); color: #0a0a0d; box-shadow: 0 0 0 1px rgba(255, 255, 255, .5), 0 8px 28px -8px rgba(255, 255, 255, .45), inset 0 1px 0 #fff; }
        .bn-btn--primary:hover { box-shadow: 0 0 0 1px rgba(255, 255, 255, .6), 0 10px 38px -8px rgba(255, 255, 255, .6), inset 0 1px 0 #fff; }
        .bn-btn--spectrum { background: linear-gradient(#141419, #0d0d11) padding-box, var(--bn-spectrum) border-box; }
        .bn-btn--spectrum span { background: var(--bn-spectrum); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .bn-btn--spectrum:hover { box-shadow: 0 0 30px -6px rgba(139, 92, 246, .65); }
      `,
    },
    {
      id: "bento",
      name: "Bento grid",
      description: "Four glass cells on a 2×2 with one double-wide. Each carries its own light source, so the grid reads as depth instead of a table.",
      html: html`
        <div class="bn-bento">
          <article class="bn-cell bn-glass bn-cell--wide" style="--bn-light: var(--bn-violet)">
            <span class="bn-cell-spark" aria-hidden="true"></span>
            <h3>Context that follows you</h3>
            <p>Every thread, doc and decision, attached to the work it belongs to.</p>
          </article>
          <article class="bn-cell bn-glass" style="--bn-light: var(--bn-cyan)">
            <span class="bn-cell-spark" aria-hidden="true"></span>
            <b class="bn-cell-metric">40<i>ms</i></b>
            <p>Median response, everywhere.</p>
          </article>
          <article class="bn-cell bn-glass" style="--bn-light: var(--bn-amber)">
            <span class="bn-cell-spark" aria-hidden="true"></span>
            <b class="bn-cell-metric">SOC&#8202;2</b>
            <p>Audited yearly, logged forever.</p>
          </article>
        </div>
      `,
      css: css`
        .bn-bento { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; width: min(100%, 420px); }
        .bn-cell { position: relative; overflow: hidden; padding: 18px; border-radius: 18px; }
        .bn-cell--wide { grid-column: span 2; }
        /* Each cell is lit from its own top-left corner. */
        .bn-cell-spark { position: absolute; top: -40%; left: -20%; width: 90%; height: 110%; background: radial-gradient(circle at 50% 50%, var(--bn-light), transparent 62%); filter: blur(26px); opacity: .55; pointer-events: none; }
        .bn-cell > *:not(.bn-cell-spark) { position: relative; z-index: 1; }
        .bn-cell h3 { margin: 0 0 6px; font-size: 18px; font-weight: 600; letter-spacing: -.035em; }
        .bn-cell p { margin: 0; color: var(--bn-haze); font-size: 12.5px; line-height: 1.5; }
        .bn-cell-metric { display: block; margin-bottom: 4px; font-size: 30px; font-weight: 600; letter-spacing: -.05em; line-height: 1; }
        .bn-cell-metric i { font-size: 15px; font-style: normal; color: var(--bn-haze); }
      `,
    },
    {
      id: "prism",
      name: "Prism card",
      description: "A white beam enters, a spectrum leaves, and the tile it crosses picks up the spill. Two blurred gradients and a grain layer — no images.",
      html: html`
        <div class="bn-prism">
          <span class="bn-prism-ray" aria-hidden="true"><i class="bn-prism-in"></i><i class="bn-prism-out"></i></span>
          <div class="bn-prism-card bn-glass">
            <p class="bn-prism-meta"><span>1985.design</span><span>Web&#8202;3</span></p>
            <div class="bn-prism-rule" aria-hidden="true"></div>
            <p class="bn-prism-foot"><span>Multichain transaction</span><b>N7</b></p>
          </div>
        </div>
      `,
      css: css`
        .bn-prism { position: relative; display: grid; place-items: center; width: min(100%, 380px); aspect-ratio: 1; overflow: hidden; border-radius: 20px; background: radial-gradient(120% 100% at 26% 92%, #17171e, #050507 68%); }
        /* One rotated rail holds both halves, so the beam that goes in and the
           spectrum that comes out are guaranteed collinear through the tile. */
        .bn-prism-ray { position: absolute; top: 50%; left: 50%; display: flex; align-items: center; width: 220%; height: 196px; translate: -50% -50%; rotate: -37deg; pointer-events: none; }
        .bn-prism-in { position: relative; flex: 1; height: 7px; background: linear-gradient(90deg, transparent, #fff 58%, #fff); filter: blur(5px); }
        /* A wider, dimmer halo under the beam so it glows rather than just blurs. */
        .bn-prism-in::after { position: absolute; content: ""; inset: -13px 0; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .5) 62%, rgba(255, 255, 255, .6)); filter: blur(18px); }
        .bn-prism-out {
          flex: 1;
          align-self: stretch;
          /* Fans open toward the far edge, then the blur does the rest. */
          clip-path: polygon(0 45%, 100% -8%, 100% 108%, 0 55%);
          background: linear-gradient(180deg, transparent 2%, #a855f7 16%, #38bdf8 33%, #4ade80 50%, #fde047 66%, #fb923c 80%, #ef4444 93%, transparent);
          filter: blur(26px) saturate(1.5);
          mask-image: linear-gradient(90deg, transparent 2%, #000 32%);
          -webkit-mask-image: linear-gradient(90deg, transparent 2%, #000 32%);
        }
        .bn-prism-card {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 22px;
          width: 56%;
          padding: 14px;
          border-radius: 14px;
          /* Brighter on the lit side, so the tile reads as metal catching light. */
          background: linear-gradient(143deg, rgba(255, 255, 255, .34), rgba(255, 255, 255, .1) 55%, rgba(255, 255, 255, .04)) padding-box, var(--bn-edge) border-box;
          font: 400 8.5px/1.4 ui-monospace, "SF Mono", Menlo, monospace;
          letter-spacing: .08em;
          text-transform: uppercase;
        }
        /* The spill: the same spectrum, faint, riding over the tile face. */
        .bn-prism-card::before { position: absolute; content: ""; inset: 0; border-radius: inherit; background: linear-gradient(143deg, transparent 28%, rgba(168, 85, 247, .3), rgba(56, 189, 248, .3), rgba(253, 224, 71, .3), transparent 78%); mix-blend-mode: screen; pointer-events: none; }
        .bn-prism-card > * { position: relative; z-index: 1; }
        .bn-prism-meta, .bn-prism-foot { display: flex; align-items: flex-end; justify-content: space-between; margin: 0; color: rgba(12, 12, 16, .72); }
        .bn-prism-rule { height: 5px; background: repeating-linear-gradient(90deg, rgba(12, 12, 16, .5) 0 1px, transparent 1px 11px); }
        .bn-prism-foot b { color: rgba(12, 12, 16, .85); font-size: 30px; letter-spacing: -.04em; line-height: .8; }
      `,
    },
    {
      id: "stat",
      name: "Stat card",
      description: "Glass, a tight metric, and a sparkline that glows — the stroke is drawn twice, once blurred underneath.",
      html: html`
        <div class="bn-stat bn-glass">
          <p class="bn-stat-label">Monthly recurring revenue</p>
          <p class="bn-stat-value">$48,120<span class="bn-delta">+12.4%</span></p>
          <svg class="bn-spark" viewBox="0 0 120 32" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="bn-spark-glow" points="0,26 12,22 24,25 36,17 48,19 60,12 72,14 84,8 96,10 108,4 120,6" />
            <polyline points="0,26 12,22 24,25 36,17 48,19 60,12 72,14 84,8 96,10 108,4 120,6" />
          </svg>
        </div>
      `,
      css: css`
        .bn-stat { width: min(100%, 280px); padding: 18px; border-radius: 18px; }
        .bn-stat-label { margin: 0 0 8px; color: var(--bn-haze); font-size: 12.5px; }
        .bn-stat-value { display: flex; gap: 10px; align-items: baseline; margin: 0 0 16px; font-size: 30px; font-weight: 600; letter-spacing: -.05em; font-variant-numeric: tabular-nums; }
        .bn-delta { padding: 3px 8px; border-radius: 999px; background: rgba(34, 211, 238, .14); box-shadow: inset 0 0 0 1px rgba(34, 211, 238, .3); color: var(--bn-cyan); font-size: 11.5px; font-weight: 500; letter-spacing: 0; }
        .bn-spark { display: block; width: 100%; height: 36px; overflow: visible; }
        .bn-spark polyline { fill: none; stroke: #c4b5fd; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; }
        .bn-spark-glow { stroke: var(--bn-violet); stroke-width: 6; filter: blur(6px); opacity: .85; }
      `,
    },
    {
      id: "input",
      name: "Glass input",
      description: "A glass field whose focus state is a coloured bloom rather than a ring, with the shortcut hint cut into the right edge.",
      html: html`
        <label class="bn-field">
          <span class="bn-field-label">Work email</span>
          <span class="bn-input-wrap bn-glass">
            <input type="email" placeholder="you@company.com">
            <kbd>&#8984;K</kbd>
          </span>
        </label>
      `,
      css: css`
        .bn-field { display: grid; gap: 8px; width: min(100%, 320px); }
        .bn-field-label { color: var(--bn-haze); font-size: 12.5px; }
        .bn-input-wrap { display: flex; gap: 8px; align-items: center; height: 44px; padding: 0 8px 0 14px; border-radius: 12px; transition: box-shadow .3s ease; }
        .bn-input-wrap:focus-within { box-shadow: var(--bn-lift), 0 0 0 1px rgba(139, 92, 246, .55), 0 0 34px -4px rgba(139, 92, 246, .6); }
        .bn-input-wrap input { flex: 1; min-width: 0; border: 0; background: none; color: var(--bn-text); font: 14px Inter, system-ui, sans-serif; }
        .bn-input-wrap input:focus { outline: none; }
        .bn-input-wrap input::placeholder { color: #5e5e68; }
        .bn-input-wrap kbd { padding: 3px 7px; border-radius: 6px; background: rgba(255, 255, 255, .07); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .1); color: var(--bn-haze); font: 11px ui-monospace, Menlo, monospace; }
      `,
    },
    {
      id: "command",
      name: "Command palette",
      description: "Heavier blur, a spectrum hairline across the top, and an active row lit from the left instead of filled.",
      html: html`
        <div class="bn-cmd bn-glass" role="dialog" aria-label="Command palette">
          <span class="bn-cmd-seam" aria-hidden="true"></span>
          <div class="bn-cmd-search"><span aria-hidden="true">&#9906;</span><input type="text" placeholder="Type a command or search…" aria-label="Command"><kbd>Esc</kbd></div>
          <p class="bn-cmd-group">Actions</p>
          <button class="bn-cmd-row" aria-selected="true"><span aria-hidden="true">&#9733;</span>Create new project<kbd>&#8984;N</kbd></button>
          <button class="bn-cmd-row"><span aria-hidden="true">&#9729;</span>Deploy to production<kbd>&#8984;D</kbd></button>
          <button class="bn-cmd-row"><span aria-hidden="true">&#9881;</span>Open settings</button>
        </div>
      `,
      css: css`
        .bn-cmd { position: relative; width: min(100%, 340px); padding: 8px; border-radius: 16px; overflow: hidden; backdrop-filter: blur(30px) saturate(1.6); -webkit-backdrop-filter: blur(30px) saturate(1.6); }
        .bn-cmd-seam { position: absolute; top: 0; left: 12%; width: 76%; height: 1px; background: var(--bn-spectrum); opacity: .9; }
        .bn-cmd-search { display: flex; gap: 10px; align-items: center; padding: 10px 10px 12px; color: var(--bn-haze); }
        .bn-cmd-search input { flex: 1; min-width: 0; border: 0; background: none; color: var(--bn-text); font: 14px Inter, system-ui, sans-serif; }
        .bn-cmd-search input:focus { outline: none; }
        .bn-cmd-search input::placeholder { color: #5e5e68; }
        .bn-cmd-group { margin: 0 0 4px; padding: 0 10px; color: #5e5e68; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
        .bn-cmd-row { position: relative; display: flex; gap: 10px; align-items: center; width: 100%; padding: 9px 10px; border: 0; border-radius: 10px; background: none; color: var(--bn-text); font: 13.5px Inter, system-ui, sans-serif; text-align: left; }
        .bn-cmd-row kbd { margin-left: auto; color: #5e5e68; font: 11px ui-monospace, Menlo, monospace; }
        .bn-cmd-row > span:first-child { color: var(--bn-haze); }
        /* Selection is a spill of light from the leading edge, not a block. */
        .bn-cmd-row[aria-selected="true"] { background: linear-gradient(90deg, rgba(139, 92, 246, .32), rgba(139, 92, 246, .02)); box-shadow: inset 1px 0 0 var(--bn-violet); }
        .bn-cmd-row:hover:not([aria-selected="true"]) { background: rgba(255, 255, 255, .05); }
        .bn-cmd-row:focus-visible { outline: 1px solid var(--bn-cyan); outline-offset: -1px; }
      `,
    },
    {
      id: "table",
      name: "Status table",
      description: "Hairline rows on glass, tabular figures, and a status dot that carries its own halo in one custom property.",
      html: html`
        <table class="bn-table">
          <thead><tr><th scope="col">Deployment</th><th scope="col">Status</th><th scope="col">Duration</th></tr></thead>
          <tbody>
            <tr><td>main@4f2a1c</td><td><span class="bn-status" style="--bn-dot: #4ade80">Ready</span></td><td>42s</td></tr>
            <tr><td>fix/auth@9b7e0d</td><td><span class="bn-status" style="--bn-dot: #22d3ee">Building</span></td><td>18s</td></tr>
            <tr><td>main@1c8de4</td><td><span class="bn-status" style="--bn-dot: #fb7185">Failed</span></td><td>7s</td></tr>
          </tbody>
        </table>
      `,
      css: css`
        .bn-table { width: min(100%, 380px); border-collapse: collapse; font-size: 13px; }
        .bn-table th { padding: 0 0 10px; color: #5e5e68; font-size: 11px; font-weight: 500; letter-spacing: .06em; text-align: left; text-transform: uppercase; }
        .bn-table td { padding: 12px 0; border-top: 1px solid rgba(255, 255, 255, .07); }
        .bn-table td:first-child { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 12px; }
        .bn-table td:last-child { color: var(--bn-haze); text-align: right; font-variant-numeric: tabular-nums; }
        .bn-status { display: inline-flex; gap: 8px; align-items: center; color: var(--bn-haze); }
        .bn-status::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--bn-dot); box-shadow: 0 0 8px 1px var(--bn-dot); }
      `,
    },
    {
      id: "toast",
      name: "Toast",
      description: "Glass slab that slides up from below, lit green from the icon outward.",
      html: html`
        <div class="bn-toast bn-glass" role="status">
          <span class="bn-toast-icon" aria-hidden="true">&#10003;</span>
          <span class="bn-toast-body"><b>Deployed to production</b>main@4f2a1c &middot; 42 seconds</span>
          <button class="bn-toast-x" aria-label="Dismiss">&#10005;</button>
        </div>
      `,
      css: css`
        .bn-toast { display: flex; gap: 12px; align-items: center; width: min(100%, 340px); padding: 12px 14px; border-radius: 14px; }
        .bn-toast-icon { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: rgba(74, 222, 128, .16); box-shadow: inset 0 0 0 1px rgba(74, 222, 128, .35), 0 0 22px -2px rgba(74, 222, 128, .55); color: #4ade80; font-size: 13px; }
        .bn-toast-body { display: grid; gap: 1px; min-width: 0; color: var(--bn-haze); font-size: 12px; }
        .bn-toast-body b { color: var(--bn-text); font-size: 13.5px; font-weight: 500; }
        .bn-toast-x { margin-left: auto; padding: 4px; border: 0; background: none; color: #5e5e68; font-size: 11px; }
        .bn-toast-x:hover { color: var(--bn-text); }
        @media (prefers-reduced-motion: no-preference) {
          .bn-toast { animation: bn-rise .5s cubic-bezier(.2, .9, .2, 1) both; }
        }
        @keyframes bn-rise { from { opacity: 0; translate: 0 14px; filter: blur(6px); } }
      `,
    },
  ],
};
