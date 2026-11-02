import { z } from "zod";

const authEnvironmentSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1)
});

export type AuthEnvironment = z.infer<typeof authEnvironmentSchema>;
export function parseAuthEnvironment(env: Record<string, string | undefined>): AuthEnvironment { return authEnvironmentSchema.parse(env); }
