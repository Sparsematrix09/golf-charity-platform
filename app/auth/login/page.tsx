'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
 const router = useRouter();
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleLogin = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');
 const supabase = createClient();
 const { error } = await supabase.auth.signInWithPassword({ email, password });
 if (error) {
 setError(error.message);
 setLoading(false);
 } else {
 router.push('/dashboard');
 router.refresh();
 }
 };

 return (
 <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--clr-bg)' }}>
 {/* Left panel */}
 <div style={{
 flex: 1, display: 'none', background: 'linear-gradient(145deg, var(--clr-primary-dark), var(--clr-bg-2))',
 alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
 }} className="auth-left">
 <div className="orb orb-green" style={{ width: 500, height: 500, top: '-20%', left: '-10%' }} />
 <div className="orb orb-gold" style={{ width: 300, height: 300, bottom: 0, right: '-10%', animationDelay: '2s' }} />
 <div style={{ position: 'relative', textAlign: 'center', padding: 40 }}>
 <div style={{ fontSize: '5rem', marginBottom: 24 }}></div>
 <h2 className="display-2" style={{ marginBottom: 16 }}>Play. Win.<br />Give Back.</h2>
 <p className="body-lg text-muted" style={{ maxWidth: 340, margin: '0 auto' }}>
 Your golf game has the power to change lives. Log in and make every score count.
 </p>
 <div style={{ marginTop: 48, display: 'flex', gap: 32, justifyContent: 'center' }}>
 <div className="hero-stat">
 <div className="hero-stat-number">£4,200</div>
 <div className="hero-stat-label">Current Jackpot</div>
 </div>
 <div className="hero-stat">
 <div className="hero-stat-number">18</div>
 <div className="hero-stat-label">Charities Supported</div>
 </div>
 </div>
 </div>
 </div>

 {/* Right panel — form */}
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
 <div style={{ width: '100%', maxWidth: 420 }}>
 <Link href="/" className="nav-logo" style={{ marginBottom: 48, display: 'inline-flex' }}>
 <div className="nav-logo-icon"></div>
 <span>GolfGives</span>
 </Link>

 <div style={{ marginBottom: 32 }}>
 <h1 className="heading-1" style={{ marginBottom: 8 }}>Welcome back</h1>
 <p className="body-md text-muted">Sign in to your account</p>
 </div>

 <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
 <div className="form-group">
 <label className="form-label" htmlFor="login-email">Email address</label>
 <input
 id="login-email"
 type="email"
 className={`form-input${error ? ' error' : ''}`}
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="you@example.com"
 required
 autoComplete="email"
 />
 </div>

 <div className="form-group">
 <div className="flex-between">
 <label className="form-label" htmlFor="login-password">Password</label>
 <Link href="/auth/reset-password" style={{ fontSize: '0.8rem', color: 'var(--clr-primary-light)' }}>
 Forgot password?
 </Link>
 </div>
 <input
 id="login-password"
 type="password"
 className={`form-input${error ? ' error' : ''}`}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
 required
 autoComplete="current-password"
 />
 {error && <p className="form-error" role="alert">{error}</p>}
 </div>

 <button
 id="login-submit-btn"
 type="submit"
 className="btn btn-primary btn-full btn-lg"
 disabled={loading}
 style={{ marginTop: 8 }}
>
 {loading ? <><span className="spinner" /> Signing in...</> : 'Sign In'}
 </button>
 </form>

 <div className="divider" style={{ margin: '28px 0' }} />

 <p className="body-sm text-muted text-center">
 Don&apos;t have an account?{' '}
 <Link href="/auth/signup" style={{ color: 'var(--clr-primary-light)', fontWeight: 600 }}>
 Sign up free
 </Link>
 </p>

 <p className="body-sm text-muted text-center" style={{ marginTop: 12 }}>
 Want to subscribe directly?{' '}
 <Link href="/subscribe" style={{ color: 'var(--clr-gold)', fontWeight: 600 }}>
 Choose a plan →
 </Link>
 </p>
 </div>
 </div>

 <style>{`
 @media (min-width: 900px) {
 .auth-left { display: flex !important; }
 }
 `}</style>
 </div>
 );
}
