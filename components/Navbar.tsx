'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
 const [scrolled, setScrolled] = useState(false);
 const [menuOpen, setMenuOpen] = useState(false);
 const [user, setUser] = useState<any>(null);

 useEffect(() => {
 const onScroll = () => setScrolled(window.scrollY > 20);
 window.addEventListener('scroll', onScroll);
 return () => window.removeEventListener('scroll', onScroll);
 }, []);

 useEffect(() => {
 const supabase = createClient();
 supabase.auth.getUser().then(({ data }) => setUser(data.user));
 const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
 setUser(session?.user ?? null);
 });
 return () => listener.subscription.unsubscribe();
 }, []);

 return (
 <nav className={`nav${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
 <div className="container">
 <div className="nav-inner">
 <Link href="/" className="nav-logo" aria-label="GolfGives home">
 <div className="nav-logo-icon" aria-hidden="true"></div>
 <span>GolfGives</span>
 </Link>

 <div className="nav-links" role="menubar">
 <Link href="/#how-it-works" className="nav-link" role="menuitem">How It Works</Link>
 <Link href="/charities" className="nav-link" role="menuitem">Charities</Link>
 <Link href="/#prizes" className="nav-link" role="menuitem">Prizes</Link>
 <Link href="/subscribe" className="nav-link" role="menuitem">Pricing</Link>
 </div>

 <div className="nav-actions">
 {user ? (
 <>
 <Link href="/dashboard" className="btn btn-outline btn-sm" id="nav-dashboard-btn">
 Dashboard
 </Link>
 </>
 ) : (
 <>
 <Link href="/auth/login" className="btn btn-ghost btn-sm" id="nav-login-btn">
 Sign In
 </Link>
 <Link href="/subscribe" className="btn btn-gold btn-sm" id="nav-subscribe-btn">
 Subscribe
 </Link>
 </>
 )}
 </div>

 <button
 className="nav-mobile-toggle"
 onClick={() => setMenuOpen(!menuOpen)}
 aria-label={menuOpen ? 'Close menu' : 'Open menu'}
 aria-expanded={menuOpen}
 id="nav-mobile-toggle"
 >
 <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : undefined }} />
 <span style={{ opacity: menuOpen ? 0 : 1 }} />
 <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : undefined }} />
 </button>
 </div>

 {menuOpen && (
 <div className="card" style={{ marginTop: 8, padding: '12px 0' }}>
 <Link href="/#how-it-works" className="sidebar-link" onClick={() => setMenuOpen(false)}>How It Works</Link>
 <Link href="/charities" className="sidebar-link" onClick={() => setMenuOpen(false)}>Charities</Link>
 <Link href="/#prizes" className="sidebar-link" onClick={() => setMenuOpen(false)}>Prizes</Link>
 <Link href="/subscribe" className="sidebar-link" onClick={() => setMenuOpen(false)}>Pricing</Link>
 <div className="divider" style={{ margin: '8px 14px' }} />
 {user ? (
 <Link href="/dashboard" className="sidebar-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
 ) : (
 <>
 <Link href="/auth/login" className="sidebar-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
 <Link href="/subscribe" className="sidebar-link" style={{ color: 'var(--clr-gold)' }} onClick={() => setMenuOpen(false)}>Subscribe Now</Link>
 </>
 )}
 </div>
 )}
 </div>
 </nav>
 );
}
