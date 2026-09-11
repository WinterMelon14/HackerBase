import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function LoginPage() {
  return <main className="mx-auto w-full max-w-md px-6 py-20">
    <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Welcome back</p>
    <h1 className="mb-2 text-4xl font-semibold tracking-tight">Sign in</h1>
    <p className="mb-8 text-zinc-600">Access your application portal and track your submission.</p>
    <AuthForm mode="signin" />
    <p className="mt-6 text-center text-sm text-zinc-600">New here? <Link href="/auth/signup" className="font-medium text-green-700 hover:underline">Create an account</Link></p>
  </main>;
}