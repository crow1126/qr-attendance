import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Staff tap the confirmation link in their email, which lands here with a
// `code` query param. We exchange it for a real session (sets cookies),
// then send them on to wherever they were headed (e.g. /scan/[orgId]).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=Could not complete login, please try again`
  );
}