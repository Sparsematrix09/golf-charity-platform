'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
 const router = useRouter();
 const [form, setForm] = useState({
 name: '',
 email: '',
 password: '',
 confirmPassword: '',
 });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState(false);

 const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

 const handleSignup = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 if (form.password !== form.confirmPassword) {
 setError('Passwords do not match');
 return;
 }
 if (form.password.length < 8) {
 setError('Password must be at least 8 characters');
 return;
 }
 setLoading(true);
 const supabase = createClient();
 const { error } = await supabase.auth.signUp({
 email: form.email,
 password: form.password,
 options: {
 data: { full_name: form.name },
 emailRedirectTo: `${window.location.origin}/auth/callback`,
 },
 });
 if (error) {
 setError(error.message);
 setLoading(false);
 } else {
 setSuccess(true);
 }
 };

 if (success) {
 return (
 <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)', padding: 24 }}>
 <div className="card" style={{ maxWidth: 440, width: '100%', textAlign: 'center', padding: 'var(--sp-2xl)' }}>
 <div style={{ fontSize: '3rem', marginBottom: 20 }}></div>
 <h2 className="heading-2" style={{ marginBottom: 12 }}>Check your inbox</h2>
 <p className="body-md text-muted" style={{ marginBottom: 24 }}>
 We sent a confirmation link to <strong>{form.email}</strong>. Click it to activate your account.
 </p>
 <Link href="/auth/login" className="btn btn-primary btn-full">
 Go to Login
 </Link>
 </div>
 </div>
 );
 }

 return (
 <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)', padding: '40px 24px' }}>
 <div style={{ width: '100%', maxWidth: 460 }}>
 <Link href="/" className="nav-logo" style={{ marginBottom: 48, display: 'inline-flex' }}>
 <div className="nav-logo-icon"></div>
 <span>GolfGives</span>
 </Link>

 <div style={{ marginBottom: 32 }}>
 <h1 className="heading-1" style={{ marginBottom: 8 }}>Create your account</h1>
 <p className="body-md text-muted">Start playing, winning, and giving today</p>
 </div>

 <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} noValidate>
 <div className="form-group">
 <label className="form-label" htmlFor="signup-name">Full name</label>
 <input
 id="signup-name"
 type="text"
 className="form-input"
 value={form.name}
 onChange={(e) => update('name', e.target.value)}
 placeholder="Your name"
 required
 autoComplete="name"
 />
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="signup-email">Email address</label>
 <input
 id="signup-email"
 type="email"
 className="form-input"
 value={form.email}
 onChange={(e) => update('email', e.target.value)}
 placeholder="you@example.com"
 required
 autoComplete="email"
 />
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="signup-password">Password</label>
 <input
 id="signup-password"
 type="password"
 className={`form-input${error && error.includes('Password') ? ' error' : ''}`}
 value={form.password}
 onChange={(e) => update('password', e.target.value)}
 placeholder="Min 8 characters"
 required
 autoComplete="new-password"
 />
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="signup-confirm">Confirm password</label>
 <input
 id="signup-confirm"
 type="password"
 className={`form-input${error && error.includes('match') ? ' error' : ''}`}
 value={form.confirmPassword}
 onChange={(e) => update('confirmPassword', e.target.value)}
 placeholder="Repeat password"
 required
 autoComplete="new-password"
 />
 {error && <p className="form-error" role="alert">{error}</p>}
 </div>

 <button
 id="signup-submit-btn"
 type="submit"
 className="btn btn-gold btn-full btn-lg"
 disabled={loading}
 style={{ marginTop: 8 }}
>
 {loading ? <><span className="spinner" /> Creating account...</> : 'Create Account'}
 </button>
 </form>

 <p className="body-sm text-muted text-center" style={{ marginTop: 24 }}>
 Already have an account?{' '}
 <Link href="/auth/login" style={{ color: 'var(--clr-primary-light)', fontWeight: 600 }}>
 Sign in
 </Link>
 </p>

 <p className="body-sm text-faint text-center" style={{ marginTop: 12, fontSize: '0.75rem' }}>
 By signing up, you agree to our Terms of Service and Privacy Policy.
 </p>
 </div>
 </div>
 );
}
