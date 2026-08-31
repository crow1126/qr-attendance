import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildDailyRows, computeStreak } from "@/lib/attendance";
import StaffDashboard from "@/components/StaffDashboard";

export default async function MePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/me");

  const { data: staffRow } = await supabase
    .from("staff")
    .select("id, name, org_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!staffRow) {
    return (
      <div className="p-8 text-center text-red-600">
        No staff record linked to your account yet. Scan your workplace QR
        first to get linked.
      </div>
    );
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name, logo_url")
    .eq("id", staffRow.org_id)
    .single();

  // Last 90 days is plenty for a streak + recent history view.
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
      clockInHref={`/scan/${staffRow.org_id}`}
    />
  );
}