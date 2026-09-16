import Image from "next/image";

/**
 * The hero's product shot: the editor on a laptop.
 *
 * The screen is an iframe onto /still (see `editor-still.tsx`),
 * built from the editor's own markup and stylesheets. As its own document
 * it keeps a 1280×800 viewport, so the editor's media queries and 100dvh
 * sizing resolve the way they do on a real laptop at any landing width;
 * landing.css scales that screen into the frame.
 *
 * Decorative: hidden from assistive tech, inert, and transparent to the
 * pointer so the page keeps scrolling over it.
 */
export function HeroEditor() {
  return (
    <div className="lb-app" aria-hidden="true">
      <span className="lb-app-glow" />

      <div className="lb-mac">
        <div className="lb-mac-screen">
          <iframe src="/still" title="Blank editor" tabIndex={-1} inert />
        </div>

        <Image
          className="lb-mac-frame"
          src="/wireframe.png"
          alt=""
          width={1254}
          height={1254}
          sizes="(min-width: 1440px) 1344px, 94vw"
          loading="eager"
        />
      </div>
    </div>
  );
}
