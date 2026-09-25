# Fresava implementation plan

Status: implemented in the working tree; database rollout still requires existing-schema inspection before applying to the shared Supabase project. Date: 25 September 2026. Revision 4: admin + staff merged into one `staff_members` entity (role-based), per owner decision.

Current project: `D:\Github\fresava`
Reference project: `D:\FRESAVA PROJECT\FRESAVA PROJECT`

Documents the implemented architecture, database shape, routes, and rollout sequence. The app code, migrations, tests, and local validation are implemented in the working tree; remote Supabase migration/deployment is intentionally pending until the existing project schema is inspected and mapped.

## 1. Goals

- Refactor the existing Next.js app first, preserving current storefront behavior.
- Backend lives under root-level `server/`, structured so it can be extracted into a separate service later.
- Port verified upgrades: persistent COD orders, account/auth, avatars, customer tracking/feedback, admin reporting + order inspection, barcode labels/scanning, updated storefront content.
- Two account entities: `customers` (public signup) and `staff_members` (server-provisioned, `role` = `admin` | `staff`). No shared `profiles`/`user_roles` table, and no way for public signup to reach `staff_members`.
- Keep Next.js, TypeScript, Tailwind, current SEO metadata, WhatsApp ordering.

## 2. Architecture

One deployment now; separable backend later. Next.js hosts thin API routes that forward to `server/` — no pricing/auth/DB logic in route files.

```text
server/
  core/                  pure business logic — no I/O, no framework, no DB client
    domain/              pricing rules, permissions, status transitions
    modules/
      auth/              shared JWT verification, provider/session adapters
      catalog/           products, prices, shipping and promos
      orders/             quoting, order creation, history, ownership
      fulfillment/        status transitions, scanner requests, label data
      customers/          customer auth, account details, avatar
      feedback/           eligibility, submission, admin listing
      staff/              staff_members auth (admin + staff), reporting,
                           scoped order lookup, scanning — role-gated internally
  data/                  everything that talks to a datastore
    repositories/        DB access, transaction/RPC wrappers — implements
                          interfaces that core/ depends on, never the reverse
    infrastructure/      Supabase JWT issuer, DB and storage adapters
    supabase/
      config.toml
      migrations/         schema, constraints, policies, functions, indexes
      seed.sql            catalog/promos/shipping dev seed
  api/                   everything that talks to the outside world
    http/                route dispatch, validation, errors, request context
    adapters/next/       framework-specific cookies/session integration
  config/                env parsing, private config
  tests/                 domain, integration, permissions, transaction tests
shared/
  contracts/               public request/response schemas and DTOs only
src/
  app/
    (storefront)/          existing public routes and layout
    admin/
      (public)/login/       /admin/login (staff_members backend, role=admin)
      (protected)/         admin layout, dashboard/orders/feedback
    staff/
      (public)/login/       /staff/login (staff_members backend, role=staff)
      (protected)/         staff layout, scan/order pages
    api/v1/                thin Next.js HTTP entry points
  features/                cart/checkout + customer/admin/staff UI
  components/              shared presentation components
  lib/api/                 typed frontend HTTP client
  proxy.ts                 thin session-refresh adapter, if needed
public/                    images/video
docs/                      architecture, schema, API, deployment notes
```

`/admin/*` and `/staff/*` stay separate route groups and layouts (different UI, no cart/footer/WhatsApp) — only the backend auth module and DB table are shared between them, gated by `role`.

Boundary rules:

1. Frontend only uses the HTTP client + shared contracts — no DB/repository/config imports.
2. Backend never imports React, frontend files, `next/navigation`, or `next/headers` — framework glue stays in `server/api/adapters/next`.
3. `server/core` never imports from `server/data` or `server/api` — it depends only on repository/service interfaces, and `server/data` provides the implementations. `server/api` is the outermost layer and only calls into `server/core/modules`, never the reverse.
4. Migrations and backend tests live only in `server/`; one migration source.
5. Shared layer holds no secrets or DB authority — client-side estimates are advisory, backend recalculates all money.
6. `customers` and `staff` modules (under `core/modules/`) own their own repos/handlers/DTOs; within `staff`, admin vs staff capabilities are separated by `role` checks, not by separate tables.
7. Import boundaries enforced via lint rules; backend has its own type-check config without Next.js ambient types.

