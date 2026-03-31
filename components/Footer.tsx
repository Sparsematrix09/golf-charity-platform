import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--clr-bg-2)', borderTop: '1px solid var(--clr-border)', padding: '64px 0 32px' }}>
      <div className="container">
        <div className="grid-4" style={{ marginBottom: 48 }}>
          <div>
            <div className="nav-logo" style={{ marginBottom: 16 }}>
              <div className="nav-logo-icon">⛳</div>
              <span>GolfGives</span>
            </div>
            <p className="body-sm text-muted" style={{ maxWidth: 220 }}>
              Play your game. Win prizes. Fund the causes that matter most.
            </p>
          </div>

          <div>
            <p className="label text-faint" style={{ marginBottom: 16 }}>Platform</p>
            <div className="flex-col gap-sm">
              <Link href="/#how-it-works" className="body-sm text-muted" style={{ transition: 'color 0.2s' }}>How It Works</Link>
              <Link href="/#prizes" className="body-sm text-muted">Prize Draws</Link>
              <Link href="/charities" className="body-sm text-muted">Charities</Link>
              <Link href="/subscribe" className="body-sm text-muted">Pricing</Link>
            </div>
          </div>

          <div>
            <p className="label text-faint" style={{ marginBottom: 16 }}>Account</p>
            <div className="flex-col gap-sm">
              <Link href="/auth/signup" className="body-sm text-muted">Sign Up</Link>
              <Link href="/auth/login" className="body-sm text-muted">Sign In</Link>
              <Link href="/dashboard" className="body-sm text-muted">Dashboard</Link>
            </div>
          </div>

          <div>
            <p className="label text-faint" style={{ marginBottom: 16 }}>Legal</p>
            <div className="flex-col gap-sm">
              <span className="body-sm text-muted">Privacy Policy</span>
              <span className="body-sm text-muted">Terms of Service</span>
              <span className="body-sm text-muted">Cookie Policy</span>
            </div>
          </div>
        </div>

        <div className="divider" />
        <div className="flex-between" style={{ marginTop: 24, flexWrap: 'wrap', gap: 12 }}>
          <p className="body-sm text-faint">© 2026 GolfGives. All rights reserved.</p>
          <p className="body-sm text-faint">Made with ❤️ for charity</p>
        </div>
      </div>
    </footer>
  );
}
