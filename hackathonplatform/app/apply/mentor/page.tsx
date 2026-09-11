import ApplicationForm from "@/components/ApplicationForm";

export default function MentorApplicationPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Mentor application</p>
      <h1 className="text-4xl font-semibold tracking-tight">Apply as a mentor.</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-600">Help teams get unstuck with practical support throughout the hackathon.</p>
      <div className="mt-12 border-t border-zinc-200 pt-10">
        <ApplicationForm type="mentor" />
      </div>
    </main>
  );
}
