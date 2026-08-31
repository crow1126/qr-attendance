"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({
  next,
  heading,
  subtext,
  orgName,
  orgLogoUrl,
}: {
  next: string;
  heading: string;
  subtext: string;
  orgName?: string | null;
  orgLogoUrl?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function sendMagicLink() {
    setLoading(true);
    setError(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);
    if (error) setError(error.message);
    else setLinkSent(true);
  }

  return (
    <div className="max-w-sm mx-auto p-6 flex flex-col gap-4">
      {orgLogoUrl && (
        <div className="flex flex-col items-center gap-2 mb-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={orgLogoUrl}
            alt={orgName ? `${orgName} logo` : "Company logo"}
            className="w-16 h-16 rounded-lg object-cover"
          />
          {orgName && (
            <p className="text-sm text-gray-500">
              Logging into <span className="font-medium">{orgName}</span>
            </p>
          )}
        </div>
      )}

      <h1 className="text-xl font-semibold">{heading}</h1>
      <p className="text-sm text-gray-500">{subtext}</p>

      {!linkSent ? (
        <>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
          <button
            onClick={sendMagicLink}
            disabled={loading || !email}
            className="bg-gray-800 text-white rounded-lg py-2 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send login link"}
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-700">
          Check your email on this device and tap the link to finish logging
          in. You can close this tab.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}