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

function makeItem(listSlug: string, title, notes: string): Todo {
  return {
    id: crypto.randomUUID(),
    listSlug,
    title,
    notes,
    status: "open",
    createdAt: new Date(),
  };
}

//category seed data
const listsTable: List[] = [
  { slug: "inbox", name: "Inbox" },
  { slug: "someday", name: "Someday" },
];

let todosTable: Todo[] = [
  makeItem("inbox", "React the React Docs", "Framework mode, not declaritive"),
  makeItem("inbox", "rebuild tasker from a blank routes.ts", ""),
  makeItem(
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

export function findItemById(id: string): Todo | undefined {
  return todosTable.find((todo) => todo.id === id);
}

export function countItemsByStatus(listSlug: string): {
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
  const todo = makeItem(listSlug, title, "");
  todosTable.push(todo);

  return todo;
}

export function toggleItemStatus(id: string): void {
  const todo = findItemById(id);
  if (!todo) return;

  todo.status = todo.status === "open" ? "done" : "open";
}

export function deleteItemById(id: string): void {
  todosTable = todosTable.filter((todo) => todo.id !== id);
}

export type UpdateTodoParams = {
  id: string;
  title: string;
  notes: string;
};

export function updateItemById(params: UpdateTodoParams): void {
  const todo = findItemById(params.id);
  if (!todo) return;

  todo.title = params.title;
  todo.notes = params.notes;
}
