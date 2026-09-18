# Tasker — a 30-minute daily to-do app

A tiny to-do app I rebuild from a blank `routes.ts` in a **30-minute box**, most days.

The goal is reps on React Router 7 routing, loaders/actions, Bun and typesafe TypeScript — the stack I use at work. Routing is the part that's new to me, so routing is the whole point. The app itself is disposable; the muscle memory is the product.

```bash
bun install
bun run dev      # http://localhost:3000
bun run check    # react-router typegen && tsc
bun test
bun run reset    # wipe the daily surface, back to a blank slate
```

---

## The two rules

**30 minutes.** If a thing can't be typed from a blank file in that window, it doesn't belong in Tier 1. That rules out a database, auth, and anything with a schema.

**The lab principle.** Where a version or tool upgrade is coming at work, Tasker sits at work's _current_ version so the migration itself becomes a kata — practised small and low-stakes before it has to happen for real. See [Upgrade katas](#upgrade-katas).

---

## No database (Tier 1)

The store is a module-level array on the server — see `app/todos.server.ts`.

**Why:** a DB is the biggest time sink in a 30-minute box — migration, model type, client setup, seed data — and none of it teaches routing. Dropping it means every minute goes to `routes.ts`, loaders, actions and types.

**The cost:** the array resets whenever the server module reloads. For practice that's fine, and arguably useful — it forces you to reason about where server state actually lives.

---

## What the app does

Features picked by **which routing concept they force**, not by what a to-do app "should" have:

| Feature          | Routing concept it forces                                                |
| ---------------- | ------------------------------------------------------------------------ |
| List todos       | `index()` route + `loader` + typed `Route.ComponentProps`                |
| Add a todo       | `action` + `<Form method="post">` + revalidation                         |
| Toggle done      | `useFetcher` — a mutation with **no navigation**                         |
| Delete a todo    | fetcher with an `intent` field — two actions, one route                  |
| Todo detail page | dynamic segment `:todoId`, `params` typing, 404 via `throw new Response` |
| Edit + save      | `redirect()` out of an action, `href()` for the target                   |
| Filter by status | search params as state — `?status=open`                                  |
| Multiple lists   | nested layout route + `<Outlet />` + which loader revalidates            |

Deliberately absent: tags/many-to-many, due dates, priorities, drag-and-drop, auth. None of them teach routing.

---

## The ladder — one level per session

Each level is a full app you could stop at. **Build from a blank `routes.ts` each time, through the level you're on.** Repeat a level until it's boring, then move up — L1–L3 being automatic is worth more than having touched L8 once.

| #      | Build this                                                                                 | New concept                                                   | Answer key                                      |
| ------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ----------------------------------------------- |
| **L1** | One route. Loader returns the array; `<Form method="post">` adds a todo.                   | `routes.ts` · `loader` · `action` · `Route.LoaderArgs`        | `app/routes/list/index.tsx`                     |
| **L2** | Add `/todo/:todoId`. Link from the list; 404 on a bad id.                                  | dynamic params · `href()` typed links · `throw new Response`  | `app/routes/list/todo.tsx`                      |
| **L3** | Wrap in a layout route with a header + `<Outlet />`. Layout gets its own loader (a count). | nested routes · nested loaders · what revalidates             | `app/routes/list/layout.tsx`                    |
| **L4** | Toggle done inline — no navigation, no full reload. First `bun test`.                      | `useFetcher` · optimistic UI from `fetcher.formData`          | `TodoRow` in `app/routes/list/index.tsx`        |
| **L5** | `?status=open` filter that survives reload and is linkable.                                | search params in the loader · `useSearchParams`               | `loader` in `app/routes/list/index.tsx`         |
| **L6** | Edit page that saves and redirects back. Zod-validate the title; show a field error.       | `redirect()` from an action · returning errors from an action | `app/routes/list/edit.tsx`                      |
| **L7** | Break it on purpose. Add an `ErrorBoundary` and a pending state.                           | `ErrorBoundary` · `useNavigation` pending UI                  | `ErrorBoundary` in `app/routes/list/layout.tsx` |
| **L8** | Split lists: `/list/:listSlug` layout, list picker at `/`.                                 | nested `route()` · index redirect · param-scoped loaders      | `app/routes.ts` + `app/routes/index.tsx`        |

Read the answer key without disturbing your working tree:

```bash
git show reference:app/routes/list/index.tsx
git diff reference -- app/routes      # how today's attempt differs
```

### Two things worth internalising

