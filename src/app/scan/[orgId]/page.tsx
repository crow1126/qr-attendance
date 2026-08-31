import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { linkStaffToAuthUser } from "@/lib/staffLink";
import ClockInPanel from "@/components/ClockInPanel";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/scan/${orgId}`);
  }

  // First visit after logging in - staff row exists (an admin created it)
  // but isn't linked to this auth user yet. Try to link by email match.
  const staffRow = await linkStaffToAuthUser({
    orgId,
    authUserId: user!.id,
    email: user!.email,
  });

  if (!staffRow || staffRow.org_id !== orgId) {
    return (
      <div className="p-8 text-center text-red-600">
        Your account isn&apos;t linked to this organization. Contact your
        admin.
      </div>
    );
  }

  if (!staffRow.active) {
    return (
      <div className="p-8 text-center text-red-600">
        Your staff account is inactive. Contact your admin.
      </div>
    );
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, require_selfie, logo_url")
    .eq("id", orgId)
    .single();

  return (
    <ClockInPanel
      method="session"
      requireSelfie={org?.require_selfie ?? false}
      staffName={staffRow.name}
      orgLogoUrl={org?.logo_url}
      orgName={org?.name}
    />
  );
}