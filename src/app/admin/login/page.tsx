import LoginForm from "@/components/LoginForm";

// Separate from staff login: no org is known yet pre-auth (an admin's org
// is looked up by their auth user id after they log in, not derivable
// from the URL the way the staff /scan/[orgId] flow is), so this page
// stays unbranded but clearly labeled as the admin entry point.
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <LoginForm
      next={next ?? "/admin"}
      role="admin"
      heading="Admin Workspace Login"
      subtext="Sign in to manage your organization's attendance, staff roster, and live reports."
    />
  );
}