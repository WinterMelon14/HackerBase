import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvValue(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const { data: isOrganizer } = await supabase.rpc("is_organizer");
  if (!isOrganizer) return new NextResponse("Forbidden", { status: 403 });

  const batchSize = 500;
  const applications: Array<{
    full_name: string;
    email: string;
    applicant_type: string;
    school: string | null;
    status: string;
    answers: Record<string, unknown>;
    teams: { name?: string } | { name?: string }[] | null;
  }> = [];

  for (let start = 0; ; start += batchSize) {
    const { data, error } = await supabase
      .from("applications")
      .select("full_name, email, applicant_type, school, status, answers, teams(name)")
      .order("created_at", { ascending: false })
      .range(start, start + batchSize - 1);
    if (error) return new NextResponse("Unable to export applications.", { status: 500 });
    applications.push(...(data ?? []));
    if (!data || data.length < batchSize) break;
  }

  const headers = ["Name", "Email", "Type", "Team", "School", "Status", "T-Shirt", "Dietary Restrictions"];
  const rows = applications.map((application) => {
    const relation = application.teams;
    const teamName = Array.isArray(relation) ? relation[0]?.name : relation?.name;
    const dietary = application.answers.dietary_restrictions ?? application.answers.dietary_restriction;
    return [
      application.full_name,
      application.email,
      application.applicant_type,
      teamName ?? "Solo",
      application.school ?? "",
      application.status,
      application.answers.shirt_size ?? "",
      Array.isArray(dietary) ? dietary.join(", ") : dietary ?? "",
    ].map(csvValue).join(",");
  });

  return new NextResponse([headers.map(csvValue).join(","), ...rows].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="hackathon_applications.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
