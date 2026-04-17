# TeloHive Dashboard

A space discovery and management dashboard built with Next.js 15, TypeScript, and Tailwind CSS. Users can search and filter 500+ venues, save favourites, track bookings, and view activity analytics.

**Live demo:** [REPLACE_WITH_VERCEL_URL]  
**Repo:** https://github.com/jay2533/telohive-dashboard

---

## Setup

This project requires two processes running simultaneously.

**1. Install dependencies**
```bash
npm install
```

**2. Start the mock API (Terminal 1)**
```bash
npm run server
# json-server starts on http://localhost:3001
```

**3. Start the Next.js app (Terminal 2)**
```bash
npm run dev
# App starts on http://localhost:3000
```

Or run both together:
```bash
npm run dev:all
```

**Test credentials**  
Any email + any password (8+ characters) will work. The auth is mocked — no real backend.

---

## Running Tests

```bash
npm test
```

92 tests across 4 files, all passing:

| File | Tests | What it covers |
|---|---|---|
| `filterUtils.test.ts` | 30 | AND filter composition, each filter in isolation, edge cases |
| `urlParams.test.ts` | 33 | Serialize/deserialize FilterState ↔ URL params, round-trips |
| `sortUtils.test.ts` | 14 | All 5 sort options, immutability, empty array |
| `useFilters.test.ts` | 15 | Hook state transitions, clearAllFilters, activeFilterCount |

---

## Architecture Overview

### Folder structure

Feature-based layout under `src/`:

```
src/
  app/                  # Next.js App Router pages
    login/              # LoginForm (Client) + page (Server shell)
    register/           # RegisterForm (Client) + page (Server shell)
    discovery/          # DiscoveryClient (Client) + page (Server shell)
    saved/              # SavedClient (Client) + page (Server shell)
    dashboard/          # DashboardClient (Client) + page (Server shell)
    bookings/           # BookingsClient (Client) + page (Server shell)
  components/
    discovery/          # SpaceCard, FilterPanel, ActiveFilterChips, VirtualizedGrid, SortDropdown
    layout/             # Sidebar, AppShell, MobileNav
    ui/                 # Toast
  hooks/                # useSpaces, useFilters, useSaved, useSort, useAuth
  lib/                  # auth.ts, filterUtils.ts, sortUtils.ts, urlParams.ts, debounce.ts, constants.ts
  types/                # index.ts — all shared TypeScript types
  __tests__/            # Vitest unit tests
```

I chose feature-based over domain-based because each route has a clear owner (discovery owns its components, bookings owns its table logic). Shared utilities live in `lib/`, shared UI in `components/ui/`. This makes it easy to find everything related to a feature without jumping across the tree.

---

## Server vs Client Component Decisions

Every page follows the same pattern: a Server Component shell that exports metadata and wraps a Client Component in `<Suspense>`.

**Server Components** (`page.tsx` files):
- Export `metadata` for SEO
- Wrap Client Components in `<Suspense>` with a skeleton fallback — required because the Client Components use `useSearchParams()` which needs a Suspense boundary in Next.js App Router
- No data fetching at the page level — all data comes from the API via hooks in the Client layer

**Client Components** (the `*Client.tsx` files and all components):
- Everything that reads URL params, calls hooks, or handles user interaction is a Client Component
- The entire app is effectively client-rendered after the initial shell, which is the right call here — the data is user-specific and comes from a local mock API, so there's no benefit to server-side data fetching

**Why not fetch spaces on the server?**  
The spaces data comes from `localhost:3001` (json-server), which is only available locally. Even in production the filter state lives in URL params, which means the relevant slice of data is determined client-side anyway. Server fetching would add complexity with no benefit.

---

## Filter State Design

`FilterState` is a discriminated union:

```typescript
type FilterState =
  | { kind: 'empty' }
  | {
      kind: 'active';
      categories: string[];
      cities: string[];
      priceRange: [number, number] | null;
      capacityRange: [number, number] | null;
      amenities: string[];
      minRating: number | null;
      searchQuery: string;
    };
```

The `kind: 'empty'` variant short-circuits `applyFilters` entirely — no iteration over 520 spaces when nothing is active. Empty arrays within `kind: 'active'` mean "no restriction on this field", so partial filter states work naturally.

**URL sync:** `useFilters` initialises from `useSearchParams()` on first render using a lazy `useState` initialiser. When any filter changes, `filterStateToParams()` serialises the state to a `URLSearchParams` object and `router.replace()` updates the URL without a navigation. The sync happens in a `useEffect` that watches filter state — never during render — to avoid the "setState during render" warning.

