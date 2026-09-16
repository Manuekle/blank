import { SFSymbol } from "@/components/icons/sf-symbol";

const WORDS = ["Button", "Avatar", "Dialog", "Input", "Tabs", "Tooltip", "Card", "Checkbox", "Select", "Accordion"];

/**
 * Full-width slow marquee of component names. Alternates solid and
 * ghost words, blue arrows between. Pauses on hover.
 */
export function ComponentMarquee() {
  const doubled = [...WORDS, ...WORDS];

  return (
    <div className="lb-marquee" aria-hidden="true">
      <div className="lb-marquee-track">
        {doubled.map((word, index) => (
          <span key={`${word}-${index}`} className="lb-marquee-item">
            <span className="lb-marquee-word">{word}</span>
            <span className="lb-marquee-arrow">
              <SFSymbol name="arrow.up.right" size={48} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
