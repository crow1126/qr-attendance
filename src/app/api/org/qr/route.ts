import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";

// Returns a PNG of the org's static entrance QR (Option A).
// Scanning it just opens /scan/[orgId] - identification happens via
// whatever Supabase Auth session is already on the phone.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: org, error } = await supabase
    .from("organizations")
    .select("id, mode")
    .eq("id", orgId)
    .single();

  if (error || !org) {
    return NextResponse.json({ error: "Org not found" }, { status: 404 });
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${org.id}`;
  const pngBuffer = await QRCode.toBuffer(url, { width: 512, margin: 2 });

  return new NextResponse(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
