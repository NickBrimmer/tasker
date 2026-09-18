import type { ReactNode } from "react";
import { cx } from "../utils/cx";

const HEADING = {
  lg: "text-lg font-semibold",
  xl: "text-xl font-semibold",
} as const;

type HeadingProps = {
  children: ReactNode;
  size?: keyof typeof HEADING;
  className?: string;
};

export function Heading({ children, size = "lg", className }: HeadingProps) {
  return <h1 className={cx(HEADING[size], className)}>{children}</h1>;
}

type TextProps = {
  children: ReactNode;
  muted?: boolean;
  pre?: boolean;
  className?: string;
};

export function Text({ children, muted, pre, className }: TextProps) {
  return (
    <p
      className={cx(
        "text-sm",
        muted && "text-gray-500 dark:text-gray-400",
        pre && "whitespace-pre-wrap",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Muted({ children }: { children: ReactNode }) {
  return <span className="text-gray-400 dark:text-gray-500">{children}</span>;
}
