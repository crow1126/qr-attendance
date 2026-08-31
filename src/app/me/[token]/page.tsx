import { createServiceClient } from "@/lib/supabase/service";
import { buildDailyRows, computeStreak } from "@/lib/attendance";
import StaffDashboard from "@/components/StaffDashboard";

export default async function MeTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // No auth session in this flow - the token itself is the credential,
  // so we use the service client (same pattern as /clock/[token]).
  const supabase = createServiceClient();

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id, name, org_id")
    .eq("personal_qr_token", token)
    .single();

  if (!staffRow) {
    return (
      <div className="p-8 text-center text-red-600">
        QR code not recognized.
      </div>
    );
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, logo_url")
    .eq("id", staffRow.org_id)
    .single();

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const { data: records } = await supabase
    .from("attendance_records")
    .select("type, occurred_at")
    .eq("staff_id", staffRow.id)
    .gte("occurred_at", since.toISOString())
    .order("occurred_at", { ascending: false });

  const rows = buildDailyRows(records ?? []);
  const streak = computeStreak(rows);

  return (
    <StaffDashboard
      staffName={staffRow.name}
      orgName={org?.name}
      orgLogoUrl={org?.logo_url}
      streak={streak}
      rows={rows}
      clockInHref={`/clock/${token}`}
    />
  );
}