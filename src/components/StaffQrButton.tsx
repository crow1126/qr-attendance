"use client";

export default function StaffQrButton({ staffId }: { staffId: string }) {
  return (
    <a
      href={`/api/staff/qr?staffId=${staffId}`}
      target="_blank"
      rel="noreferrer"
      className="text-sm underline text-gray-600"
    >
      View / print QR
    </a>
  );
}
