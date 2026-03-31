'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function WinningsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('draw_results')
      .select('*, draws(*), winner_verifications(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setResults(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleProofUpload = async (resultId: string, file: File) => {
    setUploading(resultId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Upload to Supabase Storage
    const path = `winner-proofs/${user.id}/${resultId}/${file.name}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from('proofs')
      .upload(path, file, { upsert: true });

    if (!uploadErr && uploadData) {
      const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(path);
      await supabase.from('winner_verifications').upsert({
        user_id: user.id,
        draw_result_id: resultId,
        proof_url: urlData.publicUrl,
        status: 'pending',
        payout_status: 'pending',
      });
      setUploadSuccess(resultId);
      await load();
    }
    setUploading(null);
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  const tierInfo = (t: number) => {
    if (t === 5) return { label: '🏆 Jackpot', color: 'var(--clr-gold)', badge: 'badge-gold' };
    if (t === 4) return { label: '🥈 4-Match', color: 'var(--clr-info)', badge: 'badge-blue' };
    return { label: '🥉 3-Match', color: 'var(--clr-success)', badge: 'badge-green' };
  };

  const totalWon = results.reduce((s, r) => s + (r.prize_amount ?? 0), 0);
  const totalPaid = results
    .filter((r) => r.winner_verifications?.[0]?.payout_status === 'paid')
    .reduce((s, r) => s + (r.prize_amount ?? 0), 0);
  const pending = results.filter((r) => r.winner_verifications?.[0]?.status === 'pending').length;

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ height: 36, width: 200, marginBottom: 8 }} />
        </div>
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--r-lg)' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Winnings</h1>
        <p className="page-subtitle">Track your prize wins and verification status</p>
      </div>

      {/* Summary */}
      <div className="grid-3" style={{ marginBottom: 32 }}>
        {[
          { label: 'Total Won', value: `£${totalWon.toFixed(2)}`, color: 'var(--clr-gold)', icon: '💷' },
          { label: 'Total Paid Out', value: `£${totalPaid.toFixed(2)}`, color: 'var(--clr-success)', icon: '✅' },
          { label: 'Pending Verification', value: pending, color: 'var(--clr-warning)', icon: '⏳' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="flex-between" style={{ marginBottom: 8 }}>
              <span className="label text-faint">{s.label}</span>
              <span style={{ fontSize: '1.4rem' }} aria-hidden="true">{s.icon}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.8rem', color: s.color, letterSpacing: '-0.03em' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-3xl)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }} aria-hidden="true">🏆</div>
          <h2 className="heading-2" style={{ marginBottom: 12 }}>No winnings yet</h2>
          <p className="body-lg text-muted" style={{ maxWidth: 400, margin: '0 auto' }}>
            Keep entering your scores every month. The more you play, the more chances you have to win!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {results.map((r) => {
            const { label, color, badge } = tierInfo(r.match_type);
            const verification = r.winner_verifications?.[0];
            const needsProof = !verification;
            const isPending = verification?.status === 'pending';
            const isApproved = verification?.status === 'approved';
            const isRejected = verification?.status === 'rejected';
            const isPaid = verification?.payout_status === 'paid';

            return (
              <div key={r.id} className="card card-gold">
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span className={`badge ${badge}`}>{label}</span>
                      <span className="body-sm text-faint">{r.draws?.month}</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '2rem', color: 'var(--clr-gold)', letterSpacing: '-0.04em' }}>
                      £{r.prize_amount?.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="label text-faint" style={{ marginBottom: 4 }}>Payout Status</div>
                    {isPaid ? (
                      <span className="badge badge-green">✅ Paid</span>
                    ) : isApproved ? (
                      <span className="badge badge-blue">Approved · Payment Pending</span>
                    ) : isPending ? (
                      <span className="badge badge-grey">⏳ Under Review</span>
                    ) : isRejected ? (
                      <span className="badge badge-red">❌ Proof Rejected</span>
                    ) : (
                      <span className="badge badge-grey">Awaiting Proof</span>
                    )}
                  </div>
                </div>

                {/* Verification section */}
                {!isPaid && (
                  <div style={{ borderTop: '1px solid var(--clr-border)', paddingTop: 16 }}>
                    {needsProof || isRejected ? (
                      <div>
                        <p className="body-sm text-muted" style={{ marginBottom: 12 }}>
                          {isRejected
                            ? '❌ Your proof was rejected. Please upload a clear screenshot of your Stableford scores.'
                            : '📤 Upload a screenshot of your scores from your golf platform to verify your win.'}
                        </p>
                        <label
                          htmlFor={`proof-upload-${r.id}`}
                          className="btn btn-outline btn-sm"
                          style={{ cursor: 'pointer', display: 'inline-flex', gap: 8 }}
                        >
                          {uploading === r.id ? <><span className="spinner" /> Uploading...</> : '📎 Upload Proof'}
                        </label>
                        <input
                          id={`proof-upload-${r.id}`}
                          type="file"
                          accept="image/*,.pdf"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleProofUpload(r.id, file);
                          }}
                        />
                        {uploadSuccess === r.id && (
                          <p className="body-sm" style={{ color: 'var(--clr-success)', marginTop: 8 }}>
                            ✅ Proof uploaded! Admin will review shortly.
                          </p>
                        )}
                      </div>
                    ) : (
                      verification?.proof_url && (
                        <p className="body-sm text-muted">
                          Proof submitted. {isPending ? 'Awaiting admin review.' : ''}
                          {isApproved ? 'Approved! Payment will be processed shortly.' : ''}
                        </p>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
