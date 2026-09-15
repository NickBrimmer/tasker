import { href } from "react-router";
import { Column, Heading, Muted, PageBody, Text, TextLink } from "~/components";
import { findTodo } from "~/todos.server";
import type { Route } from "./+types/todo";

export async function loader({ params }: Route.LoaderArgs) {
  // grabbing the todo id from the URL
  const todo = findTodo(params.todoId);

  // Thrown, not returned: it unwinds past this loader to the nearest ErrorBoundary.
  if (!todo || todo.listSlug !== params.listSlug)
    throw new Response("Todo not found", { status: 404 });

  // returning the todo info to the UI
  return { todo };
}

// Typegen's props for this route: typed loaderData, actionData, params, matches.
export default function TodoDetail({
  loaderData,
  params,
}: Route.ComponentProps) {
  return (
    <PageBody>
      <Column gap={4}>
        <TextLink to={href("/list/:listSlug", { listSlug: params.listSlug })}>
          Back
        </TextLink>

        <Column gap={1}>
          <Heading>{loaderData.todo.title}</Heading>
          <Text muted>
            {loaderData.todo.status === "done" ? "Done" : "Open"} - added{" "}
            {loaderData.todo.createdAt.toLocaleDateString()}
          </Text>
        </Column>

        <Text pre>{loaderData.todo.notes || <Muted>No notes.</Muted>}</Text>

        <TextLink
          to={href("/list/:listSlug/todo/:todoId/edit", {
            listSlug: params.listSlug,
            todoId: loaderData.todo.id,
          })}
          tone="normal"
          underline
          selfStart
        >
          Edit
        </TextLink>
      </Column>
    </PageBody>
  );
}
