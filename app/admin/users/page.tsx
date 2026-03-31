'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*, subscriptions(*), golf_scores(*), charities(name)')
      .order('created_at', { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from('profiles').update({
      full_name: editUser.full_name,
      charity_pct: editUser.charity_pct,
    }).eq('id', editUser.id);
    setSaving(false);
    setEditUser(null);
    load();
  };

  const statusBadge = (u: any) => {
    const sub = u.subscriptions?.[0];
    if (!sub) return <span className="badge badge-grey">No subscription</span>;
    if (sub.status === 'active') return <span className="badge badge-green">Active</span>;
    if (sub.status === 'canceled') return <span className="badge badge-red">Cancelled</span>;
    return <span className="badge badge-grey">{sub.status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">View and manage all platform members</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          id="admin-user-search"
          type="search"
          className="form-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
          aria-label="Search users"
        />
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--r-lg)' }} />
      ) : (
        <div className="table-wrapper">
          <table className="data-table" aria-label="Users table">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col">Subscription</th>
                <th scope="col">Scores</th>
                <th scope="col">Charity</th>
                <th scope="col">Charity %</th>
                <th scope="col">Joined</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--clr-text-muted)' }}>No users found</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="sidebar-avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {u.full_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.full_name ?? '—'}</div>
                          <div className="body-sm text-faint">{u.email ?? u.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td>{statusBadge(u)}</td>
                    <td>
                      <span className={`badge ${(u.golf_scores?.length ?? 0) === 5 ? 'badge-green' : 'badge-grey'}`}>
                        {u.golf_scores?.length ?? 0}/5
                      </span>
                    </td>
                    <td className="body-sm text-muted">{u.charities?.name ?? '—'}</td>
                    <td>{u.charity_pct ?? 10}%</td>
                    <td className="body-sm text-muted">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td>
                      <button
                        id={`admin-edit-user-${u.id}`}
                        className="btn btn-outline btn-sm"
                        onClick={() => setEditUser({ ...u })}
                        aria-label={`Edit ${u.full_name ?? 'user'}`}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Edit user">
          <div className="modal">
            <div className="modal-header">
              <h3 className="heading-3">Edit User</h3>
              <button className="modal-close" onClick={() => setEditUser(null)} aria-label="Close">✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-user-name">Full Name</label>
                <input
                  id="edit-user-name"
                  type="text"
                  className="form-input"
                  value={editUser.full_name ?? ''}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-user-charity-pct">Charity Contribution %</label>
                <input
                  id="edit-user-charity-pct"
                  type="number"
                  min={10}
                  max={100}
                  className="form-input"
                  value={editUser.charity_pct ?? 10}
                  onChange={(e) => setEditUser({ ...editUser, charity_pct: parseInt(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button id="admin-save-user-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
                </button>
                <button className="btn btn-ghost" onClick={() => setEditUser(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
