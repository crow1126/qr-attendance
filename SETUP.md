# Setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` in the Supabase SQL editor.
3. Create a public Storage bucket named `attendance-selfies`.
4. Add yourself as an org admin manually for now (until an onboarding flow exists):
   - Insert a row into `organizations`.
   - Insert a row into `org_admins` linking your `auth.users` id to that org.
   - Insert `staff` rows for your team (leave `auth_user_id` null until they log in for session mode; `personal_qr_token` auto-generates).
5. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL/keys.
6. `npm run dev` and visit `/admin` (log in first at `/login`).

## Flows
- Option A (session): admin toggles mode to "session", staff visit `/login` once, then scanning the entrance QR (`/api/org/qr?orgId=...`) at `/scan/[orgId]` auto-identifies them.
- Option B (personal QR): admin toggles mode to "personal_qr", prints each staff's QR from the admin dashboard, staff scan it to land on `/clock/[token]` — no login needed.

## Not yet built
- Org/admin self-signup flow (currently manual SQL insert)
- Staff bulk import
- CSV/report export
- Rotating QR anti-screenshot mode
