# Architecture

Subscript is a TypeScript modular monolith. Supabase provides managed PostgreSQL and cookie-based authentication; Drizzle owns the schema and migration source. Tables live in the PostgreSQL schema named `subscript`, isolating them from any unrelated application tables in the same Supabase project. `apps/web` owns the authenticated HTTP boundary; domain use cases in `packages/domain` do not depend on HTTP, UI, or providers. Public inputs and outputs use Zod contracts from `packages/contracts`.

Money is represented exclusively as integer minor units, and calendar billing dates use `YYYY-MM-DD` strings. This avoids floating-point errors and UTC date shifting. Timestamps are UTC.

All user-owned database records contain `user_id`; API handlers must derive it from the Supabase session and scope every query accordingly. Client-supplied user IDs are never authoritative. The web app uses Supabase Auth through server-side cookie sessions. The `subscript` schema is not exposed through the Data API; no browser can directly query it.

Provider integrations will use adapters behind domain interfaces. Their development mocks must be labelled as mocks and cannot auto-confirm a subscription.

