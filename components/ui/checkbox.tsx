"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type InputHTMLAttributes,
} from "react";

import "./checkbox.css";

export type CheckboxSize =
  | "sm"
  | "md"
  | "lg";

export type CheckboxProps =
  Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "size"
  > & {
    size?: CheckboxSize;
    indeterminate?: boolean;
  };

function cn(
  ...values: Array<
    string | false | null | undefined
  >
) {
  return values
    .filter(Boolean)
    .join(" ");
}

export const Checkbox =
  forwardRef<
    HTMLInputElement,
    CheckboxProps
  >(function Checkbox(
    {
      className,
      size = "md",
      indeterminate = false,
      disabled,
      ...props
    },
    forwardedRef,
  ) {
    const inputRef =
      useRef<HTMLInputElement>(
        null,
      );

    useImperativeHandle(
      forwardedRef,
      () =>
        inputRef.current as HTMLInputElement,
    );

    useEffect(() => {
      if (!inputRef.current) {
        return;
      }

      inputRef.current.indeterminate =
        indeterminate;
    }, [indeterminate]);

    return (
      <label
        className={cn(
          "blank-checkbox",
          `blank-checkbox--${size}`,
          disabled &&
            "blank-checkbox--disabled",
          className,
        )}
      >
        <input
          ref={inputRef}
          type="checkbox"
          disabled={disabled}
          data-indeterminate={
            indeterminate
              ? "true"
              : undefined
          }
          {...props}
        />

        <span
          className="blank-checkbox__control"
          aria-hidden="true"
        >
          <svg
            className="blank-checkbox__check"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M3.25 8.3L6.55 11.25L12.8 4.9"
              pathLength="1"
            />
          </svg>

          <span className="blank-checkbox__indeterminate" />
        </span>
      </label>
    );
  });
