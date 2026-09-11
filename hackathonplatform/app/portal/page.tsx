import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  accepted: "Accepted",
  rejected: "Rejected",
};

export default async function PortalPage({ searchParams }: { searchParams: Promise<{ submitted?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role === "organizer") redirect("/admin");

  const { data: applications } = await supabase
    .from("applications")
    .select("id, applicant_type, status, score, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (applications?.[0]) {
    redirect(`/portal/applications/${applications[0].id}${params.submitted === "1" ? "?submitted=1" : ""}`);
  }

  return <main className="mx-auto w-full max-w-3xl px-6 py-12">
    <div className="mb-10">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Applicant portal</p>
      <h1 className="text-4xl font-semibold tracking-tight">Your applications</h1>
      <p className="mt-2 text-zinc-600">Review your application status and submitted answers.</p>
    </div>
    {!applications?.length && <Link href="/apply" className="mb-8 inline-block rounded bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800">Start an application</Link>}
    <div className="space-y-4">
      {(applications ?? []).map((application) => <Link href={`/portal/applications/${application.id}`} key={application.id} className="flex items-center justify-between rounded-xl border border-zinc-200 p-5 transition hover:border-green-500 hover:bg-green-50">
        <span className="font-semibold capitalize">{application.applicant_type} application</span>
        <span className="text-sm text-zinc-600">{statusLabels[application.status] ?? "Submitted"}{application.score !== null ? ` · ${application.score}/100` : ""}</span>
      </Link>)}
    </div>
  </main>;
}