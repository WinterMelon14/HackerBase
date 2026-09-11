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
  const [{ data: isOrganizer }, { data: isRootOrganizer }] = await Promise.all([
    supabase.rpc("is_organizer"),
    supabase.rpc("is_root_organizer"),
  ]);
  if (!isOrganizer) redirect("/portal");

  const [
    { data: applications },
    { data: auditLogs },
    { data: applicationStats },
    { data: totalTeams },
  ] = await Promise.all([
    supabase
    .from("applications")
    .select("id, applicant_type, full_name, email, school, status, score, review_notes, created_at, teams(name)")
    .order("created_at", { ascending: false }).range((page - 1) * pageSize, page * pageSize - 1),
    supabase.from("audit_logs").select("id, actor_name, message, action_type, created_at").order("created_at", { ascending: false }).limit(20),
    supabase.rpc("get_application_stats"),
    supabase.rpc("get_hacker_team_count"),
  ]);
  const stats = applicationStats?.[0];

  const tableApplications = (applications ?? []).map((application) => ({
    ...application,
    team_name: (() => {
      const relation = application.teams as { name?: string } | { name?: string }[] | null;
      return Array.isArray(relation) ? relation[0]?.name ?? null : relation?.name ?? null;
    })(),
  }));

  return <main className="mx-auto w-full max-w-[1600px] px-6 py-16">
    <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="lg:w-[360px] lg:-translate-x-[100px] lg:pt-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Activity log</h2>
          <p className="mt-1 text-sm text-zinc-500">Recent organizer actions</p>
          <div className="mt-5 max-h-[calc(100vh-260px)] overflow-y-auto divide-y divide-zinc-200 pr-2">
            {(auditLogs ?? []).map((log) => (
              <div key={log.id} className="py-4">
                <p className="text-sm text-zinc-700">{log.message}</p>
                <p className="mt-1 text-xs text-zinc-500">{new Date(log.created_at).toLocaleString()}</p>
              </div>
            ))}
            {!auditLogs?.length && <p className="py-4 text-sm text-zinc-500">No activity yet.</p>}
          </div>
        </div>
      </aside>
      <section className="min-w-0">
        <div className="mx-auto w-full max-w-[1280px]">
    <div className="mb-12">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Organizer Workspace</p>
      <h1 className="text-4xl font-semibold tracking-tight">Application Review</h1>
      <p className="mt-2 text-zinc-600">Review, score, and update applicant decisions from one workspace.</p>
      <RootOrganizerLink isRootOrganizer={Boolean(isRootOrganizer)} />
    </div>
    <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">Total Applications</p>
        <p className="mt-2 text-3xl font-semibold">{stats?.total ?? 0}</p>
      </article>
      <article className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">Total Teams</p>
        <p className="mt-2 text-3xl font-semibold">{Number(totalTeams ?? 0)}</p>
      </article>
      <article className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">Hacker / Judge / Volunteer / Mentor</p>
        <p className="mt-2 text-3xl font-semibold">{stats?.hackers ?? 0} / {stats?.judges ?? 0} / {stats?.volunteers ?? 0} / {stats?.mentors ?? 0}</p>
      </article>
      <article className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm text-zinc-500">Pending Reviews</p>
        <p className="mt-2 text-3xl font-semibold">{stats?.pending ?? 0}</p>
      </article>
    </section>
    <div className="min-w-0">
      <AdminApplicationTable applications={tableApplications} />
    </div>
    <AdminPagination page={page} hasNextPage={(applications ?? []).length === pageSize} />
        </div>
      </section>
    </div>
  </main>;
}