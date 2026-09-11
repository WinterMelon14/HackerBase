import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listAuthUsers } from "@/lib/supabase/admin-users";
import OrganizerManager from "@/components/OrganizerManager";

export default async function OrganizersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const { data: isRootOrganizer } = await supabase.rpc("is_root_organizer");
  if (!isRootOrganizer) redirect("/admin");

  const admin = createAdminClient();
  const [{ data: profiles }, users] = await Promise.all([
    admin.from("profiles").select("id").eq("role", "organizer"),
    listAuthUsers(),
  ]);
  const emails = new Map(users.map((account) => [account.id, account.email ?? ""]));
  const organizers = (profiles ?? []).map((profile) => ({ id: profile.id, email: emails.get(profile.id) ?? "" })).filter((item) => item.email);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-green-700">Organizer Workspace</p>
      <h1 className="text-4xl font-semibold tracking-tight">Manage organizers</h1>
      <p className="mt-2 mb-10 text-zinc-600">Grant or remove organizer access for existing accounts.</p>
      <OrganizerManager organizers={organizers} />
    </main>
  );
}
