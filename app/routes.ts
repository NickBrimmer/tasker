import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("list/:slug", "routes/list/layout.tsx", [
    index("routes/list/index.tsx"),
    route("todo/:todoId", "routes/list/todo.tsx"),
    route("todo/:todoId/edit", "routes/list/edit.tsx"),
  ]),
] satisfies RouteConfig;
