import Link from "next/link";

/* ─── Inline SVG icons ──────────────────────────────────────────── */
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="card-svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="card-svg">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="arrow-svg">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="feat-svg">
    <rect x="5" y="2" width="14" height="20" rx="2" />
    <circle cx="12" cy="17" r="1" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="feat-svg">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="feat-svg">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="feat-svg">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);
const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="feat-svg">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);
const ToggleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="feat-svg">
    <rect x="1" y="5" width="22" height="14" rx="7" />
    <circle cx="16" cy="12" r="3" fill="currentColor" stroke="none" />
  </svg>
);
const QrIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28,opacity:0.6}}>
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="3" height="3" rx="0.5"/><rect x="18" y="18" width="3" height="3" rx="0.5"/>
    <rect x="14" y="18" width="3" height="3" rx="0.5"/><rect x="18" y="14" width="3" height="3" rx="0.5"/>
    <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none"/><rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none"/>
  </svg>
);

const FEATURES = [
  { Icon: PhoneIcon,  title: "Mobile-first scanning",   body: "Works on any smartphone camera — iOS and Android. No app download needed." },
  { Icon: LockIcon,   title: "Magic-link login",         body: "Staff log in once via a secure email link. No passwords to forget or reset." },
  { Icon: MapPinIcon, title: "Optional geofencing",      body: "Restrict clock-ins to a set radius around your premises to prevent remote check-ins." },
  { Icon: CameraIcon, title: "Selfie verification",      body: "Enable selfie capture at clock-in for an extra layer of identity confirmation." },
  { Icon: ChartIcon,  title: "Attendance reports",       body: "View per-staff records with timestamps, methods, and any flagged anomalies." },
  { Icon: ToggleIcon, title: "Two clock-in modes",       body: "One shared entrance QR for all staff, or individual personal QR codes — your choice." },
];

