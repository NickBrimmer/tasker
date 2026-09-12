export type TodoStatus = "open" | "done";

export type Todo = {
  id: string;
  listSlug: string;
  title: string;
  notes: string;
  status: TodoStatus;
  createdAt: Date;
};

export type List = {
  slug: string;
  name: string;
};

const lists: List[] = [
  { slug: "inbox", name: "Inbox" },
  { slug: "someday", name: "Someday" },
];

let todos: Todo[] = [
  makeTodo(
    "inbox",
    "Read the React Router routing docs",
    "Framework mode, not declarative.",
  ),
  makeTodo("inbox", "Rebuild Tasker from a blank routes.ts", ""),
  makeTodo(
    "someday",
    "Try the v8 future flags one at a time",
    "bun dev prints all five.",
  ),
];

function makeTodo(listSlug: string, title: string, notes: string): Todo {
  return {
    id: crypto.randomUUID(),
    listSlug,
    title,
    notes,
    status: "open",
    createdAt: new Date(),
  };
}

export function listLists(): List[] {
  return lists;
}

export function getList(slug: string): List | undefined {
  return lists.find((list) => list.slug === slug);
}

export type ListTodosParams = {
  listSlug: string;
  status?: TodoStatus;
};

export function listTodos(params: ListTodosParams): Todo[] {
  return todos
    .filter((todo) => todo.listSlug === params.listSlug)
    .filter((todo) => (params.status ? todo.status === params.status : true))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function getTodo(id: string): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

export function countByStatus(listSlug: string): {
  open: number;
  done: number;
} {
  const inList = todos.filter((todo) => todo.listSlug === listSlug);

  return {
    open: inList.filter((todo) => todo.status === "open").length,
    done: inList.filter((todo) => todo.status === "done").length,
  };
}

export function addTodo(listSlug: string, title: string): Todo {
  const todo = makeTodo(listSlug, title, "");
  todos.push(todo);

  return todo;
}

export function toggleTodo(id: string): void {
  const todo = getTodo(id);
  if (!todo) return;

  todo.status = todo.status === "open" ? "done" : "open";
}

export function deleteTodo(id: string): void {
  todos = todos.filter((todo) => todo.id !== id);
}

export type UpdateTodoParams = {
  id: string;
  title: string;
  notes: string;
};

export function updateTodo(params: UpdateTodoParams): void {
  const todo = getTodo(params.id);
  if (!todo) return;

  todo.title = params.title;
  todo.notes = params.notes;
}
