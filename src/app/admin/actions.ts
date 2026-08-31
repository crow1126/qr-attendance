"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type ActionState = { error?: string; success?: boolean };
export type InviteActionState = ActionState & { inviteLink?: string };
const ok: ActionState = { success: true };

// One-time bootstrap: the first time a logged-in user visits /admin with no
// org yet, this creates their organization and makes them its admin -
// no manual SQL/Table Editor insert needed.
export async function createOrgAction(formData: FormData) {
  const name = (formData.get("name") as string)?.trim();
  if (!name) throw new Error("Organization name is required");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in");

  const service = createServiceClient();

  const { data: org, error: orgErr } = await service
    .from("organizations")
    .insert({ name })
    .select()
    .single();
  if (orgErr) throw new Error(orgErr.message);

  const { error: adminErr } = await service
    .from("org_admins")
    .insert({ org_id: org.id, auth_user_id: user.id });
  if (adminErr) throw new Error(adminErr.message);

  redirect("/admin");
}

// All staff-management actions below return { error } instead of throwing.
// Throwing from a Server Action crashes to Next's generic error page with
// no useful message shown to the admin - returning state lets the form
// show the real reason inline instead.

export async function createStaffAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const orgId = formData.get("orgId") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!orgId || !name) return { error: "Name is required" };

  const supabase = await createClient();
  const { error } = await supabase.from("staff").insert({
    org_id: orgId,
    name,
    email: email || null,
    phone: phone || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return ok;
}

export async function updateStaffAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staffId = formData.get("staffId") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();

  if (!staffId || !name) return { error: "Name is required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("staff")
    .update({ name, email: email || null, phone: phone || null })
    .eq("id", staffId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return ok;
}

export async function toggleStaffActiveAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staffId = formData.get("staffId") as string;
  const nextActive = formData.get("nextActive") === "true";
  if (!staffId) return { error: "Missing staff id" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("staff")
    .update({ active: nextActive })
    .eq("id", staffId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return ok;
}

// Note: attendance_records has ON DELETE CASCADE on staff_id, so deleting
// a staff member also deletes their attendance history permanently. The UI
// confirms this with the admin before submitting.
export async function deleteStaffAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staffId = formData.get("staffId") as string;
  if (!staffId) return { error: "Missing staff id" };

  const supabase = await createClient();
  const { error } = await supabase.from("staff").delete().eq("id", staffId);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return ok;
}

export async function uploadLogoAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const orgId = formData.get("orgId") as string;
  const file = formData.get("logo") as File | null;

  if (!orgId || !file || file.size === 0) {
    return { error: "Choose a logo file first" };
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "png";
  const path = `${orgId}/logo.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("org-logos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadErr) return { error: uploadErr.message };

  const { data } = supabase.storage.from("org-logos").getPublicUrl(path);
  const logoUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateErr } = await supabase
    .from("organizations")
    .update({ logo_url: logoUrl })
    .eq("id", orgId);

  if (updateErr) return { error: updateErr.message };

  revalidatePath("/admin");
  return ok;
}

// Admin generates a one-time login link for a staff member.
// Uses the Supabase Admin API (service role) so no email is required to be
// configured — the admin copies the link and shares it however they like
// (WhatsApp, SMS, email, print, etc.).
export async function sendStaffInviteAction(
  _prevState: InviteActionState,
  formData: FormData
): Promise<InviteActionState> {
  const email = (formData.get("email") as string)?.trim();
  const orgId = formData.get("orgId") as string;

  if (!email) {
    return {
      error:
        "This staff member has no email address. Edit their record to add one first.",
    };
  }

  // Verify the caller is actually an admin of this org.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const { data: adminRow } = await supabase
    .from("org_admins")
    .select("org_id")
    .eq("org_id", orgId)
    .eq("auth_user_id", user.id)
    .single();

  if (!adminRow) return { error: "You are not an admin of this organization." };

  // Generate a magic-link using the service-role admin API.
  // This doesn't send any email — it just returns the link.
  const service = createServiceClient();
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";

  const { data, error } = await service.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${appUrl}/auth/callback?next=/scan/${orgId}`,
    },
  });

  if (error || !data?.properties?.action_link) {
    return { error: error?.message ?? "Could not generate login link." };
  }

  return { success: true, inviteLink: data.properties.action_link };
}