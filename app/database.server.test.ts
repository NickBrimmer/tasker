import { expect, test } from "bun:test";
import {
  addItem,
  countTodosByStatus,
  deleteById,
  findById,
  getItemsByCategory,
  toggleTodo,
  updateById,
} from "./database.server";

test("adds a todo to the right list and leaves it open", () => {
  const todo = addItem("inbox", "Write a test");

  expect(todo.listSlug).toBe("inbox");
  expect(todo.status).toBe("open");
  expect(findById(todo.id)?.title).toBe("Write a test");

  deleteById(todo.id);
});

test("toggle flips status both ways and moves the counts", () => {
  const before = countTodosByStatus("inbox");
  const todo = addItem("inbox", "Toggle me");

  toggleTodo(todo.id);
  expect(findById(todo.id)?.status).toBe("done");
  expect(countTodosByStatus("inbox").done).toBe(before.done + 1);

  toggleTodo(todo.id);
  expect(findById(todo.id)?.status).toBe("open");

  deleteById(todo.id);
});

test("status filter returns only matching todos", () => {
  const open = addItem("inbox", "Still open");
  const done = addItem("inbox", "Already done");
  toggleTodo(done.id);

  const doneIds = getItemsByCategory({ listSlug: "inbox", status: "done" }).map(
    (t) => t.id,
  );
  expect(doneIds).toContain(done.id);
  expect(doneIds).not.toContain(open.id);

  deleteById(open.id);
  deleteById(done.id);
});

test("todos are scoped to their list", () => {
  const todo = addItem("someday", "Not in the inbox");

  expect(
    getItemsByCategory({ listSlug: "inbox" }).map((t) => t.id),
  ).not.toContain(todo.id);
  expect(
    getItemsByCategory({ listSlug: "someday" }).map((t) => t.id),
  ).toContain(todo.id);

  deleteById(todo.id);
});

test("update rewrites title and notes", () => {
  const todo = addItem("inbox", "Before");
  updateById({ id: todo.id, title: "After", notes: "With notes" });

  expect(findById(todo.id)?.title).toBe("After");
  expect(findById(todo.id)?.notes).toBe("With notes");

  deleteById(todo.id);
});
