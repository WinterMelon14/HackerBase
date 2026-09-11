export const applicationAnswerLabels: Record<string, string> = {
  why_attend: "Why do you want to attend?",
  project_proud: "Tell us about a project you're proud of.",
  hackathons_attended: "Hackathon experience",
  dietary_restriction: "Dietary restrictions",
  dietary_restrictions: "Dietary restrictions",
  shirt_size: "T-shirt size",
  unique_perspective: "What unique perspective do you bring?",
  linkedin_url: "LinkedIn URL",
  job_title: "Job title",
  organization: "Organization",
  conflicts_of_interest: "Do you have any conflicts of interest with potential sponsors or participating university teams?",
  technical_experience: "What programming languages, frameworks, and APIs are you familiar with?",
  helped_someone: "Tell us about a time you helped someone.",
  physical_work_comfort: "Are you okay with standing for long periods of time and potentially lifting heavy objects?",
  stressful_situation: "Tell us about a time you handled a stressful situation.",
  github_url: "GitHub URL",
  resume_path: "Resume/portfolio link",
};

export function getApplicationAnswerLabel(key: string, applicationType?: string) {
  if (key === "hackathons_attended") {
    if (applicationType === "hacker") return "How many hackathons have you attended?";
    if (applicationType === "mentor") return "How many hackathons have you mentored at (or attended)?";
    if (applicationType === "judge") return "Have you ever judged (or attended) a hackathon before?";
    if (applicationType === "volunteer") return "Have you ever been to a hackathon before?";
  }
  return applicationAnswerLabels[key] ?? key;
}

export function formatApplicationAnswer(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => typeof item === "string" ? item.charAt(0).toUpperCase() + item.slice(1) : String(item)).join(", ");
  }
  return typeof value === "string" ? value : JSON.stringify(value);
}
