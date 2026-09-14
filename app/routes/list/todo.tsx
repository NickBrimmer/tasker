import { href } from "react-router";
import { Heading, Main, Muted, Stack, Text, TextLink } from "~/components";
import { getTodo } from "~/todos.server";
import type { Route } from "./+types/todo";

export async function loader({ params }: Route.LoaderArgs) {
  const todo = getTodo(params.todoId);

  if (!todo || todo.listSlug !== params.slug)
    throw new Response("Todo not found", { status: 404 });

  return { todo };
}

export default function TodoDetail({
  loaderData,
  params,
}: Route.ComponentProps) {
  return (
    <Main>
      <Stack gap={4}>
        <TextLink to={href("/list/:slug", { slug: params.slug })} selfStart>
          Back
        </TextLink>

        <Stack gap={1}>
          <Heading>{loaderData.todo.title}</Heading>
          <Text muted>
            {loaderData.todo.status === "done" ? "Done" : "open"} - added{" "}
            {loaderData.todo.createdAt.toLocaleDateString()}
          </Text>
        </Stack>

        <Text pre>{loaderData.todo.notes || <Muted>No notes.</Muted>}</Text>

        <TextLink
          to={href("/list/:slug/todo/:todoId/edit", {
            slug: params.slug,
            todoId: loaderData.todo.id,
          })}
          tone="normal"
          underline
          selfStart
        >
          Edit
        </TextLink>
      </Stack>
    </Main>
  );
}
