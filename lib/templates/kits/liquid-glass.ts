import { css, html, type TemplateKit } from "../types";

export const liquidGlass: TemplateKit = {
  id: "liquid-glass",
  name: "Liquid Glass",
  period: "2025 – now",
  tagline: "Panels that bend the light behind them.",
  description:
    "Controls made of a material instead of a fill. Each surface blurs and over-saturates what sits behind it, catches a bright specular rim on the top edge, and lets colour bleed through from underneath.",
  context:
    "GPUs can refract in real time now, so glass stopped being a blur filter and became a material. Panels bend the content behind them, pick up its colour, and specular edges track the light.",
  tags: ["Glass", "Refraction", "Depth"],
  root: "lg",
  palette: [
    { name: "Ground", value: "#d7dade" },
    { name: "Ink", value: "#111318" },
    { name: "Rim", value: "#ffffff" },
    { name: "Active", value: "#12b750" },
    { name: "Tint", value: "#4d7cfe" },
  ],
  fonts: "\"SF Pro Display\", Inter, system-ui — tight, heavy",
  baseCss: css`
    .lg {
      --lg-ink: #111318;
      --lg-muted: #6b7078;
      --lg-active: #12b750;
      --lg-tint: #4d7cfe;
      /* The material: a blur over whatever is behind, pushed warmer and more saturated. */
      --lg-blur: blur(14px) saturate(1.8);
      --lg-fill: rgba(255, 255, 255, .42);
      /* Rim light on top, bounce light underneath, and a soft cast shadow. */
      --lg-rim:
        inset 0 1.5px 1px -0.5px rgba(255, 255, 255, .95),
        inset 0 -1.5px 1px -0.5px rgba(255, 255, 255, .55),
        inset 1.5px 0 1px -1px rgba(255, 255, 255, .6),
        inset -1.5px 0 1px -1px rgba(255, 255, 255, .6);
      --lg-lift: 0 1px 1px rgba(16, 20, 28, .06), 0 6px 16px -6px rgba(16, 20, 28, .22);
      background:
        linear-gradient(120deg, rgba(255, 255, 255, .5), transparent 40%),
        linear-gradient(0deg, rgba(120, 130, 150, .18) 0 1px, transparent 1px 88px),
        linear-gradient(90deg, rgba(120, 130, 150, .18) 0 1px, transparent 1px 88px),
        linear-gradient(160deg, #e6e8ec, #cdd2d8 60%, #d9dde2);
      color: var(--lg-ink);
      font: 15px/1.4 "SF Pro Display", "SF Pro Text", Inter, system-ui, sans-serif;
      letter-spacing: -.015em;
    }
    /* Every glass surface shares one recipe; only the radius changes. */
    .lg-glass {
      position: relative;
      background: var(--lg-fill);
      backdrop-filter: var(--lg-blur);
      -webkit-backdrop-filter: var(--lg-blur);
      box-shadow: var(--lg-rim), var(--lg-lift);
    }
    /* Refraction: a bright sweep across the top third of the surface. */
    .lg-glass::before {
      position: absolute;
      content: "";
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(150deg, rgba(255, 255, 255, .55), rgba(255, 255, 255, .06) 42%, transparent 60%);
      pointer-events: none;
    }
    .lg-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  `,
  showcase: html`
    <div style="display: grid; gap: 16px; justify-items: center">
      <div class="lg-row">
        <button class="lg-glass lg-btn"><span class="lg-chevron" aria-hidden="true"></span>Back</button>
        <button class="lg-glass lg-icon-btn" aria-label="Add"><span class="lg-plus" aria-hidden="true"></span></button>
      </div>
      <label class="lg-toggle">
        <input type="checkbox" checked>
        <span class="lg-toggle-bleed" aria-hidden="true"></span>
        <span class="lg-glass lg-toggle-track" aria-hidden="true"><i></i></span>
        <span class="lg-sr">Focus mode</span>
      </label>
    </div>
  `,
  components: [
    {
      id: "buttons",
      name: "Glass buttons",
      description: "Pill and circle cut from the same material. Pressing one squeezes the glass rather than darkening it.",
      html: html`
        <div class="lg-row">
          <button class="lg-glass lg-btn"><span class="lg-chevron" aria-hidden="true"></span>Back</button>
          <button class="lg-glass lg-btn lg-btn--tinted">Continue</button>
          <button class="lg-glass lg-icon-btn" aria-label="Add"><span class="lg-plus" aria-hidden="true"></span></button>
          <button class="lg-glass lg-btn" disabled>Unavailable</button>
        </div>
      `,
      css: css`
        .lg-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
        .lg-btn {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          min-height: 46px;
          padding: 0 24px;
          border: 0;
          border-radius: 23px;
          color: var(--lg-ink);
          font: 600 17px/1 "SF Pro Display", Inter, system-ui, sans-serif;
          letter-spacing: -.02em;
          transition: scale .22s cubic-bezier(.2, .8, .2, 1), box-shadow .22s ease;
        }
        .lg-icon-btn { display: inline-grid; place-items: center; width: 46px; height: 46px; padding: 0; border: 0; border-radius: 50%; color: var(--lg-ink); transition: scale .22s cubic-bezier(.2, .8, .2, 1); }
        .lg-btn--tinted { background: color-mix(in oklab, var(--lg-tint) 26%, rgba(255, 255, 255, .42)); }
        .lg-btn:active:not(:disabled), .lg-icon-btn:active { scale: .96; }
        .lg-btn:focus-visible, .lg-icon-btn:focus-visible { outline: 2px solid var(--lg-tint); outline-offset: 3px; }
        .lg-btn:disabled { color: var(--lg-muted); box-shadow: var(--lg-rim); }
        /* Chevron and plus drawn from borders so they inherit the text colour. */
        .lg-chevron { width: 9px; height: 9px; border-left: 2.5px solid currentColor; border-bottom: 2.5px solid currentColor; border-radius: 1px; rotate: 45deg; translate: 2px 0; }
        .lg-plus { position: relative; width: 17px; height: 2.5px; border-radius: 2px; background: currentColor; }
        .lg-plus::after { position: absolute; content: ""; inset: 0; border-radius: 2px; background: currentColor; rotate: 90deg; }
      `,
    },
    {
      id: "toggle",
      name: "Refracting toggle",
      description: "The green knob sits under the glass, not on it — the track blurs it, so the colour bleeds past the edge.",
      html: html`
        <div class="lg-stack">
          <label class="lg-toggle">
            <input type="checkbox" checked>
            <span class="lg-toggle-bleed" aria-hidden="true"></span>
            <span class="lg-glass lg-toggle-track" aria-hidden="true"><i></i></span>
            <span class="lg-toggle-label">Focus mode</span>
          </label>
          <label class="lg-toggle">
            <input type="checkbox">
            <span class="lg-toggle-bleed" aria-hidden="true"></span>
            <span class="lg-glass lg-toggle-track" aria-hidden="true"><i></i></span>
            <span class="lg-toggle-label">Low power</span>
          </label>
        </div>
      `,
      css: css`
        .lg-stack { display: grid; gap: 14px; }
        .lg-toggle { position: relative; display: inline-flex; gap: 14px; align-items: center; cursor: pointer; }
        .lg-toggle input { position: absolute; width: 74px; height: 42px; margin: 0; opacity: 0; cursor: pointer; }
        /* The colour lives behind the glass and is blurred by it. */
        .lg-toggle-bleed { position: absolute; left: 4px; width: 34px; height: 34px; border-radius: 50%; background: var(--lg-active); filter: blur(1px); opacity: 0; translate: 0 0; transition: translate .34s cubic-bezier(.2, .9, .2, 1), opacity .2s ease; }
        .lg-toggle input:checked ~ .lg-toggle-bleed { opacity: 1; translate: 6px 0; }
        .lg-toggle-track { display: flex; align-items: center; width: 74px; height: 42px; border-radius: 21px; }
        .lg-toggle-track i { width: 34px; height: 34px; margin-left: 4px; border-radius: 50%; background: rgba(255, 255, 255, .78); box-shadow: 0 1px 3px rgba(16, 20, 28, .28), inset 0 1px 1px rgba(255, 255, 255, .9); transition: translate .34s cubic-bezier(.2, .9, .2, 1); }
        .lg-toggle input:checked ~ .lg-toggle-track i { translate: 32px 0; }
        .lg-toggle-label { font-weight: 600; }
        .lg-toggle input:focus-visible ~ .lg-toggle-track { outline: 2px solid var(--lg-tint); outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) {
          .lg-toggle-bleed, .lg-toggle-track i { transition: none; }
        }
      `,
    },
    {
      id: "bar",
      name: "Floating tab bar",
      description: "One glass capsule over the content, with a smaller capsule sliding behind the selected tab.",
      html: html`
        <nav class="lg-glass lg-bar" aria-label="Sections">
          <span class="lg-bar-pill" aria-hidden="true"></span>
          <a href="#" aria-current="page">Today</a>
          <a href="#">Library</a>
          <a href="#">Search</a>
        </nav>
      `,
      css: css`
        .lg-bar { position: relative; display: inline-flex; gap: 2px; padding: 5px; border-radius: 27px; }
        .lg-bar a { position: relative; z-index: 1; padding: 11px 22px; border-radius: 22px; color: var(--lg-muted); font-weight: 600; text-decoration: none; transition: color .2s ease; }
        .lg-bar a[aria-current="page"] { color: var(--lg-ink); }
        .lg-bar a:hover { color: var(--lg-ink); }
        /* Sized to the first tab; move it with translate when the selection changes. */
        .lg-bar-pill { position: absolute; top: 5px; bottom: 5px; left: 5px; width: 86px; border-radius: 22px; background: rgba(255, 255, 255, .72); box-shadow: 0 1px 3px rgba(16, 20, 28, .18), inset 0 1px 1px rgba(255, 255, 255, .95); transition: translate .3s cubic-bezier(.2, .8, .2, 1), width .3s cubic-bezier(.2, .8, .2, 1); }
      `,
    },
    {
      id: "panel",
      name: "Glass panel",
      description: "A card that reads the ground through itself. The header row keeps a heavier rim so it stays legible.",
      html: html`
        <section class="lg-glass lg-panel" aria-labelledby="lg-panel-title">
          <header>
            <h3 id="lg-panel-title">Now playing</h3>
            <button class="lg-glass lg-icon-btn lg-icon-btn--sm" aria-label="Close"><span class="lg-close" aria-hidden="true"></span></button>
          </header>
          <p class="lg-panel-lede">Blurred, saturated and lit from the top edge. Nothing here is a solid fill.</p>
          <div class="lg-meter" role="progressbar" aria-valuenow="42" aria-valuemin="0" aria-valuemax="100"><span style="width: 42%"></span></div>
        </section>
      `,
      css: css`
        .lg-panel { width: min(100%, 320px); padding: 20px; border-radius: 26px; }
        .lg-panel > * { position: relative; z-index: 1; }
        .lg-panel header { display: flex; gap: 12px; align-items: center; justify-content: space-between; }
        .lg-panel h3 { margin: 0; font-size: 21px; font-weight: 700; letter-spacing: -.03em; }
        .lg-panel-lede { margin: 10px 0 18px; color: var(--lg-muted); font-size: 14px; line-height: 1.5; }
        .lg-icon-btn--sm { width: 32px; height: 32px; }
        .lg-close { position: relative; width: 13px; height: 2.2px; border-radius: 2px; background: currentColor; rotate: 45deg; }
        .lg-close::after { position: absolute; content: ""; inset: 0; border-radius: 2px; background: currentColor; rotate: 90deg; }
        .lg-meter { height: 10px; overflow: hidden; border-radius: 5px; background: rgba(16, 20, 28, .12); box-shadow: inset 0 1px 2px rgba(16, 20, 28, .18); }
        .lg-meter span { display: block; height: 100%; border-radius: 5px; background: linear-gradient(90deg, var(--lg-tint), color-mix(in oklab, var(--lg-tint) 60%, #fff)); }
      `,
    },
    {
      id: "segmented",
      name: "Segmented control",
      description: "Radio inputs under one glass shell. The selected segment is the only opaque thing in the kit.",
      html: html`
        <div class="lg-glass lg-seg" role="radiogroup" aria-label="Scale">
          <label><input type="radio" name="lg-scale" checked><span>Day</span></label>
          <label><input type="radio" name="lg-scale"><span>Week</span></label>
          <label><input type="radio" name="lg-scale"><span>Month</span></label>
        </div>
      `,
      css: css`
        .lg-seg { display: inline-flex; padding: 4px; border-radius: 21px; }
        .lg-seg label { position: relative; z-index: 1; }
        .lg-seg input { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: pointer; }
        .lg-seg span { display: block; padding: 9px 20px; border-radius: 17px; color: var(--lg-muted); font-weight: 600; transition: background .22s ease, color .22s ease; }
        .lg-seg input:checked + span { background: rgba(255, 255, 255, .78); box-shadow: 0 1px 3px rgba(16, 20, 28, .18), inset 0 1px 1px rgba(255, 255, 255, .95); color: var(--lg-ink); }
        .lg-seg input:focus-visible + span { outline: 2px solid var(--lg-tint); outline-offset: 2px; }
      `,
    },
    {
      id: "slider",
      name: "Glass slider",
      description: "Native range input. The track is frosted, the thumb is a lens with a bright rim.",
      html: html`
        <label class="lg-slider">
          <span class="lg-slider-label">Brightness</span>
          <input type="range" min="0" max="100" value="68">
        </label>
      `,
      css: css`
        .lg-slider { display: grid; gap: 10px; width: min(100%, 300px); }
        .lg-slider-label { color: var(--lg-muted); font-size: 13px; font-weight: 600; }
        .lg-slider input { width: 100%; height: 34px; margin: 0; appearance: none; background: transparent; }
        .lg-slider input::-webkit-slider-runnable-track { height: 34px; border-radius: 17px; background: rgba(255, 255, 255, .42); backdrop-filter: var(--lg-blur); -webkit-backdrop-filter: var(--lg-blur); box-shadow: var(--lg-rim), var(--lg-lift); }
        .lg-slider input::-moz-range-track { height: 34px; border-radius: 17px; background: rgba(255, 255, 255, .42); box-shadow: var(--lg-rim), var(--lg-lift); }
        .lg-slider input::-webkit-slider-thumb { width: 26px; height: 26px; margin-top: 4px; appearance: none; border-radius: 50%; background: radial-gradient(circle at 50% 28%, #fff, rgba(255, 255, 255, .7)); box-shadow: 0 1px 4px rgba(16, 20, 28, .35), inset 0 1px 1px rgba(255, 255, 255, .95); }
        .lg-slider input::-moz-range-thumb { width: 26px; height: 26px; border: 0; border-radius: 50%; background: radial-gradient(circle at 50% 28%, #fff, rgba(255, 255, 255, .7)); box-shadow: 0 1px 4px rgba(16, 20, 28, .35); }
        .lg-slider input:focus-visible { outline: 2px solid var(--lg-tint); outline-offset: 3px; border-radius: 17px; }
      `,
    },
    {
      id: "alert",
      name: "Alert sheet",
      description: "Stacked glass: a dimmed scrim, a panel on top of it, and hairline-split actions.",
      html: html`
        <div class="lg-scrim">
          <div class="lg-glass lg-sheet" role="alertdialog" aria-labelledby="lg-sheet-title">
            <div class="lg-sheet-body">
              <h3 id="lg-sheet-title">Delete this draft?</h3>
              <p>It will be removed from every device signed in to this account.</p>
            </div>
            <div class="lg-sheet-actions">
              <button>Keep</button>
              <button class="lg-sheet-danger">Delete</button>
            </div>
          </div>
        </div>
      `,
      css: css`
        .lg-scrim { display: grid; place-items: center; width: min(100%, 360px); padding: 30px 20px; border-radius: 30px; background: linear-gradient(140deg, #7f8b9c, #b9c0ca 55%, #8d97a6); }
        .lg-sheet { width: min(100%, 290px); overflow: hidden; border-radius: 24px; text-align: center; }
        .lg-sheet > * { position: relative; z-index: 1; }
        .lg-sheet-body { padding: 20px 20px 18px; }
        .lg-sheet h3 { margin: 0 0 6px; font-size: 18px; font-weight: 700; letter-spacing: -.02em; }
        .lg-sheet p { margin: 0; color: var(--lg-muted); font-size: 13.5px; line-height: 1.45; }
        .lg-sheet-actions { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid rgba(16, 20, 28, .14); }
        .lg-sheet-actions button { padding: 15px 0; border: 0; background: transparent; color: var(--lg-ink); font: 600 16px "SF Pro Display", Inter, system-ui, sans-serif; }
        .lg-sheet-actions button + button { border-left: 1px solid rgba(16, 20, 28, .14); }
        .lg-sheet-actions button:hover { background: rgba(255, 255, 255, .35); }
        .lg-sheet-actions .lg-sheet-danger { color: #d1321f; }
      `,
    },
  ],
};
