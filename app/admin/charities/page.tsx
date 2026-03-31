'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminCharities() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', emoji: '', events: '', active: true });

  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase.from('charities').select('*').order('name');
    setCharities(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => setForm({ name: '', description: '', category: '', emoji: '', events: '', active: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form };
    if (editing) {
      await supabase.from('charities').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('charities').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    resetForm();
    load();
  };

  const handleEdit = (c: any) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description ?? '', category: c.category ?? '', emoji: c.emoji ?? '', events: c.events ?? '', active: c.active ?? true });
    setShowForm(true);
  };

  const handleToggleActive = async (c: any) => {
    await supabase.from('charities').update({ active: !c.active }).eq('id', c.id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this charity? This cannot be undone.')) return;
    await supabase.from('charities').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Charity Management</h1>
            <p className="page-subtitle">Add, edit, and manage the platform's charity partners</p>
          </div>
          <button
            id="admin-add-charity-btn"
            className="btn btn-gold"
            onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
          >
            + Add Charity
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={editing ? 'Edit charity' : 'Add charity'}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="heading-3">{editing ? 'Edit Charity' : 'Add New Charity'}</h3>
              <button className="modal-close" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close">✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="grid-2" style={{ gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="charity-name">Charity Name *</label>
                  <input id="charity-name" type="text" className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="charity-emoji">Emoji Icon</label>
                  <input id="charity-emoji" type="text" className="form-input" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="❤️" maxLength={4} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="charity-category">Category</label>
                <input id="charity-category" type="text" className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Healthcare, Environment" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="charity-desc">Description</label>
                <textarea id="charity-desc" className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief charity description..." style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="charity-events">Upcoming Events</label>
                <input id="charity-events" type="text" className="form-input" value={form.events} onChange={(e) => setForm({ ...form, events: e.target.value })} placeholder="e.g. Charity Golf Day - May 2026" />
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input id="charity-active" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} style={{ accentColor: 'var(--clr-primary)' }} />
                <label htmlFor="charity-active" className="form-label" style={{ margin: 0 }}>Active (visible to users)</label>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button id="admin-save-charity-btn" type="submit" className="btn btn-gold" disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : editing ? 'Update Charity' : 'Add Charity'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--r-lg)' }} />
      ) : (
        <div className="grid-3" style={{ gap: 16 }}>
          {charities.length === 0 ? (
            <p className="body-md text-muted" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px 0' }}>
              No charities yet. Add your first charity partner!
            </p>
          ) : (
            charities.map((c) => (
              <div key={c.id} className="charity-card" style={{ cursor: 'default', opacity: c.active ? 1 : 0.55 }}>
                <div className="charity-card-image-placeholder">
                  <span style={{ fontSize: '2.5rem' }} aria-hidden="true">{c.emoji ?? '❤️'}</span>
                </div>
                <div className="charity-card-body">
                  <div className="flex-between" style={{ marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                    {c.category && <span className="badge badge-green">{c.category}</span>}
                    <span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>{c.active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <h3 className="heading-3" style={{ marginBottom: 6, fontSize: '1rem' }}>{c.name}</h3>
                  <p className="body-sm text-muted" style={{ marginBottom: 8 }}>{c.description}</p>
                  {c.events && <p className="body-sm" style={{ color: 'var(--clr-primary-light)', marginBottom: 12 }}>📅 {c.events}</p>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button id={`admin-edit-charity-${c.id}`} className="btn btn-outline btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                    <button id={`admin-toggle-charity-${c.id}`} className="btn btn-ghost btn-sm" onClick={() => handleToggleActive(c)}>
                      {c.active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button id={`admin-delete-charity-${c.id}`} className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
