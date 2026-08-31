import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";

// Returns a PNG of a staff member's personal QR (Option B).
// Only callable by an org admin (RLS on `staff` enforces this).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const staffId = searchParams.get("staffId");

  if (!staffId) {
    return NextResponse.json({ error: "Missing staffId" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: staffRow, error } = await supabase
    .from("staff")
    .select("id, personal_qr_token")
    .eq("id", staffId)
    .single();

  if (error || !staffRow) {
    return NextResponse.json({ error: "Staff not found" }, { status: 404 });
  }

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/clock/${staffRow.personal_qr_token}`;
  const pngBuffer = await QRCode.toBuffer(url, { width: 512, margin: 2 });

  return new NextResponse(new Uint8Array(pngBuffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
