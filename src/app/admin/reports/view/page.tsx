import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PrintButton from "@/components/PrintButton";

function formatDuration(inTime: string, outTime: string | null) {
  if (!outTime) return "-";
  const ms = new Date(outTime).getTime() - new Date(inTime).getTime();
  if (ms <= 0) return "-";
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

export default async function ReportViewPage({
  searchParams,
}: {
  searchParams: Promise<{ orgId?: string; date?: string; staffId?: string }>;
}) {
  const { orgId, date, staffId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?next=/admin/reports");

  if (!orgId || !date) redirect("/admin/reports");

  const { data: org } = await supabase
    .from("organizations")
    .select("name, logo_url")
    .eq("id", orgId)
    .single();

  const dayStart = `${date}T00:00:00`;
  const dayEnd = `${date}T23:59:59.999`;

  let query = supabase
    .from("attendance_records")
    .select("id, type, method, occurred_at, flagged, flag_reason, staff:staff_id(id, name)")
    .eq("org_id", orgId)
    .gte("occurred_at", dayStart)
    .lte("occurred_at", dayEnd)
    .order("occurred_at", { ascending: true });

  if (staffId) query = query.eq("staff_id", staffId);

  const { data: records } = await query;

  let staffName: string | null = null;
  if (staffId) {
    const { data: s } = await supabase
      .from("staff")
      .select("name")
      .eq("id", staffId)
      .single();
    staffName = s?.name ?? null;
  }

  // Pair up in/out events per staff member so we can show a duration.
  type Row = {
    staffName: string;
    inTime: string | null;
    outTime: string | null;
    flagged: boolean;
    flagReason: string | null;
  };
  const rowsByStaff = new Map<string, Row>();

  for (const r of records ?? []) {
    const sName = (r.staff as any)?.name ?? "Unknown";
    const key = (r.staff as any)?.id ?? sName;
    const existing = rowsByStaff.get(key) ?? {
      staffName: sName,
      inTime: null,
      outTime: null,
      flagged: false,
      flagReason: null,
    };
    if (r.type === "in" && !existing.inTime) existing.inTime = r.occurred_at;
    if (r.type === "out") existing.outTime = r.occurred_at;
    if (r.flagged) {
      existing.flagged = true;
      existing.flagReason = existing.flagReason
        ? `${existing.flagReason}; ${r.flag_reason}`
        : r.flag_reason;
    }
    rowsByStaff.set(key, existing);
  }

  const rows = Array.from(rowsByStaff.values()).sort((a, b) =>
    a.staffName.localeCompare(b.staffName)
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="no-print flex justify-between items-center mb-6">
        <a href="/admin/reports" className="text-sm underline text-gray-500">
          Back
        </a>
        <PrintButton />
      </div>

      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        {org?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={org.logo_url}
            alt=""
            className="w-12 h-12 rounded object-cover"
          />
        )}
        <div>
          <h1 className="text-xl font-semibold">{org?.name}</h1>
          <p className="text-sm text-gray-600">
            {staffName ? `Individual report - ${staffName}` : "Daily attendance report"}
            {" · "}
            {date}
          </p>
        </div>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Staff</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Duration</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-400">
                No attendance records for this date.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2">{r.staffName}</td>
                <td>
                  {r.inTime
                    ? new Date(r.inTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                <td>
                  {r.outTime
                    ? new Date(r.outTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </td>
                <td>{r.inTime ? formatDuration(r.inTime, r.outTime) : "-"}</td>
                <td className={r.flagged ? "text-amber-600" : "text-gray-400"}>
                  {r.flagged ? r.flagReason : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <p className="text-xs text-gray-400 mt-6">
        Generated {new Date().toLocaleString()}
      </p>
    </div>
  );
}