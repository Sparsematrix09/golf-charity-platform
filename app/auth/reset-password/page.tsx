'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
 const [email, setEmail] = useState('');
 const [loading, setLoading] = useState(false);
 const [sent, setSent] = useState(false);
 const [error, setError] = useState('');

 const handleReset = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError('');
 const supabase = createClient();
 const { error } = await supabase.auth.resetPasswordForEmail(email, {
 redirectTo: `${window.location.origin}/auth/update-password`,
 });
 if (error) {
 setError(error.message);
 } else {
 setSent(true);
 }
 setLoading(false);
 };

 return (
 <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)', padding: 24 }}>
 <div style={{ width: '100%', maxWidth: 400 }}>
 <Link href="/" className="nav-logo" style={{ marginBottom: 48, display: 'inline-flex' }}>
 <div className="nav-logo-icon"></div>
 <span>GolfGives</span>
 </Link>

 {sent ? (
 <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-xl)' }}>
 <div style={{ fontSize: '2.5rem', marginBottom: 16 }}></div>
 <h2 className="heading-2" style={{ marginBottom: 12 }}>Check your email</h2>
 <p className="body-md text-muted" style={{ marginBottom: 24 }}>
 We sent a password reset link to <strong>{email}</strong>.
 </p>
 <Link href="/auth/login" className="btn btn-outline btn-full">← Back to Login</Link>
 </div>
 ) : (
 <>
 <h1 className="heading-1" style={{ marginBottom: 8 }}>Reset password</h1>
 <p className="body-md text-muted" style={{ marginBottom: 32 }}>Enter your email to receive a reset link</p>

 <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
 <div className="form-group">
 <label className="form-label" htmlFor="reset-email">Email address</label>
 <input
 id="reset-email"
 type="email"
 className={`form-input${error ? ' error' : ''}`}
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="you@example.com"
 required
 />
 {error && <p className="form-error" role="alert">{error}</p>}
 </div>
 <button id="reset-submit-btn" type="submit" className="btn btn-primary btn-full" disabled={loading}>
 {loading ? <><span className="spinner" /> Sending...</> : 'Send Reset Link'}
 </button>
 </form>

 <p className="body-sm text-muted text-center" style={{ marginTop: 24 }}>
 <Link href="/auth/login" style={{ color: 'var(--clr-primary-light)' }}>← Back to login</Link>
 </p>
 </>
 )}
 </div>
 </div>
 );
}
