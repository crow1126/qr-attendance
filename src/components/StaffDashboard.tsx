"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const supabase = createClient();

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPassMessage({ text: "Password must be at least 6 characters", isError: true });
      return;
    }

    setPassLoading(true);
    setPassMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPassLoading(false);
    if (error) {
      setPassMessage({ text: error.message, isError: true });
    } else {
      setPassMessage({ text: "Password changed successfully!", isError: false });
      setNewPassword("");
      setTimeout(() => setShowPasswordChange(false), 2000);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
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

        <button
          type="button"
          onClick={() => setShowPasswordChange(!showPasswordChange)}
          className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
        >
          {showPasswordChange ? "Close" : "Change Password"}
        </button>
      </div>

      {showPasswordChange && (
        <form
          onSubmit={handleChangePassword}
          className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex flex-col gap-3"
        >
          <h3 className="text-xs font-semibold text-indigo-900">Change Your Password</h3>
          <div className="flex flex-col gap-1">
            <input
              type="password"
              required
              minLength={6}
              placeholder="Enter new password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border border-indigo-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={passLoading || !newPassword}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-1.5 text-xs font-medium disabled:opacity-50 transition-colors"
            >
              {passLoading ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              onClick={() => setShowPasswordChange(false)}
              className="text-xs text-gray-500 underline"
            >
              Cancel
            </button>
          </div>
          {passMessage && (
            <p
              className={`text-xs ${
                passMessage.isError ? "text-red-600" : "text-green-700 font-medium"
              }`}
            >
              {passMessage.text}
            </p>
          )}
        </form>
      )}

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
        className="text-center bg-gray-800 text-white rounded-lg py-3 font-medium hover:bg-gray-700 transition-colors"
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