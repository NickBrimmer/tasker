import type { ReactNode } from "react";
import { cx } from "./cx";

type ListProps = {
  children: ReactNode;
  className?: string;
};

export function List({ children, className }: ListProps) {
  return (
    <ul
      className={cx("divide-y divide-gray-100 dark:divide-gray-800", className)}
    >
      {children}
    </ul>
  );
}

export function ListRow({ children, className }: ListProps) {
  return (
    <li className={cx("flex items-center gap-3 py-2", className)}>
      {children}
    </li>
  );
}
