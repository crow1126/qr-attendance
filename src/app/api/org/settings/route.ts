import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Admin-only (enforced by RLS "org admins can update their org" policy).
export async function PATCH(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await req.json();
  const { orgId, mode, requireSelfie, geofenceLat, geofenceLng, geofenceRadiusM } =
    body as {
      orgId: string;
      mode?: "session" | "personal_qr";
      requireSelfie?: boolean;
      geofenceLat?: number | null;
      geofenceLng?: number | null;
      geofenceRadiusM?: number;
    };

  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};
  if (mode) update.mode = mode;
  if (requireSelfie !== undefined) update.require_selfie = requireSelfie;
  if (geofenceLat !== undefined) update.geofence_lat = geofenceLat;
  if (geofenceLng !== undefined) update.geofence_lng = geofenceLng;
  if (geofenceRadiusM !== undefined) update.geofence_radius_m = geofenceRadiusM;

  const { data, error } = await supabase
    .from("organizations")
    .update(update)
    .eq("id", orgId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ org: data });
}
