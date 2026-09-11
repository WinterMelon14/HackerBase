import Link from "next/link";

export default function RootOrganizerLink({ isRootOrganizer }: { isRootOrganizer: boolean }) {
  if (!isRootOrganizer) return null;
  return <Link href="/admin/organizers" className="mt-5 inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-green-600 hover:text-green-700">Manage organizers</Link>;
}
