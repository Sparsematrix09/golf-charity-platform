'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SubscribePage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(null);
    }
  };

  const monthly = { price: 9.99, label: '/month' };
  const yearly = { price: 7.99, label: '/month', total: 95.88 };
  const current = billing === 'monthly' ? monthly : yearly;

  const features = [
    '5 Stableford score entries per month',
    'Automatic monthly prize draw entry',
    'Choose your charity recipient',
    '10%+ of subscription to charity',
    'Full performance dashboard',
    'Draw results & winnings history',
    'Eligible for jackpot, 4-match & 3-match prizes',
    'Cancel anytime',
  ];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 80, minHeight: '100vh', background: 'var(--clr-bg)' }}>
        <div className="container">
          {/* Header */}
          <div className="section-header" style={{ marginBottom: 'var(--sp-2xl)' }}>
            <div className="section-tag">Simple Pricing</div>
            <h1 className="heading-1" style={{ margin: '12px 0 16px' }}>One Plan, Two Ways to Pay</h1>
            <p className="body-lg text-muted" style={{ maxWidth: 480, margin: '0 auto' }}>
              Everything included. No hidden fees. A portion of every subscription goes to prizes and your chosen charity.
            </p>
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
            <div className="tabs" role="tablist" aria-label="Billing period">
              <button
                id="billing-monthly-tab"
                className={`tab-btn${billing === 'monthly' ? ' active' : ''}`}
                onClick={() => setBilling('monthly')}
                role="tab"
                aria-selected={billing === 'monthly'}
              >
                Monthly
              </button>
              <button
                id="billing-yearly-tab"
                className={`tab-btn${billing === 'yearly' ? ' active' : ''}`}
                onClick={() => setBilling('yearly')}
                role="tab"
                aria-selected={billing === 'yearly'}
              >
                Yearly
                <span style={{
                  marginLeft: 6,
                  background: 'rgba(201,168,76,0.2)',
                  color: 'var(--clr-gold)',
                  padding: '1px 8px',
                  borderRadius: 'var(--r-full)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}>Save 20%</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, maxWidth: 860, margin: '0 auto 64px' }}>
            {/* Standard plan */}
            <div className={`plan-card${billing === 'yearly' ? ' featured' : ''}`}>
              {billing === 'yearly' && <div className="plan-card-ribbon">Best Value</div>}

              <div>
                <span className="badge badge-green" style={{ marginBottom: 12 }}>
                  {billing === 'monthly' ? 'Monthly' : 'Yearly'}
                </span>
                <h2 className="heading-2" style={{ marginBottom: 4 }}>GolfGives {billing === 'monthly' ? 'Monthly' : 'Annual'}</h2>
                <p className="body-sm text-muted">Full platform access, draws & charity</p>
              </div>

              <div className="plan-price">
                <span className="plan-price-currency">£</span>
                <span className="plan-price-amount">{billing === 'monthly' ? '9.99' : '7.99'}</span>
                <span className="plan-price-period">/month</span>
              </div>

              {billing === 'yearly' && (
                <p className="body-sm text-muted" style={{ marginTop: -16, marginBottom: 12 }}>
                  £95.88 billed annually · Save £23.88 vs monthly
                </p>
              )}

              <div className="plan-features">
                {features.map((f, i) => (
                  <div key={i} className="plan-feature">
                    <div className="plan-feature-check" aria-hidden="true">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#34a870" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {f}
                  </div>
                ))}
              </div>

              <button
                id={`subscribe-${billing}-btn`}
                className="btn btn-gold btn-full btn-lg"
                onClick={() => handleSubscribe(billing)}
                disabled={loading !== null}
              >
                {loading === billing ? (
                  <><span className="spinner" /> Redirecting to checkout...</>
                ) : (
                  `Subscribe ${billing === 'monthly' ? 'Monthly' : 'Annually'} →`
                )}
              </button>

              <p className="body-sm text-faint text-center" style={{ marginTop: 12 }}>
                Powered by Stripe · Cancel anytime · Secure checkout
              </p>
            </div>

            {/* What your money does */}
            <div className="card" style={{ background: 'var(--clr-bg-2)', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <h3 className="heading-3" style={{ marginBottom: 16 }}>Where your money goes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { label: 'Prize Pool', pct: 50, color: 'var(--clr-gold)', icon: '🏆' },
                    { label: 'Charity Contribution', pct: 10, color: 'var(--clr-success)', icon: '❤️' },
                    { label: 'Platform & Operations', pct: 40, color: 'var(--clr-primary)', icon: '⚙️' },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex-between" style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span>{item.icon}</span>
                          <span className="body-sm">{item.label}</span>
                        </div>
                        <span className="body-sm" style={{ fontWeight: 700, color: item.color }}>{item.pct}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${item.pct}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="body-sm text-faint" style={{ marginTop: 12 }}>
                  * You can voluntarily increase your charity % in your dashboard.
                </p>
              </div>

              <div className="divider" />

              <div>
                <h3 className="heading-3" style={{ marginBottom: 12 }}>Jackpot grows monthly</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Current Jackpot', value: '£4,200' },
                    { label: 'Prize Pool', value: '£2,100' },
                    { label: 'This Month Draws', value: 'Apr 30' },
                    { label: 'Active Members', value: '840' },
                  ].map((s) => (
                    <div key={s.label} className="card" style={{ padding: 'var(--sp-sm)', background: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.3rem', color: 'var(--clr-text)' }}>{s.value}</div>
                      <div className="body-sm text-faint">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="divider" />

              <div>
                <p className="body-sm text-muted" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--clr-success)', fontSize: '1rem' }}>✓</span>
                  <span>Already have an account? <Link href="/auth/login" style={{ color: 'var(--clr-primary-light)', fontWeight: 600 }}>Sign in first</Link> to link your subscription.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {['🔒 Secure payments via Stripe', '🔄 Cancel anytime', '❤️ Charity-first ethos', '🇬🇧 UK-based platform'].map((b) => (
              <span key={b} className="body-sm text-muted">{b}</span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
