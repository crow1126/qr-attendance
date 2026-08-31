"use client";

import { useActionState, useEffect, useRef } from "react";
import { uploadLogoAction, type ActionState } from "@/app/admin/actions";

const initialState: ActionState = {};

export default function LogoUploadForm({ orgId }: { orgId: string }) {
  const [state, formAction, pending] = useActionState(
    uploadLogoAction,
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
      className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
    >
      <input type="hidden" name="orgId" value={orgId} />
      <input type="file" name="logo" accept="image/*" required className="text-sm" />
      <button
        type="submit"
        disabled={pending}
        className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm whitespace-nowrap disabled:opacity-50"
      >
        {pending ? "Uploading..." : "Upload logo"}
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-xs text-green-600">Logo updated.</p>
      )}
    </form>
  );
}