import ApplicationForm from "@/components/ApplicationForm";

export default function VolunteerApplicationPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Volunteer application</p>
      <h1 className="text-4xl font-semibold tracking-tight">Apply as a volunteer.</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-600">Support the staff with the labor and logistics that keep the hackathon moving.</p>
      <div className="mt-12 border-t border-zinc-200 pt-10">
        <ApplicationForm type="volunteer" />
      </div>
    </main>
  );
}
