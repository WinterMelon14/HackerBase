"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signUp } from "@/actions/auth";

export default function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form onSubmit={async (event) => {
      event.preventDefault();
      startTransition(async () => {
        setMessage("");
        setIsError(false);
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const result = mode === "signin"
          ? await createClient().auth.signInWithPassword({ email, password })
          : await signUp(formData);
        if (result.error) {
          setIsError(true);
          const errorMessage = typeof result.error === "string" ? result.error : result.error.message;
          const isRateLimited = errorMessage.toLowerCase().includes("rate limit");
          setMessage(
            isRateLimited
              ? "Slow down! You are making too many requests."
              : mode === "signup" && typeof result.error === "string"
                ? result.error
              : mode === "signin" && errorMessage.toLowerCase().includes("email not confirmed")
                ? "Please verify your email address before signing in."
              : mode === "signup"
                ? "We could not create your account. Please check your details and try again."
                : "We could not sign you in. Check your email and password and try again.",
          );
          return;
        }
        if (mode === "signup") {
          setMessage("success" in result
            ? result.success ?? "Account created. Check your email to verify your address before signing in."
            : "Account created. Check your email to verify your address before signing in.");
          return;
        }
        if (mode === "signin") {
          router.push("/portal");
          router.refresh();
        }
      });
    }} className="space-y-4 rounded-lg border border-zinc-200 bg-white p-6">
      <label className="block text-sm font-medium">Email
        <input name="email" type="email" required className="mt-1 w-full rounded border border-zinc-300 p-2" />
      </label>
      <label className="block text-sm font-medium">Password
        <input name="password" type="password" required className="mt-1 w-full rounded border border-zinc-300 p-2" />
      </label>
      {message && <p className={isError ? "text-sm text-red-700" : "text-sm text-zinc-700"}>{message}</p>}
      <button disabled={isPending} className="w-full cursor-pointer rounded bg-green-700 px-4 py-3 font-medium text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-60" type="submit">
        {isPending ? "Loading..." : mode === "signin" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
