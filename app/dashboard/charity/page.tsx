'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function CharityPage() {
 const [charities, setCharities] = useState<any[]>([]);
 const [profile, setProfile] = useState<any>(null);
 const [selected, setSelected] = useState<string | null>(null);
 const [charityPct, setCharityPct] = useState(10);
 const [donationAmount, setDonationAmount] = useState('');
 const [saving, setSaving] = useState(false);
 const [donating, setDonating] = useState(false);
 const [success, setSuccess] = useState('');
 const [loading, setLoading] = useState(true);

 const supabase = createClient();

 useEffect(() => {
 const load = async () => {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;
 const [profileRes, charitiesRes] = await Promise.all([
 supabase.from('profiles').select('*').eq('id', user.id).single(),
 supabase.from('charities').select('*').eq('active', true).order('name'),
 ]);
 setProfile(profileRes.data);
 setCharities(charitiesRes.data ?? []);
 setSelected(profileRes.data?.charity_id ?? null);
 setCharityPct(profileRes.data?.charity_pct ?? 10);
 setLoading(false);
 };
 load();
 }, []);

 const handleSave = async () => {
 setSaving(true);
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;
 await supabase.from('profiles').update({
 charity_id: selected,
 charity_pct: charityPct,
 }).eq('id', user.id);
 setSuccess('Charity preference saved!');
 setSaving(false);
 setTimeout(() => setSuccess(''), 3000);
 };

 const handleDonate = async (e: React.FormEvent) => {
 e.preventDefault();
 setDonating(true);
 const { data: { user } } = await supabase.auth.getUser();
 if (!user || !selected) return;
 await supabase.from('donations').insert({
 user_id: user.id,
 charity_id: selected,
 amount: parseFloat(donationAmount),
 type: 'independent',
 });
 setSuccess(`£${donationAmount} donation recorded to your chosen charity!`);
 setDonationAmount('');
 setDonating(false);
 setTimeout(() => setSuccess(''), 4000);
 };

 const selectedCharity = charities.find((c) => c.id === selected);

 if (loading) {
 return (
 <div>
 <div className="page-header">
 <div className="skeleton" style={{ height: 36, width: 200, marginBottom: 8 }} />
 </div>
 <div className="grid-2" style={{ gap: 24 }}>
 {[...Array(2)].map((_, i) => (<div key={i} className="skeleton" style={{ height: 300, borderRadius: 'var(--r-lg)' }} />))}
 </div>
 </div>
 );
 }

 return (
 <div>
 <div className="page-header">
 <h1 className="page-title">My Charity</h1>
 <p className="page-subtitle">Choose where your subscription contribution goes</p>
 </div>

 {success && (
 <div className="card" style={{ marginBottom: 24, background: 'rgba(52,168,112,0.1)', borderColor: 'rgba(52,168,112,0.3)' }} role="status">
 <p style={{ color: 'var(--clr-success)', fontWeight: 600 }}> {success}</p>
 </div>
 )}

 <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
 {/* Left: Current selection & pct */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
 {selectedCharity && (
 <div className="card card-gold">
 <p className="label text-faint" style={{ marginBottom: 8 }}>Currently Supporting</p>
 <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
 <span style={{ fontSize: '2rem' }} aria-hidden="true">{selectedCharity.emoji ?? ''}</span>
 <div>
 <h2 className="heading-3">{selectedCharity.name}</h2>
 <span className="badge badge-green">{selectedCharity.category}</span>
 </div>
 </div>
 <p className="body-sm text-muted">{selectedCharity.description}</p>
 </div>
 )}

 <div className="card">
 <h2 className="heading-3" style={{ marginBottom: 8 }}>Contribution Percentage</h2>
 <p className="body-sm text-muted" style={{ marginBottom: 20 }}>
 Minimum 10% of your subscription goes to your chosen charity. You can increase this voluntarily.
 </p>

 <div style={{ marginBottom: 8 }}>
 <div className="flex-between" style={{ marginBottom: 8 }}>
 <span className="body-sm">Charity contribution</span>
 <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--clr-gold)' }}>
 {charityPct}%
 </span>
 </div>
 <input
 id="charity-pct-slider"
 type="range"
 min={10}
 max={50}
 step={5}
 value={charityPct}
 onChange={(e) => setCharityPct(parseInt(e.target.value))}
 style={{ width: '100%', accentColor: 'var(--clr-gold)', cursor: 'pointer' }}
 aria-label="Charity contribution percentage"
 />
 <div className="flex-between" style={{ marginTop: 4 }}>
 <span className="body-sm text-faint">10% (min)</span>
 <span className="body-sm text-faint">50%</span>
 </div>
 </div>

 <p className="body-sm text-muted" style={{ marginTop: 12 }}>
 At £9.99/month, {charityPct}% = <strong style={{ color: 'var(--clr-gold)' }}>£{(9.99 * charityPct / 100).toFixed(2)}/month</strong> to {selectedCharity?.name ?? 'your charity'}
 </p>

 <button
 id="save-charity-btn"
 className="btn btn-primary btn-full"
 onClick={handleSave}
 disabled={saving}
 style={{ marginTop: 20 }}
>
 {saving ? <><span className="spinner" /> Saving...</> : ' Save Preferences'}
 </button>
 </div>

 {/* Independent donation */}
 <div className="card">
 <h2 className="heading-3" style={{ marginBottom: 4 }}>Make a Donation</h2>
 <p className="body-sm text-muted" style={{ marginBottom: 16 }}>Donate directly to your chosen charity, independent of your subscription.</p>
 <form onSubmit={handleDonate} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
 <div className="form-group" style={{ flex: 1, minWidth: 120 }}>
 <label className="form-label" htmlFor="donation-amount">Amount (£)</label>
 <input
 id="donation-amount"
 type="number"
 min="1"
 step="0.01"
 className="form-input"
 value={donationAmount}
 onChange={(e) => setDonationAmount(e.target.value)}
 placeholder="5.00"
 required
 />
 </div>
 <div style={{ paddingTop: 22 }}>
 <button
 id="donate-btn"
 type="submit"
 className="btn btn-gold"
 disabled={donating || !selected}
>
 {donating ? <><span className="spinner" /> Processing...</> : 'Donate '}
 </button>
 </div>
 </form>
 {!selected && <p className="body-sm" style={{ marginTop: 8, color: 'var(--clr-warning)' }}>Select a charity first</p>}
 </div>
 </div>

 {/* Right: Charity directory */}
 <div className="card">
 <div className="flex-between" style={{ marginBottom: 16 }}>
 <h2 className="heading-3">Choose a Charity</h2>
 <Link href="/charities" className="btn btn-ghost btn-sm">Browse All →</Link>
 </div>

 <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }}>
 {charities.length === 0 ? (
 <p className="body-sm text-muted" style={{ padding: '24px 0', textAlign: 'center' }}>No charities available yet. Check back soon!</p>
 ) : (
 charities.map((c) => (
 <button
 key={c.id}
 id={`charity-select-${c.id}`}
 onClick={() => setSelected(c.id)}
 style={{
 display: 'flex',
 alignItems: 'center',
 gap: 12,
 padding: 12,
 borderRadius: 'var(--r-md)',
 border: `1px solid ${selected === c.id ? 'var(--clr-gold)' : 'var(--clr-border)'}`,
 background: selected === c.id ? 'rgba(201,168,76,0.08)' : 'transparent',
 textAlign: 'left',
 cursor: 'pointer',
 transition: 'all var(--transition)',
 }}
 aria-pressed={selected === c.id}
 aria-label={`Select ${c.name}`}
>
 <span style={{ fontSize: '1.8rem', flexShrink: 0 }} aria-hidden="true">{c.emoji ?? ''}</span>
 <div style={{ flex: 1, minWidth: 0 }}>
 <div style={{ fontWeight: 600, fontSize: '0.9rem' }} className="truncate">{c.name}</div>
 <div className="body-sm text-faint">{c.category}</div>
 </div>
 {selected === c.id && (
 <span style={{ color: 'var(--clr-gold)', fontWeight: 700, flexShrink: 0 }}></span>
 )}
 </button>
 ))
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
