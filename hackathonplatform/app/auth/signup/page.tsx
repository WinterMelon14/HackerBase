import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-20">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Join the platform</p>
      <h1 className="mb-2 text-4xl font-semibold tracking-tight">Create your account</h1>
      <p className="mb-8 text-zinc-600">Create one account to submit and manage your hackathon application.</p>
      <AuthForm mode="signup" />
      <p className="mt-6 text-center text-sm text-zinc-600">Already have an account? <Link href="/auth/login" className="font-medium text-green-700 hover:underline">Sign in</Link></p>
    </main>
  );
}
