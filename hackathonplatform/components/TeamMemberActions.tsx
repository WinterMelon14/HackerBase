"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeTeamMember } from "@/actions/teams";

export default function TeamMemberActions({ applicationId }: { applicationId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const router = useRouter();

  return <div className="text-right">
    <button
      type="button"
      disabled={isPending}
      className="cursor-pointer text-sm font-medium text-red-700 hover:underline disabled:cursor-wait"
      onClick={() => {
        if (!window.confirm("Remove this teammate from your team?")) return;
        startTransition(async () => {
          const result = await removeTeamMember(applicationId);
          if (result.error) {
            setMessage(result.error);
            return;
          }
          router.refresh();
        });
      }}
    >
      {isPending ? "Removing..." : "Remove"}
    </button>
    {message && <p className="mt-1 max-w-40 text-xs text-red-700">{message}</p>}
  </div>;
}
