"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({
  next,
  role = "staff",
  heading,
  subtext,
  orgName,
  orgLogoUrl,
}: {
  next: string;
  role?: "admin" | "staff";
  heading: string;
  subtext: string;
  orgName?: string | null;
  orgLogoUrl?: string | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setError(
        error.message === "Invalid login credentials"
          ? "Invalid email or password. Please verify the credentials issued by your administrator."
          : error.message
      );
    } else if (data.session) {
      router.push(next);
      router.refresh();
    }
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    setLoading(false);
    if (error) setError(error.message);
    else setMagicLinkSent(true);
  }

  const isAdmin = role === "admin";

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Navigation back to home */}
        <Link href="/" className="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Home
        </Link>

        <div className={`login-card ${isAdmin ? "card-admin" : "card-staff"}`}>
          {/* Header Badge */}
          <div className="portal-badge">
            {isAdmin ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="badge-icon">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Company Administrator Portal</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="badge-icon">
                  <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Staff Member Portal</span>
              </>
            )}
          </div>

          {/* Org Logo & Name if known */}
          {orgLogoUrl && (
            <div className="org-header">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={orgLogoUrl}
                alt={orgName ? `${orgName} logo` : "Company logo"}
                className="org-logo"
              />
              {orgName && (
                <p className="org-text">
                  Logging into <span className="font-semibold text-white">{orgName}</span>
                </p>
              )}
            </div>
          )}

          <h1 className="login-heading">{heading}</h1>
          <p className="login-subtext">{subtext}</p>

          {/* Special notice for staff */}
          {!isAdmin && !useMagicLink && (
            <div className="staff-notice">
              <div className="notice-icon">🔐</div>
              <div className="notice-text">
                <span className="font-semibold block text-indigo-200">Admin-Issued Login</span>
                Enter the email and password provided to you by your workplace administrator.
              </div>
            </div>
          )}

          {!useMagicLink ? (
            /* ── Username/Email + Password Form ── */
            <form onSubmit={handlePasswordLogin} className="login-form">
              <div className="flex flex-col gap-1.5">
                <label className="input-label">
                  {isAdmin ? "Admin Email Address" : "Staff Email / Username"}
                </label>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="input-icon">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    type="email"
                    required
                    placeholder={isAdmin ? "admin@company.com" : "jane@company.com"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="input-label">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-purple-300 hover:text-white"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="input-icon">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email || !password}
                className={`login-submit-btn ${isAdmin ? "btn-admin" : "btn-staff"}`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" /> Signing in...
                  </span>
                ) : (
                  <span>Sign In →</span>
                )}
              </button>
            </form>
          ) : !magicLinkSent ? (
            /* ── Magic Link Alternative Form ── */
            <form onSubmit={sendMagicLink} className="login-form">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="input-icon">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="login-input"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className={`login-submit-btn ${isAdmin ? "btn-admin" : "btn-staff"}`}
              >
                {loading ? "Sending..." : "Send Email Login Link →"}
              </button>
            </form>
          ) : (
            <div className="success-box">
              <div className="success-check">✓</div>
              <h3 className="text-base font-semibold text-white">Login link sent!</h3>
              <p className="text-sm text-purple-200">
                Check your email at <span className="font-medium text-white">{email}</span>.
              </p>
            </div>
          )}

          {/* Toggle between password and magic link */}
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => {
                setUseMagicLink(!useMagicLink);
                setError(null);
              }}
              className="text-xs text-purple-300/80 hover:text-white underline"
            >
              {useMagicLink
                ? "← Sign in with Password"
                : "Trouble with password? Sign in with Email link"}
            </button>
          </div>

          {error && (
            <div className="error-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}


          {/* Quick Helper footer within card */}
          <div className="card-footer">
            {isAdmin ? (
              <p className="footer-switch">
                Looking for staff clock-in?{" "}
                <Link href="/login" className="switch-link">
                  Staff Login Portal
                </Link>
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="footer-switch">
                  Received an invite link on WhatsApp or SMS? Just tap that link directly on this phone!
                </p>
                <p className="footer-switch pt-1 border-t border-purple-900/40">
                  Are you a manager or company administrator?{" "}
                  <Link href="/admin/login" className="switch-link">
                    Admin Portal
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, #2e1065 0%, transparent 70%),
            linear-gradient(180deg, #0f0a2a 0%, #060312 100%);
          font-family: 'Inter', system-ui, sans-serif;
          color: #f8f6ff;
        }

        .login-container {
          width: 100%;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(248, 246, 255, 0.6);
          text-decoration: none;
          transition: color 0.15s;
          width: fit-content;
        }
        .back-link:hover {
          color: #c4b5fd;
        }

        .login-card {
          background: rgba(26, 16, 64, 0.7);
          border-radius: 1.25rem;
          padding: 2rem 1.75rem;
          backdrop-filter: blur(16px);
          position: relative;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
        }

        .card-admin {
          border: 1px solid rgba(139, 92, 246, 0.35);
          background: linear-gradient(180deg, rgba(30, 20, 75, 0.85) 0%, rgba(17, 10, 48, 0.9) 100%);
        }

        .card-staff {
          border: 1px solid rgba(99, 102, 241, 0.35);
          background: linear-gradient(180deg, rgba(24, 20, 68, 0.85) 0%, rgba(13, 10, 42, 0.9) 100%);
        }

        .portal-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(124, 58, 237, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.35);
          border-radius: 999px;
          padding: 0.3rem 0.85rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #c4b5fd;
          margin-bottom: 1.25rem;
        }

        .badge-icon {
          width: 0.9rem;
          height: 0.9rem;
        }

        .org-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .org-logo {
          width: 4rem;
          height: 4rem;
          border-radius: 0.75rem;
          object-fit: cover;
          border: 2px solid rgba(139, 92, 246, 0.4);
        }

        .org-text {
          font-size: 0.85rem;
          color: rgba(248, 246, 255, 0.7);
        }

        .login-heading {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #ffffff;
          margin: 0 0 0.4rem;
        }

        .login-subtext {
          font-size: 0.88rem;
          color: rgba(248, 246, 255, 0.65);
          line-height: 1.5;
          margin: 0 0 1.5rem;
        }

        .staff-notice {
          display: flex;
          gap: 0.75rem;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 0.85rem;
          padding: 0.85rem 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.8rem;
          color: rgba(248, 246, 255, 0.8);
          line-height: 1.45;
        }

        .notice-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: rgba(248, 246, 255, 0.75);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.9rem;
          width: 1.1rem;
          height: 1.1rem;
          color: rgba(248, 246, 255, 0.4);
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          background: rgba(10, 6, 25, 0.65);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 0.75rem;
          padding: 0.8rem 1rem 0.8rem 2.6rem;
          color: #ffffff;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .login-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25);
        }

        .login-input::placeholder {
          color: rgba(248, 246, 255, 0.3);
        }

        .login-submit-btn {
          width: 100%;
          padding: 0.85rem;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 0.95rem;
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 0.5rem;
        }

        .login-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-submit-btn:not(:disabled):hover {
          transform: translateY(-1px);
        }

        .btn-admin {
          background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.35);
        }

        .btn-admin:not(:disabled):hover {
          box-shadow: 0 6px 25px rgba(124, 58, 237, 0.5);
        }

        .btn-staff {
          background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
        }

        .btn-staff:not(:disabled):hover {
          box-shadow: 0 6px 25px rgba(99, 102, 241, 0.5);
        }

        .success-box {
          background: rgba(88, 28, 135, 0.35);
          border: 1px solid rgba(167, 139, 250, 0.4);
          border-radius: 0.85rem;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          text-align: center;
          align-items: center;
        }

        .success-check {
          width: 2rem;
          height: 2rem;
          background: #10b981;
          color: white;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          font-size: 0.82rem;
          padding: 0.75rem 1rem;
          border-radius: 0.65rem;
          margin-top: 1rem;
        }

        .card-footer {
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          text-align: center;
        }

        .footer-switch {
          font-size: 0.8rem;
          color: rgba(248, 246, 255, 0.55);
          line-height: 1.45;
          margin: 0;
        }

        .switch-link {
          color: #a78bfa;
          font-weight: 600;
          text-decoration: none;
        }

        .switch-link:hover {
          color: #c4b5fd;
          text-decoration: underline;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}