"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { submitApplication } from "@/actions/applications";

export type ApplicationType = "hacker" | "judge" | "mentor" | "volunteer";

const dietaryOptions = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten-free" },
  { value: "None", label: "None" },
] as const;
const shirtSizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block text-sm font-medium">{label}{children}</label>;
}

const inputClass = "mt-2 w-full rounded border border-zinc-300 p-3";

export default function ApplicationForm({ type }: { type: ApplicationType }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isTeamCreator, setIsTeamCreator] = useState(false);
  const router = useRouter();
  const hasSchool = type === "hacker";
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      startTransition(async () => {
        setMessage("");
        const result = await submitApplication(data);
        if (result.error) {
          setMessage(result.error);
          return;
        }
        router.push("/portal?submitted=1");
        router.refresh();
      });
    }} className="space-y-6">
      <input type="hidden" name="type" value={type} />

      <Field label="Full name">
        <input name="fullName" required maxLength={100} className={inputClass} />
      </Field>

      {type === "judge" && <>
        <Field label="LinkedIn URL">
          <input name="linkedinUrl" type="url" required maxLength={500} className={inputClass} />
        </Field>
        <Field label="Job title">
          <input name="jobTitle" required maxLength={50} className={inputClass} />
        </Field>
        <Field label="Organization">
          <input name="organization" required maxLength={50} className={inputClass} />
        </Field>
      </>}

      {hasSchool && <Field label="School or organization">
        <input name="school" required className={inputClass} />
      </Field>}

      <Field label="Why do you want to attend?">
        <textarea name="whyAttend" required maxLength={5000} rows={5} className={inputClass} />
      </Field>

      {type === "hacker" && <>
        <Field label="Tell us about a project you're proud of.">
          <textarea name="projectProud" required maxLength={5000} rows={5} className={inputClass} />
        </Field>
        <Field label="How many hackathons have you attended?">
          <input name="hackathonsAttended" type="number" min="0" step="1" required className={inputClass} />
        </Field>
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">Are you applying as the creator of a team?</legend>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="isTeamCreator" value="yes" checked={isTeamCreator} onChange={() => setIsTeamCreator(true)} required />Yes</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" name="isTeamCreator" value="no" checked={!isTeamCreator} onChange={() => setIsTeamCreator(false)} required />No</label>
          </div>
        </fieldset>
        {isTeamCreator ? (
          <Field label="Team name">
            <input name="teamName" required maxLength={50} className={inputClass} />
          </Field>
        ) : (
          <Field label="Team code (optional)">
            <input name="teamCode" maxLength={6} className={`${inputClass} uppercase`} />
          </Field>
        )}
      </>}

      {type === "judge" && <>
        <Field label="Have you ever judged (or attended) a hackathon before?">
          <select name="hackathonsAttended" required className={inputClass}>
            <option value="">Select one</option><option>Yes</option><option>No</option>
          </select>
        </Field>
        <Field label="What unique perspective do you bring?">
          <textarea name="uniquePerspective" required maxLength={5000} rows={5} className={inputClass} />
        </Field>
        <Field label="Do you have any conflicts of interest with potential sponsors or participating university teams?">
          <textarea name="conflictsOfInterest" required maxLength={5000} rows={4} className={inputClass} />
        </Field>
      </>}

      {type === "mentor" && <>
        <Field label="How many hackathons have you mentored at (or attended)?">
          <input name="hackathonsAttended" type="number" min="0" step="1" required className={inputClass} />
        </Field>
        <Field label="What programming languages, frameworks, and APIs are you familiar with?">
          <textarea name="technicalExperience" required maxLength={5000} rows={4} className={inputClass} />
        </Field>
        <Field label="Tell us about a time you helped someone.">
          <textarea name="helpedSomeone" required maxLength={5000} rows={5} className={inputClass} />
        </Field>
      </>}

      {type === "volunteer" && <>
        <Field label="Have you ever been to a hackathon before?">
          <select name="hackathonsAttended" required className={inputClass}>
            <option value="">Select one</option><option>Yes</option><option>No</option>
          </select>
        </Field>
        <Field label="Are you okay with standing for long periods of time and potentially lifting heavy objects?">
          <select name="physicalWorkComfort" required className={inputClass}>
            <option value="">Select one</option><option>Yes</option><option>No</option>
          </select>
        </Field>
        <Field label="Tell us about a time you handled a stressful situation.">
          <textarea name="stressfulSituation" required maxLength={5000} rows={5} className={inputClass} />
        </Field>
      </>}

      <Field label="Dietary restrictions">
        <select name="dietaryRestriction" required className={inputClass}>
          <option value="">Select one</option>
          {dietaryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </Field>

      {type !== "judge" && <Field label="T-shirt size">
        <select name="shirtSize" required className={inputClass}>
          <option value="">Select one</option>
          {shirtSizes.map((size) => <option key={size}>{size}</option>)}
        </select>
      </Field>}

      {type === "hacker" && <Field label="GitHub URL (optional)">
        <input name="githubUrl" type="url" maxLength={500} className={inputClass} />
      </Field>}
      {type === "mentor" && <Field label="GitHub URL">
        <input name="githubUrl" type="url" required maxLength={500} className={inputClass} />
      </Field>}
      {type === "judge" && <Field label="Resume/portfolio link (optional)">
        <input name="resumePath" type="url" maxLength={500} className={inputClass} placeholder="https://example.com/resume" />
      </Field>}

      {message && <p className="text-sm text-red-700">{message}</p>}
      <button disabled={isPending} type="submit" className="cursor-pointer rounded bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">
        {isPending ? "Submitting..." : "Submit application"}
      </button>
    </form>
  );
}
