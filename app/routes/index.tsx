import { getAllLists } from "~/database.server";
import type { Route } from "./+types/index";
import { href, redirect } from "react-router";

export async function loader(_: Route.LoaderArgs) {
  const firstList = getAllLists()[0];
  if (!firstList) return;

  // href(pattern, params) bulds the URL, type-checked against routes.ts
  return redirect(href("/list/:listSlug", { listSlug: firstList.slug }));
}
