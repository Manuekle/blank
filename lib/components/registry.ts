import { BUTTON_SPEC, type ComponentSpec } from "@/lib/component-model";

import { ACCORDION_SPEC } from "./accordion";
import { ALERT_SPEC } from "./alert";
import { ALERT_DIALOG_SPEC } from "./alert-dialog";
import { ASPECT_RATIO_SPEC } from "./aspect-ratio";
import { ATTACHMENT_SPEC } from "./attachment";
import { AVATAR_SPEC } from "./avatar";
import { BADGE_SPEC } from "./badge";
import { BREADCRUMB_SPEC } from "./breadcrumb";
import { BUBBLE_SPEC } from "./bubble";
import { CALENDAR_SPEC } from "./calendar";
import { CARD_SPEC } from "./card";
import { CAROUSEL_SPEC } from "./carousel";
import { CHART_SPEC } from "./chart";
import { COLLAPSIBLE_SPEC } from "./collapsible";
import { COMBOBOX_SPEC } from "./combobox";
import { COMMAND_SPEC } from "./command";
import { CONTEXT_MENU_SPEC } from "./context-menu";
import { DATA_TABLE_SPEC } from "./data-table";
import { DATE_PICKER_SPEC } from "./date-picker";
import { DIALOG_SPEC } from "./dialog";
import { DIRECTION_SPEC } from "./direction";
import { DRAWER_SPEC } from "./drawer";
import { DROPDOWN_MENU_SPEC } from "./dropdown-menu";
import { EMPTY_SPEC } from "./empty";
import { HOVER_CARD_SPEC } from "./hover-card";
import { MENUBAR_SPEC } from "./menubar";
import { MESSAGE_SPEC } from "./message";
import { MESSAGE_SCROLLER_SPEC } from "./message-scroller";
import { NAVIGATION_MENU_SPEC } from "./navigation-menu";
import { PAGINATION_SPEC } from "./pagination";
import { POPOVER_SPEC } from "./popover";
import { QUESTIONNAIRE_SPEC } from "./questionnaire";
import { RESIZABLE_SPEC } from "./resizable";
import { SCROLL_AREA_SPEC } from "./scroll-area";
import { SHEET_SPEC } from "./sheet";
import { SIDEBAR_SPEC } from "./sidebar";
import { TOAST_SPEC } from "./toast";
import { TOOLTIP_SPEC } from "./tooltip";
import { BUTTON_GROUP_SPEC } from "./button-group";
import { CHECKBOX_SPEC } from "./checkbox";
import { FIELD_SPEC } from "./field";
import { INPUT_SPEC } from "./input";
import { INPUT_GROUP_SPEC } from "./input-group";
import { INPUT_OTP_SPEC } from "./input-otp";
import { ITEM_SPEC } from "./item";
import { KBD_SPEC } from "./kbd";
import { LABEL_SPEC } from "./label";
import { MARKER_SPEC } from "./marker";
import { NATIVE_SELECT_SPEC } from "./native-select";
import { PROGRESS_SPEC } from "./progress";
import { RADIO_GROUP_SPEC } from "./radio-group";
import { SELECT_SPEC } from "./select";
import { SEPARATOR_SPEC } from "./separator";
import { SKELETON_SPEC } from "./skeleton";
import { SLIDER_SPEC } from "./slider";
import { SPINNER_SPEC } from "./spinner";
import { SWITCH_SPEC } from "./switch";
import { TABLE_SPEC } from "./table";
import { TABS_SPEC } from "./tabs";
import { TEXTAREA_SPEC } from "./textarea";
import { TOGGLE_SPEC } from "./toggle";
import { TOGGLE_GROUP_SPEC } from "./toggle-group";
import { TYPOGRAPHY_SPEC } from "./typography";

export const COMPONENT_SPECS: ComponentSpec[] = [
  BUTTON_SPEC,
  BUTTON_GROUP_SPEC,
  INPUT_SPEC,
  INPUT_GROUP_SPEC,
  INPUT_OTP_SPEC,
  TEXTAREA_SPEC,
  CHECKBOX_SPEC,
  SWITCH_SPEC,
  RADIO_GROUP_SPEC,
  SELECT_SPEC,
  NATIVE_SELECT_SPEC,
  SLIDER_SPEC,
  TOGGLE_SPEC,
  TOGGLE_GROUP_SPEC,
  FIELD_SPEC,
  LABEL_SPEC,
  TYPOGRAPHY_SPEC,
  AVATAR_SPEC,
  BADGE_SPEC,
  ITEM_SPEC,
  KBD_SPEC,
  MARKER_SPEC,
  SEPARATOR_SPEC,
  SPINNER_SPEC,
  SKELETON_SPEC,
  PROGRESS_SPEC,
  TABLE_SPEC,
  TABS_SPEC,
  ACCORDION_SPEC,
  COLLAPSIBLE_SPEC,
  ALERT_SPEC,
  CARD_SPEC,
  DIALOG_SPEC,
  ALERT_DIALOG_SPEC,
  DRAWER_SPEC,
  SHEET_SPEC,
  TOAST_SPEC,
  TOOLTIP_SPEC,
  POPOVER_SPEC,
  DROPDOWN_MENU_SPEC,
  ASPECT_RATIO_SPEC,
  ATTACHMENT_SPEC,
  BREADCRUMB_SPEC,
  BUBBLE_SPEC,
  CAROUSEL_SPEC,
  DIRECTION_SPEC,
  EMPTY_SPEC,
  MESSAGE_SPEC,
  MESSAGE_SCROLLER_SPEC,
  PAGINATION_SPEC,
  RESIZABLE_SPEC,
  SCROLL_AREA_SPEC,
  CALENDAR_SPEC,
  CHART_SPEC,
  COMBOBOX_SPEC,
  COMMAND_SPEC,
  CONTEXT_MENU_SPEC,
  DATA_TABLE_SPEC,
  DATE_PICKER_SPEC,
  HOVER_CARD_SPEC,
  MENUBAR_SPEC,
  NAVIGATION_MENU_SPEC,
  QUESTIONNAIRE_SPEC,
  SIDEBAR_SPEC,
];

/** Forked components live here so saved documents resolve them across sessions. */
const forkSpecs = new Map<string, ComponentSpec>();

export function registerForkSpec(spec: ComponentSpec): void {
  forkSpecs.set(spec.id, spec);
}

export function listForkSpecs(): ComponentSpec[] {
  return [...forkSpecs.values()];
}

export function getSpec(id: string): ComponentSpec {
  return forkSpecs.get(id) ?? COMPONENT_SPECS.find((spec) => spec.id === id) ?? BUTTON_SPEC;
}

export function hasSpec(id: string): boolean {
  return forkSpecs.has(id) || COMPONENT_SPECS.some((spec) => spec.id === id);
}

export function findSpecByName(name: string): ComponentSpec | undefined {
  return COMPONENT_SPECS.find((spec) => spec.name === name);
}
