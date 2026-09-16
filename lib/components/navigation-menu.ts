import type { ComponentSpec } from "@/lib/component-model";

export const defaultNavigationMenuTSX = `import {
  forwardRef,
  type HTMLAttributes,
} from "react";

import "./styles.css";

export type NavigationMenuProps =
  HTMLAttributes<HTMLElement> & {
    /** Injected by the preview to simulate the disabled state. */
    disabled?: boolean;
  };

const links = ["Home", "Docs", "Pricing"];

export const NavigationMenu = forwardRef<
  HTMLElement,
  NavigationMenuProps
>(function NavigationMenu(
  {
    className = "",
    disabled: _disabled,
    ...props
  },
  ref,
) {
  return (
    <nav
      ref={ref}
      aria-label="Main"
      className={[
        "blank-navigation-menu",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <ul className="blank-navigation-menu__list">
        {links.map((link, index) => (
          <li
            key={link}
            className="blank-navigation-menu__item"
          >
            <a
              href="#"
              aria-current={index === 0 ? "page" : undefined}
              className="blank-navigation-menu__link"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
});
`;

const navigationMenuSubCSS = `.blank-navigation-menu__list {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.blank-navigation-menu__link {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
}`;

export const NAVIGATION_MENU_SPEC: ComponentSpec = {
  id: "navigation-menu",
  name: "Navigation Menu",
  fileName: "NavigationMenu.tsx",
  exportName: "NavigationMenu",
  className: "blank-navigation-menu",
  vanillaTSX: defaultNavigationMenuTSX,
  contentProp: null,
  contentLabel: "Label",
  defaultContent: "",
  subCSS: navigationMenuSubCSS,
  supportedStates: ["default"],
};
