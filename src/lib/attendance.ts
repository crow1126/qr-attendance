export type AttendanceEvent = { type: "in" | "out"; occurred_at: string };
export type DayRow = { date: string; inTime: string | null; outTime: string | null };

// Groups raw in/out events into one row per calendar day (first "in",
// last "out"), newest first.
export function buildDailyRows(records: AttendanceEvent[]): DayRow[] {
  const map = new Map<string, DayRow>();

  for (const r of records) {
    const date = r.occurred_at.slice(0, 10);
    const existing = map.get(date) ?? { date, inTime: null, outTime: null };
    if (r.type === "in" && !existing.inTime) existing.inTime = r.occurred_at;
    if (r.type === "out") existing.outTime = r.occurred_at;
    map.set(date, existing);
  }

  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

// Consecutive-day streak counting back from today. If today has no clock-in
// yet, that alone doesn't break the streak - we just start counting from
// yesterday instead. Note: this treats every calendar day as a working
// day (no weekend/holiday awareness yet).
export function computeStreak(rows: DayRow[]): number {
  const datesWithIn = new Set(rows.filter((r) => r.inTime).map((r) => r.date));

  let streak = 0;
  const cursor = new Date();

  if (!datesWithIn.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (datesWithIn.has(toISODate(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function formatDuration(inTime: string, outTime: string | null) {
  if (!outTime) return "-";
  const ms = new Date(outTime).getTime() - new Date(inTime).getTime();
  if (ms <= 0) return "-";
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}