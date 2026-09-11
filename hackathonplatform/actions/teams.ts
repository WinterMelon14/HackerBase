"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function removeTeamMember(applicationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const admin = createAdminClient();
  const { data: creatorApplication } = await admin
    .from("applications")
    .select("id, team_id")
    .eq("user_id", user.id)
    .eq("applicant_type", "hacker")
    .maybeSingle();
  if (!creatorApplication?.team_id) return { error: "You are not a team creator." };

  const { data: team } = await admin
    .from("teams")
    .select("id, creator_id")
    .eq("id", creatorApplication.team_id)
    .maybeSingle();
  if (!team || team.creator_id !== user.id) return { error: "Only the team creator can remove teammates." };
  if (applicationId === creatorApplication.id) return { error: "You cannot remove yourself from the team." };

  const { error } = await admin
    .from("applications")
    .update({ team_id: null })
    .eq("id", applicationId)
    .eq("team_id", team.id);
  if (error) return { error: "Unable to remove that teammate." };

  revalidatePath("/portal");
  return { success: "Teammate removed." };
}
