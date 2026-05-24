import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome | Blue Mind Freediving',
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return (
    <>
<style>{`
        .welcome-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(0,0,0,0.22) !important;
        }
      `}</style>

      <main
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #0A4D68 0%, #00A9A5 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'var(--font-montserrat), system-ui, sans-serif',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '20px',
            padding: '3rem 2.5rem',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          }}
        >
          {/* Check circle */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <path
                d="M7 18L15 26L29 10"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Logo text */}
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '1rem',
            }}
          >
            Blue Mind Freediving
          </p>

          <h1
            style={{
              fontSize: 'clamp(1.6rem, 5vw, 2.1rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.2,
              marginBottom: '1rem',
              letterSpacing: '-0.5px',
            }}
          >
            Welcome to the community!
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.78)',
              lineHeight: 1.7,
              marginBottom: '2rem',
            }}
          >
            Your registration is complete. Our team will review your application
            within <strong style={{ color: 'white' }}>24 hours</strong> and get
            you set up.
          </p>

          <a
            href="https://app.bluemindfreediving.nl/pending-approval"
            className="welcome-btn"
            style={{
              display: 'inline-block',
              background: 'white',
              color: '#0A4D68',
              fontWeight: 800,
              fontSize: '0.95rem',
              padding: '0.9rem 2.25rem',
              borderRadius: '50px',
              textDecoration: 'none',
              letterSpacing: '-0.1px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            Go to your account →
          </a>

          <p
            style={{
              marginTop: '1.75rem',
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            Questions?{' '}
            <a
              href="mailto:info@bluemindfreediving.nl"
              style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'underline' }}
            >
              info@bluemindfreediving.nl
            </a>
          </p>
        </div>

        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.08em',
          }}
        >
          © Blue Mind Freediving · Amsterdam
        </p>
      </main>
    </>
  );
}
