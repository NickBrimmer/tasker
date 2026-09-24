import { expect, test } from "bun:test";
import {
  addItem,
  countItemsByStatus,
  deleteItemById,
  findItemById,
  getItemsByCategory,
  toggleItemStatus,
  updateItemById,
} from "./database.server";

test("adds a todo to the right list and leaves it open", () => {
  const todo = addItem("inbox", "Write a test");

  expect(todo.listSlug).toBe("inbox");
  expect(todo.status).toBe("open");
  expect(findItemById(todo.id)?.title).toBe("Write a test");

  deleteItemById(todo.id);
});

test("toggle flips status both ways and moves the counts", () => {
  const before = countItemsByStatus("inbox");
  const todo = addItem("inbox", "Toggle me");

  toggleItemStatus(todo.id);
  expect(findItemById(todo.id)?.status).toBe("done");
  expect(countItemsByStatus("inbox").done).toBe(before.done + 1);

  toggleItemStatus(todo.id);
  expect(findItemById(todo.id)?.status).toBe("open");

  deleteItemById(todo.id);
});

test("status filter returns only matching todos", () => {
  const open = addItem("inbox", "Still open");
  const done = addItem("inbox", "Already done");
  toggleItemStatus(done.id);

  const doneIds = getItemsByCategory({ listSlug: "inbox", status: "done" }).map(
    (t) => t.id,
  );
  expect(doneIds).toContain(done.id);
  expect(doneIds).not.toContain(open.id);

  deleteItemById(open.id);
  deleteItemById(done.id);
});

test("todos are scoped to their list", () => {
  const todo = addItem("someday", "Not in the inbox");

  expect(
    getItemsByCategory({ listSlug: "inbox" }).map((t) => t.id),
  ).not.toContain(todo.id);
  expect(
    getItemsByCategory({ listSlug: "someday" }).map((t) => t.id),
  ).toContain(todo.id);

  deleteItemById(todo.id);
});

test("update rewrites title and notes", () => {
  const todo = addItem("inbox", "Before");
  updateItemById({ id: todo.id, title: "After", notes: "With notes" });

  expect(findItemById(todo.id)?.title).toBe("After");
  expect(findItemById(todo.id)?.notes).toBe("With notes");

  deleteItemById(todo.id);
});
