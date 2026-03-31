'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { generateRandomDraw, generateAlgorithmicDraw, processDrawResults, calculatePrizeTiers, calculateTotalPool } from '@/lib/draw-engine';

export default function AdminDraws() {
 const [draws, setDraws] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [creating, setCreating] = useState(false);
 const [month, setMonth] = useState('');
 const [logic, setLogic] = useState<'random' | 'algorithmic'>('random');
 const [simResult, setSimResult] = useState<any>(null);
 const [simRunning, setSimRunning] = useState<string | null>(null);
 const [publishing, setPublishing] = useState<string | null>(null);
 const [jackpot, setJackpot] = useState(0);
 const [activeSubs, setActiveSubs] = useState(0);

 const supabase = createClient();

 const load = async () => {
 const [drawsRes, jackpotRes, subsRes] = await Promise.all([
 supabase.from('draws').select('*, draw_numbers(number)').order('created_at', { ascending: false }),
 supabase.from('jackpot').select('current_amount').single(),
 supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
 ]);
 setDraws(drawsRes.data ?? []);
 setJackpot(jackpotRes.data?.current_amount ?? 0);
 setActiveSubs(subsRes.count ?? 0);
 setLoading(false);
 };

 useEffect(() => { load(); }, []);

 const handleCreate = async (e: React.FormEvent) => {
 e.preventDefault();
 setCreating(true);
 const { data, error } = await supabase.from('draws').insert({ month, logic, status: 'draft', pool_total: calculateTotalPool(activeSubs, 0) }).select().single();
 if (!error && data) await load();
 setCreating(false);
 setMonth('');
 };

 const handleSimulate = async (draw: any) => {
 setSimRunning(draw.id);
 setSimResult(null);

 // Get all active subscriber scores
 const { data: entries } = await supabase
 .from('profiles')
 .select('id, golf_scores(score)')
 .not('subscription_status', 'is', null);

 const drawEntries = (entries ?? []).map((p: any) => ({
 user_id: p.id,
 scores: (p.golf_scores ?? []).map((s: any) => s.score),
 })).filter((e) => e.scores.length> 0);

 const drawnNumbers = logic === 'random'
 ? generateRandomDraw()
 : generateAlgorithmicDraw(drawEntries);

 const results = processDrawResults(drawEntries, drawnNumbers);
 const totalPool = calculateTotalPool(activeSubs, 0);
 const prizes = calculatePrizeTiers(totalPool, jackpot);

 // Store draw numbers in DB for this draw
 if (draw.draw_numbers?.length === 0 || !draw.draw_numbers) {
 await supabase.from('draw_numbers').insert(
 drawnNumbers.map((n) => ({ draw_id: draw.id, number: n }))
 );
 }

 await supabase.from('draws').update({ status: 'simulated' }).eq('id', draw.id);

 setSimResult({ drawnNumbers, results, prizes, totalPool, drawId: draw.id });
 await load();
 setSimRunning(null);
 };

 const handlePublish = async (drawId: string) => {
 if (!simResult || simResult.drawId !== drawId) {
 alert('Please run a simulation first before publishing.');
 return;
 }
 if (!confirm('Publish draw results? This will notify all winners and cannot be undone.')) return;
 setPublishing(drawId);

 const { prizes, results } = simResult;

 // Insert draw results for winners
 const insertResults: any[] = [];
 results.tier5.forEach((e: any) => {
 const amount = results.tier5.length> 0 ? prizes.tier5 / results.tier5.length : 0;
 insertResults.push({ draw_id: drawId, user_id: e.user_id, match_type: 5, prize_amount: amount });
 });
 results.tier4.forEach((e: any) => {
 const amount = results.tier4.length> 0 ? prizes.tier4 / results.tier4.length : 0;
 insertResults.push({ draw_id: drawId, user_id: e.user_id, match_type: 4, prize_amount: amount });
 });
 results.tier3.forEach((e: any) => {
 const amount = results.tier3.length> 0 ? prizes.tier3 / results.tier3.length : 0;
 insertResults.push({ draw_id: drawId, user_id: e.user_id, match_type: 3, prize_amount: amount });
 });

 if (insertResults.length> 0) {
 await supabase.from('draw_results').insert(insertResults);
 }

 // Handle jackpot rollover
 if (results.tier5.length === 0) {
 await supabase.from('jackpot').update({
 current_amount: jackpot + prizes.tier5,
 last_updated: new Date().toISOString(),
 }).eq('id', 1);
 } else {
 await supabase.from('jackpot').update({ current_amount: 0, last_updated: new Date().toISOString() }).eq('id', 1);
 }

 await supabase.from('draws').update({ status: 'published', pool_total: simResult.totalPool }).eq('id', drawId);
 setPublishing(null);
 setSimResult(null);
 load();
 };

 const prizePool = calculateTotalPool(activeSubs, 0);

 return (
 <div>
 <div className="page-header">
 <h1 className="page-title">Draw Management</h1>
 <p className="page-subtitle">Configure, simulate, and publish monthly prize draws</p>
 </div>

 {/* Current pool info */}
 <div className="grid-3" style={{ marginBottom: 32 }}>
 {[
 { label: 'Active Subscribers', value: activeSubs, icon: '', color: 'var(--clr-primary-light)' },
 { label: 'Prize Pool This Month', value: `£${prizePool.toFixed(2)}`, icon: '', color: 'var(--clr-gold)' },
 { label: 'Jackpot Carryover', value: `£${Number(jackpot).toLocaleString()}`, icon: '�', color: 'var(--clr-gold)' },
 ].map((s) => (
 <div key={s.label} className="card">
 <div className="flex-between" style={{ marginBottom: 8 }}>
 <span className="label text-faint">{s.label}</span>
 <span style={{ fontSize: '1.4rem' }} aria-hidden="true">{s.icon}</span>
 </div>
 <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.6rem', color: s.color, letterSpacing: '-0.02em' }}>
 {s.value}
 </div>
 </div>
 ))}
 </div>

 <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
 {/* Create draw */}
 <div className="card">
 <h2 className="heading-3" style={{ marginBottom: 20 }}>Create New Draw</h2>
 <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
 <div className="form-group">
 <label className="form-label" htmlFor="draw-month">Draw Month</label>
 <input
 id="draw-month"
 type="text"
 className="form-input"
 value={month}
 onChange={(e) => setMonth(e.target.value)}
 placeholder="e.g. April 2026"
 required
 />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="draw-logic">Draw Logic</label>
 <select
 id="draw-logic"
 className="form-input"
 value={logic}
 onChange={(e) => setLogic(e.target.value as 'random' | 'algorithmic')}
>
 <option value="random">Random (Standard Lottery)</option>
 <option value="algorithmic">Algorithmic (Weighted by Score Frequency)</option>
 </select>
 <p className="form-hint">Algorithmic draws weight numbers by how often they appear in user scores, increasing winner probability.</p>
 </div>
 <button
 id="create-draw-btn"
 type="submit"
 className="btn btn-primary"
 disabled={creating}
>
 {creating ? <><span className="spinner" /> Creating...</> : '+ Create Draw'}
 </button>
 </form>
 </div>

 {/* Simulation result */}
 {simResult && (
 <div className="card card-gold">
 <h2 className="heading-3" style={{ marginBottom: 4 }}>Simulation Result</h2>
 <p className="body-sm text-muted" style={{ marginBottom: 16 }}>Preview before publishing</p>

 <div style={{ marginBottom: 16 }}>
 <p className="label text-faint" style={{ marginBottom: 8 }}>Drawn Numbers</p>
 <div style={{ display: 'flex', gap: 8 }}>
 {simResult.drawnNumbers.map((n: number, i: number) => (
 <div key={i} className="draw-ball draw-ball-sm" aria-label={`Number ${n}`}>{n}</div>
 ))}
 </div>
 </div>

 <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
 {[
 { tier: '5-Match Jackpot', count: simResult.results.tier5.length, prize: simResult.prizes.tier5, rollover: simResult.results.tier5.length === 0 },
 { tier: '4-Match', count: simResult.results.tier4.length, prize: simResult.prizes.tier4, rollover: false },
 { tier: '3-Match', count: simResult.results.tier3.length, prize: simResult.prizes.tier3, rollover: false },
 ].map((t) => (
 <div key={t.tier} className="flex-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--clr-border)' }}>
 <div>
 <span className="body-sm" style={{ fontWeight: 600 }}>{t.tier}</span>
 {t.rollover && <span className="badge badge-gold" style={{ marginLeft: 8 }}>Rolls Over</span>}
 </div>
 <div style={{ textAlign: 'right' }}>
 <span className="body-sm text-muted">{t.count} winner{t.count !== 1 ? 's' : ''} · </span>
 <span style={{ fontWeight: 700, color: 'var(--clr-gold)' }}>£{t.prize.toFixed(2)}</span>
 </div>
 </div>
 ))}
 </div>

 <button
 id={`publish-draw-btn-${simResult.drawId}`}
 className="btn btn-gold btn-full"
 onClick={() => handlePublish(simResult.drawId)}
 disabled={publishing !== null}
>
 {publishing ? <><span className="spinner" /> Publishing...</> : ' Publish Results'}
 </button>
 </div>
 )}
 </div>

 {/* Draws list */}
 <div className="card" style={{ marginTop: 24 }}>
 <h2 className="heading-3" style={{ marginBottom: 20 }}>All Draws</h2>
 {loading ? (
 <div className="skeleton" style={{ height: 200, borderRadius: 'var(--r-md)' }} />
 ) : draws.length === 0 ? (
 <p className="body-md text-muted" style={{ textAlign: 'center', padding: '32px 0' }}>No draws created yet.</p>
 ) : (
 <div className="table-wrapper">
 <table className="data-table" aria-label="Draws table">
 <thead>
 <tr>
 <th scope="col">Month</th>
 <th scope="col">Logic</th>
 <th scope="col">Status</th>
 <th scope="col">Numbers Drawn</th>
 <th scope="col">Actions</th>
 </tr>
 </thead>
 <tbody>
 {draws.map((d) => (
 <tr key={d.id}>
 <td style={{ fontWeight: 600 }}>{d.month}</td>
 <td><span className="badge badge-grey">{d.logic}</span></td>
 <td>
 <span className={`badge ${d.status === 'published' ? 'badge-green' : d.status === 'simulated' ? 'badge-blue' : 'badge-grey'}`}>
 {d.status}
 </span>
 </td>
 <td>
 <div style={{ display: 'flex', gap: 4 }}>
 {(d.draw_numbers ?? []).map((n: any, i: number) => (
 <div key={i} className="draw-ball draw-ball-sm" style={{ width: 30, height: 30, fontSize: '0.7rem' }}>
 {n.number}
 </div>
 ))}
 {(d.draw_numbers ?? []).length === 0 && <span className="text-faint body-sm">—</span>}
 </div>
 </td>
 <td>
 {d.status === 'draft' && (
 <button
 id={`simulate-draw-${d.id}`}
 className="btn btn-outline btn-sm"
 onClick={() => handleSimulate(d)}
 disabled={simRunning === d.id}
>
 {simRunning === d.id ? <><span className="spinner" /> Simulating...</> : ' Simulate'}
 </button>
 )}
 {d.status === 'simulated' && (
 <button
 id={`publish-draw-${d.id}`}
 className="btn btn-gold btn-sm"
 onClick={() => handlePublish(d.id)}
 disabled={publishing === d.id}
>
 Publish
 </button>
 )}
 {d.status === 'published' && <span className="badge badge-green">Complete</span>}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 </div>
 );
}
