import { css, html, type TemplateKit } from "../types";

export const web2: TemplateKit = {
  id: "web-2-0",
  name: "Web 2.0",
  period: "2005 – 2010",
  tagline: "Glossy CTAs, beta badges and tag clouds.",
  description:
    "The startup web of the mid 2000s. Big rounded boxes, reflective gradient buttons that shout “Sign up free!”, starburst badges, diagonal stripes and a tag cloud in the sidebar.",
  context:
    "CSS3 was not ready yet, so the gloss was baked into sliced PNGs. Rounded corners, reflections and starburst badges signalled that a site was a product, not a page — and that it was free.",
  tags: ["Gloss", "Rounded", "Startup"],
  root: "w2",
  palette: [
    { name: "Lime", value: "#7ac943" },
    { name: "Orange", value: "#ff8a00" },
    { name: "Sky", value: "#3fa9f5" },
    { name: "Magenta", value: "#e0006e" },
    { name: "Ink", value: "#333333" },
  ],
  fonts: "\"Trebuchet MS\", Verdana, Arial",
  baseCss: css`
    .w2 {
      --w2-lime: #7ac943;
      --w2-lime-dark: #4e9a1f;
      --w2-orange: #ff8a00;
      --w2-sky: #3fa9f5;
      --w2-pink: #e0006e;
      background: #fff repeating-linear-gradient(-45deg, rgba(63, 169, 245, .05) 0 12px, transparent 12px 24px);
      color: #333;
      font: 14px/1.45 "Trebuchet MS", Verdana, Arial, sans-serif;
    }
  `,
  showcase: html`
    <div style="display: grid; gap: 18px; justify-items: center">
      <div class="w2-logo">snappr<span class="w2-burst"><span>beta!</span></span></div>
      <button class="w2-cta">Sign up free!</button>
      <div class="w2-tags" style="max-width: 250px"><a href="#">ajax</a> <a class="w2-tag--3" href="#">mashup</a> <a class="w2-tag--2" href="#">rss</a> <a href="#">wiki</a> <a class="w2-tag--4" href="#">social</a> <a class="w2-tag--2" href="#">folksonomy</a></div>
    </div>
  `,
  components: [
    {
      id: "cta",
      name: "Glossy CTA",
      description: "Oversized rounded button with a glass highlight across the top half.",
      html: html`
        <div class="w2-row">
          <button class="w2-cta">Sign up free!</button>
          <button class="w2-cta w2-cta--orange">Take the tour »</button>
        </div>
      `,
      css: css`
        .w2-row { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: center; }
        .w2-cta {
          position: relative;
          padding: 12px 30px;
          border: 1px solid var(--w2-lime-dark);
          border-radius: 12px;
          background: linear-gradient(#a8e46e, var(--w2-lime) 50%, #62b32b 51%, #86d64d);
          box-shadow: 0 3px 0 var(--w2-lime-dark), 0 6px 12px rgba(0, 0, 0, .2);
          color: #fff;
          font: 700 20px "Trebuchet MS", Arial, sans-serif;
          text-shadow: 0 -1px 0 rgba(0, 0, 0, .3);
        }
        .w2-cta::after { position: absolute; content: ""; inset: 2px 6px 52%; border-radius: 10px 10px 30px 30px / 10px 10px 8px 8px; background: linear-gradient(rgba(255, 255, 255, .75), rgba(255, 255, 255, .1)); pointer-events: none; }
        .w2-cta--orange { border-color: #c75f00; background: linear-gradient(#ffc266, var(--w2-orange) 50%, #f07400 51%, #ffa12e); box-shadow: 0 3px 0 #c75f00, 0 6px 12px rgba(0, 0, 0, .2); }
        .w2-cta:hover { filter: brightness(1.06); }
        .w2-cta:active { translate: 0 2px; box-shadow: 0 1px 0 var(--w2-lime-dark); }
        .w2-cta:focus-visible { outline: 3px dashed var(--w2-sky); outline-offset: 4px; }
      `,
    },
    {
      id: "signup",
      name: "Signup box",
      description: "Chunky rounded inputs with a yellow focus glow and a big green button.",
      html: html`
        <div class="w2-signup">
          <h3>Join 2,000,000 happy users</h3>
          <input class="w2-input" type="text" placeholder="Pick a username" aria-label="Username">
          <input class="w2-input" type="email" placeholder="Your email" aria-label="Email">
          <button class="w2-cta" type="button">Create my account</button>
        </div>
      `,
      css: css`
        .w2-signup { display: grid; gap: 10px; width: min(100%, 320px); padding: 18px; border: 2px solid #ffd24d; border-radius: 16px; background: linear-gradient(#fffbe6, #fff3b8); }
        .w2-signup h3 { margin: 0 0 4px; color: #b36200; font-size: 18px; text-align: center; }
        .w2-input { padding: 10px 12px; border: 2px solid #ccc; border-radius: 8px; background: #fff; color: #333; font: 16px "Trebuchet MS", Arial, sans-serif; }
        .w2-input:focus { outline: none; border-color: #f5b800; box-shadow: 0 0 8px rgba(255, 200, 0, .8); }
        .w2-signup .w2-cta { font-size: 17px; }
      `,
    },
    {
      id: "nav",
      name: "Glossy nav tabs",
      description: "Rounded top tabs with a shine and an active tab that joins the page.",
      html: html`
        <nav class="w2-nav" aria-label="Main">
          <a href="#" aria-current="page">Home</a>
          <a href="#">Explore</a>
          <a href="#">Groups</a>
          <a href="#">Blog</a>
        </nav>
      `,
      css: css`
        .w2-nav { display: flex; gap: 4px; padding: 0 12px; border-bottom: 4px solid var(--w2-sky); }
        .w2-nav a { padding: 8px 16px 6px; border: 1px solid #9ccde9; border-bottom: 0; border-radius: 10px 10px 0 0; background: linear-gradient(#fff, #e3f1fa 50%, #d3e9f7 51%, #eef7fd); color: #1c6ea8; font-weight: 700; text-decoration: none; }
        .w2-nav a:hover { background: linear-gradient(#fff, #cfe8f8); }
        .w2-nav a[aria-current="page"] { border-color: var(--w2-sky); background: linear-gradient(#8fd0fb, var(--w2-sky) 50%, #1f95ea 51%, #54b5f7); color: #fff; text-shadow: 0 -1px rgba(0, 0, 0, .25); }
      `,
    },
    {
      id: "toolbar",
      name: "Glossy toolbar",
      description: "Oversized round nav buttons, a rounded address bar with a drop chevron and a search capsule.",
      html: html`
        <div class="w2-toolbar">
          <button class="w2-orb" aria-label="Back">&#8249;</button>
          <button class="w2-orb" aria-label="Forward">&#8250;</button>
          <label class="w2-omni">
            <input type="text" value="snappr.example.com" aria-label="Address">
            <span class="w2-omni-chevron" aria-hidden="true"></span>
          </label>
          <button class="w2-orb w2-orb--wide">Search</button>
        </div>
      `,
      css: css`
        .w2-toolbar { display: flex; gap: 8px; align-items: center; width: min(100%, 420px); padding: 9px 10px; border: 1px solid #9ccde9; border-radius: 12px; background: linear-gradient(#f4fbff, #d8eefc 50%, #c6e5fa 51%, #eaf6fe); box-shadow: inset 0 1px rgba(255, 255, 255, .9), 0 3px 10px rgba(63, 169, 245, .25); }
        .w2-orb { display: grid; place-items: center; width: 38px; height: 38px; padding: 0; border: 1px solid #2b7fc0; border-radius: 50%; background: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, .95), rgba(255, 255, 255, 0) 55%), linear-gradient(#7fc9f7, var(--w2-sky) 50%, #1a8ce0 51%, #5db9f5); box-shadow: 0 2px 4px rgba(0, 0, 0, .28); color: #fff; font: 700 22px/1 "Trebuchet MS", Arial, sans-serif; text-shadow: 0 -1px rgba(0, 0, 0, .35); }
        .w2-orb--wide { width: auto; height: 34px; padding: 0 16px; border-radius: 17px; font-size: 14px; }
        .w2-orb:hover { filter: brightness(1.08); }
        .w2-orb:active { filter: brightness(.9); translate: 0 1px; }
        .w2-omni { position: relative; flex: 1; min-width: 0; }
        .w2-omni input { width: 100%; height: 34px; padding: 0 30px 0 12px; border: 1px solid #7fb4d6; border-radius: 17px; background: linear-gradient(#fff, #f2f9fe); box-shadow: inset 0 2px 3px rgba(0, 0, 0, .12); color: #333; font: 14px "Trebuchet MS", Arial, sans-serif; }
        .w2-omni input:focus { outline: none; border-color: #f5b800; box-shadow: 0 0 8px rgba(255, 200, 0, .8); }
        .w2-omni-chevron { position: absolute; top: 15px; right: 13px; width: 7px; height: 7px; border-right: 2px solid #4b7a96; border-bottom: 2px solid #4b7a96; rotate: 45deg; pointer-events: none; }
      `,
    },
    {
      id: "panel",
      name: "Rounded panel",
      description: "Content box with a glossy gradient header and a friendly icon bullet list.",
      html: html`
        <section class="w2-panel">
          <h3 class="w2-panel-head">Why snappr?</h3>
          <ul class="w2-panel-list">
            <li>Share photos with friends in 1 click</li>
            <li>Tag, rate and subscribe via RSS</li>
            <li>100% free. No credit card!</li>
          </ul>
        </section>
      `,
      css: css`
        .w2-panel { width: min(100%, 300px); overflow: hidden; border: 1px solid #b9dcf5; border-radius: 14px; background: #fff; box-shadow: 0 4px 14px rgba(63, 169, 245, .18); }
        .w2-panel-head { margin: 0; padding: 10px 16px; border-bottom: 1px solid #8cc9f0; background: linear-gradient(#e8f5fe, #c5e6fb 50%, #b0ddfa 51%, #d7eefd); color: #1c6ea8; font-size: 17px; text-shadow: 0 1px #fff; }
        .w2-panel-list { margin: 0; padding: 12px 16px 14px; list-style: none; }
        .w2-panel-list li { position: relative; padding: 5px 0 5px 26px; }
        .w2-panel-list li::before { position: absolute; content: "✓"; left: 0; top: 6px; display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: linear-gradient(#a8e46e, #62b32b); color: #fff; font-size: 11px; font-weight: 700; }
      `,
    },
    {
      id: "profile",
      name: "Profile card",
      description: "Gradient avatar tile, a status list with colored bullets and round social buttons.",
      html: html`
        <aside class="w2-profile">
          <div class="w2-avatar" aria-hidden="true">&#9787;</div>
          <h3>Untitled</h3>
          <p class="w2-profile-handle">info / info / info</p>
          <ul class="w2-status">
            <li class="w2-status--green">status: here</li>
            <li class="w2-status--lime">two</li>
            <li class="w2-status--amber">three</li>
          </ul>
          <div class="w2-social">
            <a href="#" aria-label="Photos">&#9673;</a>
            <a href="#" aria-label="Updates">&#9679;</a>
            <a href="#" aria-label="Email">&#9993;</a>
          </div>
        </aside>
      `,
      css: css`
        .w2-profile { width: min(100%, 220px); padding: 14px; border: 1px solid #a8d8b0; border-radius: 14px; background: linear-gradient(#fbfffb, #e6f6e9); box-shadow: 0 4px 14px rgba(90, 158, 37, .2); text-align: center; }
        .w2-avatar { display: grid; place-items: center; height: 116px; margin-bottom: 10px; border: 1px solid #8fc79a; border-radius: 10px; background: linear-gradient(#bfe9c6, #63b473 50%, #4a9a5d 51%, #8ed09b); color: rgba(255, 255, 255, .92); font-size: 62px; text-shadow: 0 2px 4px rgba(0, 0, 0, .25); }
        .w2-profile h3 { margin: 0; color: #4a4a4a; font-size: 24px; font-weight: 400; }
        .w2-profile-handle { margin: 0 0 12px; color: #5a9e25; font-size: 17px; }
        .w2-status { margin: 0 0 14px; padding: 0; list-style: none; text-align: left; }
        .w2-status li { position: relative; padding: 3px 0 3px 22px; color: #4a4a4a; }
        .w2-status li::before { position: absolute; content: ""; left: 4px; top: 10px; width: 9px; height: 9px; border-radius: 50%; background: var(--w2-dot, var(--w2-lime)); box-shadow: inset 0 1px rgba(255, 255, 255, .8); }
        .w2-status--green { --w2-dot: #2f8f4e; }
        .w2-status--lime { --w2-dot: #9ad03f; }
        .w2-status--amber { --w2-dot: #f5c033; }
        .w2-social { display: flex; gap: 8px; justify-content: center; }
        .w2-social a { display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid #8fb4cc; border-radius: 50%; background: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, .9), rgba(255, 255, 255, 0) 55%), linear-gradient(#b9d9ee, #8fb9d8); color: #fff; font-size: 15px; text-decoration: none; text-shadow: 0 -1px rgba(0, 0, 0, .3); }
        .w2-social a:hover { filter: brightness(1.08); }
      `,
    },
    {
      id: "tags",
      name: "Tag cloud",
      description: "Weighted links. Bigger means more popular.",
      html: html`
        <nav class="w2-tags" aria-label="Popular tags">
          <a href="#">ajax</a> <a class="w2-tag--3" href="#">mashup</a> <a href="#">api</a>
          <a class="w2-tag--2" href="#">rss</a> <a class="w2-tag--4" href="#">social</a> <a href="#">wiki</a>
          <a class="w2-tag--2" href="#">folksonomy</a> <a class="w2-tag--3" href="#">podcast</a> <a href="#">widgets</a>
        </nav>
      `,
      css: css`
        .w2-tags { width: min(100%, 300px); line-height: 1.8; text-align: center; }
        .w2-tags a { margin: 0 3px; color: #0b72c4; font-size: 12px; text-decoration: none; }
        .w2-tags a:hover { background: #0b72c4; color: #fff; }
        .w2-tags .w2-tag--2 { font-size: 16px; color: #5a9e25; }
        .w2-tags .w2-tag--3 { font-size: 21px; font-weight: 700; color: var(--w2-pink); }
        .w2-tags .w2-tag--4 { font-size: 27px; font-weight: 700; color: var(--w2-orange); }
      `,
    },
    {
      id: "badge",
      name: "Beta starburst & logo",
      description: "Twelve-point starburst made from three rotated squares, stuck on a reflective wordmark.",
      html: html`
        <div class="w2-logo">snappr<span class="w2-burst"><span>beta!</span></span></div>
      `,
      css: css`
        .w2-logo { position: relative; display: inline-block; padding-right: 30px; color: var(--w2-sky); font: 700 54px/1 "Trebuchet MS", Arial, sans-serif; letter-spacing: -3px; -webkit-box-reflect: below -8px linear-gradient(transparent 55%, rgba(255, 255, 255, .35)); }
        .w2-burst { position: absolute; top: -18px; right: -18px; display: grid; place-items: center; width: 56px; height: 56px; isolation: isolate; background: var(--w2-pink); rotate: 12deg; }
        .w2-burst::before, .w2-burst::after { position: absolute; content: ""; inset: 0; z-index: -1; background: inherit; rotate: 30deg; }
        .w2-burst::after { rotate: 60deg; }
        .w2-burst span { color: #fff; font: 700 13px/1 Verdana, sans-serif; letter-spacing: 0; }
      `,
    },
  ],
};
