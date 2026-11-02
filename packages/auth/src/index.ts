import { z } from "zod";

const authEnvironmentSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional()
}).superRefine((value, context) => {
  if (Boolean(value.GOOGLE_CLIENT_ID) !== Boolean(value.GOOGLE_CLIENT_SECRET)) context.addIssue({ code: "custom", message: "Google OAuth requires both client ID and secret." });
});

export type AuthEnvironment = z.infer<typeof authEnvironmentSchema>;
export function parseAuthEnvironment(env: Record<string, string | undefined>): AuthEnvironment { return authEnvironmentSchema.parse(env); }

/** Configuration validated before it is handed to the Better Auth adapter in the web app. */
export function getAuthOptions(env: Record<string, string | undefined>) {
  const config = parseAuthEnvironment(env);
  return { emailAndPassword: { enabled: true, requireEmailVerification: true }, emailVerification: { sendOnSignUp: true }, socialProviders: config.GOOGLE_CLIENT_ID ? { google: { clientId: config.GOOGLE_CLIENT_ID, clientSecret: config.GOOGLE_CLIENT_SECRET! } } : undefined };
}
