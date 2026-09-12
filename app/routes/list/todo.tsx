import { href, Link } from "react-router";
import { getTodo } from "~/todos.server";
import type { Route } from "./+types/todo";

export async function loader({ params }: Route.LoaderArgs) {
  const todo = getTodo(params.todoId);
  // Also 404 when the todo exists but belongs to another list — the URL asserts both.
  if (!todo || todo.listSlug !== params.slug)
    throw new Response("Todo not found", { status: 404 });

  return { todo };
}

export default function TodoDetail({
  loaderData,
  params,
}: Route.ComponentProps) {
  return (
    <main className="mt-6">
      <Link
        to={href("/list/:slug", { slug: params.slug })}
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        ← Back
      </Link>

      <h1 className="mt-4 text-lg font-semibold">{loaderData.todo.title}</h1>

      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {loaderData.todo.status === "done" ? "Done" : "Open"} · added{" "}
        {loaderData.todo.createdAt.toLocaleDateString()}
      </p>

      <p className="mt-4 text-sm whitespace-pre-wrap">
        {loaderData.todo.notes || (
          <span className="text-gray-400 dark:text-gray-500">No notes.</span>
        )}
      </p>

      <Link
        to={href("/list/:slug/todo/:todoId/edit", {
          slug: params.slug,
          todoId: loaderData.todo.id,
        })}
        className="mt-6 inline-block text-sm underline"
      >
        Edit
      </Link>
    </main>
  );
}
