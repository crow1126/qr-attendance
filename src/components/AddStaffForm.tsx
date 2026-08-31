"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createStaffAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

function generateRandomPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#";
  let pass = "";
  for (let i = 0; i < 8; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function AddStaffForm({ orgId }: { orgId: string }) {
  const [state, formAction, pending] = useActionState(
    createStaffAction,
    initialState
  );
  const [password, setPassword] = useState("StaffPass123");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setPassword(generateRandomPassword());
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="orgId" value={orgId} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Staff Full Name *
          </label>
          <input
            name="name"
            required
            className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Staff Email / Username *
          </label>
          <input
            name="email"
            type="email"
            required
            className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="jane@company.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            name="phone"
            className="border rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="+1 234 567 890"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-semibold text-gray-700">
              Initial Password *
            </label>
            <button
              type="button"
              onClick={() => setPassword(generateRandomPassword())}
              className="text-[11px] text-indigo-600 underline hover:text-indigo-800"
            >
              Generate
            </button>
          </div>
          <input
            name="password"
            type="text"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Min 6 characters"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1">
        <button
          type="submit"
          disabled={pending}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap disabled:opacity-50 transition-colors shadow-sm"
        >
          {pending ? "Creating Account..." : "Create Staff & Issue Login"}
        </button>
        <span className="text-xs text-gray-500">
          Staff can log in immediately with this email &amp; password, and change it anytime.
        </span>
      </div>

      {state.error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 p-2 rounded-lg">
          ✓ Staff account created successfully with login credentials.
        </p>
      )}
    </form>
  );
}