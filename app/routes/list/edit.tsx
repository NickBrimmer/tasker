import { Form, href, Link, redirect, useNavigation } from "react-router";
import { z } from "zod";
import { getTodo, updateTodo } from "~/todos.server";
import type { Route } from "./+types/edit";

const editSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Keep it under 120 characters"),
  notes: z.string().max(2000, "Notes are too long"),
});

export async function loader({ params }: Route.LoaderArgs) {
  const todo = getTodo(params.todoId);
  if (!todo || todo.listSlug !== params.slug)
    throw new Response("Todo not found", { status: 404 });

  return { todo };
}

export async function action({ params, request }: Route.ActionArgs) {
  const todo = getTodo(params.todoId);
  if (!todo || todo.listSlug !== params.slug)
    throw new Response("Todo not found", { status: 404 });

  const formData = await request.formData();
  const parsed = editSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    return { fieldErrors };
  }

  updateTodo({
    id: todo.id,
    title: parsed.data.title,
    notes: parsed.data.notes,
  });

  return redirect(
    href("/list/:slug/todo/:todoId", { slug: params.slug, todoId: todo.id }),
  );
}

export default function EditTodo({
  actionData,
  loaderData,
  params,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSaving = navigation.formData != null;
  const errors = actionData?.fieldErrors;

  return (
    <main className="mt-6">
      <Link
        to={href("/list/:slug/todo/:todoId", {
          slug: params.slug,
          todoId: loaderData.todo.id,
        })}
        className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
      >
        ← Cancel
      </Link>

      <Form method="post" className="mt-4 flex flex-col gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={loaderData.todo.title}
            aria-describedby={errors?.title ? "title-error" : undefined}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          {errors?.title && (
            <p id="title-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.title[0]}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            defaultValue={loaderData.todo.notes}
            aria-describedby={errors?.notes ? "notes-error" : undefined}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          {errors?.notes && (
            <p id="notes-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.notes[0]}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="self-start rounded bg-gray-900 px-3 py-2 text-sm text-white disabled:opacity-50 dark:bg-gray-200 dark:text-gray-900"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </Form>
    </main>
  );
}
