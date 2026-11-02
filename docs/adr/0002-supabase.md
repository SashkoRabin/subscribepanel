# ADR 0002: Supabase as the managed PostgreSQL platform

Use Supabase for managed PostgreSQL while keeping Drizzle as the application schema and migration tool. The server connects with `SUPABASE_DATABASE_URL`; browser code does not query subscription tables directly.

This preserves portable SQL and the modular-monolith boundary while providing Supabase operational tooling. Any future direct browser access must use a publishable key, enable Row Level Security, and have a tested user-isolation policy. Service-role credentials remain server-only and are not required for ordinary application data access.
