'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Score {
  id: string;
  score: number;
  date: string;
  created_at: string;
}

export default function ScoresPage() {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const supabase = createClient();

  const loadScores = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('golf_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);
    setScores(data ?? []);
    setLoading(false);
  };

  useEffect(() => { loadScores(); }, []);

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const val = parseInt(newScore);
    if (isNaN(val) || val < 1 || val > 45) {
      setError('Score must be between 1 and 45 (Stableford)');
      return;
    }
    if (!newDate) {
      setError('Please select a date');
      return;
    }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // If already 5 scores, delete the oldest first
    if (scores.length >= 5) {
      const oldest = [...scores].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
      await supabase.from('golf_scores').delete().eq('id', oldest.id);
    }

    const { error: insertErr } = await supabase.from('golf_scores').insert({
      user_id: user.id,
      score: val,
      date: newDate,
    });

    if (insertErr) {
      setError(insertErr.message);
    } else {
      setSuccess('Score added successfully!');
      setNewScore('');
      await loadScores();
    }
    setSaving(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await supabase.from('golf_scores').delete().eq('id', id);
    await loadScores();
    setDeleteId(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 35) return 'var(--clr-gold)';
    if (score >= 25) return 'var(--clr-success)';
    if (score >= 15) return 'var(--clr-primary-light)';
    return 'var(--clr-text-muted)';
  };

  const avg = scores.length ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length) : null;
  const max = scores.length ? Math.max(...scores.map((s) => s.score)) : null;
  const min = scores.length ? Math.min(...scores.map((s) => s.score)) : null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Scores</h1>
        <p className="page-subtitle">Enter your Stableford scores (1–45). Only your latest 5 are kept.</p>
      </div>

      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        {/* Add Score */}
        <div className="card">
          <h2 className="heading-3" style={{ marginBottom: 20 }}>Add New Score</h2>
          <form onSubmit={handleAddScore} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="score-value">Stableford Score (1–45)</label>
              <input
                id="score-value"
                type="number"
                min={1}
                max={45}
                className={`form-input${error ? ' error' : ''}`}
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="e.g. 34"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="score-date">Date Played</label>
              <input
                id="score-date"
                type="date"
                className="form-input"
                value={newDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}
            {success && <p style={{ color: 'var(--clr-success)', fontSize: '0.85rem', fontWeight: 500 }} role="status">{success}</p>}

            <button
              id="add-score-btn"
              type="submit"
              className="btn btn-primary btn-full"
              disabled={saving}
            >
              {saving ? <><span className="spinner" /> Adding...</> : '+ Add Score'}
            </button>
          </form>

          {scores.length >= 5 && (
            <div className="card" style={{ marginTop: 16, background: 'rgba(232,160,32,0.08)', borderColor: 'rgba(232,160,32,0.25)', padding: 12 }}>
              <p className="body-sm" style={{ color: 'var(--clr-warning)' }}>
                ⚠️ You have 5 scores. Adding a new one will automatically remove your oldest score.
              </p>
            </div>
          )}

          {scores.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className="divider" style={{ marginBottom: 16 }} />
              <p className="label text-faint" style={{ marginBottom: 12 }}>Score Stats</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Average', value: avg },
                  { label: 'Best', value: max },
                  { label: 'Lowest', value: min },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--r-md)' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--clr-text)' }}>{s.value}</div>
                    <div className="body-sm text-faint">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scores list */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <h2 className="heading-3">Your Scores</h2>
            <span className="badge badge-grey">{scores.length} / 5</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: 'var(--r-md)' }} />
              ))}
            </div>
          ) : scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">⛳</div>
              <p className="body-md text-muted">No scores yet. Add your first Stableford score to start participating in draws!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {scores.map((s, i) => (
                <div key={s.id} className="score-card">
                  <div
                    className="score-number"
                    style={{ color: getScoreColor(s.score), borderColor: getScoreColor(s.score) + '40', background: getScoreColor(s.score) + '18' }}
                    aria-label={`Score ${s.score}`}
                  >
                    {s.score}
                  </div>
                  <div style={{ flex: 1, paddingLeft: 12 }}>
                    <div className="body-sm" style={{ fontWeight: 600 }}>
                      {new Date(s.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="body-sm text-faint">Stableford round</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {i === 0 && <span className="badge badge-green">Latest</span>}
                    {i === scores.length - 1 && scores.length === 5 && <span className="badge badge-grey">Oldest</span>}
                    <button
                      id={`delete-score-${s.id}`}
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(s.id)}
                      disabled={deleteId === s.id}
                      aria-label={`Delete score of ${s.score}`}
                      style={{ padding: '6px 12px' }}
                    >
                      {deleteId === s.id ? '...' : '✕'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ marginTop: 16, background: 'rgba(26,122,82,0.05)', borderColor: 'rgba(26,122,82,0.15)', padding: 12 }}>
            <p className="body-sm text-muted">
              💡 <strong>Tip:</strong> Your scores become your draw entry numbers. Each unique score between 1-45 in your latest 5 games will be matched against the monthly draw numbers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
