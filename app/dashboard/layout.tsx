'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
 { href: '/dashboard', label: 'Overview', icon: '' },
 { href: '/dashboard/scores', label: 'My Scores', icon: '' },
 { href: '/dashboard/draws', label: 'Draws & Prizes', icon: '' },
 { href: '/dashboard/charity', label: 'My Charity', icon: '' },
 { href: '/dashboard/winnings', label: 'Winnings', icon: '�' },
 { href: '/dashboard/subscription', label: 'Subscription', icon: '�' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const router = useRouter();
 const [user, setUser] = useState<any>(null);
 const [profile, setProfile] = useState<any>(null);
 const [sidebarOpen, setSidebarOpen] = useState(false);

 useEffect(() => {
 const supabase = createClient();
 supabase.auth.getUser().then(async ({ data }) => {
 if (!data.user) { router.push('/auth/login'); return; }
 setUser(data.user);
 const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
 setProfile(p);
 });
 }, [router]);

 const handleSignOut = async () => {
 const supabase = createClient();
 await supabase.auth.signOut();
 router.push('/');
 };

 const initials = profile?.full_name
 ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
 : user?.email?.[0]?.toUpperCase() ?? '?';

 return (
 <div className="dashboard-layout">
 {/* Mobile overlay */}
 {sidebarOpen && (
 <div
 onClick={() => setSidebarOpen(false)}
 style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 49 }}
 />
 )}

 {/* Sidebar */}
 <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} role="navigation" aria-label="Dashboard navigation">
 <div className="sidebar-logo">
 <div className="sidebar-logo-icon" aria-hidden="true"></div>
 <Link href="/" style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.1rem' }}>GolfGives</Link>
 </div>

 <nav className="sidebar-nav">
 <p className="sidebar-section-label">Menu</p>
 {NAV_ITEMS.map((item) => (
 <Link
 key={item.href}
 href={item.href}
 className={`sidebar-link${pathname === item.href ? ' active' : ''}`}
 onClick={() => setSidebarOpen(false)}
 aria-current={pathname === item.href ? 'page' : undefined}
>
 <span aria-hidden="true">{item.icon}</span>
 {item.label}
 </Link>
 ))}
 </nav>

 <div className="sidebar-footer">
 <div className="sidebar-user">
 <div className="sidebar-avatar" aria-hidden="true">{initials}</div>
 <div className="sidebar-user-info">
 <div className="sidebar-user-name truncate">{profile?.full_name ?? user?.email ?? 'Loading...'}</div>
 <div className="sidebar-user-role">
 {profile?.subscription_status === 'active' ? ' Active Member' : ' Not subscribed'}
 </div>
 </div>
 </div>
 <button
 id="dashboard-signout-btn"
 className="btn btn-ghost btn-sm btn-full"
 onClick={handleSignOut}
 style={{ marginTop: 8, justifyContent: 'flex-start', color: 'var(--clr-danger)' }}
>
 Sign Out
 </button>
 </div>
 </aside>

 {/* Main */}
 <div className="main-content">
 {/* Mobile top bar */}
 <div style={{
 display: 'none', alignItems: 'center', justifyContent: 'space-between',
 marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--clr-border)',
 }} id="dashboard-mobile-bar">
 <div className="nav-logo">
 <div className="nav-logo-icon"></div>
 <span>GolfGives</span>
 </div>
 <button
 className="btn btn-ghost btn-sm"
 onClick={() => setSidebarOpen(true)}
 aria-label="Open navigation"
 id="dashboard-mobile-menu-btn"
>
 
 </button>
 </div>
 <style>{`
 @media (max-width: 1024px) {
 #dashboard-mobile-bar { display: flex !important; }
 }
 `}</style>

 {children}
 </div>
 </div>
 );
}
