"use client";

import { signOut } from "@/actions/auth";

export default function SignOutButton() {
  return <form action={signOut}><button className="cursor-pointer text-sm underline hover:text-green-700" type="submit">Sign out</button></form>;
}
