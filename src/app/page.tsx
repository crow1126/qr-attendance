export default function Home() {
  return (
    <main className="max-w-md mx-auto p-8 flex flex-col gap-4 text-center">
      <h1 className="text-2xl font-semibold">QR Attendance</h1>
      <p className="text-gray-500 text-sm">
        Scan your workplace&apos;s QR code to clock in or out. Admins can
        manage staff and settings at{" "}
        <a href="/admin" className="underline">
          /admin
        </a>
        .
      </p>
    </main>
  );
}
