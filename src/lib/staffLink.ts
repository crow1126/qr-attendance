import { createServiceClient } from "@/lib/supabase/service";

// Called right after a staff member logs in and lands on /scan/[orgId].
// A staff row is created by an admin with just name/email/phone - there's
// no auth_user_id yet because the person hasn't logged in before. This
// finds the unlinked staff row for this org matching their verified email
// and links it. Uses the service client because staff have no RLS update
// permission on their own row (by design - only admins manage staff).
export async function linkStaffToAuthUser({
  orgId,
  authUserId,
  email,
}: {
  orgId: string;
  authUserId: string;
  email: string | undefined;
}) {
  const service = createServiceClient();

  // Already linked somewhere? Don't touch it.
  const { data: existing } = await service
    .from("staff")
    .select("id, org_id, name, active")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existing) return existing;

  if (!email) return null;

  const { data: match, error } = await service
    .from("staff")
    .select("id, org_id, name, active")
    .eq("org_id", orgId)
    .ilike("email", email) // case-insensitive - Supabase Auth normalizes emails
    .is("auth_user_id", null)
    .maybeSingle();

  if (error || !match) return null;

  const { data: updated, error: updateErr } = await service
    .from("staff")
    .update({ auth_user_id: authUserId })
    .eq("id", match.id)
    .select("id, org_id, name, active")
    .single();

  if (updateErr) return null;

  return updated;
}