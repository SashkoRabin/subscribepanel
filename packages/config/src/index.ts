import { z } from "zod";
export const serverEnvironmentSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SECRET_KEY: z.string().min(1)
});
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

