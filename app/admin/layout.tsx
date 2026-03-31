'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/draws', label: 'Draw Management', icon: '🎱' },
  { href: '/admin/charities', label: 'Charities', icon: '❤️' },
  { href: '/admin/winners', label: 'Winners', icon: '🏆' },
  { href: '/admin/reports', label: 'Reports', icon: '📈' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/auth/login'); return; }
      const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
      if (p?.role !== 'admin') { router.push('/dashboard'); return; }
      setAdminUser(data.user);
      setChecking(false);
    });
  }, [router]);

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p className="body-sm text-muted" style={{ marginTop: 16 }}>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar" role="navigation" aria-label="Admin navigation">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-hidden="true">⚙️</div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1rem' }}>Admin Panel</span>
        </div>

        <div style={{ marginBottom: 16, padding: '8px 14px', background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.2)', borderRadius: 'var(--r-md)' }}>
          <span className="label" style={{ color: 'var(--clr-danger)' }}>🔐 Admin Access</span>
        </div>

        <nav className="sidebar-nav">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${pathname === item.href ? ' active' : ''}`}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="divider" style={{ marginBottom: 12 }} />
          <Link href="/dashboard" className="sidebar-link">
            <span aria-hidden="true">👤</span>
            My Dashboard
          </Link>
          <Link href="/" className="sidebar-link">
            <span aria-hidden="true">🌐</span>
            Back to Site
          </Link>
        </div>
      </aside>

      <div className="main-content">
        {children}
      </div>
    </div>
  );
}
