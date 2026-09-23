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
// category seed data
const listsTable: List[] = [
  { slug: "inbox", name: "Inbox" },
  { slug: "someday", name: "Someday" },
];

// this is your Todos table! This is your DB Table!
let todosTable: Todo[] = [
  makeTodo("inbox", "React the React Docs", "Framework mode, not declaritive"),
  makeTodo("inbox", "rebuild tasker from a blank routes.ts", ""),
  makeTodo(
    "someday",
    "try the v8 future flags one at a time",
    "bun dev prints all five",
  ),
];

export function getAllLists(): List[] {
  return listsTable;
}

export function findList(slug: string): List | undefined {
  return listsTable.find((list) => list.slug === slug);
}

export type GetItemsByCategoryParams = {
  listSlug: string;
  status?: TodoStatus;
};
export function getItemsByCategory(params: GetItemsByCategoryParams): Todo[] {
  return todosTable
    .filter((todo) => todo.listSlug === params.listSlug)
    .filter((todo) => (params.status ? todo.status === params.status : true))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function findById(id: string): Todo | undefined {
  return todosTable.find((todo) => todo.id === id);
}

export function countTodosByStatus(listSlug: string): {
  open: number;
  done: number;
} {
  const inList = todosTable.filter((todo) => todo.listSlug === listSlug);

  return {
    open: inList.filter((todo) => todo.status === "open").length,
    done: inList.filter((todo) => todo.status === "done").length,
  };
}

export function addItem(listSlug: string, title: string): Todo {
  const todo = makeTodo(listSlug, title, "");
  todosTable.push(todo);

  return todo;
}

export function toggleTodo(id: string): void {
  const todo = findById(id);
  if (!todo) return;

  todo.status = todo.status === "open" ? "done" : "open";
}

export function deleteById(id: string): void {
  todosTable = todosTable.filter((todo) => todo.id !== id);
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
