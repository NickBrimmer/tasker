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
import { countTodosByStatus, findList, getAllLists } from "~/todos.server";
import type { Route } from "./+types/layout";

export async function loader({ params }: Route.LoaderArgs) {
  const list = findList(params.listSlug);
  // Thrown, not returned: it unwinds past this loader to the nearest ErrorBoundary.
  if (!list) throw new Response("List not found", { status: 404 });

  return {
    list,
    lists: getAllLists(),
    counts: countTodosByStatus(list.slug),
  };
}

// Typegen's props for this route: typed loaderData, actionData, params, matches.
export default function ListLayout({ loaderData }: Route.ComponentProps) {
  return (
    <Page>
      <PageHeader>
        <Column gap={2}>
          <Tabs>
            {loaderData.lists.map((list) => (
              <TabLink
                key={list.slug}
                to={href("/collection/:listSlug", { listSlug: list.slug })}
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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <Page>
      <Column gap={4}>
        <Column gap={2}>
          <Heading size="xl">
            {isNotFound ? "Not found" : "Something broke"}
          </Heading>
          <Text muted>
            {isNotFound
              ? "That list or todo does not exist."
              : "An unexpected error occurred."}
          </Text>
        </Column>
        <TextLink to="/" tone="normal" underline selfStart>
          Back to the first list
        </TextLink>
      </Column>
    </Page>
  );
}
