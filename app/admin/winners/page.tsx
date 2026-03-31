'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminWinners() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processing, setProcessing] = useState<string | null>(null);

  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase
      .from('winner_verifications')
      .select('*, draw_results(*, draws(*), profiles(full_name, email))')
      .order('created_at', { ascending: false });
    setWinners(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected', resultId?: string) => {
    setProcessing(id);
    await supabase.from('winner_verifications').update({ status: action }).eq('id', id);
    if (action === 'approved' && resultId) {
      // Create winner verification as approved — payout still pending admin action
    }
    load();
    setProcessing(null);
  };

  const handleMarkPaid = async (id: string) => {
    setProcessing(id);
    await supabase.from('winner_verifications').update({ payout_status: 'paid' }).eq('id', id);
    load();
    setProcessing(null);
  };

  const filtered = winners.filter((w) => filter === 'all' ? true : w.status === filter);

  const tierLabel = (t: number) => {
    if (t === 5) return '🏆 Jackpot';
    if (t === 4) return '🥈 4-Match';
    return '🥉 3-Match';
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Winners Management</h1>
        <p className="page-subtitle">Verify proof submissions and manage prize payouts</p>
      </div>

      {/* Summary */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Winners', value: winners.length, color: 'var(--clr-text)' },
          { label: 'Pending Review', value: winners.filter((w) => w.status === 'pending').length, color: 'var(--clr-warning)' },
          { label: 'Approved', value: winners.filter((w) => w.status === 'approved').length, color: 'var(--clr-success)' },
          { label: 'Paid Out', value: winners.filter((w) => w.payout_status === 'paid').length, color: 'var(--clr-gold)' },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="label text-faint" style={{ marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '2rem', color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="tabs" style={{ marginBottom: 24 }} role="tablist">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            id={`winners-filter-${f}`}
            className={`tab-btn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span style={{ marginLeft: 6, fontSize: '0.7rem', fontWeight: 700, color: 'var(--clr-text-muted)' }}>
                ({winners.filter((w) => w.status === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--r-lg)' }} />
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-2xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">🏆</div>
          <p className="body-lg text-muted">No {filter === 'all' ? '' : filter} winner submissions yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((w) => {
            const result = w.draw_results;
            const user = result?.profiles;
            const isPending = w.status === 'pending';
            const isApproved = w.status === 'approved';
            const isPaid = w.payout_status === 'paid';

            return (
              <div key={w.id} className="card">
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className="badge badge-gold">{tierLabel(result?.match_type ?? 3)}</span>
                      <span className="body-sm text-faint">{result?.draws?.month}</span>
                      <span className={`badge ${isPending ? 'badge-grey' : isApproved ? 'badge-green' : 'badge-red'}`}>
                        {w.status}
                      </span>
                      {isPaid && <span className="badge badge-green">💷 Paid</span>}
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: 'var(--clr-gold)', letterSpacing: '-0.03em' }}>
                      £{result?.prize_amount?.toFixed(2) ?? '—'}
                    </div>
                    <div className="body-sm text-muted" style={{ marginTop: 4 }}>
                      Winner: <strong>{user?.full_name ?? '—'}</strong> · {user?.email ?? '—'}
                    </div>
                  </div>

                  {/* Proof link */}
                  {w.proof_url && (
                    <a
                      href={w.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      id={`view-proof-${w.id}`}
                    >
                      📎 View Proof
                    </a>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {isPending && (
                    <>
                      <button
                        id={`approve-winner-${w.id}`}
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAction(w.id, 'approved', result?.id)}
                        disabled={processing === w.id}
                      >
                        {processing === w.id ? <span className="spinner" /> : '✅ Approve'}
                      </button>
                      <button
                        id={`reject-winner-${w.id}`}
                        className="btn btn-danger btn-sm"
                        onClick={() => handleAction(w.id, 'rejected')}
                        disabled={processing === w.id}
                      >
                        ❌ Reject
                      </button>
                    </>
                  )}
                  {isApproved && !isPaid && (
                    <button
                      id={`mark-paid-${w.id}`}
                      className="btn btn-gold btn-sm"
                      onClick={() => handleMarkPaid(w.id)}
                      disabled={processing === w.id}
                    >
                      {processing === w.id ? <span className="spinner" /> : '💷 Mark as Paid'}
                    </button>
                  )}
                  {isPaid && (
                    <span className="body-sm" style={{ color: 'var(--clr-success)', fontWeight: 600, alignSelf: 'center' }}>
                      ✅ Payment complete
                    </span>
                  )}
                  {w.status === 'rejected' && (
                    <button
                      id={`re-approve-winner-${w.id}`}
                      className="btn btn-outline btn-sm"
                      onClick={() => handleAction(w.id, 'approved')}
                    >
                      Re-approve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
