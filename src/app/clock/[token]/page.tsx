import { createServiceClient } from "@/lib/supabase/service";
import ClockInPanel from "@/components/ClockInPanel";

export default async function PersonalClockPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Service client: there's no logged-in user here, the token itself
  // is the credential, so RLS (which only allows admins/self) can't apply.
  const supabase = createServiceClient();

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id, name, org_id, active")
    .eq("personal_qr_token", token)
    .single();

  if (!staffRow) {
    return (
      <div className="p-8 text-center text-red-600">
        QR code not recognized. Ask your admin to reissue your card.
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
    .eq("id", staffRow.org_id)
    .single();

  return (
    <ClockInPanel
      method="personal_qr"
      token={token}
      requireSelfie={org?.require_selfie ?? false}
      staffName={staffRow.name}
      orgLogoUrl={org?.logo_url}
      orgName={org?.name}
    />
  );
}