**Typesafety runs through all eight levels.** `+types/<name>` files are _generated_, never hand-written — `bun run check` runs `react-router typegen && tsc`. `Route.LoaderArgs`, `Route.ActionArgs` and `Route.ComponentProps` come from there, and `href()` is type-checked against `routes.ts`, so a renamed route breaks the build instead of 404ing at runtime. That clicks on L2.

**The `?index` gotcha.** When an index route and its parent layout share a URL, a POST to that URL is ambiguous and React Router resolves it to the _parent_. `<Form>` handles this for you — it renders `action="/list/inbox?index"` — but a hand-written `fetch`/`curl` to `/list/inbox` hits the layout, which has no action, and returns **405 Method Not Allowed**. If an action mysteriously doesn't run, check for the missing `?index`.

---

## Bun is part of the practice

Not just the package manager. Three things worth deliberately noticing:

- **`bunx --bun`** — the `--bun` flag forces the Bun runtime instead of letting the shim fall back to Node. Non-obvious, and exactly the kind of thing that bites during a toolchain change.
- **`bun test`** — the built-in runner, `import { test, expect } from "bun:test"`. No vitest, no jest, no config.
- **`bun run scripts/*.ts`** — TypeScript executed directly, no build step. `scripts/reset.ts` is the smallest possible excuse to write one.

`Bun.file` / `Bun.write` show up in the persistence tier below.

---

## Daily workflow

Delete-and-rewrite in one repo rather than re-scaffolding. What makes that work is separating the stable scaffold from the daily surface.

**Never touch:** `package.json` · `tsconfig.json` · `vite.config.ts` · `react-router.config.ts` · `app/root.tsx` · `app/app.css` · `.agents/`

**Delete and rewrite daily:** `app/routes.ts` · `app/routes/**` · `app/todos.server.ts`

`bun run reset` clears the daily surface and writes back a blank `routes.ts` plus a stub `home.tsx` — a two-second clean slate.

> **Tag the reference before your first reset**, or the answer key is gone:
>
> ```bash
> git tag reference        # points at the finished L1–L8 build
> bun run reset
> git add -A && git commit -m "clean slate"
> ```

**Git as the practice log:** one commit per session — `day 014 — L3 nested layouts (28 min)` — then `git tag day-014`. The tag list _is_ the log.

**Other things that keep the box at 30 minutes:**

- **Styling: none.** Plain HTML, maybe four Tailwind classes. The easiest way to burn 25 of the 30 minutes.
- **Write the level's acceptance check first**, one line in a comment: "I can add a todo and it survives a refresh." Then build to it.
- **Log one line per day** in the commit body — level, minutes, what slowed you down. That last field tells you which level to repeat.
- **Stop at 30 minutes even if unfinished.** Where you stopped is the useful data.

---

## Reading master side by side

A second checkout of `master` in its own folder, so the finished code sits open next to the file you're retyping. One repo, one history, two working trees.

**Set it up:**

```bash
git worktree add ../tasker-master master   # master checked out at ../tasker-master
code --add ../tasker-master                # adds it as a second root folder in the current VS Code window
```

Then **File → Save Workspace As…**, saved _outside_ both folders (`~/Developer/tasker.code-workspace`) — dropped inside either one it shows up as an untracked file.

**Start the branch with the work stripped back out.** Branching off `master` hands you the files already written, so start from the commit _before_ whatever you want to redo — `6f2bb20` (`t-2-dependencies-and-base-colors`) is the last one before the components existed:

```bash
git switch --detach 6f2bb20   # step off the branch; git won't delete the one you're standing on
git branch -D t-3             # force-delete, safe while t-3 has no commits of its own
git switch -c t-3 6f2bb20     # t-3 restarts before the component work — app/components/ is gone
```

**Put it back:**

```bash
git worktree remove ../tasker-master   # deletes the folder; refuses if you left edits in it (--force overrides)
git worktree list                      # should show only the main checkout
git switch -c t-4 origin/master        # a fresh branch at master, to abandon a rewrite and start clean
```

**When it gets weird:**

```bash
git worktree prune    # you deleted the folder by hand and git still lists it
git worktree repair   # you moved or renamed a folder and the two ends lost track of each other
git fetch origin      # master looks stale — local master only moves when you pull it
```

---

## How this was set up

Scaffolded with `bunx create-react-router@latest tasker --package-manager bun`, then pinned by hand.

Notes from doing it, since the defaults have moved on:

- The default template now produces **React Router 8 + Vite 8**, not 7.
- The `--react-router-version` flag is a **no-op for `package.json`** — scaffolding with and without it produced identical output. Pin by hand.
- Vite 7 has no built-in `resolve.tsconfigPaths`, so the `vite-tsconfig-paths` plugin is required.
- Deleted from the template: `app/welcome/`, `Dockerfile`, `.dockerignore`.
- Kept `.agents/skills/react-router/` — framework-mode reference docs, useful in-repo.

