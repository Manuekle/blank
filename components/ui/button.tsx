"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import "./button.css";

export type ButtonVariant =
  | "neutral"
  | "primary"
  | "outline"
  | "ghost"
  | "success"
  | "danger"
  /* Legacy aliases — remove after migration. */
  | "secondary"
  | "ai";

export type ButtonSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "icon-xs"
  | "icon-sm"
  | "icon-md"
  /* Legacy alias. */
  | "icon";

export type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    loading?: boolean;
    fullWidth?: boolean;
  };

type ResolvedVariant = Exclude<
  ButtonVariant,
  "secondary" | "ai"
>;

type ResolvedSize = Exclude<
  ButtonSize,
  "icon"
>;

function cn(
  ...values: Array<
    string | false | null | undefined
  >
) {
  return values
    .filter(Boolean)
    .join(" ");
}

function normalizeVariant(
  variant: ButtonVariant,
): ResolvedVariant {
  if (variant === "secondary") {
    return "neutral";
  }

  if (variant === "ai") {
    return "primary";
  }

  return variant;
}

function normalizeSize(
  size: ButtonSize,
): ResolvedSize {
  if (size === "icon") {
    return "icon-sm";
  }

  return size;
}

export const Button =
  forwardRef<
    HTMLButtonElement,
    ButtonProps
  >(function Button(
    {
      children,
      className,
      variant = "neutral",
      size = "sm",
      leftIcon,
      rightIcon,
      loading = false,
      fullWidth = false,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) {
    const resolvedVariant =
      normalizeVariant(variant);

    const resolvedSize =
      normalizeSize(size);

    const isDisabled =
      disabled || loading;

    const iconOnly =
      resolvedSize.startsWith(
        "icon-",
      );

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={
          loading || undefined
        }
        data-loading={
          loading || undefined
        }
        data-variant={
          resolvedVariant
        }
        data-size={
          resolvedSize
        }
        // Interaction sounds; they play only where cuelume's bind() runs (the editor).
        data-cuelume-press=""
        data-cuelume-release=""
        className={cn(
          "blank-ui-button",
          `blank-ui-button--${resolvedVariant}`,
          `blank-ui-button--${resolvedSize}`,
          iconOnly &&
            "blank-ui-button--icon-only",
          fullWidth &&
            "blank-ui-button--full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <span
            className="blank-ui-button__spinner"
            aria-hidden="true"
          />
        ) : (
          leftIcon && (
            <span
              className="blank-ui-button__icon"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )
        )}

        {children != null && (
          <span className="blank-ui-button__label">
            {children}
          </span>
        )}

        {!loading &&
          rightIcon && (
            <span
              className="blank-ui-button__icon"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          )}
      </button>
    );
  });
