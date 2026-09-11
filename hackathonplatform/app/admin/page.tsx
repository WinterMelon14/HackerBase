import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import AdminApplicationTable from "@/components/AdminApplicationTable";
import AdminPagination from "@/components/AdminPagination";
import RootOrganizerLink from "@/components/RootOrganizerLink";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const pageSize = 100;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: isOrganizer } = await supabase.rpc("is_organizer");
  if (!isOrganizer) redirect("/portal");

  const [
    { data: applications },
    { count: totalApplications },
    { count: hackerCount },
    { count: judgeCount },
    { count: volunteerCount },
    { count: mentorCount },
    { count: pendingReviews },
    { data: totalTeams },
  ] = await Promise.all([
    supabase
    .from("applications")
    .select("id, applicant_type, full_name, email, school, status, score, review_notes, created_at, teams(name)")
    .order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("applicant_type", "hacker"),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("applicant_type", "judge"),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("applicant_type", "volunteer"),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("applicant_type", "mentor"),
    supabase.from("applications").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.rpc("get_hacker_team_count"),
  ]);

  const tableApplications = (applications ?? []).map((application) => ({
    ...application,
    team_name: (() => {
      const relation = application.teams as { name?: string } | { name?: string }[] | null;
      return Array.isArray(relation) ? relation[0]?.name ?? null : relation?.name ?? null;
    })(),
  }));

  return <main className="mx-auto w-full max-w-6xl px-6 py-16">
    <div className="mb-12">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Organizer Workspace</p>
      <h1 className="text-4xl font-semibold tracking-tight">Application Review</h1>
      <p className="mt-2 text-zinc-600">Review, score, and update applicant decisions from one workspace.</p>
      <RootOrganizerLink />
    </div>
    <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">Total Applications</p>
        <p className="mt-2 text-3xl font-semibold">{totalApplications ?? 0}</p>
      </article>
      <article className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">Total Teams</p>
        <p className="mt-2 text-3xl font-semibold">{Number(totalTeams ?? 0)}</p>
      </article>
      <article className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">Hacker/Judge/Volunteer/Mentor</p>
        <p className="mt-2 text-3xl font-semibold">{hackerCount ?? 0} / {judgeCount ?? 0} / {volunteerCount ?? 0} / {mentorCount ?? 0}</p>
      </article>
      <article className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">Pending Reviews</p>
        <p className="mt-2 text-3xl font-semibold">{pendingReviews ?? 0}</p>
      </article>
    </section>
    <AdminApplicationTable applications={tableApplications} />
    <AdminPagination page={page} hasNextPage={(applications ?? []).length === pageSize} />
  </main>;
}