**TypeScript 6 needed one fix:** it errors on `baseUrl` —

```
error TS5101: Option 'baseUrl' is deprecated and will stop functioning in TypeScript 7.0.
```

Removing `baseUrl` fixes it; `paths` resolves relative to the tsconfig without it. The alternative, `"ignoreDeprecations": "6.0"`, defers rather than fixes.

Running versions: `react-router@7.18.0`, `typescript@6.0.3`, `vite@7.3.6`, `react@19.3.0`, `zod@4.6.2`.

---

## Future iterations of practice

Roughly ordered. Each is its own tier, to plan properly when I get there.

### Upgrade katas

- **React Router 7 → 8.** Do it here first, then at work. `bun run dev` already prints the migration checklist for free — RR 7.18 emits five future-flag warnings, each naming a behaviour change and the flag to opt in early: `v8_middleware`, `v8_splitRouteModules`, `v8_viteEnvironmentApi`, `v8_passThroughRequests`, `v8_trailingSlashAwareDataRequests`. Flipping them on one at a time _is_ the kata.
- **TypeScript upgrade.** Pinned at `^6.0.3` here, deliberately ahead of work. Next kata is 6 → 7 — TS 7 is the native Go port, the more consequential jump.

### Persistence without a DB

JSON file via `Bun.file` / `Bun.write`. Removes the HMR-reset annoyance, makes you think about read/write races, and is a real Bun API rep.

### Custom loader/action wrappers

The patterns I use daily at work, once raw loaders/actions are automatic:

- A typed `createAction(schema)` + `useAction(href)` pair wrapping `useFetcher`, so actions are Zod-validated at the boundary and callers never read a result.
- **Loader-only routes** with no default export, fetched on demand by a `useLoader(href, { disabled })` hook — the pattern behind data-fetching modals and pickers. No equivalent in the React Router docs, so worth its own tier.
- Server-function test harnesses that call a route's `loader`/`action` directly with a session cookie, no browser.

### Kysely + pglite

The real database tier. pglite means no Docker and no Postgres service, so a rebuild stays viable. Rough ladder:

1. `selectFrom` / `where` / `orderBy`
2. `insertInto` + `.returning()`, `updateTable`
3. `innerJoin` + an `exists()` access gate
4. `jsonArrayFrom` for nested arrays
5. `$if()` conditional filters instead of JS `if`
6. `selectNoFrom` combining access check + count + page in one round trip
7. Transactional soft-delete diff — read, diff, `UPDATE removed_at` / `INSERT ON CONFLICT DO UPDATE`

Rungs 6 and 7 are where production style diverges most from generic Kysely tutorials. Schema would grow to roughly `users` / `sessions` / `lists` / `todos` — enough for a slug-routed access gate.

### CSV uploads

Upload-endpoint practice: `multipart/form-data` in an action, streaming vs. buffering, parsing, per-row validation, reporting row errors to the UI, and the map → review → import flow shape. After Kysely, so imported rows have somewhere to land.

### Background worker — "Upload v2"

A second process polling a `tasks` table, processing uploads in the background instead of in the request. No Redis, no SQS — the DB table _is_ the queue. Smallest honest version is a `tasks` table, a `bun run worker` polling loop, and one executor. Needs Kysely and CSV upload first.

---

## Open questions

| Question                                          | Notes                                                                                           |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| TS 6 now, or start at 5.9.3 to match work?        | Running on 6. Starting at 5.9.3 would add a 5.9 → 6 kata instead. One-line change whenever.     |
| Repeat-until-boring, or move up a level each day? | Leaning repeat-until-boring.                                                                    |
| Tailwind, or plain CSS?                           | Template includes it; leaving it rather than spending time removing it. Just not using it much. |

---

## Status

All eight levels are implemented and committed as the reference build. Verified: `bun run check` clean and `bun test` 5/5.

Exercised end-to-end against the dev server — redirect from `/`, 404s on bad list / bad todo / cross-list access, add, toggle, both filters, both Zod error branches, successful save + redirect, and nested layout counts revalidating after every mutation.

**Delete is the exception.** The earlier claim that it was exercised end-to-end was wrong: the fetcher form posted a second `id` field instead of `intent`, so the action matched no branch and delete silently did nothing. `deleteById` itself was always correct and always covered by `bun test` — the break was in the form wiring, which nothing tests. Fixed, but not yet re-run against the dev server.

Not yet verified in a browser: delete, the optimistic toggle, pending button states, and `NavLink` active styling are server-correct but visually unconfirmed.
