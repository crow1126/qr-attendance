"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateStaffAction,
  toggleStaffActiveAction,
  deleteStaffAction,
  sendStaffInviteAction,
  type ActionState,
  type InviteActionState,
} from "@/app/admin/actions";
import StaffQrButton from "@/components/StaffQrButton";

const initialState: ActionState = {};
const initialInviteState: InviteActionState = {};

type Staff = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
};

export default function StaffRow({
  staff,
  showQr,
  orgId,
}: {
  staff: Staff;
  showQr: boolean;
  orgId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [updateState, updateAction, updating] = useActionState(
    updateStaffAction,
    initialState
  );
  const [toggleState, toggleAction, toggling] = useActionState(
    toggleStaffActiveAction,
    initialState
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteStaffAction,
    initialState
  );
  const [inviteState, inviteAction, inviting] = useActionState(
    sendStaffInviteAction,
    initialInviteState
  );

  useEffect(() => {
    if (updateState.success) setEditing(false);
  }, [updateState]);

  function handleCopy(link: string) {
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const colSpan = showQr ? 5 : 4;

  if (editing) {
    return (
      <tr className="border-b last:border-0">
        <td colSpan={colSpan} className="py-2">
          <form
            action={updateAction}
            className="flex flex-col sm:flex-row gap-2 sm:items-center flex-wrap"
          >
            <input type="hidden" name="staffId" value={staff.id} />
            <input
              name="name"
              defaultValue={staff.name}
              required
              className="border rounded-lg px-2 py-1 text-sm flex-1 min-w-[120px]"
            />
            <input
              name="email"
              type="email"
              defaultValue={staff.email ?? ""}
              className="border rounded-lg px-2 py-1 text-sm flex-1 min-w-[160px]"
              placeholder="Email"
            />
            <input
              name="phone"
              defaultValue={staff.phone ?? ""}
              className="border rounded-lg px-2 py-1 text-sm flex-1 min-w-[100px]"
              placeholder="Phone"
            />
            <button
              type="submit"
              disabled={updating}
              className="text-xs bg-gray-800 text-white rounded px-3 py-1.5 disabled:opacity-50"
            >
              {updating ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs underline text-gray-400"
            >
              Cancel
            </button>
            {updateState.error && (
              <p className="text-xs text-red-600 basis-full">
                {updateState.error}
              </p>
            )}
          </form>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="border-b">
        <td className="py-2">{staff.name}</td>
        <td>{staff.email ?? staff.phone ?? "-"}</td>
        <td>{staff.active ? "Active" : "Inactive"}</td>
        {showQr && (
          <td>
            <StaffQrButton staffId={staff.id} />
          </td>
        )}
        <td>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs underline text-gray-500"
            >
              Edit
            </button>

            {/* ── Send Login Link ── */}
            <form action={inviteAction}>
              <input type="hidden" name="email" value={staff.email ?? ""} />
              <input type="hidden" name="orgId" value={orgId} />
              <button
                type="submit"
                disabled={inviting}
                className="text-xs underline text-indigo-600 disabled:opacity-50"
              >
                {inviting ? "Generating…" : "Send Login"}
              </button>
            </form>

            <form action={toggleAction}>
              <input type="hidden" name="staffId" value={staff.id} />
              <input
                type="hidden"
                name="nextActive"
                value={(!staff.active).toString()}
              />
              <button
                type="submit"
                disabled={toggling}
                className="text-xs underline text-gray-500 disabled:opacity-50"
              >
                {staff.active ? "Deactivate" : "Activate"}
              </button>
            </form>

            <form
              action={deleteAction}
              onSubmit={(e) => {
                if (
                  !confirm(
                    `Delete ${staff.name}? This also permanently deletes their attendance history.`
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="staffId" value={staff.id} />
              <button
                type="submit"
                disabled={deleting}
                className="text-xs underline text-red-500 disabled:opacity-50"
              >
                Delete
              </button>
            </form>
          </div>

          {toggleState.error && (
            <p className="text-xs text-red-600">{toggleState.error}</p>
          )}
          {deleteState.error && (
            <p className="text-xs text-red-600">{deleteState.error}</p>
          )}
          {inviteState.error && (
            <p className="text-xs text-red-600 mt-1">{inviteState.error}</p>
          )}
        </td>
      </tr>

      {/* ── Invite link row (shown below staff row when link is ready) ── */}
      {inviteState.inviteLink && (
        <tr className="bg-indigo-50 border-b">
          <td colSpan={colSpan} className="py-2 px-3">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-indigo-700">
                ✓ Login link for {staff.name} — share this via WhatsApp, SMS, or email:
              </p>
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  readOnly
                  value={inviteState.inviteLink}
                  className="text-xs border border-indigo-200 rounded px-2 py-1 bg-white flex-1 min-w-0 font-mono"
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  onClick={() => handleCopy(inviteState.inviteLink!)}
                  className="text-xs bg-indigo-600 text-white rounded px-3 py-1 whitespace-nowrap hover:bg-indigo-700 transition-colors"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Hi ${staff.name}, here is your login link for our attendance system: ${inviteState.inviteLink}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-green-600 text-white rounded px-3 py-1 whitespace-nowrap hover:bg-green-700 transition-colors"
                >
                  Share via WhatsApp
                </a>
              </div>
              <p className="text-xs text-indigo-500">
                This link is single-use and expires after the staff member logs in.
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
