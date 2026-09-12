import { href, isRouteErrorResponse, NavLink, Outlet } from "react-router";
import { countByStatus, getList, listLists } from "~/todos.server";
import type { Route } from "./+types/layout";

export async function loader({ params }: Route.LoaderArgs) {
  const list = getList(params.slug);
  if (!list) throw new Response("List not found", { status: 404 });

  return {
    list,
    lists: listLists(),
    counts: countByStatus(list.slug),
  };
}

export default function ListLayout({ loaderData }: Route.ComponentProps) {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <header className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <nav className="flex gap-3">
          {loaderData.lists.map((list) => (
            <NavLink
              key={list.slug}
              to={href("/list/:slug", { slug: list.slug })}
              end
              className={({ isActive }) =>
                isActive
                  ? "font-semibold text-gray-900 dark:text-gray-100"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }
            >
              {list.name}
            </NavLink>
          ))}
        </nav>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {loaderData.counts.open} open · {loaderData.counts.done} done
        </p>
      </header>

      <Outlet />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">
        {isNotFound ? "Not found" : "Something broke"}
      </h1>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        {isNotFound
          ? "That list or todo does not exist."
          : "An unexpected error occurred."}
      </p>
      <NavLink to="/" className="mt-4 inline-block text-sm underline">
        Back to the first list
      </NavLink>
    </div>
  );
}
