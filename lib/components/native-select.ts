import type { ComponentSpec } from "@/lib/component-model";

export const defaultNativeSelectTSX = `import {
  forwardRef,
  type SelectHTMLAttributes,
} from "react";

import "./styles.css";

export type NativeSelectProps =
  SelectHTMLAttributes<HTMLSelectElement>;

export const NativeSelect = forwardRef<
  HTMLSelectElement,
  NativeSelectProps
>(function NativeSelect(
  {
    className = "",
    defaultValue = "one",
    ...props
  },
  ref,
) {
  return (
    <select
      ref={ref}
      defaultValue={defaultValue}
      className={[
        "blank-native-select",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <option value="one">
        Option one
      </option>

      <option value="two">
        Option two
      </option>

      <option value="three">
        Option three
      </option>
    </select>
  );
});
`;

const nativeSelectSubCSS = `.blank-native-select {
  cursor: pointer;
}`;

export const NATIVE_SELECT_SPEC: ComponentSpec = {
  id: "native-select",
  name: "Native Select",
  fileName: "NativeSelect.tsx",
  exportName: "NativeSelect",
  className: "blank-native-select",
  vanillaTSX: defaultNativeSelectTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: nativeSelectSubCSS,
  supportedStates: ["default", "hover", "active", "focus", "disabled"],
};
