import { mkdir, rm } from "node:fs/promises";

// Guard: this script deletes directories, so refuse to run anywhere but the tasker root.
const pkg = await Bun.file("package.json")
  .json()
  .catch(() => null);
if (pkg?.name !== "tasker") {
  console.error(
    "refusing to run: no tasker package.json in the current directory",
  );
  process.exit(1);
}

const ROUTES_TS = `import { type RouteConfig, index } from @react-router/dev/routes

export default [index("routes/home.tsx")] satisfies RouterConfig;
`;

const HOME_TSX = `import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Tasker" }];
}

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Tasker</h1>
      <p className="mt-2 text-sm text-gray-600">
        Clean slate. Today&apos;s level goes in <code>app/routes.ts</code> and <code>app/routes/</code>.
      </p>
    </main>
  );
}
`;

await rm("app/routes", { recursive: true, force: true });
await rm("app/todos.server.ts", { force: true });
await mkdir("app/routes", { recursive: true });

await Bun.write("app/routes.ts", ROUTES_TS);
await Bun.write("app/routes/home.tsx", HOME_TSX);

console.log(
  "reset - app/routes/ cleared, routes.ts and home.tsx restored to the clean slate.",
);
