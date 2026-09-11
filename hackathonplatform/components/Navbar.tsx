import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isOrganizer = false;
  let applicationId: string | null = null;
  if (user) {
    const [{ data: profile }, { data: application }] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).maybeSingle(),
      supabase.from("applications").select("id").eq("user_id", user.id).maybeSingle(),
    ]);
    isOrganizer = profile?.role === "organizer";
    if (!isOrganizer) {
      applicationId = application?.id ?? null;
    }
  }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <nav className="flex w-full items-center justify-between px-8 py-4">
        <Link href={isOrganizer ? "/admin" : applicationId ? `/portal/applications/${applicationId}` : user ? "/portal" : "/"} className="font-semibold tracking-tight">
          HackerBase
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              <span className="hidden text-zinc-500 md:inline">Logged in as &apos;<span className="text-black">{user.email}</span>&apos;</span>
              <SignOutButton />
            </>
          ) : (
            <Link href="/auth/login" className="rounded-lg border border-zinc-200 px-3 py-2 font-medium hover:border-green-600 hover:text-green-700">Sign in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}