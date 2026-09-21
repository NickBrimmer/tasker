import { href, redirect } from "react-router";
import { getAllLists } from "~/database.server";

import type { Route } from "./+types/index";

export async function loader(_: Route.LoaderArgs) {
  const firstList = getAllLists()[0];
  if (!firstList) throw new Response("No Lists", { status: 404 });

  return redirect(href("/list/:listSlug", { listSlug: firstList.slug }));
}