Future extraction: the `core/` + `data/` layers move into their own service as-is (they already depend on nothing outside `server/`), add a plain Node HTTP adapter, prefer a same-origin reverse proxy to keep cookies working, and `server/api/adapters/next` can stay behind as a thin proxy shim if needed. Cross-origin needs explicit CORS/CSRF work later.

## 3. Hosting change

Currently static export (`output: "export"`) to Netlify. APIs and cookie-based auth need a runtime, so static export will be dropped and Netlify's Next.js runtime adapter configured — do this when APIs are introduced, not during the behavior-preserving refactor. Public marketing pages can stay prerendered.

## 4. Frontend route plan

| Route | Purpose and access |
|---|---|
| `/`, `/spread`, `/purity`, `/origin`, `/story`, `/contact` | Existing public pages; content/media updates. |
| `/checkout` | Guest or signed-in COD checkout. |
| `/auth`, `/auth/callback`, `/auth/forgot-password`, `/auth/reset-password` | Customer signup/login/recovery. |
| `/account` | Authenticated customer overview: details, avatar, logout. |
| `/orders`, `/orders/[orderId]` | Orders owned by the signed-in user or an authorized guest session. |
| `/admin/login`, `/admin/auth/callback`, `/admin/forgot-password`, `/admin/reset-password` | Admin portal login/recovery — same `staff_members` backend as `/staff/*`, requires `role = admin`; no public signup. |
| `/admin` → `/admin/dashboard` | Sales/fulfillment/customer/product summaries. |
| `/admin/orders`, `/admin/orders/[orderId]`, `/admin/orders/[orderId]/label` | Search/filter/detail + label print. |
| `/admin/feedback` | Admin feedback list. |
| `/staff/login`, `/staff/auth/callback`, `/staff/forgot-password`, `/staff/reset-password` | Staff portal login/recovery — same `staff_members` backend, requires `role = staff`; no public signup. |
| `/staff` → `/staff/scan` | Staff barcode lookup + fulfillment advancement. |
| `/staff/orders/[orderId]` | Staff-scoped shipment detail. |

Each login/recovery screen sits outside its protected layout to avoid redirect loops. Even though admin and staff share one backend table, `role` still gates access strictly: an admin session cannot open `/staff/scan` and a staff session cannot open `/admin/*` — same separation as before, enforced by a claim instead of a table. Reserved for later: `/admin/products`, `/admin/customers`, `/admin/settings`, `/staff/settings` — don't show dead links for these yet.

## 5. Authentication and authorization

JWT access tokens for two account types — `customer` and `staff_member` — issued by Supabase Auth (handles password hashing, confirmation, recovery, refresh rotation). App-level account data stays out of `auth.users`, in `customers` or `staff_members`.

- Access token carries verified `iss`/`aud`/`sub`/`exp`/`iat` plus server-derived `account_type` (`customer` | `staff_member`) + `entity_id`, and for `staff_member` a `role` (`admin` | `staff`) claim — never from client input. Short lifetime (~15 min). No addresses/payment data/mutable permissions in the token.
- Verify signature + issuer/audience/expiry via a maintained SDK against published keys — decoding alone is not verification. Then resolve `sub` to the matching active entity and compare ID/type/role; reject on mismatch or deactivation even with a valid JWT.
- Two separate namespaced Secure HttpOnly cookies: one for `customer` sessions, one for `staff_member` sessions (shared by both admin and staff portals). No tokens in localStorage or exposed to JS. Refresh handled server-side via rotated provider refresh tokens.
- `revoked_auth_sessions` table checked on every authenticated request for immediate logout/revocation, independent of token expiry.
- SameSite + Origin/CSRF checks on cookie-authenticated mutations; rate limit login/recovery/checkout/scan.
- One Auth identity maps to exactly one entity (a `customers` row or a `staff_members` row), enforced by a DB trigger/lock — a missing entity is denied, never defaulted to customer. Public signup always creates a `customers` row; `staff_members` rows (with explicit `role`) are created only via a server-only provisioning command, gated until the entity exists.
- Guest checkout: unpredictable guest-session token in an HttpOnly cookie (only its hash + expiry stored); binds guest orders. Claiming an old guest order later requires both the guest binding and an authenticated identity — a matching email alone is not enough.
- RLS enabled everywhere; policies check verified `auth.uid()` against active entities/ownership, not just JWT claims. Browser writes to role-defining tables/privileged functions are rejected; elevated server access is narrowly scoped.

