import type { ComponentProps, ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { cx } from "../utils/cx";

const ACTIVE = "font-semibold text-gray-900 dark:text-gray-100";
const INACTIVE =
  "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100";

type TextLinkProps = ComponentProps<typeof Link> & {
  tone?: "subtle" | "normal";
  underline?: boolean;
  selfStart?: boolean;
};

export function TextLink({
  tone = "subtle",
  underline,
  selfStart,
  className,
  ...props
}: TextLinkProps) {
  return (
    <Link
      className={cx(
        "text-sm",
        tone === "subtle" && INACTIVE,
        underline && "underline",
        selfStart && "self-start",
        typeof className === "string" ? className : undefined,
      )}
      {...props}
    />
  );
}

type TitleLinkProps = ComponentProps<typeof Link> & {
  strike?: boolean;
};

// The one link that is a row's content rather than one of its controls: it
// fills the row, and goes struck-through once the todo is done.
export function TitleLink({ strike, className, ...props }: TitleLinkProps) {
  return (
    <Link
      className={cx(
        "flex-1 text-sm",
        strike && "text-gray-400 line-through dark:text-gray-500",
        typeof className === "string" ? className : undefined,
      )}
      {...props}
    />
  );
}

export function Tabs({ children }: { children: ReactNode }) {
  return <nav className="flex items-center gap-3">{children}</nav>;
}

type TabLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  children: ReactNode;
  end?: boolean;
  active?: boolean;
};

export function TabLink({ active, end, ...props }: TabLinkProps) {
  // NavLink matches on pathname and ignores search params, so `?status=open`
  // and `?status=done` would both report active. Pass `active` for those.
  if (active !== undefined) {
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={cx("text-sm", active ? ACTIVE : INACTIVE)}
        {...props}
      />
    );
  }

  return (
    <NavLink
      end={end}
      className={({ isActive }) => cx("text-sm", isActive ? ACTIVE : INACTIVE)}
      {...props}
    />
  );
}
