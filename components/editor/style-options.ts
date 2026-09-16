/**
 * Font stacks that need no download, so the sandboxed preview and the exported
 * CSS render the same. Custom… accepts any font-family value.
 */
export const fontStacks: { label: string; value: string }[] = [
  { label: "System", value: "system-ui, sans-serif" },
  { label: "Neo-grotesque", value: 'Inter, Roboto, "Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif' },
  { label: "Humanist", value: 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif' },
  { label: "Geometric", value: 'Avenir, Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif' },
  { label: "Rounded", value: 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT", "Arial Rounded MT Bold", Calibri, sans-serif' },
  { label: "Industrial", value: 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif' },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Helvetica", value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet", value: '"Trebuchet MS", "Lucida Grande", sans-serif' },
  { label: "Serif", value: 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif' },
  { label: "Old style", value: '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif' },
  { label: "Georgia", value: "Georgia, Cambria, serif" },
  { label: "Times", value: '"Times New Roman", Times, serif' },
  { label: "Monospace", value: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", monospace' },
  { label: "Courier", value: '"Courier New", Courier, monospace' },
];

export const borderStyles = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "double", label: "Double" },
];

export const fontStyles = [
  { value: "normal", label: "Regular", name: "Regular" },
  { value: "italic", label: "Italic", name: "Italic" },
];

export const textCases = [
  { value: "none", label: "—", name: "As typed" },
  { value: "capitalize", label: "Aa", name: "Capitalize" },
  { value: "lowercase", label: "aa", name: "Lowercase" },
];

/** Lucide icons shown before searching; any other Lucide name can be found by search. */
export const iconChoices = [
  "ArrowRight", "ArrowLeft", "ArrowUpRight", "ChevronRight", "ChevronDown", "Plus", "Minus", "X",
  "Check", "Download", "Upload", "Send", "Search", "Settings", "Trash2", "Pencil",
  "Copy", "Link", "ExternalLink", "Share2", "Mail", "Bell", "Heart", "Star",
  "Bookmark", "User", "LogIn", "LogOut", "ShoppingCart", "Play", "Sparkles", "Zap",
];

/** "ArrowUpRight" reads as "Arrow up right". */
export function iconLabel(name: string) {
  const words = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Za-z])(\d)/g, "$1 $2");
  return words.charAt(0) + words.slice(1).toLowerCase();
}
