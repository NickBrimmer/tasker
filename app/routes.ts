import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // index(file) — renders at its parent's path exactly, adding no URL segment of its own.
  index("routes/index.tsx"),

  // route(path, file, children?) — path first, module second; children's paths are relative to this one.
  route("list/:listSlug", "routes/list/layout.tsx", [
    // A child index fills its parent's <Outlet /> at /list/:listSlug with nothing appended.
    index("routes/list/index.tsx"),
    route("todo/:todoId", "routes/list/todo.tsx"),
    route("todo/:todoId/edit", "routes/list/edit.tsx"),
  ]),
  // satisfies (not `:`) type-checks the array while keeping its exact shape for typegen to read.
] satisfies RouteConfig;
