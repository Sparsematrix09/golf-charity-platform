'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Draw {
 id: string;
 month: string;
 status: 'draft' | 'simulated' | 'published';
 draw_numbers?: number[];
 logic: string;
}

interface DrawResult {
 id: string;
 draw_id: string;
 match_type: 3 | 4 | 5;
 prize_amount: number;
 draws: Draw;
}

interface DrawEntry {
 id: string;
 draw_id: string;
 draws: Draw;
}

export default function DrawsPage() {
 const [entries, setEntries] = useState<DrawEntry[]>([]);
 const [results, setResults] = useState<DrawResult[]>([]);
 const [nextDraw, setNextDraw] = useState<Draw | null>(null);
 const [userScores, setUserScores] = useState<number[]>([]);
 const [jackpot, setJackpot] = useState(4200);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const load = async () => {
 const supabase = createClient();
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) return;

 const [entriesRes, resultsRes, nextDrawRes, scoresRes, jackpotRes] = await Promise.all([
 supabase.from('draw_entries').select('*, draws(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
 supabase.from('draw_results').select('*, draws(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
 supabase.from('draws').select('*, draw_numbers(number)').eq('status', 'draft').order('created_at', { ascending: false }).limit(1).single(),
 supabase.from('golf_scores').select('score').eq('user_id', user.id).order('date', { ascending: false }).limit(5),
 supabase.from('jackpot').select('current_amount').single(),
 ]);

 setEntries(entriesRes.data ?? []);
 setResults(resultsRes.data ?? []);
 setNextDraw(nextDrawRes.data);
 setUserScores((scoresRes.data ?? []).map((s: any) => s.score));
 setJackpot(jackpotRes.data?.current_amount ?? 4200);
 setLoading(false);
 };
 load();
 }, []);

 const matchTierLabel = (t: number) => {
 if (t === 5) return { label: '� Jackpot Winner!', badge: 'badge-gold' };
 if (t === 4) return { label: ' 4-Number Match', badge: 'badge-blue' };
 return { label: ' 3-Number Match', badge: 'badge-green' };
 };

 const totalWon = results.reduce((s, r) => s + (r.prize_amount ?? 0), 0);

 if (loading) {
 return (
 <div>
 <div className="page-header">
 <div className="skeleton" style={{ height: 36, width: 200, marginBottom: 8 }} />
 </div>
 <div className="grid-2" style={{ gap: 24 }}>
 {[...Array(2)].map((_, i) => (<div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--r-lg)' }} />))}
 </div>
 </div>
 );
 }

 return (
 <div>
 <div className="page-header">
 <h1 className="page-title">Draws & Prizes</h1>
 <p className="page-subtitle">Your draw participation history and results</p>
 </div>

 {/* Summary stats */}
 <div className="grid-4" style={{ marginBottom: 32 }}>
 {[
 { label: 'Draws Entered', value: entries.length, icon: '', color: 'var(--clr-primary-light)' },
 { label: 'Times Won', value: results.length, icon: '', color: 'var(--clr-gold)' },
 { label: 'Total Winnings', value: `£${totalWon.toFixed(2)}`, icon: '', color: 'var(--clr-success)' },
 { label: 'Current Jackpot', value: `£${Number(jackpot).toLocaleString()}`, icon: '�', color: 'var(--clr-gold)' },
 ].map((s, i) => (
 <div key={i} className="card">
 <div className="flex-between" style={{ marginBottom: 10 }}>
 <span className="label text-faint">{s.label}</span>
 <span style={{ fontSize: '1.4rem' }} aria-hidden="true">{s.icon}</span>
 </div>
 <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: s.color, letterSpacing: '-0.02em' }}>
 {s.value}
 </div>
 </div>
 ))}
 </div>

 <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
 {/* Upcoming draw */}
 <div className="card card-gold">
 <h2 className="heading-3" style={{ marginBottom: 4 }}>Upcoming Draw</h2>
 <p className="body-sm text-muted" style={{ marginBottom: 20 }}>
 {nextDraw ? `Scheduled: ${nextDraw.month}` : 'No upcoming draw scheduled yet'}
 </p>

 {userScores.length> 0 ? (
 <>
 <p className="label text-faint" style={{ marginBottom: 12 }}>Your Entry Numbers</p>
 <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
 {userScores.map((s, i) => (
 <div key={i} className="draw-ball" aria-label={`Entry number: ${s}`}>{s}</div>
 ))}
 {Array.from({ length: Math.max(0, 5 - userScores.length) }).map((_, i) => (
 <div
 key={`empty-${i}`}
 style={{
 width: 56, height: 56, borderRadius: '50%',
 border: '2px dashed var(--clr-border)',
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontSize: '1.2rem', color: 'var(--clr-text-faint)',
 }}
 aria-label="Empty slot"
>?</div>
 ))}
 </div>
 {userScores.length < 5 && (
 <p className="body-sm" style={{ color: 'var(--clr-warning)' }}>
 Add {5 - userScores.length} more score{5 - userScores.length !== 1 ? 's' : ''} to fill all 5 entry slots
 </p>
 )}
 </>
 ) : (
 <div style={{ textAlign: 'center', padding: '24px 0' }}>
 <p className="body-sm text-muted">Add Stableford scores in the Scores section to participate in the draw.</p>
 </div>
 )}
 </div>

 {/* How the draw works */}
 <div className="card">
 <h2 className="heading-3" style={{ marginBottom: 16 }}>How the Draw Works</h2>
 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
 {[
 { match: '5 Numbers', prize: '40% of pool + jackpot', color: 'var(--clr-gold)', rollover: true },
 { match: '4 Numbers', prize: '35% of pool', color: 'var(--clr-info)', rollover: false },
 { match: '3 Numbers', prize: '25% of pool', color: 'var(--clr-success)', rollover: false },
 ].map((tier) => (
 <div key={tier.match} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--clr-border)' }}>
 <div style={{ width: 100, fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: tier.color }}>
 {tier.match}
 </div>
 <div style={{ flex: 1 }}>
 <span className="body-sm">{tier.prize}</span>
 {tier.rollover && <span className="badge badge-gold" style={{ marginLeft: 8 }}>Rollover</span>}
 </div>
 </div>
 ))}
 </div>
 <p className="body-sm text-faint" style={{ marginTop: 12 }}>
 Prizes split equally among multiple winners in the same tier. Jackpot carries over each month until won.
 </p>
 </div>
 </div>

 {/* Results history */}
 {results.length> 0 && (
 <div className="card" style={{ marginTop: 24 }}>
 <h2 className="heading-3" style={{ marginBottom: 20 }}>Your Winnings</h2>
 <div className="table-wrapper">
 <table className="data-table" aria-label="Draw results">
 <thead>
 <tr>
 <th scope="col">Month</th>
 <th scope="col">Result</th>
 <th scope="col">Prize</th>
 <th scope="col">Status</th>
 </tr>
 </thead>
 <tbody>
 {results.map((r) => {
 const { label, badge } = matchTierLabel(r.match_type);
 return (
 <tr key={r.id}>
 <td>{r.draws?.month ?? '—'}</td>
 <td><span className={`badge ${badge}`}>{label}</span></td>
 <td style={{ fontWeight: 700, color: 'var(--clr-gold)' }}>£{r.prize_amount?.toFixed(2)}</td>
 <td><span className="badge badge-green">Verified</span></td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* Entries history */}
 {entries.length> 0 && (
 <div className="card" style={{ marginTop: 24 }}>
 <h2 className="heading-3" style={{ marginBottom: 20 }}>Draw Entry History</h2>
 <div className="table-wrapper">
 <table className="data-table" aria-label="Draw entries">
 <thead>
 <tr>
 <th scope="col">Draw Month</th>
 <th scope="col">Status</th>
 </tr>
 </thead>
 <tbody>
 {entries.map((e) => (
 <tr key={e.id}>
 <td>{e.draws?.month ?? '—'}</td>
 <td>
 <span className={`badge ${e.draws?.status === 'published' ? 'badge-green' : e.draws?.status === 'simulated' ? 'badge-blue' : 'badge-grey'}`}>
 {e.draws?.status ?? 'pending'}
 </span>
 </td>
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
