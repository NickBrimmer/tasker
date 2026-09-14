import { href, redirect } from "react-router";
import { listLists } from "~/todos.server";
import type { Route } from "./+types/index";

export async function loader(_: Route.LoaderArgs) {
  const firstList = listLists()[0];
  if (!firstList) throw new Response("No Lists", { status: 404 });

  return redirect(href("/list/:slug", { slug: firstList.slug }));
}
