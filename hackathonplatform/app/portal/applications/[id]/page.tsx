import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TeamMemberActions from "@/components/TeamMemberActions";
import { formatApplicationAnswer, getApplicationAnswerLabel } from "@/lib/application-answers";

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  accepted: "Accepted",
  rejected: "Rejected",
};

type TeamMember = {
  team_name: string;
  invite_code: string;
  creator_id: string | null;
  member_id: string;
  member_full_name: string;
  member_email: string;
  member_status: string;
};

export default async function ApplicationDetailsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ submitted?: string }> }) {
  const { id } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: application } = await supabase
    .from("applications")
    .select("id, applicant_type, full_name, email, school, answers, status, score, created_at, team_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!application) notFound();
  const { data: teamMembers } = application.team_id
    ? await supabase.rpc("get_application_team", { application_id: id })
    : { data: [] };
  const typedTeamMembers = (teamMembers ?? []) as TeamMember[];
  const team = typedTeamMembers[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Application details</p>
      <h1 className="text-4xl font-semibold capitalize tracking-tight">{application.applicant_type} application</h1>
      <p className="mt-2 text-zinc-600">Status: <span>{statusLabels[application.status] ?? "Submitted"}</span></p>
      {query.submitted === "1" && <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4 text-green-900">Success! Your application has been submitted. Please be on the lookout for an email from hackathons@test.edu</div>}
      <div className="mt-10 grid gap-4 border-y border-zinc-200 py-6 md:grid-cols-3">
        <div><p className="text-sm text-zinc-500">Full name</p><p className="font-medium">{application.full_name}</p></div>
        <div><p className="text-sm text-zinc-500">Email</p><p className="font-medium">{application.email}</p></div>
        {application.school && <div><p className="text-sm text-zinc-500">School or organization</p><p className="font-medium">{application.school}</p></div>}
      </div>
      {team && <section className="mt-10 rounded-xl border border-zinc-200 p-6">
        <h2 className="text-xl font-semibold">Team: {team.team_name}</h2>
        <p className="mt-1 text-sm text-zinc-600">Invite code: {team.invite_code}</p>
        <div className="mt-5 divide-y divide-zinc-200 border-y border-zinc-200">
          {typedTeamMembers.map((member) => <div key={member.member_id} className="flex items-center justify-between gap-4 py-4">
            <div><p className="font-medium">{member.member_full_name}</p><p className="text-sm text-zinc-500">{member.member_email}</p></div>
            {team.creator_id === user.id && member.member_id !== application.id && <TeamMemberActions applicationId={member.member_id} />}
          </div>)}
        </div>
      </section>}
      <dl className="mt-12 divide-y divide-zinc-200 border-y border-zinc-200">
        {Object.entries(application.answers ?? {}).map(([question, answer]) => (
          <div key={question} className="grid gap-2 py-6 md:grid-cols-[220px_1fr]">
            <dt className="font-semibold">{getApplicationAnswerLabel(question, application.applicant_type)}</dt>
            <dd className="whitespace-pre-wrap text-zinc-700">
              {(question === "github_url" || question === "linkedin_url") && typeof answer === "string" ? (
                <a href={answer} target="_blank" rel="noreferrer" className="text-green-700 underline">{answer}</a>
              ) : formatApplicationAnswer(answer)}
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
