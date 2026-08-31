"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ModeToggle({
  orgId,
  currentMode,
}: {
  orgId: string;
  currentMode: "session" | "personal_qr";
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function setMode(mode: "session" | "personal_qr") {
    if (mode === currentMode) return;
    setSaving(true);
    await fetch("/api/org/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, mode }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={saving}
        onClick={() => setMode("session")}
        className={`px-3 py-1.5 rounded-lg text-sm border ${
          currentMode === "session"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-700"
        }`}
      >
        Company QR (session)
      </button>
      <button
        disabled={saving}
        onClick={() => setMode("personal_qr")}
        className={`px-3 py-1.5 rounded-lg text-sm border ${
          currentMode === "personal_qr"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-700"
        }`}
      >
        Personal QR per staff
      </button>
    </div>
  );
}
