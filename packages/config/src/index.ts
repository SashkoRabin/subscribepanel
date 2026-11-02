import { z } from "zod";
export const serverEnvironmentSchema = z.object({
  SUPABASE_DATABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url()
});
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

