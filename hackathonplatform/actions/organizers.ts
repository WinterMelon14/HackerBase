"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findAuthUserByEmail } from "@/lib/supabase/admin-users";

async function requireRootOrganizer() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");
  const { data: isRootOrganizer } = await supabase.rpc("is_root_organizer");
  if (!isRootOrganizer) throw new Error("Root organizer access is required.");
  return user.id;
}

export async function setOrganizerByEmail(formData: FormData) {
  try {
    const currentUserId = await requireRootOrganizer();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const role = String(formData.get("role") ?? "");
    const confirmDelete = formData.get("confirmDelete") === "true";
    if (!email || !["organizer", "applicant"].includes(role)) return { error: "Enter a valid email and role." };

    const user = await findAuthUserByEmail(email);
    if (!user) return { error: "No account exists with that email address." };
    if (user.id === currentUserId && role === "applicant") {
      return { error: "You cannot remove your own root organizer access." };
    }
    const admin = createAdminClient();
    const { data: application } = await admin.from("applications").select("id").eq("user_id", user.id).maybeSingle();

    if (role === "organizer" && application && !confirmDelete) {
      return { requiresConfirmation: true, message: "This account has an application. Promoting it will delete that application." };
    }
    if (role === "organizer" && application) {
      const { error } = await admin.from("applications").delete().eq("id", application.id);
      if (error) return { error: "We could not remove the existing application." };
    }

    const { error } = await admin.from("profiles").update({ role }).eq("id", user.id);
    if (error) return { error: "We could not update this account's organizer role." };
    revalidatePath("/admin");
    revalidatePath("/admin/organizers");
    return { success: role === "organizer" ? "Organizer access granted." : "Organizer access removed." };
  } catch (error) {
    console.error("Organizer update failed:", error);
    return { error: "We could not update organizer access. Please try again." };
  }
}
