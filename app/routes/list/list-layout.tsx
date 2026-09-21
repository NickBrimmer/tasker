import { href, isRouteErrorResponse, Outlet } from "react-router";
import {
  Column,
  Heading,
  Page,
  PageHeader,
  TabLink,
  Tabs,
  Text,
  TextLink,
} from "~/components";
import { countTodosByStatus, findList, getAllLists } from "~/database.server";
import type { Route } from "./+types/list-layout";

export async function loader({ params }: Route.LoaderArgs) {
  const list = findList(params.listSlug);

  if (!list) throw new Response("List not found", { status: 404 });

  return {
    list,
    lists: getAllLists(),
    counts: countTodosByStatus(list.slug),
  };
}

export default function ListLayout({ loaderData }: Route.ComponentProps) {
  return (
    <Page>
      <PageHeader>
        <Column gap={2}>
          <Tabs>
            {loaderData.lists.map((list) => (
              <TabLink
                key={list.slug}
                to={href("/list/:listSlug", { listSlug: list.slug })}
                end
              >
                {list.name}
              </TabLink>
            ))}
          </Tabs>
          <Text muted>
            {loaderData.counts.open} open - {loaderData.counts.done} done
          </Text>
        </Column>
      </PageHeader>
      {/* Reads the route match one level below this layout and renders it: index, todo, or edit. */}
      <Outlet />
    </Page>
  );
}
