import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

const CONTROL =
  "rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500";

type FieldProps = {
  id: string;
  label: string;
  hideLabel?: boolean;
  error?: string;
  children: ReactNode;
};

export function Field({ id, label, hideLabel, error, children }: FieldProps) {
  const content = (
    <>
      <label
        htmlFor={id}
        className={hideLabel ? "sr-only" : "block text-sm font-medium"}
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </>
  );

  // A hidden label means the control sits directly in a parent flex row, so a
  // wrapper div would break that layout.
  return hideLabel ? content : <div>{content}</div>;
}

type ControlProps = {
  name: string;
  label: string;
  hideLabel?: boolean;
  error?: string;
  grow?: boolean;
  id?: string;
};

type InputProps = Omit<ComponentProps<"input">, "id" | "name"> & ControlProps;

export function Input({
  name,
  label,
  hideLabel,
  error,
  grow,
  id = name,
  className,
  ...props
}: InputProps) {
  return (
    <Field id={id} label={label} hideLabel={hideLabel} error={error}>
      <input
        id={id}
        name={name}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cx(
          CONTROL,
          grow && "flex-1",
          !hideLabel && "mt-1 w-full",
          className,
        )}
        {...props}
      />
    </Field>
  );
}

type TextareaProps = Omit<ComponentProps<"textarea">, "id" | "name"> &
  ControlProps;

export function Textarea({
  name,
  label,
  hideLabel,
  error,
  grow,
  id = name,
  rows = 5,
  className,
  ...props
}: TextareaProps) {
  return (
    <Field id={id} label={label} hideLabel={hideLabel} error={error}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cx(
          CONTROL,
          grow && "flex-1",
          !hideLabel && "mt-1 w-full",
          className,
        )}
        {...props}
      />
    </Field>
  );
}

export function Hidden({ name, value }: { name: string; value: string }) {
  return <input type="hidden" name={name} value={value} />;
}
