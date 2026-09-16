import type { SFSymbolName } from "@/components/icons/sf-symbol";

export type CatalogSection = "primitives" | "composition";

export type CatalogEntry = {
  name: string;
  icon: SFSymbolName;
  section: CatalogSection;
  /** Only Button is editable for now; everything else renders as Soon. */
  available?: boolean;
};

export const componentCatalog: CatalogEntry[] = [
  // Primitives
  { name: "Avatar", icon: "person.crop.circle", section: "primitives" },
  { name: "Badge", icon: "circle.grid.cross", section: "primitives" },
  { name: "Button", icon: "cursorarrow", section: "primitives", available: true },
  { name: "Button Group", icon: "rectangle.split.2x1", section: "primitives" },
  { name: "Checkbox", icon: "square", section: "primitives" },
  { name: "Field", icon: "textbox", section: "primitives" },
  { name: "Input", icon: "character.cursor.ibeam", section: "primitives" },
  { name: "Input Group", icon: "rectangle.3.group", section: "primitives" },
  { name: "Input OTP", icon: "key", section: "primitives" },
  { name: "Item", icon: "list.bullet", section: "primitives" },
  { name: "Kbd", icon: "keyboard", section: "primitives" },
  { name: "Label", icon: "tag", section: "primitives" },
  { name: "Marker", icon: "mappin", section: "primitives" },
  { name: "Native Select", icon: "chevron.down", section: "primitives" },
  { name: "Progress", icon: "percent", section: "primitives" },
  { name: "Radio Group", icon: "antenna.radiowaves.left.and.right", section: "primitives" },
  { name: "Select", icon: "slider.horizontal.3", section: "primitives" },
  { name: "Separator", icon: "minus", section: "primitives" },
  { name: "Skeleton", icon: "square.dashed", section: "primitives" },
  { name: "Slider", icon: "slider.vertical.3", section: "primitives" },
  { name: "Spinner", icon: "arrow.triangle.2.circlepath", section: "primitives" },
  { name: "Switch", icon: "switch.2", section: "primitives" },
  { name: "Table", icon: "table", section: "primitives" },
  { name: "Tabs", icon: "menubar.rectangle", section: "primitives" },
  { name: "Textarea", icon: "curlybraces", section: "primitives" },
  { name: "Toggle", icon: "togglepower", section: "primitives" },
  { name: "Toggle Group", icon: "square.grid.2x2", section: "primitives" },
  { name: "Typography", icon: "textformat", section: "primitives" },

  // Composition
  { name: "Accordion", icon: "rectangle.expand.vertical", section: "composition" },
  { name: "Alert", icon: "exclamationmark.triangle", section: "composition" },
  { name: "Alert Dialog", icon: "exclamationmark.bubble", section: "composition" },
  { name: "Aspect Ratio", icon: "aspectratio", section: "composition" },
  { name: "Attachment", icon: "paperclip", section: "composition" },
  { name: "Breadcrumb", icon: "chevron.right.2", section: "composition" },
  { name: "Bubble", icon: "bubble.left", section: "composition" },
  { name: "Calendar", icon: "calendar", section: "composition" },
  { name: "Card", icon: "creditcard", section: "composition" },
  { name: "Carousel", icon: "photo.stack", section: "composition" },
  { name: "Chart", icon: "chart.bar", section: "composition" },
  { name: "Collapsible", icon: "chevron.up.chevron.down", section: "composition" },
  { name: "Combobox", icon: "list.bullet.rectangle", section: "composition" },
  { name: "Command", icon: "command", section: "composition" },
  { name: "Context Menu", icon: "ellipsis.circle", section: "composition" },
  { name: "Data Table", icon: "tablecells", section: "composition" },
  { name: "Date Picker", icon: "calendar.circle", section: "composition" },
  { name: "Dialog", icon: "macwindow", section: "composition" },
  { name: "Direction", icon: "arrow.left.arrow.right", section: "composition" },
  { name: "Drawer", icon: "sidebar.right", section: "composition" },
  { name: "Dropdown Menu", icon: "arrow.down.circle", section: "composition" },
  { name: "Empty", icon: "tray", section: "composition" },
  { name: "Hover Card", icon: "hand.point.up.left", section: "composition" },
  { name: "Menubar", icon: "menubar.dock.rectangle", section: "composition" },
  { name: "Message", icon: "message", section: "composition" },
  { name: "Message Scroller", icon: "text.bubble", section: "composition" },
  { name: "Navigation Menu", icon: "line.3.horizontal", section: "composition" },
  { name: "Pagination", icon: "list.number", section: "composition" },
  { name: "Popover", icon: "bubble.middle.top", section: "composition" },
  { name: "Questionnaire", icon: "questionmark.square", section: "composition" },
  { name: "Resizable", icon: "arrow.up.left.and.arrow.down.right", section: "composition" },
  { name: "Scroll Area", icon: "scroll", section: "composition" },
  { name: "Sheet", icon: "square.bottomhalf.filled", section: "composition" },
  { name: "Sidebar", icon: "sidebar.left", section: "composition" },
  { name: "Toast", icon: "bell.badge", section: "composition" },
  { name: "Tooltip", icon: "questionmark.bubble", section: "composition" },
];

export const primitiveCatalog = componentCatalog.filter(
  (entry) => entry.section === "primitives",
);

export const compositionCatalog = componentCatalog.filter(
  (entry) => entry.section === "composition",
);
