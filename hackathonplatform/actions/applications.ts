"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomInt } from "node:crypto";

const allowedTypes = new Set(["hacker", "judge", "mentor", "volunteer"]);
const dietaryOptions = new Set(["vegetarian", "vegan", "gluten-free", "None"]);
const shirtSizes = new Set(["XS", "S", "M", "L", "XL", "XXL"]);
const limits = {
  name: 100,
  shortAnswer: 50,
  longAnswer: 5000,
  url: 500,
  shortLine: 50,
  teamCode: 6,
  resumeLink: 500,
};

function exceeds(value: string, max: number) {
  return value.length > max;
}

export async function submitApplication(formData: FormData) {
  const type = String(formData.get("type") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim();
  const whyAttend = String(formData.get("whyAttend") ?? "").trim();
  const uniquePerspective = String(formData.get("uniquePerspective") ?? "").trim();
  const githubUrl = String(formData.get("githubUrl") ?? "").trim();
  const resumePath = String(formData.get("resumePath") ?? "").trim();
  const dietaryRestriction = String(formData.get("dietaryRestriction") ?? "").trim();
  const shirtSize = String(formData.get("shirtSize") ?? "").trim();
  const projectProud = String(formData.get("projectProud") ?? "").trim();
  const hackathonsAttendedValue = String(formData.get("hackathonsAttended") ?? "").trim();
  const isTeamCreator = String(formData.get("isTeamCreator") ?? "") === "yes";
  const teamName = String(formData.get("teamName") ?? "").trim();
  const teamCode = String(formData.get("teamCode") ?? "").trim().toUpperCase();
  const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim();
  const jobTitle = String(formData.get("jobTitle") ?? "").trim();
  const organization = String(formData.get("organization") ?? "").trim();
  const conflictsOfInterest = String(formData.get("conflictsOfInterest") ?? "").trim();
  const technicalExperience = String(formData.get("technicalExperience") ?? "").trim();
  const helpedSomeone = String(formData.get("helpedSomeone") ?? "").trim();
  const physicalWorkComfort = String(formData.get("physicalWorkComfort") ?? "").trim();
  const stressfulSituation = String(formData.get("stressfulSituation") ?? "").trim();

  if (!allowedTypes.has(type) || !fullName || !whyAttend || !dietaryOptions.has(dietaryRestriction)) {
    return { error: "Complete all required fields before submitting." };
  }
  if (
    exceeds(fullName, limits.name) ||
    exceeds(whyAttend, limits.longAnswer) ||
    exceeds(jobTitle, limits.shortLine) ||
    exceeds(organization, limits.shortLine) ||
    exceeds(teamName, limits.shortLine) ||
    exceeds(linkedinUrl, limits.url) ||
    exceeds(githubUrl, limits.url) ||
    exceeds(resumePath, limits.resumeLink)
  ) {
    return { error: "One or more responses are too long." };
  }

  if (type !== "judge" && !shirtSizes.has(shirtSize)) {
    return { error: "Choose a valid t-shirt size." };
  }

  if (["hacker", "mentor"].includes(type) && (!/^\d+$/.test(hackathonsAttendedValue) || Number(hackathonsAttendedValue) < 0)) {
    return { error: "Enter a valid non-negative hackathon count." };
  }

  if (["judge", "volunteer"].includes(type) && !["Yes", "No"].includes(hackathonsAttendedValue)) {
    return { error: "Select whether you have attended a hackathon." };
  }

  if (type === "hacker" && (!projectProud || exceeds(projectProud, limits.longAnswer))) {
    return { error: "Complete the hacker application fields with valid values." };
  }

  if (type === "judge" && (!uniquePerspective || !linkedinUrl || !jobTitle || !organization || !conflictsOfInterest || exceeds(uniquePerspective, limits.longAnswer) || exceeds(conflictsOfInterest, limits.longAnswer))) {
    return { error: "Complete all required judge application fields." };
  }

  if (type === "mentor" && (!technicalExperience || !helpedSomeone || exceeds(technicalExperience, limits.longAnswer) || exceeds(helpedSomeone, limits.longAnswer))) {
    return { error: "Complete all required mentor application fields." };
  }

  if (type === "volunteer" && (!physicalWorkComfort || !stressfulSituation || exceeds(stressfulSituation, limits.longAnswer))) {
    return { error: "Complete all required volunteer application fields." };
  }

  if (type === "hacker" && isTeamCreator && !teamName) {
    return { error: "Enter a team name to create a team." };
  }

  if (type === "hacker" && !isTeamCreator && teamCode && !/^[A-Z0-9]{6}$/.test(teamCode)) {
    return { error: "Team codes must be six letters or numbers." };
  }

  if (type === "mentor" && !githubUrl) {
    return { error: "Mentor applications require a GitHub URL." };
  }

  if (githubUrl) {
    try {
      const url = new URL(githubUrl);
      if (url.protocol !== "https:" || !["github.com", "www.github.com"].includes(url.hostname.toLowerCase())) {
        return { error: "GitHub URL must use https://github.com/." };
      }

    } catch {
      return { error: "Enter a valid GitHub URL." };
    }
  }

  if (linkedinUrl) {
    try {
      const url = new URL(linkedinUrl);
      if (url.protocol !== "https:" || !["linkedin.com", "www.linkedin.com"].includes(url.hostname.toLowerCase())) {
        return { error: "LinkedIn URL must use https://linkedin.com/." };
      }
    } catch {
      return { error: "Enter a valid LinkedIn URL." };
    }
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to apply." };
  }

  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing && !user.email) {
    return { error: "Your account does not have an email address." };
  }

  if (existing) {
    return { error: "You can only submit one application." };
  }

  let teamId: string | null = null;
  let createdTeamId: string | null = null;
  const admin = createAdminClient();

  if (type === "hacker" && isTeamCreator) {
    const inviteCode = await createUniqueInviteCode(admin);
    const { data: team, error: teamError } = await admin
      .from("teams")
      .insert({ name: teamName, invite_code: inviteCode, creator_id: user.id })
      .select("id")
      .single();
    if (teamError) {
      return { error: teamError.code === "23505" ? "That team name is already taken." : "Unable to create your team." };
    }
    teamId = team.id;
    createdTeamId = team.id;
  } else if (type === "hacker" && teamCode) {
    const { data: team } = await admin.from("teams").select("id").eq("invite_code", teamCode).maybeSingle();
    if (!team) return { error: "That team code is invalid." };
    teamId = team.id;
  }

  const { error } = await admin.from("applications").insert({
    user_id: user.id,
    applicant_type: type,
    full_name: fullName,
    email: user.email,
    school: school || null,
    experience_level: null,
    answers: {
      why_attend: whyAttend,
      dietary_restrictions: [dietaryRestriction],
      ...(type !== "judge" ? { shirt_size: shirtSize } : {}),
      hackathons_attended: ["hacker", "mentor"].includes(type) ? Number(hackathonsAttendedValue) : hackathonsAttendedValue,
      ...(type === "hacker" ? {
        project_proud: projectProud,
        hackathons_attended: Number(hackathonsAttendedValue),
      } : {}),
      ...(githubUrl ? { github_url: githubUrl } : {}),
      ...(linkedinUrl ? { linkedin_url: linkedinUrl } : {}),
      ...(type === "judge" && uniquePerspective
        ? { unique_perspective: uniquePerspective }
        : {}),
      ...(type === "judge" ? {
        job_title: jobTitle,
        organization,
        conflicts_of_interest: conflictsOfInterest,
      } : {}),
      ...(type === "mentor" ? {
        technical_experience: technicalExperience,
        helped_someone: helpedSomeone,
      } : {}),
      ...(type === "volunteer" ? {
        physical_work_comfort: physicalWorkComfort,
        stressful_situation: stressfulSituation,
      } : {}),
      ...(type === "judge" && resumePath ? { resume_path: resumePath } : {}),
    },
    ...(teamId ? { team_id: teamId } : {}),
    status: "submitted",
  });

  if (error) {
    if (createdTeamId) {
      await admin.from("teams").delete().eq("id", createdTeamId).eq("creator_id", user.id);
    }
    console.error("Application submission failed:", error.code, error.message);
    return {
      error:
        error.code === "23505"
          ? "You already submitted this application."
          : error.code === "PGRST204"
            ? "The Supabase answers migration has not been applied yet."
          : "Unable to submit application. Confirm the Supabase schema migration is applied.",
    };
  }

  async function createUniqueInviteCode(admin: ReturnType<typeof createAdminClient>) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      let code = "";
      for (let index = 0; index < 6; index += 1) {
        code += alphabet[randomInt(alphabet.length)];
      }
      const { data } = await admin.from("teams").select("id").eq("invite_code", code).maybeSingle();
      if (!data) return code;
    }
    throw new Error("Unable to generate a unique team code.");
  }

  revalidatePath("/portal");
  return { success: "Application submitted." };
}

export async function updateApplicationReview(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const score = Number(formData.get("score") ?? 0);
  const notes = String(formData.get("reviewNotes") ?? "").trim();

  if (!id || !["submitted", "accepted", "rejected"].includes(status)) {
    return { error: "Invalid review update." };
  }

  if (!Number.isInteger(score) || score < 0 || score > 100) {
    return { error: "Score must be a whole number from 0 to 100." };
  }
  if (notes.length > limits.longAnswer) {
    return { error: "Review notes are too long." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "organizer") return { error: "Organizer access is required." };

  const { error } = await supabase
    .from("applications")
    .update({ status, score, review_notes: notes || null })
    .eq("id", id);

  if (error) return { error: "Unable to update this application." };
  revalidatePath("/admin");
  return { success: "Review saved." };
}