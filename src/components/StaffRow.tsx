"use client";

import { useActionState, useEffect, useState } from "react";
import {
  updateStaffAction,
  toggleStaffActiveAction,
  deleteStaffAction,
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
}: {
  staff: Staff;
  showQr: boolean;
}) {
  const [editing, setEditing] = useState(false);

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

  useEffect(() => {
    if (updateState.success) setEditing(false);
  }, [updateState]);

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
    <tr className="border-b last:border-0">
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
      </td>
    </tr>
  );
}