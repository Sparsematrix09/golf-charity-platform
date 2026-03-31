'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';

export default function CharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('charities').select('*').eq('active', true).order('name');
      setCharities(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  const categories = ['All', ...Array.from(new Set(charities.map((c) => c.category).filter(Boolean)))];

  const filtered = charities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = category === 'All' || c.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: 100, paddingBottom: 80, minHeight: '100vh', background: 'var(--clr-bg)' }}>
        <div className="container">
          {/* Header */}
          <div className="section-header" style={{ marginBottom: 'var(--sp-2xl)' }}>
            <div className="section-tag">Make an Impact</div>
            <h1 className="heading-1" style={{ margin: '12px 0 16px' }}>Our Charity Partners</h1>
            <p className="body-lg text-muted" style={{ maxWidth: 640, margin: '0 auto' }}>
              We partner with incredible organisations making a real difference. Choose where your subscription contribution goes, or make an independent donation anytime.
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
            <input
              type="search"
              className="form-input"
              placeholder="Search charities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ maxWidth: 320 }}
              aria-label="Search charities"
            />
            <div className="tabs" role="tablist" aria-label="Filter by category">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`tab-btn${category === cat ? ' active' : ''}`}
                  onClick={() => setCategory(cat as string)}
                  role="tab"
                  aria-selected={category === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid-3" style={{ gap: 'var(--sp-lg)' }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 320, borderRadius: 'var(--r-lg)' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--sp-3xl)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }} aria-hidden="true">🔍</div>
              <h2 className="heading-3" style={{ marginBottom: 8 }}>No charities found</h2>
              <p className="body-sm text-muted">Try adjusting your search or category filter.</p>
              <button className="btn btn-outline btn-sm" onClick={() => { setSearch(''); setCategory('All'); }} style={{ marginTop: 16 }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid-3" style={{ gap: 'var(--sp-lg)' }}>
              {filtered.map((c) => (
                <div key={c.id} className="charity-card" style={{ cursor: 'default' }}>
                  <div className="charity-card-image-placeholder">
                    <span style={{ fontSize: '4rem' }} aria-hidden="true">{c.emoji ?? '❤️'}</span>
                  </div>
                  <div className="charity-card-body">
                    <div className="flex-between" style={{ marginBottom: 12 }}>
                      <span className="badge badge-green">{c.category ?? 'General'}</span>
                    </div>
                    <h3 className="heading-3" style={{ marginBottom: 8 }}>{c.name}</h3>
                    <p className="body-sm text-muted">{c.description}</p>
                    
                    {c.events && (
                      <div style={{ marginTop: 16, padding: 12, background: 'rgba(26,122,82,0.05)', borderRadius: 'var(--r-md)', border: '1px solid rgba(26,122,82,0.1)' }}>
                        <div className="label text-faint" style={{ color: 'var(--clr-primary-light)', marginBottom: 4 }}>Upcoming Event</div>
                        <div className="body-sm text-muted">{c.events}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to action */}
          <div className="card" style={{ marginTop: 64, textAlign: 'center', background: 'linear-gradient(135deg, var(--clr-primary-dark), var(--clr-bg-2))' }}>
            <h2 className="heading-2" style={{ marginBottom: 12 }}>Support these causes today</h2>
            <p className="body-lg text-muted" style={{ maxWidth: 480, margin: '0 auto 24px' }}>
              Subscribe and specify which charity receives a portion of your monthly or annual fee.
            </p>
            <a href="/subscribe" className="btn btn-gold btn-lg">Choose Plan & Charity</a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