## 6. Proposed database schema

Target schema, not a claim about the live Supabase database — inspect an actual schema export before writing migrations against an existing one.

Conventions: UUID PKs; UTC `timestamptz`; integer money in paisa; currency `BDT`; explicit FKs/checks; historical orders keep immutable snapshots.

| Table/resource | Main fields and constraints |
|---|---|
| `auth.users` | Provider-managed credentials/JWT subject only — no business fields. |
| `staff_members` | `id`, unique `auth_user_id`, `role` (`admin` \| `staff`), optional unique `employee_code`, `full_name`, `phone`, `avatar_path`, `active`, timestamps. Server-provisioned only; `role` is set at provisioning time and only changeable server-side. |
| `customers` | `id`, unique `auth_user_id`, `full_name`, `phone`, `address`, `city`, `avatar_path`, `active`, timestamps. |
| `products` | `id`, unique `sku` (`single`/`duo`/`family`), name, description, jar count, per-jar weight (g), price/compare-at (paisa), badge, image path, active flag, timestamps. |
| `shipping_zones` | Code (`dhaka`/`outside`), label, fee + free-shipping threshold (paisa), ETA text, active flag. |
| `promotions` | Unique code, discount basis points, cap/minimum (paisa), active/start/end. Seed `FRESAVA10` (10%, Tk250 cap). |
| `revoked_auth_sessions` | Provider session UUID PK, `auth_user_id`, revoked-at/expires-at. |
| `guest_sessions` | ID, unique hashed token, expiry/revocation. Raw tokens never logged or stored. |
| `orders` | ID, unique display number, unique tracking code, nullable `customer_id` XOR `guest_session_id`, customer/address/shipping snapshots, currency, subtotal, discount, shipping, total, promo snapshot, COD method, payment status, fulfillment status + version, notes, unique idempotency key + request hash, timestamps. Check `total = subtotal - discount + shipping`. |
| `order_items` | ID, order FK, product FK, SKU/name/size/weight snapshots, qty (1–99), unit price, line subtotal (paisa). |
| `order_status_history` | ID, order FK, from/to status, sequence/version, nullable `staff_member_id` FK or trusted system source, reason, timestamp. Append-only, unique per order/version. |
| `fulfillment_requests` | Request/idempotency key, order FK, `staff_member_id` FK, expected version, request hash, result status/version, timestamp. Supports retry-safe scans; backend still enforces `role = staff` for advancement even though the FK type is shared. |
| `order_feedback` | ID, unique order FK, rating 1–5, comment (1–500 chars), timestamps. One per delivered order, DB-enforced. |
| `audit_log` | `actor_type`, nullable `staff_member_id` / `customer_id` FK (exactly one, or none for system events), action, entity type/ID, minimal change data, timestamp. Append-only. |
| Storage: `avatars` | Private bucket, entity-prefixed paths, JPEG/PNG/WebP, 5 MB max, short-lived signed read URLs. |

Indexes: unique SKU/code/tracking/order-number/token-hash; `orders(customer_id, created_at)`, `(guest_session_id, created_at)`, `(status, created_at)`; `order_items(order_id)`; `order_status_history(order_id, created_at)`; `order_feedback(created_at)`; unique `auth_user_id` in each of `staff_members` and `customers`.

Deletion: deactivate products/accounts and revoke sessions rather than hard-delete; restrict cascading deletes on financial records; don't cascade Auth deletion into orders/audit history. Demoting/removing an admin or staff member is a `role`/`active` change on the same row, not a cross-table move.

## 7. Transactions and business rules

### Order placement

