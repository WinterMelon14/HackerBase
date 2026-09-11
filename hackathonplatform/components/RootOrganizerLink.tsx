import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function RootOrganizerLink() {
  const supabase = await createClient();
  const { data: isRootOrganizer } = await supabase.rpc("is_root_organizer");
  if (!isRootOrganizer) return null;
  return <Link href="/admin/organizers" className="mt-5 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-green-600 hover:text-green-700">Manage organizers</Link>;
}
