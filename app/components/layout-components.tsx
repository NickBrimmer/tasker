import type { ReactNode } from "react";
import { cx } from "./cx";

const GAP = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  6: "gap-6",
} as const;

type Gap = keyof typeof GAP;

type BoxProps = {
  children: ReactNode;
  className?: string;
};

export function Page({ children, className }: BoxProps) {
  return (
    <div className={cx("mx-auto max-w-2xl p-8", className)}>{children}</div>
  );
}

export function Header({ children, className }: BoxProps) {
  return (
    <header
      className={cx(
        "border-b border-gray-200 pb-4 dark:border-gray-700",
        className,
      )}
    >
      {children}
    </header>
  );
}

export function Main({ children, className }: BoxProps) {
  return <main className={cx("mt-6", className)}>{children}</main>;
}

type FlexProps = BoxProps & {
  gap?: Gap;
};

export function Row({ children, gap = 3, className }: FlexProps) {
  return (
    <div className={cx("flex items-center", GAP[gap], className)}>
      {children}
    </div>
  );
}

export function Nav({ children, gap = 3, className }: FlexProps) {
  return (
    <nav className={cx("flex items-center", GAP[gap], className)}>
      {children}
    </nav>
  );
}

export function Stack({ children, gap = 4, className }: FlexProps) {
  return (
    <div className={cx("flex flex-col", GAP[gap], className)}>{children}</div>
  );
}
