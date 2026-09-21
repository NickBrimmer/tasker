import { useEffect, useRef } from "react";
import { Form, href, useFetcher, useNavigation } from "react-router";
import {
  Button,
  CheckButton,
  Column,
  Hidden,
  Input,
  List,
  ListRow,
  PageBody,
  Row,
  TabLink,
  Tabs,
  TitleLink,
} from "~/components";
import {
  addItem,
  deleteById,
  getItemsByCategory,
  toggleTodo,
  type Todo,
  type TodoStatus,
} from "~/database.server";
import type { Route } from "./+types/index";

function parseStatus(value: string | null): TodoStatus | undefined {
  return value === "open" || value === "done" ? value : undefined;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const status = parseStatus(new URL(request.url).searchParams.get("status"));

  return {
    todos: getItemsByCategory({ listSlug: params.listSlug, status }),
    status: status ?? null,
  };
}

export async function action({ params, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "add") {
    const title = String(formData.get("title") ?? "").trim();
    if (title) addItem(params.listSlug, title);
    return null;
  }

  const id = String(formData.get("id") ?? "");
  if (intent === "toggle") toggleTodo(id);
  if (intent === "delete") deleteById(id);

  return null;
}

const STATUS_TABS: { value: TodoStatus | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "open", label: "Open" },
  { value: "done", label: "Done" },
];

type StatusTabsProps = {
  current: TodoStatus | null;
};

function StatusTabs(props: StatusTabsProps) {
  return (
    <Tabs>
      {STATUS_TABS.map((tab) => (
        <TabLink
          key={tab.label}
          to={tab.value ? `status=${tab.value}` : "?"}
          active={props.current === tab.value}
        >
          {tab.label}
        </TabLink>
      ))}
    </Tabs>
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
    <PageBody>
      <Column gap={4}>
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

        <StatusTabs current={loaderData.status} />
        <List>
          {loaderData.todos.map((todo) => (
            <TodoRow key={todo.id} todo={todo} listSlug={todo.listSlug} />
          ))}
        </List>
      </Column>
    </PageBody>
  );
}

type TodoRowProps = {
  todo: Todo;
  listSlug: string;
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
    <ListRow>
      <fetcher.Form method="post">
        <Hidden name="id" value={props.todo.id} />
        <Hidden name="intent" value="toggle" />
        <CheckButton checked={isDone} label={props.todo.title} />
      </fetcher.Form>

      <TitleLink
        to={href("/collection/:listSlug/todo/:todoId", {
          listSlug: props.listSlug,
          todoId: props.todo.id,
        })}
        strike={isDone}
      >
        {props.todo.title}
      </TitleLink>

      <fetcher.Form method="post">
        <Hidden name="id" value={props.todo.id} />
        <Hidden name="intent" value="delete" />
        <Button variant="ghost" danger size="sm">
          Delete
        </Button>
      </fetcher.Form>
    </ListRow>
  );
}
