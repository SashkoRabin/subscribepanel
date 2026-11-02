"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "../../lib/supabase/server";

export type AuthState = { error?: string; message?: string };

function credentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || password.length < 8) throw new Error("Use a valid email address and a password with at least 8 characters.");
  return { email, password };
}

export async function signIn(_previous: AuthState, formData: FormData): Promise<AuthState> {
  let input: { email: string; password: string };
  try { input = credentials(formData); } catch (error) { return { error: error instanceof Error ? error.message : "Check your details." }; }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) return { error: "We couldn’t sign you in with those details." };
  redirect("/");
}

export async function signUp(_previous: AuthState, formData: FormData): Promise<AuthState> {
  let input: { email: string; password: string };
  try { input = credentials(formData); } catch (error) { return { error: error instanceof Error ? error.message : "Check your details." }; }
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp(input);
  if (error) return { error: error.message };
  if (data.session) redirect("/");
  return { message: "Your account is ready. Confirm your email to finish signing in." };
}

export async function requestPasswordReset(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address first." };
  const supabase = await createServerSupabaseClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: new URL("/auth", siteUrl).toString() });
  return { message: "If an account exists, we’ve sent a reset link." };
}
