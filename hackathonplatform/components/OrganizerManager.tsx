"use client";

import { useRef, useState, useTransition } from "react";
import { setOrganizerByEmail } from "@/actions/organizers";

type Organizer = { id: string; email: string };

export default function OrganizerManager({ organizers }: { organizers: Organizer[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function submit(formData: FormData, confirmDelete = false) {
    if (confirmDelete) formData.set("confirmDelete", "true");
    startTransition(async () => {
      const result = await setOrganizerByEmail(formData);
      if (result.requiresConfirmation) {
        if (window.confirm(result.message)) submit(formData, true);
        return;
      }
      setMessage(result.error ?? result.success ?? "");
      if (result.success) formRef.current?.reset();
    });
  }

  return (
    <div className="space-y-8">
      <form ref={formRef} action={(formData) => submit(formData)} className="rounded-xl border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Add organizer</h2>
        <p className="mt-1 text-sm text-zinc-600">The account must already exist. Existing applications are removed only after confirmation.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input name="email" type="email" required placeholder="organizer@example.com" className="min-w-0 flex-1 rounded-lg border border-zinc-300 p-3" />
          <input type="hidden" name="role" value="organizer" />
          <button disabled={isPending} className="cursor-pointer rounded-lg bg-green-700 px-5 py-3 font-medium text-white hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">{isPending ? "Updating..." : "Grant access"}</button>
        </div>
        {message && <p className="mt-4 text-sm text-zinc-700">{message}</p>}
      </form>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Current organizers</h2>
        <div className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {organizers.map((organizer) => (
            <div key={organizer.id} className="flex items-center justify-between gap-4 p-4">
              <span className="font-medium">{organizer.email}</span>
              <form action={(formData) => submit(formData)}>
                <input type="hidden" name="email" value={organizer.email} />
                <input type="hidden" name="role" value="applicant" />
                <button className="cursor-pointer text-sm font-medium text-red-700 hover:underline">Remove access</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
