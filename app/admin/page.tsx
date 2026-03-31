'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminOverview() {
 const [stats, setStats] = useState<any>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const load = async () => {
 const supabase = createClient();
 const [usersRes, activeSubsRes, drawsRes, jackpotRes, donationsRes, charitiesRes] = await Promise.all([
 supabase.from('profiles').select('id', { count: 'exact', head: true }),
 supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
 supabase.from('draws').select('id, status, month').order('created_at', { ascending: false }).limit(5),
 supabase.from('jackpot').select('current_amount').single(),
 supabase.from('donations').select('amount'),
 supabase.from('charities').select('id', { count: 'exact', head: true }).eq('active', true),
 ]);

 const totalDonations = (donationsRes.data ?? []).reduce((s: number, d: any) => s + (d.amount ?? 0), 0);
 const monthlyRevenue = (activeSubsRes.count ?? 0) * 9.99;
 const prizePool = monthlyRevenue * 0.5;

 setStats({
 totalUsers: usersRes.count ?? 0,
 activeSubscribers: activeSubsRes.count ?? 0,
 recentDraws: drawsRes.data ?? [],
 jackpot: jackpotRes.data?.current_amount ?? 0,
 totalDonations,
 totalCharities: charitiesRes.count ?? 0,
 monthlyRevenue,
 prizePool,
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
 <div className="grid-4" style={{ gap: 16, marginBottom: 24 }}>
 {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--r-lg)' }} />)}
 </div>
 </div>
 );
 }

 return (
 <div>
 <div className="page-header">
 <h1 className="page-title">Admin Overview</h1>
 <p className="page-subtitle">Platform-wide statistics and quick actions</p>
 </div>

 <div className="grid-4" style={{ marginBottom: 32 }}>
 {[
 { label: 'Total Users', value: stats.totalUsers, icon: '', color: 'var(--clr-primary-light)' },
 { label: 'Active Subscribers', value: stats.activeSubscribers, icon: '', color: 'var(--clr-success)' },
 { label: 'Monthly Revenue', value: `£${stats.monthlyRevenue.toFixed(2)}`, icon: '', color: 'var(--clr-gold)' },
 { label: 'Prize Pool', value: `£${stats.prizePool.toFixed(2)}`, icon: '�', color: 'var(--clr-gold)' },
 { label: 'Current Jackpot', value: `£${Number(stats.jackpot).toLocaleString()}`, icon: '', color: 'var(--clr-gold)' },
 { label: 'Total Charity Raised', value: `£${stats.totalDonations.toFixed(2)}`, icon: '', color: 'var(--clr-danger)' },
 { label: 'Active Charities', value: stats.totalCharities, icon: '', color: 'var(--clr-primary-light)' },
 { label: 'Draws This Month', value: stats.recentDraws.filter((d: any) => d.status !== 'draft').length, icon: '', color: 'var(--clr-info)' },
 ].map((s, i) => (
 <div key={i} className="card">
 <div className="flex-between" style={{ marginBottom: 8 }}>
 <span className="label text-faint">{s.label}</span>
 <span style={{ fontSize: '1.3rem' }} aria-hidden="true">{s.icon}</span>
 </div>
 <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: s.color, letterSpacing: '-0.02em' }}>
 {s.value}
 </div>
 </div>
 ))}
 </div>

 {/* Recent draws status */}
 <div className="grid-2" style={{ gap: 24 }}>
 <div className="card">
 <h2 className="heading-3" style={{ marginBottom: 16 }}>Recent Draws</h2>
 {stats.recentDraws.length === 0 ? (
 <p className="body-sm text-muted">No draws yet. <Link href="/admin/draws" style={{ color: 'var(--clr-primary-light)' }}>Create one →</Link></p>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
 {stats.recentDraws.map((d: any) => (
 <div key={d.id} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--clr-border)' }}>
 <span className="body-sm" style={{ fontWeight: 600 }}>{d.month}</span>
 <span className={`badge ${d.status === 'published' ? 'badge-green' : d.status === 'simulated' ? 'badge-blue' : 'badge-grey'}`}>
 {d.status}
 </span>
 </div>
 ))}
 </div>
 )}
 <div style={{ marginTop: 16 }}>
 <Link href="/admin/draws" className="btn btn-primary btn-sm" id="admin-manage-draws-btn">
 Manage Draws →
 </Link>
 </div>
 </div>

 <div className="card">
 <h2 className="heading-3" style={{ marginBottom: 16 }}>Quick Actions</h2>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
 {[
 { href: '/admin/draws', label: ' Run Monthly Draw', btn: 'btn-gold' },
 { href: '/admin/winners', label: ' Review Pending Winners', btn: 'btn-primary' },
 { href: '/admin/users', label: ' Manage Users', btn: 'btn-outline' },
 { href: '/admin/charities', label: ' Add New Charity', btn: 'btn-outline' },
 { href: '/admin/reports', label: ' View Reports', btn: 'btn-outline' },
 ].map((a) => (
 <Link key={a.href} href={a.href} className={`btn ${a.btn} btn-sm`} style={{ justifyContent: 'flex-start' }} id={`admin-qa-${a.href.split('/').pop()}`}>
 {a.label}
 </Link>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}