1. Client sends SKU/qty, delivery details, shipping zone, promo code, idempotency key — never price, actor ID, total, or status.
2. Backend verifies identity/guest session and validates input.
3. One transaction reads active catalog/promo/shipping, computes the quote, inserts order + items + initial history, commits. Integer arithmetic throughout; shipping eligibility uses subtotal after promo.
4. Same owner + idempotency key + same payload → same order returned; changed payload with that key is rejected. No orphan orders on item failure.
5. COD creates an unpaid order ("amount due", not "charged"); payment collection is a separate authorized action.

Use a versioned DB function or transaction-capable repository with restricted execution privileges — a browser must never invoke a privileged function to bypass pricing.

### Fulfillment

Pipeline: `order_confirmed → ready_for_packing → packing → quality_check → ready_for_dispatch → handed_to_delivery → out_for_delivery → delivered`.

Scanning resolves a shipment read-only; advancement checks the row's expected version + an idempotency key, locks the row, validates the actor is an active `staff_member` with `role = staff` and the transition is legal, updates status, appends history atomically — stale/duplicate transitions rejected. Admin camera lookup (`/admin/orders`) is read-only regardless of role; only `/staff/scan` (role = staff) can advance. Labels use a pinned local CODE128 library, not a CDN script.

### Reporting and feedback

Report placed-order value and collected COD revenue as separate figures. Unique-phone count is a reporting metric only, not an identity model. Feedback requires ownership + delivered status, enforced in the DB; one per order.

## 8. API surface (versioned, proposed)

| Endpoints under `/api/v1` | Responsibility |
|---|---|
| `POST/GET /customers/auth/*` (signup, login, refresh, logout, recovery, reset, session, callback) | Customer JWT/session lifecycle. |
| `POST/GET /staff/auth/*` (login, refresh, logout, recovery, reset, session, callback) | Shared `staff_members` JWT/session lifecycle, used by both the admin and staff portals; no public signup. The `role` claim in the resulting token — not the endpoint called — determines admin vs staff access. |
| `GET /catalog`; `POST /checkout/quote` | Active products + server-calculated quote. |
| `POST /orders`; `GET /customers/orders`, `/customers/orders/:id` | Atomic checkout + owner-scoped order history. |
| `POST /customers/orders/:id/feedback` | Delivered-order feedback. |
| `GET/PATCH /customers/account`; `POST /customers/account/avatar` | Account details + bounded image upload. |
| `GET /admin/dashboard`, `/admin/orders`, `/admin/orders/:id`, `/admin/orders/:id/label`, `/admin/feedback` | Admin reporting, search, detail, labels, feedback. Requires `role = admin`. |
| `POST /admin/orders/lookup` | Read-only barcode lookup for admin. Requires `role = admin`. |
| `POST /staff/fulfillment/lookup`, `/staff/fulfillment/advance`; `GET /staff/orders/:id` | Staff-scoped lookup/detail + retry-safe advancement. Requires `role = staff`. |
| `POST /admin/orders/:id/payment-collected` | Authorized COD collection recording + audit event. Requires `role = admin`. |

Customer and staff-member JWTs are never interchangeable. Within the staff-member token, every admin/staff endpoint checks `role` explicitly — sharing a token type does not imply shared access. Shared validation, consistent errors, pagination, request IDs; authorize before data retrieval; separate public vs privileged DTOs.

## 9. Storefront port and improvements

