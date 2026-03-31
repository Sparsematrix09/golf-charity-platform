'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminReports() {
 const [stats, setStats] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const load = async () => {
 const supabase = createClient();
 const [usersRes, activeRes, monthlyRes, yearlyRes, drawsRes, donationsRes, charityRes, winnersRes, jackpotRes] = await Promise.all([
 supabase.from('profiles').select('id, created_at', { count: 'exact' }),
 supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
 supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('plan', 'monthly'),
 supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('plan', 'yearly'),
 supabase.from('draws').select('id, status, month, pool_total').order('created_at', { ascending: false }),
 supabase.from('donations').select('amount, type'),
 supabase.from('charities').select('id, name, active'),
 supabase.from('draw_results').select('prize_amount, match_type'),
 supabase.from('jackpot').select('current_amount').single(),
 ]);

 const totalDonations = (donationsRes.data ?? []).reduce((s: number, d: any) => s + (d.amount ?? 0), 0);
 const indepDonations = (donationsRes.data ?? []).filter((d: any) => d.type === 'independent').reduce((s: number, d: any) => s + (d.amount ?? 0), 0);
 const subDonations = totalDonations - indepDonations;
 const totalPrizesPaid = (winnersRes.data ?? []).reduce((s: number, r: any) => s + (r.prize_amount ?? 0), 0);
 const monthlyRevenue = (monthlyRes.count ?? 0) * 9.99 + (yearlyRes.count ?? 0) * (95.88 / 12);

 setStats({
 totalUsers: usersRes.count ?? 0,
 activeSubscribers: activeRes.count ?? 0,
 monthlyPlans: monthlyRes.count ?? 0,
 yearlyPlans: yearlyRes.count ?? 0,
 draws: drawsRes.data ?? [],
 publishedDraws: (drawsRes.data ?? []).filter((d: any) => d.status === 'published').length,
 totalDonations,
 indepDonations,
 subDonations,
 totalPrizesPaid,
 monthlyRevenue,
 jackpot: jackpotRes.data?.current_amount ?? 0,
 totalCharities: (charityRes.data ?? []).filter((c: any) => c.active).length,
 jackpotWins: (winnersRes.data ?? []).filter((r: any) => r.match_type === 5).length,
 tier4Wins: (winnersRes.data ?? []).filter((r: any) => r.match_type === 4).length,
 tier3Wins: (winnersRes.data ?? []).filter((r: any) => r.match_type === 3).length,
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
 </div>
 <div className="grid-4" style={{ gap: 16 }}>
 {[...Array(12)].map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 'var(--r-lg)' }} />)}
 </div>
 </div>
 );
 }

 return (
 <div>
 <div className="page-header">
 <h1 className="page-title">Reports & Analytics</h1>
 <p className="page-subtitle">Platform-wide performance data</p>
 </div>

 {/* User stats */}
 <div style={{ marginBottom: 32 }}>
 <p className="label text-faint" style={{ marginBottom: 16 }}> Users & Subscriptions</p>
 <div className="grid-4" style={{ gap: 16 }}>
 {[
 { label: 'Total Registered', value: stats.totalUsers },
 { label: 'Active Subscribers', value: stats.activeSubscribers },
 { label: 'Monthly Plans', value: stats.monthlyPlans },
 { label: 'Annual Plans', value: stats.yearlyPlans },
 ].map((s) => (
 <div key={s.label} className="card">
 <div className="label text-faint" style={{ marginBottom: 8 }}>{s.label}</div>
 <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em' }}>{s.value}</div>
 </div>
 ))}
 </div>
 </div>

 {/* Revenue */}
 <div style={{ marginBottom: 32 }}>
 <p className="label text-faint" style={{ marginBottom: 16 }}> Revenue & Pool</p>
 <div className="grid-4" style={{ gap: 16 }}>
 {[
 { label: 'Monthly Revenue', value: `£${stats.monthlyRevenue.toFixed(2)}`, color: 'var(--clr-gold)' },
 { label: 'Total Prize Pool', value: `£${(stats.monthlyRevenue * 0.5).toFixed(2)}`, color: 'var(--clr-gold)' },
 { label: 'Current Jackpot', value: `£${Number(stats.jackpot).toLocaleString()}`, color: 'var(--clr-gold)' },
 { label: 'Total Prizes Paid', value: `£${stats.totalPrizesPaid.toFixed(2)}`, color: 'var(--clr-success)' },
 ].map((s) => (
 <div key={s.label} className="card">
 <div className="label text-faint" style={{ marginBottom: 8 }}>{s.label}</div>
 <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
 </div>
 ))}
 </div>
 </div>

 {/* Charity */}
 <div style={{ marginBottom: 32 }}>
 <p className="label text-faint" style={{ marginBottom: 16 }}> Charity Impact</p>
 <div className="grid-4" style={{ gap: 16 }}>
 {[
 { label: 'Total Charity Raised', value: `£${stats.totalDonations.toFixed(2)}`, color: 'var(--clr-danger)' },
 { label: 'From Subscriptions', value: `£${stats.subDonations.toFixed(2)}`, color: 'var(--clr-danger)' },
 { label: 'Independent Donations', value: `£${stats.indepDonations.toFixed(2)}`, color: 'var(--clr-danger)' },
 { label: 'Active Charities', value: stats.totalCharities, color: 'var(--clr-primary-light)' },
 ].map((s) => (
 <div key={s.label} className="card">
 <div className="label text-faint" style={{ marginBottom: 8 }}>{s.label}</div>
 <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
 </div>
 ))}
 </div>
 </div>

 {/* Draw stats */}
 <div style={{ marginBottom: 32 }}>
 <p className="label text-faint" style={{ marginBottom: 16 }}> Draw Statistics</p>
 <div className="grid-4" style={{ gap: 16 }}>
 {[
 { label: 'Total Draws Run', value: stats.publishedDraws },
 { label: 'Jackpot Wins', value: stats.jackpotWins },
 { label: '4-Match Wins', value: stats.tier4Wins },
 { label: '3-Match Wins', value: stats.tier3Wins },
 ].map((s) => (
 <div key={s.label} className="card">
 <div className="label text-faint" style={{ marginBottom: 8 }}>{s.label}</div>
 <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em' }}>{s.value}</div>
 </div>
 ))}
 </div>
 </div>

 {/* Draw history table */}
 {stats.draws.length> 0 && (
 <div className="card">
 <h2 className="heading-3" style={{ marginBottom: 16 }}>Draw History</h2>
 <div className="table-wrapper">
 <table className="data-table" aria-label="Draw history">
 <thead>
 <tr>
 <th scope="col">Month</th>
 <th scope="col">Status</th>
 <th scope="col">Pool Total</th>
 </tr>
 </thead>
 <tbody>
 {stats.draws.map((d: any) => (
 <tr key={d.id}>
 <td style={{ fontWeight: 600 }}>{d.month}</td>
 <td>
 <span className={`badge ${d.status === 'published' ? 'badge-green' : d.status === 'simulated' ? 'badge-blue' : 'badge-grey'}`}>
 {d.status}
 </span>
 </td>
 <td style={{ fontWeight: 600 }}>{d.pool_total ? `£${d.pool_total}` : '—'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>
 );
}
