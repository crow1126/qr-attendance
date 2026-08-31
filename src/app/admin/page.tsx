import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ModeToggle from "@/components/ModeToggle";
import AddStaffForm from "@/components/AddStaffForm";
import StaffRow from "@/components/StaffRow";
import LogoUploadForm from "@/components/LogoUploadForm";
import { createOrgAction } from "./actions";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login?next=/admin");

  // MVP: assumes one admin manages one org. Extend to an org picker
  // once an admin can run multiple orgs.
  const { data: adminRow } = await supabase
    .from("org_admins")
    .select("org_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!adminRow) {
    return (
      <div className="max-w-sm mx-auto p-6 flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Set up your organization</h1>
        <p className="text-sm text-gray-500">
          You&apos;re logged in but not yet an admin anywhere. Create your
          organization and you&apos;ll be made its admin automatically.
        </p>
        <form action={createOrgAction} className="flex flex-col gap-2">
          <input
            name="name"
            required
            placeholder="e.g. Riverside Spinal Clinic"
            className="border rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            className="bg-gray-800 text-white rounded-lg py-2"
          >
            Create organization
          </button>
        </form>
      </div>
    );
  }

  const orgId = adminRow.org_id;

  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single();

  const { data: staffList } = await supabase
    .from("staff")
    .select("id, name, phone, email, active")
    .eq("org_id", orgId)
    .order("name");

  const { data: recentRecords } = await supabase
    .from("attendance_records")
    .select("id, type, method, occurred_at, flagged, flag_reason, staff:staff_id(name)")
    .eq("org_id", orgId)
    .order("occurred_at", { ascending: false })
    .limit(25);

  const showQr = org?.mode === "personal_qr";

  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-8">
      <div className="flex items-center gap-4">
        {org?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={org.logo_url}
            alt={`${org.name} logo`}
            className="w-14 h-14 rounded-lg object-cover border"
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{org?.name}</h1>
          <p className="text-sm text-gray-500">Attendance admin dashboard</p>
        </div>
        <a
          href={`/admin/reports?orgId=${orgId}`}
          className="text-sm underline text-gray-600 whitespace-nowrap"
        >
          Attendance reports
        </a>
      </div>

      <section className="border rounded-lg p-4">
        <h2 className="font-medium mb-3">Company logo</h2>
        <LogoUploadForm orgId={orgId} />
        <p className="text-xs text-gray-400 mt-2">
          Shows on this dashboard and on the staff clock-in pages.
        </p>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-medium mb-3">Clock-in mode</h2>
        <ModeToggle orgId={orgId} currentMode={org?.mode ?? "session"} />
        {org?.mode === "session" ? (
          <p className="text-sm text-gray-500 mt-2">
            Staff scan one company QR:{" "}
            <a
              className="underline"
              href={`/api/org/qr?orgId=${orgId}`}
              target="_blank"
            >
              view entrance QR
            </a>
          </p>
        ) : (
          <p className="text-sm text-gray-500 mt-2">
            Each staff member has their own personal QR (below).
          </p>
        )}
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-medium mb-3">Add staff member</h2>
        <AddStaffForm orgId={orgId} />
        <p className="text-xs text-gray-400 mt-2">
          For session mode, the email here must match the email they log in
          with - the app links them automatically on their first scan.
        </p>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-medium mb-3">Staff ({staffList?.length ?? 0})</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-1">Name</th>
              <th>Contact</th>
              <th>Status</th>
              {showQr && <th>QR</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList?.map((s) => (
              <StaffRow key={s.id} staff={s} showQr={showQr} />
            ))}
          </tbody>
        </table>
      </section>

      <section className="border rounded-lg p-4">
        <h2 className="font-medium mb-3">Recent attendance</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-1">Staff</th>
              <th>Type</th>
              <th>Method</th>
              <th>Time</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {recentRecords?.map((r: any) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2">{r.staff?.name ?? "-"}</td>
                <td>{r.type}</td>
                <td>{r.method}</td>
                <td>{new Date(r.occurred_at).toLocaleString()}</td>
                <td className={r.flagged ? "text-amber-600" : "text-gray-400"}>
                  {r.flagged ? r.flag_reason : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}