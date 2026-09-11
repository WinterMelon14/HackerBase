"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes("rate limit")) {
      return { error: "Slow down! You are making too many requests." };
    }
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Please verify your email address before signing in." };
    }
    return { error: "Unable to sign in with those credentials." };
  }

  redirect("/portal");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || password.length < 8) {
    return { error: "Use a valid email and a password with at least 8 characters." };
  }

  const supabase = await createClient();
  const { data: sessionData } = await supabase.auth.getUser();
  if (sessionData.user) {
    return { error: "Sign out before creating another account." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    const normalizedError = error.message.toLowerCase();
    if (normalizedError.includes("rate limit")) {
      return { error: "Slow down! You are making too many requests." };
    }
    if (
      normalizedError.includes("already registered") ||
      normalizedError.includes("already exists") ||
      normalizedError.includes("user already")
    ) {
      return { error: "An account already exists with that email address. Sign in instead." };
    }
    return { error: "We could not create your account. Please check your details and try again." };
  }

  if (!data.user || data.user.identities?.length === 0) {
    return { error: "An account already exists with that email address. Sign in instead." };
  }

  return { success: "Account created. Check your email to verify your address before signing in." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}