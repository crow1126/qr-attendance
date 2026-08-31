import { DayRow, formatDuration } from "@/lib/attendance";

export default function StaffDashboard({
  staffName,
  orgName,
  orgLogoUrl,
  streak,
  rows,
  clockInHref,
}: {
  staffName: string;
  orgName?: string;
  orgLogoUrl?: string | null;
  streak: number;
  rows: DayRow[];
  clockInHref: string;
}) {
  return (
    <div className="max-w-md mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        {orgLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={orgLogoUrl}
            alt={orgName ? `${orgName} logo` : "Company logo"}
            className="w-12 h-12 rounded-lg object-cover"
          />
        )}
        <div>
          <p className="text-lg font-medium">{staffName}</p>
          {orgName && <p className="text-sm text-gray-500">{orgName}</p>}
        </div>
      </div>

      <div className="rounded-xl bg-gray-900 text-white p-5 text-center">
        <p className="text-3xl font-bold">
          {streak > 0 ? `🔥 ${streak}` : "—"}
        </p>
        <p className="text-sm text-gray-300 mt-1">
          {streak > 0
            ? `day streak${streak >= 7 ? " - keep it up!" : ""}`
            : "No active streak yet - clock in to start one"}
        </p>
      </div>

      <a
        href={clockInHref}
        className="text-center bg-gray-800 text-white rounded-lg py-3 font-medium"
      >
        Clock in / out
      </a>

      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-2">
          Attendance history
        </h2>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-400">No attendance recorded yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-1">Date</th>
                <th>In</th>
                <th>Out</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date} className="border-b last:border-0">
                  <td className="py-2">
                    {new Date(r.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}