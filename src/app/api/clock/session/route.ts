import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { distanceMeters } from "@/lib/geo";

// Option A: staff scans the single company QR, which lands them on a page
// that is already authenticated (or asks them to log in once). This route
// reads their session to identify them - no ID typed, no personal QR needed.
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json();
  const { type, lat, lng, selfieUrl, deviceId } = body as {
    type: "in" | "out";
    lat?: number;
    lng?: number;
    selfieUrl?: string;
    deviceId?: string;
  };

  if (type !== "in" && type !== "out") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const { data: staffRow, error: staffErr } = await supabase
    .from("staff")
    .select("id, org_id, active, bound_device_id")
    .eq("auth_user_id", user.id)
    .single();

  if (staffErr || !staffRow) {
    return NextResponse.json({ error: "Staff record not found" }, { status: 404 });
  }

  if (!staffRow.active) {
    return NextResponse.json({ error: "Staff account inactive" }, { status: 403 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("geofence_lat, geofence_lng, geofence_radius_m, require_selfie")
    .eq("id", staffRow.org_id)
    .single();

  let flagged = false;
  let flagReason: string | null = null;
  let distance: number | null = null;

  if (org?.geofence_lat != null && org?.geofence_lng != null) {
    if (lat == null || lng == null) {
      flagged = true;
      flagReason = "No location provided";
    } else {
      distance = distanceMeters(lat, lng, org.geofence_lat, org.geofence_lng);
      if (distance > (org.geofence_radius_m ?? 150)) {
        flagged = true;
        flagReason = `Outside geofence (${Math.round(distance)}m away)`;
      }
    }
  }

  if (org?.require_selfie && !selfieUrl) {
    flagged = true;
    flagReason = flagReason ? `${flagReason}; no selfie` : "No selfie provided";
  }

  if (
    staffRow.bound_device_id &&
    deviceId &&
    staffRow.bound_device_id !== deviceId
  ) {
    flagged = true;
    flagReason = flagReason
      ? `${flagReason}; unrecognized device`
      : "Unrecognized device";
  }

  const { data: record, error: insertErr } = await supabase
    .from("attendance_records")
    .insert({
      org_id: staffRow.org_id,
      staff_id: staffRow.id,
      type,
      method: "session",
      lat,
      lng,
      distance_m: distance,
      selfie_url: selfieUrl,
      device_id: deviceId,
      flagged,
      flag_reason: flagReason,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ record });
}
