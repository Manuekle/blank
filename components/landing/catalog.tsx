import { SFSymbol, type SFSymbolName } from "@/components/icons/sf-symbol";
import { TEMPLATE_KITS } from "@/lib/templates";

/**
 * Maps each kit component's descriptive name ("Gel button",
 * "Bento grid") to the icon the editor uses for that primitive.
 */
function iconFor(name: string): SFSymbolName {
  const n = name.toLowerCase();
  if (/\bfab\b/.test(n)) return "plus";
  if (/\bcommand/.test(n)) return "command";
  if (/\btoggle\b/.test(n)) return "togglepower";
  if (/\bswitch\b/.test(n)) return "switch.2";
  if (/\b(check|checkbox|radio)\b/.test(n)) return "square";
  if (/\b(input|field|search|shortcut|text)\b/.test(n)) return "character.cursor.ibeam";
  if (/\b(button|buttons|cta)\b/.test(n)) return "cursorarrow";
  if (/\b(tab|nav|navigation)\b/.test(n)) return "menubar.rectangle";
  if (/\b(progress|barber)\b/.test(n)) return "percent";
  if (/\b(avatar|profile|face|signup)\b/.test(n)) return "person.crop.circle";
  if (/\b(badge|starburst)\b/.test(n)) return "circle.grid.cross";
  if (/\b(alert|error)\b/.test(n)) return "exclamationmark.triangle";
  if (/\b(window|dialog|panel|login|desktop)\b/.test(n)) return "macwindow";
  if (/\b(card|pricing)\b/.test(n)) return "creditcard";
  if (/\b(billboard|hero|media|player|episode|widget)\b/.test(n)) return "photo.stack";
  if (/\b(table|list|grouped|row)\b/.test(n)) return "table";
  if (/\b(tiles|grid|bento)\b/.test(n)) return "square.grid.2x2";
  if (/\b(chip|pill|tag|filter)\b/.test(n)) return "tag";
  if (/\b(notification|snackbar|toast|announcement)\b/.test(n)) return "bell.badge";
  if (/\b(slider|dial|knob)\b/.test(n)) return "slider.vertical.3";
  if (/\b(shadow|icon)\b/.test(n)) return "square.3.layers.3d";
  if (/\b(marquee|banner)\b/.test(n)) return "arrow.left.arrow.right";
  if (/\b(unlock|lock)\b/.test(n)) return "key";
  return "square";
}

/**
 * Every primitive shipped with Blank, as a quiet editorial index.
 * Each row carries the editor's icon for that component.
 */
export function ComponentCatalog() {
  const names = [...new Set(TEMPLATE_KITS.flatMap((kit) => kit.components.map((component) => component.name)))];
  const total = TEMPLATE_KITS.reduce((sum, kit) => sum + kit.components.length, 0);

  return (
    <div>
      <p className="lb-catalog-total">
        <b>{names.length}</b> primitives
        <span aria-hidden="true">/</span>
        <b>{TEMPLATE_KITS.length}</b> kits
        <span aria-hidden="true">/</span>
        <b>{total}</b> copy-paste components
      </p>
      <div className="lb-catalog-sheet">
        <ul className="lb-catalog-list">
          {names.map((name, index) => (
            <li key={name}>
              <span className="lb-catalog-icon" aria-hidden="true">
                <SFSymbol name={iconFor(name)} size={14} />
              </span>
              <span className="lb-catalog-name">{name}</span>
              <em>{String(index + 1).padStart(2, "0")}</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
