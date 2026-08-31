import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { distanceMeters } from "@/lib/geo";

// Option B: staff scans/shows their own personal QR (encodes a unique token).
// No login required - the token itself is the identifier. Because there's
// no Supabase Auth session here, this route uses the service role client
// (server-only) after validating the token against the staff table.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, type, lat, lng, selfieUrl, deviceId } = body as {
    token: string;
    type: "in" | "out";
    lat?: number;
    lng?: number;
    selfieUrl?: string;
    deviceId?: string;
  };

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }
  if (type !== "in" && type !== "out") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: staffRow, error: staffErr } = await supabase
    .from("staff")
    .select("id, org_id, active, bound_device_id")
    .eq("personal_qr_token", token)
    .single();

  if (staffErr || !staffRow) {
    return NextResponse.json({ error: "Invalid or unrecognized QR code" }, { status: 404 });
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
      method: "personal_qr",
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
