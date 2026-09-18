import type { ComponentProps, ReactNode } from "react";
import { cx } from "../utils/cx";

const SIZE = {
  sm: "text-xs",
  md: "text-sm",
} as const;

const VARIANT = {
  primary:
    "rounded px-3 py-2 bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-900",
  ghost:
    "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100",
} as const;

const DANGER = {
  primary:
    "rounded px-3 py-2 bg-red-600 text-white dark:bg-red-500 dark:text-white",
  ghost:
    "text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400",
} as const;

type ButtonProps = Omit<ComponentProps<"button">, "children"> & {
  children: ReactNode;
  variant?: keyof typeof VARIANT;
  size?: keyof typeof SIZE;
  danger?: boolean;
  pending?: boolean;
  pendingLabel?: ReactNode;
  selfStart?: boolean;
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  danger = false,
  pending = false,
  pendingLabel,
  selfStart,
  type = "submit",
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? pending}
      className={cx(
        SIZE[size],
        (danger ? DANGER : VARIANT)[variant],
        "disabled:opacity-50",
        selfStart && "self-start",
        className,
      )}
      {...props}
    >
      {pending ? (pendingLabel ?? children) : children}
    </button>
  );
}

type CheckButtonProps = Omit<
  ComponentProps<"button">,
  "children" | "aria-label"
> & {
  checked: boolean;
  label: string;
};

export function CheckButton({
  checked,
  label,
  type = "submit",
  className,
  ...props
}: CheckButtonProps) {
  return (
    <button
      type={type}
      aria-label={`Mark ${label} as ${checked ? "open" : "done"}`}
      className={cx(
        "flex h-5 w-5 items-center justify-center rounded border border-gray-400 text-xs dark:border-gray-600",
        className,
      )}
      {...props}
    >
      {checked ? "✓" : ""}
    </button>
  );
}
