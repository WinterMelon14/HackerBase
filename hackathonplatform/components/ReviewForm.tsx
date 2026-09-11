"use client";

import { useState, useTransition } from "react";
import { updateApplicationReview } from "@/actions/applications";

export default function ReviewForm({
  id,
  status,
  score,
  reviewNotes,
}: {
  id: string;
  status: string;
  score: number | null;
  reviewNotes: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(status);

  return (
    <form
      action={async (formData) => {
        startTransition(async () => {
          const result = await updateApplicationReview(formData);
          if (result.error) {
            setCurrentStatus(status);
            window.alert(result.error);
            return;
          }
          setCurrentStatus(result.status ?? currentStatus);
        });
      }}
      className="flex items-center justify-end gap-2"
    >
      <input type="hidden" name="id" value={id} />
      <select aria-label="Application status" name="status" value={currentStatus} onChange={(event) => {
        const form = event.currentTarget.form;
        if (!form) return;
        const nextStatus = event.currentTarget.value;
        if (currentStatus === "accepted" && nextStatus !== "accepted" && !window.confirm("This applicant is currently accepted. Change their status and rescind that decision?")) {
          setCurrentStatus(currentStatus);
          return;
        }
        setCurrentStatus(nextStatus);
        form.requestSubmit();
      }} className="rounded border border-zinc-300 p-2">
        <option value="submitted">Submitted</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>
      <input type="hidden" name="score" value={score ?? 0} />
      <input type="hidden" name="reviewNotes" value={reviewNotes ?? ""} />
      {isPending && <span className="text-sm text-zinc-500">Updating...</span>}
    </form>
  );
}
