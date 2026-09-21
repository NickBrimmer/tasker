import { href } from "react-router";
import { Column, Heading, Muted, PageBody, Text, TextLink } from "~/components";
import { findById } from "~/database.server";
import type { Route } from "./+types/todo-detail";

export async function loader({ params }: Route.LoaderArgs) {
  const todo = findById(params.todoId);

  if (!todo || todo.listSlug !== params.listSlug)
    throw new Response("Todo not found", { status: 404 });

  return { todo };
}

export default function TodoDetail({
  loaderData,
  params,
}: Route.ComponentProps) {
  return (
    <PageBody>
      <Column gap={4}>
        <TextLink
          to={href("/list/:listSlug", { listSlug: params.listSlug })}
        >
          Back
        </TextLink>

        <Column gap={1}>
          <Heading>{loaderData.todo.title}</Heading>
          <Text muted>
            {loaderData.todo.status === "done" ? "Done" : "Open"} - added{" "}
            {loaderData.todo.createdAt.toLocaleDateString()}
          </Text>
        </Column>
      </Column>

      <Text pre>{loaderData.todo.notes || <Muted>No notes</Muted>}</Text>

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
    </PageBody>
  );
}
