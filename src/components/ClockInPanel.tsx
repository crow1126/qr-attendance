"use client";

import { useState } from "react";
import SelfieCapture from "@/components/SelfieCapture";
import { getDeviceId } from "@/lib/device";

type Props = {
  method: "session" | "personal_qr";
  token?: string; // required when method === "personal_qr"
  requireSelfie: boolean;
  staffName?: string;
  orgLogoUrl?: string | null;
  orgName?: string;
};

export default function ClockInPanel({
  method,
  token,
  requireSelfie,
  staffName,
  orgLogoUrl,
  orgName,
}: Props) {
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<
    { ok: true; type: "in" | "out"; flagged: boolean; flagReason?: string | null }
    | { ok: false; message: string }
    | null
  >(null);

  async function getPosition(): Promise<GeolocationPosition | null> {
    if (!navigator.geolocation) return null;
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos),
        () => resolve(null),
        { timeout: 8000 }
      );
    });
  }

  async function submit(type: "in" | "out") {
    if (requireSelfie && !selfieUrl) {
      setResult({ ok: false, message: "Please take a selfie first." });
      return;
    }

    setSubmitting(true);
    setResult(null);

    const pos = await getPosition();
    const deviceId = getDeviceId();

    const endpoint =
      method === "session" ? "/api/clock/session" : "/api/clock/personal";

    const payload: Record<string, unknown> = {
      type,
      lat: pos?.coords.latitude,
      lng: pos?.coords.longitude,
      selfieUrl,
      deviceId,
    };
    if (method === "personal_qr") payload.token = token;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? "Something went wrong." });
      } else {
        setResult({
          ok: true,
          type,
          flagged: data.record.flagged,
          flagReason: data.record.flag_reason,
        });
      }
    } catch {
      setResult({ ok: false, message: "Network error - try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6 max-w-sm mx-auto">
      {orgLogoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={orgLogoUrl}
          alt={orgName ? `${orgName} logo` : "Company logo"}
          className="w-16 h-16 rounded-lg object-cover"
        />
      )}
      {staffName && (
        <p className="text-lg font-medium">Welcome, {staffName}</p>
      )}

      <SelfieCapture required={requireSelfie} onCaptured={setSelfieUrl} />

      <div className="flex gap-4 w-full">
        <button
          onClick={() => submit("in")}
          disabled={submitting}
          className="flex-1 py-3 rounded-lg bg-green-600 text-white font-medium disabled:opacity-50"
        >
          Clock In
        </button>
        <button
          onClick={() => submit("out")}
          disabled={submitting}
          className="flex-1 py-3 rounded-lg bg-red-600 text-white font-medium disabled:opacity-50"
        >
          Clock Out
        </button>
      </div>

      {result && (
        <div
          className={`text-sm text-center ${
            result.ok
              ? result.flagged
                ? "text-amber-600"
                : "text-green-700"
              : "text-red-600"
          }`}
        >
          {result.ok
            ? result.flagged
              ? `Recorded, but flagged: ${result.flagReason}`
              : `Clocked ${result.type} successfully.`
            : result.message}
        </div>
      )}

      <a
        href={method === "session" ? "/me" : `/me/${token}`}
        className="text-sm underline text-gray-500"
      >
        View my attendance & streak
      </a>
    </div>
  );
}