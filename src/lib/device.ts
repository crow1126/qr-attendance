// Generates (or reuses) a stable per-device ID stored in localStorage.
// This is a lightweight fingerprint for device binding - not tamper-proof,
// but combined with GPS + selfie it raises the bar against buddy clock-ins.
export function getDeviceId(): string {
  const key = "qr-attendance-device-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
