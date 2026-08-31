"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SelfieCapture({
  required,
  onCaptured,
}: {
  required: boolean;
  onCaptured: (url: string | null) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
    });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setStreaming(true);
  }

  function stopCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    setStreaming(false);
  }

  async function capture() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    stopCamera();

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob) return;

    setUploading(true);
    const supabase = createClient();
    const fileName = `selfies/${crypto.randomUUID()}.jpg`;

    const { error } = await supabase.storage
      .from("attendance-selfies")
      .upload(fileName, blob, { contentType: "image/jpeg" });

    setUploading(false);

    if (error) {
      console.error("Selfie upload failed", error);
      onCaptured(null);
      return;
    }

    const { data } = supabase.storage
      .from("attendance-selfies")
      .getPublicUrl(fileName);

    setPreviewUrl(data.publicUrl);
    onCaptured(data.publicUrl);
  }

  function retake() {
    setPreviewUrl(null);
    onCaptured(null);
    startCamera();
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm text-gray-600">
        {required ? "Selfie required" : "Selfie (recommended)"}
      </p>

      {previewUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Captured selfie"
            className="w-40 h-40 object-cover rounded-full border"
          />
          <button
            onClick={retake}
            className="text-sm underline text-gray-500"
            type="button"
          >
            Retake
          </button>
        </>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-40 h-40 object-cover rounded-full border bg-gray-100"
            muted
            playsInline
          />
          <canvas ref={canvasRef} className="hidden" />

          {!streaming ? (
            <button
              onClick={startCamera}
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm"
            >
              Open camera
            </button>
          ) : (
            <button
              onClick={capture}
              type="button"
              disabled={uploading}
              className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Capture"}
            </button>
          )}

          {!required && !streaming && (
            <button
              onClick={() => onCaptured(null)}
              type="button"
              className="text-xs underline text-gray-400"
            >
              Skip selfie
            </button>
          )}
        </>
      )}
    </div>
  );
}
