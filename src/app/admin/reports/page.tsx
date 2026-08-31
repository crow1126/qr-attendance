import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function ReportsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?next=/admin/reports");

  const { data: adminRow } = await supabase
    .from("org_admins")
    .select("org_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!adminRow) redirect("/admin");

  const orgId = adminRow.org_id;

  const { data: staffList } = await supabase
    .from("staff")
    .select("id, name")
    .eq("org_id", orgId)
    .order("name");

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Attendance reports</h1>
        <p className="text-sm text-gray-500">
          Generate a printable daily report - for everyone, or one staff
          member.
        </p>
      </div>

      <form
        action="/admin/reports/view"
        className="flex flex-col gap-4 border rounded-lg p-4"
      >
        <input type="hidden" name="orgId" value={orgId} />

        <div>
          <label className="block text-xs text-gray-500 mb-1">Date</label>
          <input
            type="date"
            name="date"
            defaultValue={todayIso()}
            required
            className="border rounded-lg px-3 py-2 w-full text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Staff</label>
          <select
            name="staffId"
            defaultValue=""
            className="border rounded-lg px-3 py-2 w-full text-sm"
          >
            <option value="">All staff (general report)</option>
            {staffList?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-gray-800 text-white rounded-lg py-2 text-sm"
        >
          Generate report
        </button>
      </form>

      <a href="/admin" className="text-sm underline text-gray-500">
        Back to dashboard
      </a>
    </div>
  );
}