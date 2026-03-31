'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function SubscriptionPage() {
  const [profile, setProfile] = useState<any>(null);
  const [sub, setSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: s } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
      setProfile(p);
      setSub(s);
      setLoading(false);
    };
    load();
  }, []);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel? You will lose access to draws at the end of your billing period.')) return;
    setCancelling(true);
    const res = await fetch('/api/cancel-subscription', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setMessage('Your subscription has been cancelled. Access continues until your renewal date.');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: s } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
        setSub(s);
      }
    } else {
      setMessage('Unable to cancel at this time. Please contact support.');
    }
    setCancelling(false);
  };

  const handleManage = async () => {
    const res = await fetch('/api/billing-portal', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const isActive = sub?.status === 'active';
  const isCancelled = sub?.status === 'canceled';

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ height: 36, width: 220, marginBottom: 8 }} />
        </div>
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--r-lg)' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subscription</h1>
        <p className="page-subtitle">Manage your GolfGives membership</p>
      </div>

      {message && (
        <div className="card" style={{ marginBottom: 24, background: 'rgba(52,168,112,0.1)', borderColor: 'rgba(52,168,112,0.3)' }} role="status">
          <p style={{ color: 'var(--clr-success)', fontWeight: 600 }}>{message}</p>
        </div>
      )}

      {!sub ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-2xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }} aria-hidden="true">💳</div>
          <h2 className="heading-2" style={{ marginBottom: 12 }}>No Active Subscription</h2>
          <p className="body-lg text-muted" style={{ maxWidth: 420, margin: '0 auto 32px' }}>
            Subscribe to join monthly draws, support your charity, and track your performance.
          </p>
          <Link href="/subscribe" className="btn btn-gold btn-lg" id="sub-page-subscribe-btn">
            Choose a Plan →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Current plan */}
          <div className={`card${isActive ? ' card-gold' : ''}`}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <h2 className="heading-2">GolfGives {sub.plan === 'yearly' ? 'Annual' : 'Monthly'}</h2>
                  <span className={`badge ${isActive ? 'badge-green' : isCancelled ? 'badge-red' : 'badge-grey'}`}>
                    {isActive ? 'Active' : isCancelled ? 'Cancelled' : sub.status}
                  </span>
                </div>
                <p className="body-md text-muted">
                  {sub.plan === 'yearly' ? '£95.88/year (£7.99/month equivalent)' : '£9.99/month'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="label text-faint" style={{ marginBottom: 4 }}>
                  {isCancelled ? 'Access Until' : 'Next Renewal'}
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem' }}>
                  {sub.renewal_date
                    ? new Date(sub.renewal_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '—'}
                </div>
              </div>
            </div>

            <div className="grid-3" style={{ marginBottom: 24, gap: 12 }}>
              {[
                { label: 'Plan Type', value: sub.plan === 'yearly' ? 'Annual' : 'Monthly' },
                { label: 'Draw Access', value: isActive ? '✅ Included' : '❌ Inactive' },
                { label: 'Charity Contribution', value: `${profile?.charity_pct ?? 10}%` },
              ].map((s) => (
                <div key={s.label} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)', border: '1px solid var(--clr-border)' }}>
                  <div className="label text-faint" style={{ marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                id="manage-billing-btn"
                className="btn btn-outline btn-sm"
                onClick={handleManage}
              >
                Manage Billing →
              </button>
              {isActive && (
                <button
                  id="cancel-subscription-btn"
                  className="btn btn-danger btn-sm"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? <><span className="spinner" /> Cancelling...</> : 'Cancel Subscription'}
                </button>
              )}
              {isCancelled && (
                <Link href="/subscribe" className="btn btn-gold btn-sm" id="resubscribe-btn">
                  Resubscribe
                </Link>
              )}
            </div>
          </div>

          {/* Billing history placeholder */}
          <div className="card">
            <h2 className="heading-3" style={{ marginBottom: 16 }}>Billing History</h2>
            <div className="table-wrapper">
              <table className="data-table" aria-label="Billing history">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Plan</th>
                    <th scope="col">Amount</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-GB') : '—'}</td>
                    <td>{sub.plan === 'yearly' ? 'Annual Plan' : 'Monthly Plan'}</td>
                    <td style={{ fontWeight: 600 }}>{sub.plan === 'yearly' ? '£95.88' : '£9.99'}</td>
                    <td><span className="badge badge-green">Paid</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="body-sm text-faint" style={{ marginTop: 12 }}>Full billing history available via Stripe customer portal.</p>
          </div>
        </div>
      )}
    </div>
  );
}
