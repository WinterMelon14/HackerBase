import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: isOrganizer } = await supabase.rpc("is_organizer");
    redirect(isOrganizer ? "/admin" : "/portal");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-24">
      <section className="max-w-3xl">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">HackerBase</p>
        <h1 className="text-5xl font-semibold leading-tight tracking-tight md:text-6xl">A clearer way to run your next hackathon.</h1>
        <p className="mt-6 max-w-2xl text-xl leading-8 text-zinc-600">Applicants submit one focused application. Organizers review every response, score candidates, and make decisions from one secure workspace.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/auth/signup" className="rounded-lg bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800">Create an account</Link>
          <Link href="/auth/login" className="rounded-lg border border-zinc-300 px-6 py-3 font-medium hover:border-green-600 hover:text-green-700">Sign in</Link>
        </div>
      </section>
      <section className="mt-24 grid gap-5 border-t border-zinc-200 pt-8 md:grid-cols-3">
        <div><p className="font-semibold">Simple applications</p><p className="mt-2 text-sm leading-6 text-zinc-600">A focused flow for hackers, judges, mentors, and volunteers without unnecessary steps.</p></div>
        <div><p className="font-semibold">Flexible answers</p><p className="mt-2 text-sm leading-6 text-zinc-600">Questions can evolve without redesigning the application data model.</p></div>
        <div><p className="font-semibold">Secure review</p><p className="mt-2 text-sm leading-6 text-zinc-600">Role-aware access keeps applicant data in the right hands.</p></div>
      </section>
    </main>
  );
}
