import Link from "next/link";

import { SFSymbol } from "@/components/icons/sf-symbol";
import { Button } from "@/components/ui/button";
import { TEMPLATE_KITS } from "@/lib/templates";

export function FinalCta() {
  const total = TEMPLATE_KITS.reduce((sum, kit) => sum + kit.components.length, 0);

  return (
    <section
      className="lb-final lb-container"
      aria-labelledby="lb-final-heading"
    >
      <span className="lb-final-glow" aria-hidden="true" />
      <span className="lb-final-line" aria-hidden="true" />

      <h2 id="lb-final-heading">
        What will you make <em>from blank?</em>
      </h2>

      <div className="lb-final-ctas">
        <Link href="/edit">
          <Button
            size="md"
            variant="primary"
            rightIcon={
              <SFSymbol
                name="arrow.up.right"
                size={13}
              />
            }
          >
            Start creating
          </Button>
        </Link>

        <Link href="/#catalog">
          <Button
            size="md"
            variant="outline"
          >
            Explore components
          </Button>
        </Link>
      </div>

      <dl className="lb-final-facts">
        <div>
          <dt>Components</dt>
          <dd>{total} copy-paste</dd>
        </div>
        <div>
          <dt>Kits</dt>
          <dd>{TEMPLATE_KITS.length} ready to remix</dd>
        </div>
        <div>
          <dt>Dependencies</dt>
          <dd>Zero</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>v0.4.0</dd>
        </div>
      </dl>
    </section>
  );
}
