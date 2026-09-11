import Link from "next/link";

export default function ApplyPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-20">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Applications</p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">Choose how you want to contribute.</h1>
      <p className="mt-4 max-w-xl text-lg text-zinc-600">Each application has its own dedicated form so you can focus on the information that matters.</p>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Link href="/apply/hacker" className="rounded-xl border border-zinc-200 p-8 hover:border-green-600 hover:bg-green-50">
          <h2 className="text-2xl font-semibold">Hacker application</h2>
          <p className="mt-3 text-zinc-600">Tell us about your experience, interests, and what you want to build.</p>
        </Link>
        <Link href="/apply/judge" className="rounded-xl border border-zinc-200 p-8 hover:border-green-600 hover:bg-green-50">
          <h2 className="text-2xl font-semibold">Judge application</h2>
          <p className="mt-3 text-zinc-600">Share your experience and the perspective you would bring to judging.</p>
        </Link>
        <Link href="/apply/mentor" className="rounded-xl border border-zinc-200 p-8 hover:border-green-600 hover:bg-green-50">
          <h2 className="text-2xl font-semibold">Mentor application</h2>
          <p className="mt-3 text-zinc-600">Help hackathon teams by providing technical and creative support when they need it.</p>
        </Link>
        <Link href="/apply/volunteer" className="rounded-xl border border-zinc-200 p-8 hover:border-green-600 hover:bg-green-50">
          <h2 className="text-2xl font-semibold">Volunteer application</h2>
          <p className="mt-3 text-zinc-600">Support hackathon staff with the labor and logistics that make the event run smoothly.</p>
        </Link>
      </div>
    </main>
  );
}