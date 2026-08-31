"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateStaffAction,
  toggleStaffActiveAction,
  deleteStaffAction,
  setStaffPasswordAction,
  type ActionState,
} from "@/app/admin/actions";
import StaffQrButton from "@/components/StaffQrButton";

const initialState: ActionState = {};

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
  const [changingPass, setChangingPass] = useState(false);
  const [newPass, setNewPass] = useState("");
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
  const [passState, passAction, passPending] = useActionState(
    setStaffPasswordAction,
    initialState
  );

  useEffect(() => {
    if (updateState.success) setEditing(false);
  }, [updateState]);

  useEffect(() => {
    if (passState.success) {
      setChangingPass(false);
      setNewPass("");
    }
  }, [passState]);

  function handleCopyCredentials(email: string) {
    const text = `Staff Login for ${staff.name}:\nPortal: ${window.location.origin}/login\nUsername/Email: ${email}`;
    navigator.clipboard.writeText(text).then(() => {
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
            className="flex flex-col sm:flex-row gap-2 sm:items-center flex-wrap bg-gray-50 p-2 rounded-lg"
          >
            <input type="hidden" name="staffId" value={staff.id} />
            <input
              name="name"
              defaultValue={staff.name}
              required
              className="border rounded-lg px-2 py-1 text-sm flex-1 min-w-[120px]"
              placeholder="Name"
            />
            <input
              name="email"
              type="email"
              defaultValue={staff.email ?? ""}
              required
              className="border rounded-lg px-2 py-1 text-sm flex-1 min-w-[160px]"
              placeholder="Email (Login Username)"
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
              className="text-xs bg-indigo-600 text-white rounded px-3 py-1.5 disabled:opacity-50 font-medium"
            >
              {updating ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs underline text-gray-500"
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
        <td className="py-3 font-medium text-gray-900">{staff.name}</td>
        <td>
          <div className="flex flex-col">
            <span className="text-gray-900 font-mono text-xs">{staff.email ?? "-"}</span>
            {staff.phone && <span className="text-gray-400 text-xs">{staff.phone}</span>}
          </div>
        </td>
        <td>
          <span
            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
              staff.active
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {staff.active ? "Active" : "Inactive"}
          </span>
        </td>
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
              className="text-xs text-gray-600 hover:text-indigo-600 underline"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() => setChangingPass(!changingPass)}
              className="text-xs text-indigo-600 hover:text-indigo-800 underline font-medium"
            >
              {changingPass ? "Close Password" : "Set Password"}
            </button>

            {staff.email && (
              <button
                type="button"
                onClick={() => handleCopyCredentials(staff.email!)}
                className="text-xs text-indigo-600 hover:text-indigo-800 underline"
              >
                {copied ? "Copied!" : "Copy Login Info"}
              </button>
            )}

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
                className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
              >
                {staff.active ? "Deactivate" : "Activate"}
              </button>
            </form>

            <form
              action={deleteAction}
              onSubmit={(e) => {
                if (
                  !confirm(
                    `Delete ${staff.name}? This will remove their account and attendance history.`
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
                className="text-xs text-red-500 hover:text-red-700 underline disabled:opacity-50"
              >
                Delete
              </button>
            </form>
          </div>

          {toggleState.error && (
            <p className="text-xs text-red-600 mt-1">{toggleState.error}</p>
          )}
          {deleteState.error && (
            <p className="text-xs text-red-600 mt-1">{deleteState.error}</p>
          )}
        </td>
      </tr>

      {/* ── Set Password form (shown below staff row when toggled) ── */}
      {changingPass && (
        <tr className="bg-indigo-50/70 border-b">
          <td colSpan={colSpan} className="py-2.5 px-3">
            <form action={passAction} className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <input type="hidden" name="staffId" value={staff.id} />
              <input type="hidden" name="orgId" value={orgId} />
              <span className="text-xs font-semibold text-indigo-900 whitespace-nowrap">
                New Password for {staff.name}:
              </span>
              <input
                name="password"
                type="text"
                required
                minLength={6}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Min 6 chars (e.g. NewPass123)"
                className="border border-indigo-300 rounded px-2.5 py-1 text-xs bg-white font-mono flex-1 max-w-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={passPending || !newPass}
                className="text-xs bg-indigo-600 text-white rounded px-3 py-1 font-medium disabled:opacity-50 hover:bg-indigo-700"
              >
                {passPending ? "Updating..." : "Save Password"}
              </button>
              <button
                type="button"
                onClick={() => setChangingPass(false)}
                className="text-xs text-gray-500 underline"
              >
                Cancel
              </button>

              {passState.error && (
                <span className="text-xs text-red-600">{passState.error}</span>
              )}
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

