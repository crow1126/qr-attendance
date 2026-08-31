import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";

// DEV ONLY. Never reachable in production (guarded below).
// Lets you log in as any email instantly while building, without waiting
// on real email delivery or hitting Supabase's free-tier send rate limit.
// Visit: /api/dev/login?email=you@example.com&next=/admin
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const next = searchParams.get("next") ?? "/admin";

  if (!email) {
    return NextResponse.json({ error: "Missing ?email=" }, { status: 400 });
  }

  const service = createServiceClient();

  // generateLink creates/looks up the user and returns the OTP that would
  // have been emailed - without actually sending an email.
  const { data, error } = await service.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data?.properties?.email_otp) {
    return NextResponse.json(
      { error: error?.message ?? "Could not generate a login code" },
      { status: 500 }
    );
  }

  // Verify it right away using the cookie-aware client, which writes a
  // real session - same end state as clicking the email link.
  const supabase = await createClient();
  const { error: verifyErr } = await supabase.auth.verifyOtp({
    email,
    token: data.properties.email_otp,
    type: "email",
  });

  if (verifyErr) {
    return NextResponse.json({ error: verifyErr.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL(next, req.url));
}