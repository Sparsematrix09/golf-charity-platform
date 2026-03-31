'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
 const [data, setData] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const supabase = createClient();
 const load = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const [profileRes, scoresRes, drawsRes, charitiesRes, jackpotRes] = await Promise.all([
 supabase.from('profiles').select('*, subscriptions(*)').eq('id', user.id).single(),
 supabase.from('golf_scores').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
 supabase.from('draw_entries').select('*, draws(month, status)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
 supabase.from('charities').select('name, emoji').eq('id', (await supabase.from('profiles').select('charity_id').eq('id', user.id).single()).data?.charity_id).single(),
 supabase.from('jackpot').select('current_amount').single(),
 ]);

 setData({
 profile: profileRes.data,
 scores: scoresRes.data ?? [],
 draws: drawsRes.data ?? [],
 charity: charitiesRes.data,
 jackpot: jackpotRes.data?.current_amount ?? 4200,
 });
 setLoading(false);
 };
 load();
 }, []);

 if (loading) {
 return (
 <div>
 <div className="page-header">
 <div className="skeleton" style={{ height: 36, width: 200, marginBottom: 8 }} />
 <div className="skeleton" style={{ height: 18, width: 280 }} />
 </div>
 <div className="grid-4" style={{ marginBottom: 24 }}>
 {[...Array(4)].map((_, i) => (
 <div key={i} className="skeleton" style={{ height: 120, borderRadius: 'var(--r-lg)' }} />
 ))}
 </div>
 </div>
 );
 }

 const sub = data?.profile?.subscriptions?.[0];
 const isActive = sub?.status === 'active' || data?.profile?.subscription_status === 'active';
 const scores = data?.scores ?? [];
 const draws = data?.draws ?? [];

 return (
 <div>
 <div className="page-header">
 <h1 className="page-title">
 Welcome back{data?.profile?.full_name ? `, ${data.profile.full_name.split(' ')[0]}` : ''}! �
 </h1>
 <p className="page-subtitle">Here's your GolfGives overview for this month</p>
 </div>

 {/* Status banner */}
 {!isActive && (
 <div className="card" style={{ marginBottom: 24, background: 'rgba(224,85,85,0.08)', borderColor: 'rgba(224,85,85,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
 <div>
 <p style={{ fontWeight: 600, color: 'var(--clr-danger)', marginBottom: 4 }}> No active subscription</p>
 <p className="body-sm text-muted">Subscribe to enter draws and support your charity</p>
 </div>
 <Link href="/subscribe" className="btn btn-gold btn-sm" id="dashboard-subscribe-prompt-btn">Subscribe Now</Link>
 </div>
 )}

 {/* Key stats */}
 <div className="grid-4" style={{ marginBottom: 32 }}>
 {[
 {
 label: 'Subscription',
 value: isActive ? 'Active' : 'Inactive',
 color: isActive ? 'var(--clr-success)' : 'var(--clr-danger)',
 sub: sub?.renewal_date ? `Renews ${new Date(sub.renewal_date).toLocaleDateString('en-GB')}` : 'Subscribe to play',
 icon: '�',
 },
 {
 label: 'Scores Logged',
 value: `${scores.length}/5`,
 color: scores.length === 5 ? 'var(--clr-success)' : 'var(--clr-warning)',
 sub: scores.length < 5 ? 'Add more scores to maximise draws' : 'Full entry — draw ready',
 icon: '',
 },
 {
 label: 'Current Jackpot',
 value: `£${Number(data?.jackpot).toLocaleString()}`,
 color: 'var(--clr-gold)',
 sub: 'Match all 5 numbers to win',
 icon: '�',
 },
 {
 label: 'Your Charity',
 value: data?.charity?.name ?? 'Not selected',
 color: data?.charity ? 'var(--clr-primary-light)' : 'var(--clr-text-faint)',
 sub: data?.profile?.charity_pct ? `${data.profile.charity_pct}% of your fee` : 'Select a charity',
 icon: '',
 },
 ].map((s, i) => (
 <div key={i} className="card">
 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
 <span className="label text-faint">{s.label}</span>
 <span style={{ fontSize: '1.5rem' }} aria-hidden="true">{s.icon}</span>
 </div>
 <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.4rem', color: s.color, marginBottom: 4, letterSpacing: '-0.02em' }}>
 {s.value}
 </div>
 <div className="body-sm text-faint">{s.sub}</div>
 </div>
 ))}
 </div>

 <div className="grid-2" style={{ gap: 24 }}>
 {/* Recent scores */}
 <div className="card">
 <div className="flex-between" style={{ marginBottom: 20 }}>
 <h2 className="heading-3">Latest Scores</h2>
 <Link href="/dashboard/scores" className="btn btn-ghost btn-sm" id="dashboard-view-scores-btn">
 Manage →
 </Link>
 </div>
 {scores.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '32px 0' }}>
 <div style={{ fontSize: '2.5rem', marginBottom: 12 }} aria-hidden="true"></div>
 <p className="body-sm text-muted" style={{ marginBottom: 16 }}>No scores yet. Enter your Stableford scores to participate in draws.</p>
 <Link href="/dashboard/scores" className="btn btn-primary btn-sm" id="dashboard-add-scores-btn">
 Add First Score
 </Link>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
 {scores.map((s: any, i: number) => (
 <div key={i} className="score-card">
 <div className="score-number" aria-label={`Score: ${s.score}`}>{s.score}</div>
 <div style={{ flex: 1, paddingLeft: 12 }}>
 <div className="body-sm" style={{ fontWeight: 600 }}>
 {new Date(s.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
 </div>
 <div className="body-sm text-faint">Stableford</div>
 </div>
 {i === 0 && <span className="badge badge-green">Latest</span>}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* Recent draws */}
 <div className="card">
 <div className="flex-between" style={{ marginBottom: 20 }}>
 <h2 className="heading-3">Draw History</h2>
 <Link href="/dashboard/draws" className="btn btn-ghost btn-sm" id="dashboard-view-draws-btn">
 View All →
 </Link>
 </div>
 {draws.length === 0 ? (
 <div style={{ textAlign: 'center', padding: '32px 0' }}>
 <div style={{ fontSize: '2.5rem', marginBottom: 12 }} aria-hidden="true"></div>
 <p className="body-sm text-muted">No draws yet. Draws are run monthly for all active subscribers.</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
 {draws.map((d: any, i: number) => (
 <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < draws.length - 1 ? '1px solid var(--clr-border)' : 'none' }}>
 <div>
 <div className="body-sm" style={{ fontWeight: 600 }}>{d.draws?.month}</div>
 <div className="body-sm text-faint">Entered</div>
 </div>
 <span className={`badge ${d.draws?.status === 'published' ? 'badge-green' : 'badge-grey'}`}>
 {d.draws?.status ?? 'pending'}
 </span>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Quick actions */}
 <div className="card" style={{ marginTop: 24 }}>
 <h2 className="heading-3" style={{ marginBottom: 16 }}>Quick Actions</h2>
 <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
 <Link href="/dashboard/scores" className="btn btn-primary btn-sm" id="qa-scores-btn">+ Add Score</Link>
 <Link href="/dashboard/charity" className="btn btn-outline btn-sm" id="qa-charity-btn">Change Charity</Link>
 <Link href="/dashboard/draws" className="btn btn-outline btn-sm" id="qa-draws-btn">View Draw Results</Link>
 <Link href="/dashboard/winnings" className="btn btn-outline btn-sm" id="qa-winnings-btn">My Winnings</Link>
 {!isActive && (
 <Link href="/subscribe" className="btn btn-gold btn-sm" id="qa-subscribe-btn">Subscribe Now</Link>
 )}
 </div>
 </div>
 </div>
 );
}
