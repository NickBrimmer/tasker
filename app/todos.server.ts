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

// this is your Todos - this is your DB!
let todos: Todo[] = [
  makeTodo("inbox", "React the React Docs", "Framework mode, not declaritive"),
  makeTodo("inbox", "rebuild tasker from a blank routes.ts", ""),
  makeTodo(
    "someday",
    "try the v8 future flags one at a time",
    "bun dev prints all five",
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

export function getAllLists(): List[] {
  return lists;
}

export function findList(slug: string): List | undefined {
  return lists.find((list) => list.slug === slug);
}

export type GetTodosParams = {
  listSlug: string;
  status?: TodoStatus;
};

export function getTodos(params: GetTodosParams): Todo[] {
  return todos
    .filter((todo) => todo.listSlug === params.listSlug)
    .filter((todo) => (params.status ? todo.status === params.status : true))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function findById(id: string): Todo | undefined {
  return todos.find((todo) => todo.id === id);
}

export function countTodosByStatus(listSlug: string): {
  open: number;
  done: number;
} {
  const inList = todos.filter((todo) => todo.listSlug === listSlug);

  return {
    open: inList.filter((todo) => todo.status === "open").length,
    done: inList.filter((todo) => todo.status === "done").length,
  };
}

export function addItem(listSlug: string, title: string): Todo {
  const todo = makeTodo(listSlug, title, "");
  todos.push(todo);

  return todo;
}

export function toggleTodo(id: string): void {
  const todo = findById(id);
  if (!todo) return;

  todo.status = todo.status === "open" ? "done" : "open";
}

export function deleteById(id: string): void {
  todos = todos.filter((todo) => todo.id !== id);
}

export type UpdateTodoParams = {
  id: string;
  title: string;
  notes: string;
};

export function updateById(params: UpdateTodoParams): void {
  const todo = findById(params.id);
  if (!todo) return;

  todo.title = params.title;
  todo.notes = params.notes;
}
