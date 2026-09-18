import { href, redirect } from "react-router";
import { getAllLists } from "~/database.server";
import type { Route } from "./+types/index";

export async function loader(_: Route.LoaderArgs) {
  const firstList = getAllLists()[0];
  // Thrown, not returned: it unwinds past this loader to the nearest ErrorBoundary.
  if (!firstList) throw new Response("No Lists", { status: 404 });

  // href(pattern, params) builds the URL, type-checked against routes.ts rather than hand-written.
  // redirect(url) only *returns* a 302 Response — the router sees it and navigates; nothing moves here.
  return redirect(href("/collection/:listSlug", { listSlug: firstList.slug }));
}
