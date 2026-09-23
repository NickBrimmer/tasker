import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  //index(file) - renders at it's parent's path exactly, adding no URL of it's own
  index("routes/index.tsx"),

  // route(path, file, children?)
  route("list/:listSlug", "routes/list/list-layout.tsx", [
    index("routes/list/index.tsx"),
    route("todo/:todoId", "routes/list/todo-detail.tsx"),
    route("todo/:todoId/edit", "routes/list/edit-detail.tsx"),
  ]),
] satisfies RouteConfig;
