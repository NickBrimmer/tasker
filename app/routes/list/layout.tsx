import { href, isRouteErrorResponse, Outlet } from "react-router";
import {
  Header,
  Heading,
  Nav,
  Page,
  Stack,
  TabLink,
  Text,
  TextLink,
} from "~/components";
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
    <Page>
      <Header>
        <Stack gap={2}>
          <Nav>
            {loaderData.lists.map((list) => (
              <TabLink
                key={list.slug}
                to={href("/list/:slug", { slug: list.slug })}
                end
              >
                {list.name}
              </TabLink>
            ))}
          </Nav>
          <Text muted>
            {loaderData.counts.open} open · {loaderData.counts.done} done
          </Text>
        </Stack>
      </Header>

      <Outlet />
    </Page>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <Page>
      <Stack gap={4}>
        <Stack gap={2}>
          <Heading size="xl">
            {isNotFound ? "Not found" : "Something broke"}
          </Heading>
          <Text muted>
            {isNotFound
              ? "That list or todo does not exist."
              : "An unexpected error occurred."}
          </Text>
        </Stack>
        <TextLink to="/" tone="normal" underline selfStart>
          Back to the first list
        </TextLink>
      </Stack>
    </Page>
  );
}