export default function Home() {
  return (
    <main className="landing-root">
      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge">
          <QrIcon />
          <span>Attendance made effortless</span>
        </div>

        <h1 className="hero-title">
          Smart QR&nbsp;
          <span className="hero-gradient-text">Attendance</span>
          <br />
          Tracking
        </h1>

        <p className="hero-sub">
          Admins create staff accounts in seconds. Staff clock&nbsp;in and
          out&nbsp;by scanning a&nbsp;QR&nbsp;code — no&nbsp;app to&nbsp;install,
          no&nbsp;PIN to&nbsp;remember.
        </p>

        {/* ─── Login Choice Cards ─── */}
        <div className="login-cards">
          <Link href="/admin/login" className="login-card login-card--admin">
            <ShieldIcon />
            <span className="card-label">I&apos;m an Admin</span>
            <span className="card-desc">
              Manage staff, view reports &amp; configure settings
            </span>
            <ArrowIcon />
          </Link>

          <Link href="/login" className="login-card login-card--staff">
            <UserIcon />
            <span className="card-label">I&apos;m Staff</span>
            <span className="card-desc">
              Log in once — after that, just scan your workplace QR
            </span>
            <ArrowIcon />
          </Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────── */}
      <section className="how-section">
        <h2 className="section-title">How it works</h2>

        <div className="steps">
          <div className="step">
            <div className="step-number">01</div>
            <h3 className="step-heading">Admin sets up</h3>
            <p className="step-body">
              Sign in, create your organization, add your team members with
              their names and email addresses.
            </p>
          </div>

          <div className="step-divider" aria-hidden="true" />

          <div className="step">
            <div className="step-number">02</div>
            <h3 className="step-heading">Staff log in once</h3>
            <p className="step-body">
              Each staff member visits the Staff login page and enters their
              email to receive a magic link — one tap and they&apos;re linked.
            </p>
          </div>

          <div className="step-divider" aria-hidden="true" />

          <div className="step">
            <div className="step-number">03</div>
            <h3 className="step-heading">Scan &amp; go</h3>
            <p className="step-body">
              Staff scan the entrance QR (or their personal QR) to clock in
              or out. Location &amp; selfie checks are optional.
            </p>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────── */}
      <section className="features-section">
        <h2 className="section-title">Everything you need</h2>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <f.Icon />
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────── */}
      <section className="cta-section">
        <h2 className="cta-title">Ready to get started?</h2>
        <p className="cta-sub">
          Create your organization in under a minute — no credit card required.
        </p>
        <Link href="/admin/login" className="cta-btn">
          Get started as Admin
        </Link>
      </section>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="footer-coreva">
            Built by{" "}
            <a href="https://apextrackgh.com" target="_blank" rel="noopener noreferrer" className="footer-apex-link">
              Coreva Ltd
            </a>
          </span>
          <span className="footer-divider">·</span>
          <span className="footer-product">
            First product:{" "}
            <a href="https://apextrackgh.com" target="_blank" rel="noopener noreferrer" className="footer-apex-link footer-apex-highlight">
              ApexTrack GH
            </a>
          </span>
        </div>
        <div className="footer-links">
          <Link href="/admin/login">Admin login</Link>
          <Link href="/login">Staff login</Link>
        </div>
      </footer>

      {/* ─── STYLES ───────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .landing-root {
          font-family: 'Inter', system-ui, sans-serif;
          min-height: 100vh;
          background: #f8f6ff;
          color: #1a1040;
          overflow-x: hidden;
        }

        /* ── SVG icon sizing ── */
        .card-svg  { width: 2rem; height: 2rem; color: rgba(255,255,255,0.9); margin-bottom: 0.25rem; flex-shrink: 0; }
        .arrow-svg { width: 1.1rem; height: 1.1rem; color: rgba(255,255,255,0.55); margin-top: 0.5rem; transition: transform 0.18s ease, color 0.18s ease; }
        .feat-svg  { width: 1.9rem; height: 1.9rem; color: #a78bfa; margin-bottom: 0.75rem; display: block; }

        /* ── HERO ── */
        .hero {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 3rem 1.25rem 4rem;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, #e8e0ff 0%, transparent 70%),
            linear-gradient(180deg, #f8f6ff 0%, #1a1040 100%);
          position: relative;
        }

        .hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237c3aed' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
          pointer-events: none;
        }

        .hero > * { position: relative; z-index: 1; }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(124, 58, 237, 0.15);
          color: #a78bfa;
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: 999px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 0.35rem 1rem 0.35rem 0.6rem;
          margin-bottom: 1.75rem;
        }

        .hero-title {
          font-size: clamp(2.6rem, 9vw, 5.5rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.03em;
          color: #f8f6ff;
          margin: 0 0 1.25rem;
          text-shadow: 0 2px 40px rgba(124,58,237,0.25);
        }

        .hero-gradient-text {
          background: linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-sub {
          font-size: clamp(1rem, 3vw, 1.2rem);
          color: rgba(248,246,255,0.72);
          max-width: 38rem;
          line-height: 1.65;
          margin: 0 0 2.75rem;
        }

        .login-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          width: 100%;
          max-width: 38rem;
        }

        @media (max-width: 500px) {
          .login-cards { grid-template-columns: 1fr; }
        }

        .login-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.3rem;
          padding: 1.4rem 1.25rem;
          border-radius: 1.1rem;
          text-decoration: none;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          position: relative;
          overflow: hidden;
        }

        .login-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          border: 1px solid rgba(255,255,255,0.18);
          pointer-events: none;
        }

        .login-card:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 20px 50px rgba(0,0,0,0.25); }
        .login-card:hover .arrow-svg { transform: translateX(4px); color: #fff; }

        .login-card--admin {
          background: linear-gradient(135deg, rgba(109,40,217,0.9), rgba(79,70,229,0.85));
          backdrop-filter: blur(12px);
        }

        .login-card--staff {
          background: linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.07));
          backdrop-filter: blur(12px);
        }

        .card-label { font-size: 1rem; font-weight: 700; color: #fff; letter-spacing: -0.01em; }
        .card-desc  { font-size: 0.8rem; color: rgba(255,255,255,0.68); line-height: 1.4; text-align: left; }

        /* ── HOW IT WORKS ── */
        .how-section { background: #1a1040; padding: 5rem 1.25rem; text-align: center; }

        .section-title {
          font-size: clamp(1.6rem, 5vw, 2.4rem);
          font-weight: 800;
          color: #f8f6ff;
          margin: 0 0 3rem;
          letter-spacing: -0.02em;
        }

        .steps {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          max-width: 56rem;
          margin: 0 auto;
          flex-wrap: wrap;
        }

        .step { flex: 1 1 200px; min-width: 180px; max-width: 260px; padding: 0 1.5rem; text-align: left; }

        .step-number {
          font-size: 2.4rem;
          font-weight: 900;
          background: linear-gradient(135deg, #a78bfa, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          margin-bottom: 0.75rem;
        }

        .step-heading { font-size: 1.05rem; font-weight: 700; color: #f8f6ff; margin: 0 0 0.5rem; }
        .step-body    { font-size: 0.88rem; color: rgba(248,246,255,0.58); line-height: 1.6; margin: 0; }

        .step-divider {
          width: 2px;
          height: 6rem;
          background: linear-gradient(to bottom, transparent, rgba(124,58,237,0.4), transparent);
          align-self: center;
          flex-shrink: 0;
        }

        @media (max-width: 600px) {
          .step-divider { display: none; }
          .step { text-align: center; margin-bottom: 2.5rem; max-width: 100%; padding: 0 0.5rem; }
        }

        /* ── FEATURES ── */
        .features-section {
          background: linear-gradient(180deg, #1a1040 0%, #0f0a2e 100%);
          padding: 5rem 1.25rem;
          text-align: center;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.25rem;
          max-width: 56rem;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(124,58,237,0.2);
          border-radius: 1.1rem;
          padding: 1.75rem 1.5rem;
          text-align: left;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }

        .feature-card:hover {
          border-color: rgba(124,58,237,0.5);
          background: rgba(124,58,237,0.08);
          transform: translateY(-2px);
        }

        .feature-title { font-size: 0.95rem; font-weight: 700; color: #f8f6ff; margin: 0 0 0.4rem; }
        .feature-body  { font-size: 0.83rem; color: rgba(248,246,255,0.55); line-height: 1.55; margin: 0; }

        /* ── CTA ── */
        .cta-section {
          background: linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%);
          padding: 5rem 1.25rem;
          text-align: center;
        }

        .cta-title { font-size: clamp(1.8rem, 5vw, 2.8rem); font-weight: 900; color: #fff; margin: 0 0 0.75rem; letter-spacing: -0.025em; }
        .cta-sub   { font-size: 1.05rem; color: rgba(255,255,255,0.75); margin: 0 0 2.25rem; }

        .cta-btn {
          display: inline-block;
          background: #fff;
          color: #6d28d9;
          font-weight: 700;
          font-size: 1rem;
          padding: 0.9rem 2.25rem;
          border-radius: 999px;
          text-decoration: none;
          transition: box-shadow 0.2s, transform 0.2s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }

        /* ── FOOTER ── */
        .landing-footer {
          background: #0a0620;
          color: rgba(248,246,255,0.4);
          font-size: 0.82rem;
          padding: 1.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }

        .footer-coreva  { color: rgba(248,246,255,0.5); }
        .footer-divider { color: rgba(248,246,255,0.25); }
        .footer-product { color: rgba(248,246,255,0.5); }

        .footer-apex-link {
          color: #a78bfa;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.15s;
        }

        .footer-apex-link:hover { color: #c4b5fd; }

        .footer-apex-highlight {
          background: linear-gradient(90deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .footer-links { display: flex; gap: 1.5rem; }
        .footer-links a { color: rgba(248,246,255,0.45); text-decoration: none; transition: color 0.15s; }
        .footer-links a:hover { color: #a78bfa; }
      `}</style>
    </main>
  );
}