- Port hero video, updated product photography, empty-trolley illustration/animation, order banner, five-card facts layout, relevant typography/layout updates.
- Resolve conflicting product facts (340g vs 400g, §12) before updating ingredients/weights/sourcing/story/footer copy.
- Keep existing pricing/bundle savings; derive display size from catalog data instead of hardcoded labels.
- Remove simulated card/wallet forms and any payment-processing claims — COD + WhatsApp only.
- Keyboard/focus behavior, accessible form errors, loading/empty/failure states, responsive layouts, reduced-motion/video fallbacks.
- Customer account profile editing (small completion of the reference's read-only view). Multiple addresses / settings panel stay deferred.
- Contact form submission stays simulated (as in both projects) — label or disable it rather than implying delivery, until a real destination is defined.

## 10. Delivery sequence and acceptance gates

| Phase | Work | Acceptance |
|---|---|---|
| 1. Refactor | Split storefront/admin/staff layouts, frontend features, shared contracts, root `server/` structure, import boundaries; preserve working pages/cart/WhatsApp. | Existing interactions still work; type-check/lint/build pass; no new network dependency for storefront yet. |
| 2. Database foundation | Inspect target schema, add migrations/seeds, `customers` + `staff_members` entities, Supabase adapters, RLS/storage rules, transactional functions. | Fresh DB recreatable; migration rehearsed separately; unauthorized access denied. |
| 3. Runtime/auth | Enable Next.js runtime, thin APIs, JWT sessions, customer login + shared admin/staff login (role-gated), recovery/account/avatar. | Customer and staff-member tokens can't cross each other; `role` correctly gates `/admin/*` vs `/staff/*`; expiry/refresh/logout, owner access tested. |
| 4. Commerce | Catalog/quote integration, atomic COD checkout, confirmation, guest + account ownership. | Tampered prices ignored; duplicate submit → one order; failure rolls back; totals match. |
| 5. Operations | Admin dashboard/orders/labels, staff scanning, tracking/history, feedback. | Labels scan correctly; concurrent/repeated scans can't skip stages; permissions verified per role. |
| 6. UI/content | Port assets/content, order/account UI, branded 404, restrained transitions. | Mobile/desktop + keyboard checks pass; unresolved product claims flagged before publishing. |
| 7. Documentation/staging | Update README, architecture/schema/API/setup docs, migration instructions, deployment config. | Production build + staging pass; no secrets in client output; rollback documented. |

## 11. Existing data and rollout

Manual Supabase SQL entry point: `server/supabase/FRESAVA_SUPABASE_CHANGES.sql`. Keep it updated whenever migrations or seed data change, then review/run that single file in Supabase. This central file is written as an additive, existing-data-preserving script: it creates missing objects, replaces app functions, and inserts default seed rows only when missing. The smaller files under `server/supabase/migrations/` remain useful as source sections for local tests and review history.

Before touching a live Supabase project: pull schema/functions/policies/storage config and take a backup; rehearse on staging first. The reference uses numeric order IDs — migrate with an explicit legacy-ID map, don't regenerate IDs already on shipped labels. No destructive reset of an existing database.

If there's no existing database: create the schema from migrations, seed the 3 products, 2 shipping zones, and current promo; provision the first admin and any staff explicitly and audited (as distinct `staff_members` rows with the right `role`). If legacy `profiles`/`user_roles` exist, migrate verified records into `customers` or `staff_members` (setting `role` explicitly per person), then retire the old tables only after access checks pass — don't copy old writable role metadata into trusted entities.

## 12. Decisions carried into approval

Recommended defaults: keep Next.js; one runtime deployment initially; root-level separable `server/`; COD only; secure guest + signed-in checkout; admin under `/admin/*`, staff under `/staff/*` (UI separate, backend shared via `staff_members` + `role`); JWT access + rotating refresh tokens; migrations/policies included; first admin/staff provisioned server-side.

**Applied:** `admins` and `staff` are merged into one `staff_members` table (`role`: `admin` | `staff`), one JWT/cookie namespace, and one login/refresh/logout/recovery flow — with `/admin/*` and `/staff/*` access still strictly gated by `role` per route. `customers` remains fully separate (public signup, different data shape and risk profile). This drops one backend auth module, one cookie namespace, and one audit-log FK column compared to the original three-entity design, without weakening the admin/staff boundary.

Before live integration/publication, confirm: the Supabase target (existing data or fresh), the administrator identity, and the 340g vs 400g product weight discrepancy (catalog/home/footer currently agree on 340g; the reference source says 400g).

Out of scope for this plan: full product/inventory CRUD, staff-management UI, multi-address management, online payments, courier-provider integration, notification delivery, real contact inbox. Included small completions: customer account editing, auth recovery, admin feedback listing, COD collection recording.

Implementation begins only after the owner's confirmation of this plan.
