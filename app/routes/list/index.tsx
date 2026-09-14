import { useEffect, useRef } from "react";
import { Form, href, useFetcher, useNavigation } from "react-router";
import {
  Button,
  CheckButton,
  Hidden,
  Input,
  Item,
  List,
  Main,
  Row,
  Stack,
  TabLink,
  TextLink,
} from "~/components";
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
    if (title) addTodo(params.slug, title);
    return null;
  }

  const id = String(formData.get("id") ?? "");
  if (intent === "toggle") toggleTodo(id);
  if (intent === "delete") deleteTodo(id);

  return null;
}

type FilterLinkProps = {
  current: TodoStatus | null;
  value: TodoStatus | null;
  label: string;
};

function FilterLink(props: FilterLinkProps) {
  return (
    <TabLink
      to={props.value ? `?status=${props.value}` : "?"}
      active={props.current === props.value}
    >
      {props.label}
    </TabLink>
  );
}

export default function ListIndex({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);

  const isAdding = navigation.formData?.get("intent") === "add";

  useEffect(() => {
    if (!isAdding) formRef.current?.reset();
  }, [isAdding]);

  return (
    <Main>
      <Stack gap={4}>
        <Form ref={formRef} method="post">
          <Row gap={2}>
            <Hidden name="intent" value="add" />
            <Input
              name="title"
              label="New Todo"
              hideLabel
              required
              grow
              placeholder="What needs doing?"
            />
            <Button pending={isAdding} pendingLabel="adding...">
              Add
            </Button>
          </Row>
        </Form>

        <Row>
          <FilterLink current={loaderData.status} value={null} label="All" />
          <FilterLink current={loaderData.status} value="open" label="Open" />
          <FilterLink current={loaderData.status} value="done" label="Done" />
        </Row>

        <List>
          {loaderData.todos.map((todo) => (
            <TodoRow key={todo.id} todo={todo} slug={todo.listSlug} />
          ))}
        </List>
      </Stack>
    </Main>
  );
}

type TodoRowProps = {
  todo: Todo;
  slug: string;
};

function TodoRow(props: TodoRowProps) {
  const fetcher = useFetcher();

  const pendingIntent = fetcher.formData?.get("intent");
  const isDone =
    pendingIntent === "toggle"
      ? props.todo.status === "open"
      : props.todo.status === "done";

  if (pendingIntent === "delete") return null;

  return (
    <Item>
      <fetcher.Form method="post">
        <Hidden name="id" value={props.todo.id} />
        <Hidden name="intent" value="toggle" />
        <CheckButton checked={isDone} label={props.todo.title} />
      </fetcher.Form>

      <TextLink
        to={href("/list/:slug/todo/:todoId", {
          slug: props.slug,
          todoId: props.todo.id,
        })}
        tone="normal"
        grow
        strike={isDone}
      >
        {props.todo.title}
      </TextLink>

      <fetcher.Form method="post">
        <Hidden name="id" value={props.todo.id} />
        <Hidden name="intent" value="delete" />
        <Button variant="ghost" danger size="sm">
          Delete
        </Button>
      </fetcher.Form>
    </Item>
  );
}
