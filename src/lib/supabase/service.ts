import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. Never import this from a Client Component or expose the key.
// Used by the personal-QR clock-in route: staff using Option B aren't
// authenticated via Supabase Auth, so we validate their token ourselves
// and then write with the service role, bypassing RLS.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
