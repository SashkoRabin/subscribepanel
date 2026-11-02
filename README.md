# Subscript

Privacy-first subscription management for European consumers.

## Local development

1. Create a Supabase project and copy `.env.example` to `.env`.
2. Set `SUPABASE_DATABASE_URL` to its server-side Postgres connection URL. Never use a publishable key for Drizzle migrations or server queries.
3. Run `pnpm install`, then `pnpm db:generate` and `pnpm db:migrate`.
4. Run `pnpm dev`.

The current milestone supplies the workspace, Supabase-backed database schema, shared domain rules, and the initial web/mobile/worker shells. External integrations are deliberately not implemented yet.

