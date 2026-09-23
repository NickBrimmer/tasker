import { Form, href, redirect, useNavigation } from "react-router";
import { z } from "zod";
import {
  Button,
  Column,
  Input,
  PageBody,
  Textarea,
  TextLink,
} from "~/components";
import { findById, updateById } from "~/database.server";
import type { Route } from "./+types/edit-detail";

const editSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(120, "Keep it under 120 characters, bub."),
  notes: z.string().max(2000, "Notes are too long."),
});

export async function loader({ params }: Route.LoaderArgs) {
  const todo = findById(params.todoId);
  if (!todo || todo.listSlug !== params.listSlug)
    throw new Response("Todo not found", { status: 404 });

  return { todo };
}

export async function action({ params, request }: Route.ActionArgs) {
  const todo = findById(params.todoId);
  if (!todo || todo.listSlug !== params.listSlug)
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

  updateById({
    id: todo.id,
    title: parsed.data.title,
    notes: parsed.data.notes,
  });

  return redirect(
    href("/list/:listSlug/todo/:todoId", {
      listSlug: params.listSlug,
      todoId: todo.id,
    }),
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
    <PageBody>
      <Column gap={4}>
        <TextLink
          to={href("/list/:listSlug/todo/:todoId", {
            listSlug: params.listSlug,
            todoId: loaderData.todo.id,
          })}
        >
          Cancel
        </TextLink>

        <Form method="post">
          <Column gap={4}>
            <Input
              name="title"
              label="Title"
              defaultValue={loaderData.todo.title}
              error={errors?.title?.[0]}
            />
            <Textarea
              name="notes"
              label="Notes"
              defaultValue={loaderData.todo.notes}
              error={errors?.notes?.[0]}
            />
            <Button pending={isSaving} pendingLabel="saving..." selfStart>
              Save
            </Button>
          </Column>
        </Form>
      </Column>
    </PageBody>
  );
}
