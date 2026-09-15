import { expect, test } from "bun:test";
import {
  addTodo,
  countTodosByStatus,
  deleteTodo,
  findTodo,
  getTodos,
  toggleTodo,
  updateTodo,
} from "./todos.server";

test("adds a todo to the right list and leaves it open", () => {
  const todo = addTodo("inbox", "Write a test");

  expect(todo.listSlug).toBe("inbox");
  expect(todo.status).toBe("open");
  expect(findTodo(todo.id)?.title).toBe("Write a test");

  deleteTodo(todo.id);
});

test("toggle flips status both ways and moves the counts", () => {
  const before = countTodosByStatus("inbox");
  const todo = addTodo("inbox", "Toggle me");

  toggleTodo(todo.id);
  expect(findTodo(todo.id)?.status).toBe("done");
  expect(countTodosByStatus("inbox").done).toBe(before.done + 1);

  toggleTodo(todo.id);
  expect(findTodo(todo.id)?.status).toBe("open");

  deleteTodo(todo.id);
});

test("status filter returns only matching todos", () => {
  const open = addTodo("inbox", "Still open");
  const done = addTodo("inbox", "Already done");
  toggleTodo(done.id);

  const doneIds = getTodos({ listSlug: "inbox", status: "done" }).map(
    (t) => t.id,
  );
  expect(doneIds).toContain(done.id);
  expect(doneIds).not.toContain(open.id);

  deleteTodo(open.id);
  deleteTodo(done.id);
});

test("todos are scoped to their list", () => {
  const todo = addTodo("someday", "Not in the inbox");

  expect(getTodos({ listSlug: "inbox" }).map((t) => t.id)).not.toContain(
    todo.id,
  );
  expect(getTodos({ listSlug: "someday" }).map((t) => t.id)).toContain(
    todo.id,
  );

  deleteTodo(todo.id);
});

test("update rewrites title and notes", () => {
  const todo = addTodo("inbox", "Before");
  updateTodo({ id: todo.id, title: "After", notes: "With notes" });

  expect(findTodo(todo.id)?.title).toBe("After");
  expect(findTodo(todo.id)?.notes).toBe("With notes");

  deleteTodo(todo.id);
});