**Why URL params as source of truth?**  
Filter state in URL params means shareable links, browser back/forward navigation works correctly, and a page refresh restores the exact view. React state is derived from the URL on mount, not the other way around.

---

## Virtualization

**Choice:** `useWindowVirtualizer` from `@tanstack/react-virtual` v3.

**Why windowing over pagination:**  
The assignment explicitly required handling 500+ cards without layout jank. Cursor-based pagination would have required API changes (json-server supports `_page` and `_limit` but that means the filter/sort logic would need to move server-side, which conflicts with the URL-param-driven client filter architecture). Windowing lets all filtering, sorting, and searching happen in memory on the already-fetched dataset, which keeps the filter response instant.

**Why `useWindowVirtualizer` over `useVirtualizer`:**  
`useWindowVirtualizer` virtualises against the window scroll position rather than a scrollable container. This avoids nested scroll issues and works naturally with the sticky top bar layout. The downside is slightly less control over scroll behaviour, but for a card grid it's the right default.

**Implementation detail:** Spaces are chunked into rows based on column count (1/2/3/4 columns at 640/1024/1280px breakpoints, measured via `ResizeObserver`). Each virtual item is a row, not an individual card. This keeps the virtualizer's item count low (~130 rows for 520 spaces at 4 columns) and makes row height measurement accurate.

---

## State Management

No external state library. The decision tree was:

1. **Filter state** → URL params (source of truth), mirrored in `useState` via `useFilters`
2. **Spaces data** → `useSpaces` hook with local `useState` — fetched once on mount, never mutated
3. **Saved state** → `useSaved` hook with optimistic `useState` updates, synced to json-server
4. **Bookings state** → local `useState` in `BookingsClient` — scoped to that page, no need to share
5. **Auth session** → `localStorage` + `useAuth` hook — no global provider needed since auth state only affects the sidebar and protected route redirect

I considered Zustand for saved state (since it's referenced across Discovery and Saved pages) but decided against it — `useSaved` is a custom hook that both pages import, so the state is consistent within a session without a global store. The tradeoff is that the two pages don't share a single instance, but since they're never mounted simultaneously that doesn't cause inconsistency.

---

## Trade-offs

**What I chose and why:**

- **Client-side filtering over server-side:** Keeps filter response instant, lets URL params be the source of truth without round-trips. Works because the full dataset fits comfortably in memory (520 spaces).
- **Recharts over building a chart from scratch:** The assignment explicitly listed it as an acceptable option. A custom canvas chart would have taken 3x longer with no meaningful benefit for this scope.
- **`useWindowVirtualizer` over pagination:** See Virtualization section above.
- **No global state library:** The state topology is simple enough that co-located hooks cover everything without prop drilling or global stores.

**What I considered but rejected:**

- **React Query / SWR:** Would add caching and background refetch, which is overkill for a local mock API that doesn't change under the user.
- **Server-side filtering via json-server query params:** Would mean moving filter logic out of the client, losing instant filter response, and breaking the URL-param architecture.
- **Zustand for saved state:** Adds a dependency and indirection for a problem that a shared custom hook already solves cleanly.

---

## What I'd Improve With More Time

In priority order:

1. **Deploy json-server to Railway or Render** so the live demo works fully without local setup. Currently evaluators need to run json-server locally to see real data.
2. **Availability date filter** — marked as optional in the spec. Would require either storing availability windows per space in db.json or a calendar UI that filters by date overlap.
3. **Space detail page** — the "View Details" CTA currently has no destination. A `/spaces/[id]` page with full details, a photo gallery, and a booking form would complete the user journey.
4. **Optimistic updates on filter chips** — currently the grid re-renders after each filter change. Debouncing the grid update (separate from the URL sync debounce) would make rapid filter changes feel smoother.
5. **Error boundaries** — currently errors in individual components can bubble up. Per-component error boundaries with fallback UI would make the app more resilient.
6. **Persistent saved state across sessions** — currently saved spaces are fetched from json-server on mount, but if json-server restarts the saved list resets. A proper backend or at least localStorage fallback would fix this.
7. **Keyboard navigation on filter panel** — the category and amenity chips are clickable but not keyboard-navigable. Adding `role="checkbox"` and keyboard handlers would improve accessibility.

---

## Time Spent

~10 hours total.

- Phase 1 (types, filter/sort utils, tests): ~1.5 hrs
- Phase 2 (auth, middleware, sidebar, toast): ~1.5 hrs  
- Phase 3 (discovery page, hooks, virtualized grid): ~3 hrs
- Phase 4 (saved, dashboard, bookings): ~2 hrs
- Phase 5 (tests, polish, README): ~2 hrs