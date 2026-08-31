"use client";

import { useActionState, useEffect, useRef } from "react";
import { createStaffAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export default function AddStaffForm({ orgId }: { orgId: string }) {
  const [state, formAction, pending] = useActionState(
    createStaffAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-2 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <input type="hidden" name="orgId" value={orgId} />
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs text-gray-500 mb-1">Name</label>
        <input
          name="name"
          required
          className="border rounded-lg px-3 py-2 w-full text-sm"
          placeholder="Jane Doe"
        />
      </div>
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs text-gray-500 mb-1">
          Email (used to log in)
        </label>
        <input
          name="email"
          type="email"
          className="border rounded-lg px-3 py-2 w-full text-sm"
          placeholder="jane@example.com"
        />
      </div>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-xs text-gray-500 mb-1">Phone</label>
        <input
          name="phone"
          className="border rounded-lg px-3 py-2 w-full text-sm"
          placeholder="Optional"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm whitespace-nowrap disabled:opacity-50"
      >
        {pending ? "Adding..." : "Add staff"}
      </button>

      {state.error && (
        <p className="text-xs text-red-600 basis-full">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-600 basis-full">Staff added.</p>
      )}
    </form>
  );
}