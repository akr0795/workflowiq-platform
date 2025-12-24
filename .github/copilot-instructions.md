# Copilot Instructions — enterprise-flow

Purpose: Short, actionable guidance to help an AI agent be productive quickly in this repo.

## Quick start (commands)
- Install dependencies: `npm i`
- Start dev server: `npm run dev` (Vite, default port 5173)
- Build for production: `npm run build` (use `npm run build:dev` for a dev-mode build)
- Preview build: `npm run preview`
- Lint: `npm run lint`

## Big picture
- A single-page React + TypeScript app bootstrapped with Vite.
- Client-side routing with `react-router-dom` (routes defined in `src/App.tsx`).
- Server state pattern: `@tanstack/react-query` (QueryClient provided in `App.tsx`).
- UI primitives follow the shadcn / Radix pattern under `src/components/ui/*` (styled with Tailwind + `cva`).
- No real backend yet: data comes from `src/data/mockData.ts` and `AuthContext` (mock users). Replace these with API hooks when integrating a backend.

## Key files & patterns (use these as authoritative examples)
- Routing & page registration: `src/App.tsx` — add new pages under `src/pages/` and register routes here (use `ProtectedRoute` for authenticated pages).
- Auth: `src/contexts/AuthContext.tsx` — **mock** users and role/permission checks; default login password is `password`. Roles: `admin`, `manager`, `developer`.
- Types: `src/types/index.ts` — canonical data model types (use these rather than ad-hoc types).
- Mock data: `src/data/mockData.ts` — example payloads for Projects/Tasks/Approvals/KPIs.
- UI primitives: `src/components/ui/*` — follow these building blocks (Dialog, Form, Input, Button, etc.).
  - Use `cn(...)` from `src/lib/utils.ts` to merge tailwind classes.
  - Use `buttonVariants` (see `src/components/ui/button.tsx`) and `cva` for variant-based styling.
- Layout: `src/components/layout/*` (e.g., `MainLayout`, `Sidebar`) shows standard layout patterns and role-based navigation filtering.
- Forms: Use `react-hook-form` + `zod` + `@hookform/resolvers/zod` (see `src/components/team/TeamMemberFormModal.tsx` for an example).

## Conventions & small rules
- Import alias: `@/*` maps to `./src/*` (see `tsconfig.json` paths). Prefer `@/` imports.
- Styling: Tailwind + design tokens in `tailwind.config.ts`. Respect color tokens and avoid hardcoding global color/spacing variables.
- Component files are TypeScript + React; favor `forwardRef` where applicable like the existing UI primitives.
- Accessible components: Radix primitives are used; preserve accessible props when editing (e.g., Dialog, Tooltip).
- Role checks: Use `useAuth()` helpers (`hasRole`, `hasPermission`) rather than duplicating role logic.
- ID generation pattern in UI examples often uses `MEM${Date.now()}` for temporary client IDs—use consistent ID strategies when adding mock data.

## Data & integration guidance
- Replace mock data by creating data hooks that use `useQuery`/`useMutation` (see `QueryClient` instantiation in `App.tsx`).
- If adding an API client, centralize it (e.g., `src/lib/api.ts` or `src/hooks/api/*`) and use `react-query` for caching and invalidation.

## When making UI changes
- Follow the component primitives. Example to add a page and link:
  - Create `src/pages/MyPage.tsx` exporting a React component.
  - Add a route in `src/App.tsx`: `<Route path="/my" element={<MyPage />} />` (inside ProtectedRoute if auth required).
  - If a new navigation item is needed, add it to `NAV_ITEMS` in `src/components/layout/Sidebar.tsx`, include `roles` if access should be restricted.
- Use `cn` + `buttonVariants({ variant: ..., size: ... })` for consistent styling.

## Linting & formatting
- ESLint available via `npm run lint`. There is no automated test suite in the repo (none discovered). Be conservative with refactors and run `npm run lint`.

## Things an AI should NOT change without confirmation
- Global design tokens in `tailwind.config.ts` (these affect the app theme globally).
- `tsconfig` path alias and base configurations.
- Auth role/permission semantics in `AuthContext` without stakeholder confirmation.

## Helpful examples (copy-paste friendly)
- Protecting a route with role requirements:

```tsx
// in App.tsx
<Route element={<ProtectedRoute requiredRoles={["admin"]}><AdminOnly /></ProtectedRoute>}>
  <Route path="/admin" element={<AdminPage />} />
</Route>
```

- Adding a simple data fetch hook using react-query:

```ts
import { useQuery } from '@tanstack/react-query';
export function useProjects() {
  return useQuery(['projects'], () => fetch('/api/projects').then(r => r.json()));
}
```

---

If anything above is unclear or you want stronger rules (formatting, tests, PR descriptions), tell me which sections to expand or edit. Thanks!