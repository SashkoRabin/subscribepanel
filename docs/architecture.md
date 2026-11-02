# Architecture

Subscript is a TypeScript modular monolith. Supabase provides managed PostgreSQL; Drizzle owns the schema, migrations, and server-side data access. `apps/web` owns the authenticated HTTP boundary; domain use cases in `packages/domain` do not depend on HTTP, UI, or providers. Public inputs and outputs use Zod contracts from `packages/contracts`.

Money is represented exclusively as integer minor units, and calendar billing dates use `YYYY-MM-DD` strings. This avoids floating-point errors and UTC date shifting. Timestamps are UTC.

All user-owned database records contain `user_id`; API handlers must derive it from the authenticated session and scope every query accordingly. Client-supplied user IDs are never authoritative. The initial web app accesses Supabase only from server code using the database connection string. If a future browser feature uses Supabase directly, it must have Row Level Security enabled and policies based on the authenticated user ID before exposure.

Provider integrations will use adapters behind domain interfaces. Their development mocks must be labelled as mocks and cannot auto-confirm a subscription.

