"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm"
    >
      Print
    </button>
  );
}