import { useEffect, useRef } from "react";
import { Form, href, Link, useFetcher, useNavigation } from "react-router";
import {
  addTodo,
  deleteTodo,
  listTodos,
  toggleTodo,
  type Todo,
  type TodoStatus,
} from "~/todos.server";
import type { Route } from "./+types/index";

function parseStatus(value: string | null): TodoStatus | undefined {
  return value === "open" || value === "done" ? value : undefined;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const status = parseStatus(new URL(request.url).searchParams.get("status"));

  return {
    todos: listTodos({ listSlug: params.slug, status }),
    status: status ?? null,
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add") {
    const title = String(formData.get("title") ?? "").trim();
    // The <input required> is a convenience, not a guarantee — re-check on the server.
    if (title) addTodo(params.slug, title);
    return null;
  }

  const id = String(formData.get("id") ?? "");
  if (intent === "toggle") toggleTodo(id);
  if (intent === "delete") deleteTodo(id);

  return null;
}

export default function ListIndex({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);

  const isAdding = navigation.formData?.get("intent") === "add";

  useEffect(() => {
    if (!isAdding) formRef.current?.reset();
  }, [isAdding]);

  return (
    <main>
      <Form ref={formRef} method="post" className="mt-6 flex gap-2">
        <input type="hidden" name="intent" value="add" />
        <label htmlFor="title" className="sr-only">
          New todo
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="What needs doing?"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="rounded bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-gray-200 dark:text-gray-900"
        >
          {isAdding ? "Adding…" : "Add"}
        </button>
      </Form>

      <div className="mt-4 flex gap-3 text-sm">
        <FilterLink current={loaderData.status} value={null} label="All" />
        <FilterLink current={loaderData.status} value="open" label="Open" />
        <FilterLink current={loaderData.status} value="done" label="Done" />
      </div>

      <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
        {loaderData.todos.map((todo) => (
          <TodoRow key={todo.id} todo={todo} slug={todo.listSlug} />
        ))}
      </ul>

      {loaderData.todos.length === 0 && (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Nothing here.</p>
      )}
    </main>
  );
}

type FilterLinkProps = {
  current: TodoStatus | null;
  value: TodoStatus | null;
  label: string;
};

function FilterLink(props: FilterLinkProps) {
  const isActive = props.current === props.value;

  return (
    <Link
      to={props.value ? `?status=${props.value}` : "?"}
      className={
        isActive
          ? "font-semibold text-gray-900 dark:text-gray-100"
          : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      }
    >
      {props.label}
    </Link>
  );
}

type TodoRowProps = {
  todo: Todo;
  slug: string;
};

function TodoRow(props: TodoRowProps) {
  const fetcher = useFetcher();

  // Optimistic: trust the in-flight submission over loader data so the checkbox
  // flips immediately instead of waiting for the server round trip.
  const pendingIntent = fetcher.formData?.get("intent");
  const isDone =
    pendingIntent === "toggle"
      ? props.todo.status === "open"
      : props.todo.status === "done";

  if (pendingIntent === "delete") return null;

  return (
    <li className="flex items-center gap-3 py-2">
      <fetcher.Form method="post">
        <input type="hidden" name="id" value={props.todo.id} />
        <input type="hidden" name="intent" value="toggle" />
        <button
          type="submit"
          aria-label={
            isDone
              ? `Mark ${props.todo.title} as open`
              : `Mark ${props.todo.title} as done`
          }
          className="flex h-5 w-5 items-center justify-center rounded border border-gray-400 text-xs dark:border-gray-600"
        >
          {isDone ? "✓" : ""}
        </button>
      </fetcher.Form>

      <Link
        to={href("/list/:slug/todo/:todoId", {
          slug: props.slug,
          todoId: props.todo.id,
        })}
        className={
          isDone
            ? "flex-1 text-sm text-gray-400 line-through dark:text-gray-500"
            : "flex-1 text-sm"
        }
      >
        {props.todo.title}
      </Link>

      <fetcher.Form method="post">
        <input type="hidden" name="id" value={props.todo.id} />
        <input type="hidden" name="intent" value="delete" />
        <button
          type="submit"
          className="text-xs text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
        >
          Delete
        </button>
      </fetcher.Form>
    </li>
  );
}
