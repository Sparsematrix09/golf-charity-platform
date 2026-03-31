'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ===== HERO ===== */}
        <section className="hero" aria-label="Hero section">
          {/* Background orbs */}
          <div className="orb orb-green" style={{ width: 600, height: 600, top: '-10%', left: '-15%', animationDelay: '0s' }} />
          <div className="orb orb-gold" style={{ width: 400, height: 400, bottom: '10%', right: '-10%', animationDelay: '3s' }} />
          <div className="orb orb-green" style={{ width: 300, height: 300, top: '60%', left: '40%', animationDelay: '1.5s', opacity: 0.5 }} />

          {/* Grid overlay */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.03,
            backgroundImage: 'linear-gradient(var(--clr-text) 1px, transparent 1px), linear-gradient(90deg, var(--clr-text) 1px, transparent 1px)',
            backgroundSize: '60px 60px', zIndex: 0,
          }} />

          <div className="container">
            <div className="hero-content">
              <div className="hero-eyebrow animate-fade-up" style={{ animationDelay: '0s' }}>
                Play Golf · Win Prizes · Fund Charity
              </div>

              <h1 className="hero-title animate-fade-up delay-1">
                Golf That<br />
                <span className="accent">Changes</span><br />
                <span className="primary">Lives</span>
              </h1>

              <p className="hero-subtitle animate-fade-up delay-2">
                Subscribe, enter your golf scores, compete in monthly draws, and channel your contribution to a charity you believe in. The game you love — with real impact.
              </p>

              <div className="hero-cta animate-fade-up delay-3">
                <Link href="/subscribe" className="btn btn-gold btn-xl" id="hero-subscribe-btn">
                  Start Playing & Giving
                </Link>
                <Link href="/#how-it-works" className="btn btn-outline btn-lg" id="hero-learn-btn">
                  See How It Works
                </Link>
              </div>

              <div className="hero-stats animate-fade-up delay-4">
                <div className="hero-stat">
                  <div className="hero-stat-number">£24k+</div>
                  <div className="hero-stat-label">Donated to Charity</div>
                </div>
                <div style={{ width: 1, height: 40, background: 'var(--clr-border)' }} aria-hidden="true" />
                <div className="hero-stat">
                  <div className="hero-stat-number">840+</div>
                  <div className="hero-stat-label">Active Members</div>
                </div>
                <div style={{ width: 1, height: 40, background: 'var(--clr-border)' }} aria-hidden="true" />
                <div className="hero-stat">
                  <div className="hero-stat-number">£4,200</div>
                  <div className="hero-stat-label">Current Jackpot</div>
                </div>
                <div style={{ width: 1, height: 40, background: 'var(--clr-border)' }} aria-hidden="true" />
                <div className="hero-stat">
                  <div className="hero-stat-number">18</div>
                  <div className="hero-stat-label">Partner Charities</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section id="how-it-works" className="section" aria-label="How it works">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">The Process</div>
              <h2 className="heading-1">Simple Steps,<br />Real Impact</h2>
              <p className="body-lg text-muted" style={{ maxWidth: 560, margin: '16px auto 0' }}>
                Four simple steps connect your golf game to meaningful charitable outcomes every month.
              </p>
            </div>

            <div className="grid-4" style={{ gap: 'var(--sp-md)' }}>
              {[
                {
                  step: '01',
                  icon: '🃏',
                  title: 'Subscribe',
                  desc: 'Choose your plan — monthly or yearly. A portion of every payment goes directly to prize pools and your chosen charity.',
                  color: 'var(--clr-primary)',
                },
                {
                  step: '02',
                  icon: '⛳',
                  title: 'Enter Scores',
                  desc: 'Log your last 5 Stableford scores (1–45). Your rolling score history is your ticket to each monthly draw.',
                  color: 'var(--clr-gold)',
                },
                {
                  step: '03',
                  icon: '🎱',
                  title: 'Monthly Draw',
                  desc: '5 numbers are drawn each month. Match 3, 4, or all 5 of your scores to win tier prizes — or the jackpot.',
                  color: 'var(--clr-primary-light)',
                },
                {
                  step: '04',
                  icon: '❤️',
                  title: 'Charity Impact',
                  desc: 'At least 10% of your subscription goes to your chosen charity — or donate independently anytime.',
                  color: 'var(--clr-danger)',
                },
              ].map((item, i) => (
                <div key={i} className="card" style={{ animationDelay: `${i * 0.1}s`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', top: 12, right: 16,
                    fontFamily: 'var(--font-heading)', fontSize: '4rem', fontWeight: 900,
                    color: item.color, opacity: 0.08, letterSpacing: '-0.05em', lineHeight: 1,
                    userSelect: 'none',
                  }} aria-hidden="true">{item.step}</div>
                  <div style={{ fontSize: '2rem', marginBottom: 16 }} aria-hidden="true">{item.icon}</div>
                  <h3 className="heading-3" style={{ marginBottom: 8 }}>{item.title}</h3>
                  <p className="body-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CHARITY SPOTLIGHT ===== */}
        <section className="section" style={{ background: 'var(--clr-bg-2)' }} aria-label="Charity spotlight">
          <div className="container">
            <div className="flex-between" style={{ marginBottom: 'var(--sp-2xl)', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div className="section-tag" style={{ marginBottom: 12 }}>Charity Partners</div>
                <h2 className="heading-1">The Causes<br />You're Funding</h2>
              </div>
              <Link href="/charities" className="btn btn-outline">
                View All Charities →
              </Link>
            </div>

            <div className="grid-3">
              {[
                {
                  emoji: '🫀',
                  name: 'British Heart Foundation',
                  category: 'Healthcare',
                  raised: '£3,200',
                  members: 124,
                  desc: 'Funding life-saving cardiovascular research and awareness campaigns across the UK.',
                },
                {
                  emoji: '🌿',
                  name: 'The Wildlife Trust',
                  category: 'Environment',
                  raised: '£2,870',
                  members: 98,
                  desc: 'Protecting the UK\'s most precious wildlife habitats and biodiversity.',
                },
                {
                  emoji: '🏠',
                  name: 'Shelter UK',
                  category: 'Housing',
                  raised: '£4,100',
                  members: 156,
                  desc: 'Fighting homelessness and bad housing through advice, support, and advocacy.',
                },
              ].map((c, i) => (
                <div key={i} className="charity-card" style={{ cursor: 'default' }}>
                  <div className="charity-card-image-placeholder" aria-hidden="true">
                    <span style={{ fontSize: '3rem' }}>{c.emoji}</span>
                  </div>
                  <div className="charity-card-body">
                    <div className="flex-between" style={{ marginBottom: 8 }}>
                      <span className="badge badge-green">{c.category}</span>
                      <span className="label text-faint">{c.members} members</span>
                    </div>
                    <h3 className="heading-3" style={{ marginBottom: 6 }}>{c.name}</h3>
                    <p className="body-sm text-muted" style={{ marginBottom: 12 }}>{c.desc}</p>
                    <div className="flex-between">
                      <span className="body-sm text-muted">Raised this year</span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--clr-gold)' }}>{c.raised}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRIZES ===== */}
        <section id="prizes" className="section" aria-label="Prize tiers">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Prize Structure</div>
              <h2 className="heading-1">Three Ways to Win<br />Every Month</h2>
              <p className="body-lg text-muted" style={{ maxWidth: 560, margin: '16px auto 0' }}>
                Match your Stableford scores to the drawn numbers. The more you match, the bigger the prize.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 'var(--sp-md)', alignItems: 'end' }}>
              {[
                {
                  matches: 3,
                  emoji: '🥉',
                  label: '3-Number Match',
                  share: '25%',
                  desc: 'Match any 3 of your 5 scores against the drawn numbers',
                  badge: 'bronze',
                  highlighted: false,
                },
                {
                  matches: 5,
                  emoji: '🏆',
                  label: '5-Number Jackpot',
                  share: '40%',
                  desc: 'Match all 5. The jackpot rolls over until claimed, growing every month',
                  badge: 'gold',
                  highlighted: true,
                },
                {
                  matches: 4,
                  emoji: '🥈',
                  label: '4-Number Match',
                  share: '35%',
                  desc: 'Match 4 of your 5 scores — a significant prize tier',
                  badge: 'silver',
                  highlighted: false,
                },
              ].map((tier, i) => (
                <div
                  key={i}
                  className={`plan-card${tier.highlighted ? ' featured' : ''}`}
                  style={{ textAlign: 'center', padding: tier.highlighted ? 'var(--sp-2xl) var(--sp-xl)' : 'var(--sp-xl)' }}
                >
                  {tier.highlighted && (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.05))',
                      border: '1px solid rgba(201,168,76,0.2)',
                      borderRadius: 'var(--r-full)',
                      padding: '4px 16px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'var(--clr-gold)',
                      display: 'inline-block',
                      marginBottom: 16,
                    }}>Jackpot · Rolls Over</div>
                  )}
                  <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">{tier.emoji}</div>
                  <div style={{
                    display: 'flex',
                    width: tier.matches * 28 + (tier.matches - 1) * 6,
                    margin: '0 auto 16px',
                    gap: 6,
                    justifyContent: 'center',
                  }}>
                    {Array.from({ length: tier.matches }).map((_, j) => (
                      <div
                        key={j}
                        style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'linear-gradient(145deg, var(--clr-gold-dark), var(--clr-gold))',
                          fontSize: '0.6rem', fontWeight: 900, color: '#0a0a0a',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      />
                    ))}
                  </div>
                  <h3 className="heading-3" style={{ marginBottom: 8 }}>{tier.label}</h3>
                  <p className="body-sm text-muted" style={{ marginBottom: 16 }}>{tier.desc}</p>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, var(--clr-gold-dark), var(--clr-gold-light))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.04em',
                  }}>
                    {tier.share}
                  </div>
                  <p className="body-sm text-faint">of total prize pool</p>
                </div>
              ))}
            </div>

            <div className="card" style={{ marginTop: 'var(--sp-xl)', textAlign: 'center', background: 'rgba(26,122,82,0.06)', borderColor: 'rgba(26,122,82,0.2)' }}>
              <p className="body-md text-muted">
                💡 The prize pool grows with every subscription. Multiple winners split their tier equally.
                The jackpot carries over each month until a 5-match winner is found.
              </p>
            </div>
          </div>
        </section>

        {/* ===== CTA BAND ===== */}
        <section className="section" style={{ background: 'linear-gradient(135deg, var(--clr-primary-dark) 0%, var(--clr-bg-2) 100%)' }} aria-label="Call to action">
          <div className="container" style={{ textAlign: 'center' }}>
            <div className="section-tag" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'var(--clr-text)' }}>
              Ready to Play?
            </div>
            <h2 className="heading-1" style={{ margin: '16px 0 24px' }}>
              Join Hundreds of Golfers<br />Making a Difference
            </h2>
            <p className="body-lg text-muted" style={{ maxWidth: 480, margin: '0 auto 40px' }}>
              Monthly or yearly — your subscription funds prizes, supports charities, and puts your game on the leaderboard.
            </p>
            <div className="hero-cta">
              <Link href="/subscribe" className="btn btn-gold btn-xl" id="cta-subscribe-btn">
                Choose Your Plan
              </Link>
              <Link href="/auth/signup" className="btn btn-outline btn-lg" id="cta-signup-btn">
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
