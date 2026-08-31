import { createServiceClient } from "@/lib/supabase/service";
import LoginForm from "@/components/LoginForm";

// Staff login. If `next` points at /scan/<orgId> (the company-QR flow),
// we already know which org this is - so we show that org's logo/name
// right on the login screen, letting staff confirm they're logging into
// the right workplace before they type their email.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = next ?? "/";

  const orgIdMatch = nextPath.match(
    /^\/scan\/([0-9a-fA-F-]{36})/
  );

  let orgName: string | null = null;
  let orgLogoUrl: string | null = null;

  if (orgIdMatch) {
    const service = createServiceClient();
    const { data: org } = await service
      .from("organizations")
      .select("name, logo_url")
      .eq("id", orgIdMatch[1])
      .single();

    orgName = org?.name ?? null;
    orgLogoUrl = org?.logo_url ?? null;
  }

  return (
    <LoginForm
      next={nextPath}
      role="staff"
      heading="Staff Sign In"
      subtext="Access your workplace attendance portal and clock-in history."
      orgName={orgName}
      orgLogoUrl={orgLogoUrl}
    />
  );
}