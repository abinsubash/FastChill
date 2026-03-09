'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const shopImage = '/placeholder-shop.jpg';

  return (
    <div className="min-h-screen bg-[#050A0F] text-white">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Syne', sans-serif;
          background: #050A0F;
          color: #fff;
        }

        .mono { font-family: 'Space Mono', monospace; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050A0F; }
        ::-webkit-scrollbar-thumb { background: #00D4FF; border-radius: 2px; }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
        @keyframes borderRun {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .anim-1 { animation: fadeUp 0.7s ease both; }
        .anim-2 { animation: fadeUp 0.7s ease 0.1s both; }
        .anim-3 { animation: fadeUp 0.7s ease 0.2s both; }
        .anim-4 { animation: fadeUp 0.7s ease 0.3s both; }
        .anim-5 { animation: fadeUp 0.7s ease 0.4s both; }

        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent);
          animation: scanLine 4s linear infinite;
          pointer-events: none;
        }

        .glow-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #00D4FF;
          box-shadow: 0 0 12px #00D4FF, 0 0 24px #00D4FF;
          animation: glow 2s ease-in-out infinite;
          display: inline-block;
        }

        /* Thin border card with running highlight */
        .card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(0,212,255,0.12);
          border-radius: 2px;
          transition: border-color 0.3s, background 0.3s, transform 0.3s;
        }
        .card:hover {
          border-color: rgba(0,212,255,0.4);
          background: rgba(0,212,255,0.04);
          transform: translateY(-2px);
        }

        /* Nav */
        .nav-link {
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          transition: color 0.2s;
          position: relative;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 1px;
          background: #00D4FF;
          transition: width 0.3s;
        }
        .nav-link:hover { color: #00D4FF; }
        .nav-link:hover::after { width: 100%; }

        /* Buttons */
        .btn-primary {
          background: #00D4FF;
          color: #050A0F;
          border: none;
          padding: 12px 28px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 700;
          cursor: pointer;
          border-radius: 2px;
          transition: background 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          background: #33DDFF;
          box-shadow: 0 0 20px rgba(0,212,255,0.4);
        }

        .btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 12px 28px;
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 400;
          cursor: pointer;
          border-radius: 2px;
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-ghost:hover {
          border-color: rgba(0,212,255,0.5);
          color: #00D4FF;
        }

        /* Divider */
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent);
        }

        /* Horizontal rule label */
        .section-label {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #00D4FF;
        }

        /* Image overlay */
        .img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,212,255,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Corner accents */
        .corner-tl, .corner-br {
          position: absolute;
          width: 16px; height: 16px;
          pointer-events: none;
        }
        .corner-tl {
          top: -1px; left: -1px;
          border-top: 2px solid #00D4FF;
          border-left: 2px solid #00D4FF;
        }
        .corner-br {
          bottom: -1px; right: -1px;
          border-bottom: 2px solid #00D4FF;
          border-right: 2px solid #00D4FF;
        }

        /* Grid noise */
        .noise-bg {
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='none'/%3E%3Cline x1='0' y1='60' x2='60' y2='0' stroke='rgba(0,212,255,0.03)' stroke-width='0.5'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        /* Mobile menu */
        .mobile-menu {
          display: none;
        }
        @media (max-width: 768px) {
          .mobile-menu.open { display: flex; }
          .desktop-nav { display: none; }
        }

        /* Responsive grid helpers */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        .parts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
        }
        @media (max-width: 900px) {
          .parts-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 500px) {
          .parts-grid { grid-template-columns: 1fr; }
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
        }
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr; }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        /* Padding helper */
        .section-pad { padding: 80px 24px; }
        @media (max-width: 600px) { .section-pad { padding: 56px 20px; } }

        /* Hero heading */
        .hero-h1 {
          font-size: clamp(36px, 6vw, 72px);
          font-weight: 800;
          line-height: 1.0;
          letter-spacing: -0.02em;
        }

        /* Badge */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border: 1px solid rgba(0,212,255,0.25);
          border-radius: 2px;
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,212,255,0.8);
        }

        /* Part card emoji */
        .part-icon {
          font-size: 28px;
          display: block;
          margin-bottom: 16px;
          filter: grayscale(0.3);
        }

        /* Stat number */
        .stat-num {
          font-family: 'Space Mono', monospace;
          font-size: clamp(22px, 4vw, 30px);
          font-weight: 700;
          color: #00D4FF;
          letter-spacing: -0.02em;
        }

        /* Verified chip */
        .verified-chip {
          position: absolute;
          bottom: 20px; left: 20px; right: 20px;
          background: rgba(5,10,15,0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 2px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
      `}</style>

      {/* Background grid */}
      <div className="noise-bg" />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        borderBottom: '1px solid rgba(0,212,255,0.08)',
        backdropFilter: 'blur(20px)',
        background: 'rgba(5,10,15,0.9)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', color: '#00D4FF' }}>
              FAST<span style={{ color: 'rgba(255,255,255,0.9)' }}>CHILL</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="desktop-nav" style={{ display: 'flex', gap: 36, listStyle: 'none', alignItems: 'center' }}>
            {['Home', 'Shop', 'Services', 'About', 'Contact'].map((item) => (
              <li key={item}>
                <Link
                  href={item === 'Home' ? '/' : `/user/${item.toLowerCase()}`}
                  className="nav-link"
                  style={{ textDecoration: 'none' }}
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            className="hamburger-btn"
            aria-label="Toggle menu"
          >
            <div style={{ width: 22, height: 1, background: menuOpen ? '#00D4FF' : 'rgba(255,255,255,0.7)', marginBottom: 5, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
            <div style={{ width: 22, height: 1, background: menuOpen ? 'transparent' : 'rgba(255,255,255,0.7)', transition: 'all 0.2s', opacity: menuOpen ? 0 : 1 }} />
            <div style={{ width: 22, height: 1, background: menuOpen ? '#00D4FF' : 'rgba(255,255,255,0.7)', marginTop: 5, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        <div style={{
          display: menuOpen ? 'flex' : 'none',
          flexDirection: 'column',
          padding: '16px 24px 20px',
          gap: 8,
          borderTop: '1px solid rgba(0,212,255,0.08)',
          background: 'rgba(5,10,15,0.98)',
        }}>
          {['Home', 'Shop', 'Services', 'About', 'Contact'].map((item) => (
            <Link
              key={item}
              href={item === 'Home' ? '/' : `/user/${item.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: 11, letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              {item}
            </Link>
          ))}
        </div>
      </nav>

      {/* Hamburger btn show on mobile via inline style override */}
      <style jsx>{`
        @media (max-width: 768px) {
          .hamburger-btn { display: block !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 60 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }} className="section-pad">
          <div className="hero-grid">

            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div className="anim-1">
                <span className="badge">
                  <span className="glow-dot" />
                  Authorized Dealer · Genuine Parts
                </span>
              </div>

              <h1 className="hero-h1 anim-2">
                Your Cooling<br />
                <span style={{ color: '#00D4FF' }}>Solution</span><br />
                Hub
              </h1>

              <p className="anim-3" style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 420, fontWeight: 400 }}>
                Expert in refrigerator, AC, washing machine, and appliance parts. Fast service, genuine components, trusted by thousands.
              </p>

              <div className="anim-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn-primary">Shop Now</button>
                <button className="btn-ghost">Contact Us</button>
              </div>

              <div className="anim-5 stats-grid" style={{ marginTop: 12 }}>
                {[
                  { number: '5000+', label: 'Parts Available' },
                  { number: '10+', label: 'Years Experience' },
                  { number: '24/7', label: 'Support' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span className="stat-num">{s.number}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — image */}
            <div className="anim-3" style={{ position: 'relative' }}>
              <div style={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(0,212,255,0.15)' }}>
                <div className="corner-tl" />
                <div className="corner-br" />
                <div className="scan-line" />

                <div style={{ position: 'relative', aspectRatio: '4/3', width: '100%', background: 'rgba(0,212,255,0.04)' }}>
                  <Image
                    src={shopImage}
                    alt="FAST CHILL Shop"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="img-overlay" />
                </div>

                <div className="verified-chip">
                  <div style={{ width: 32, height: 32, borderRadius: 2, background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" fill="none" stroke="#00D4FF" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="mono" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#fff' }}>AUTHORIZED DEALER</div>
                    <div className="mono" style={{ fontSize: 10, color: 'rgba(0,212,255,0.7)', letterSpacing: '0.08em' }}>100% Genuine Parts</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── PARTS ── */}
      <section className="section-pad">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
            <div style={{ width: 24, height: 1, background: '#00D4FF' }} />
            <span className="section-label">Parts We Supply</span>
          </div>

          <div className="parts-grid" style={{ background: 'rgba(0,212,255,0.06)' }}>
            {[
              { name: 'Refrigerator', icon: '❄️', items: 'Compressors, Thermostats, Fans' },
              { name: 'Air Conditioner', icon: '🌬️', items: 'Condensers, Filters, Remotes' },
              { name: 'Washing Machine', icon: '🔄', items: 'Motors, Pumps, Control Boards' },
              { name: 'All Appliances', icon: '⚡', items: 'Universal Parts & Tools' },
            ].map((p, i) => (
              <div key={i} className="card" style={{ padding: '32px 24px' }}>
                <span className="part-icon">{p.icon}</span>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, marginBottom: 20 }}>{p.items}</div>
                <a href="#" style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#00D4FF', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Browse <span style={{ fontSize: 14 }}>→</span>
                </a>
              </div>
            ))}
          </div>

        </div>
      </section>

      <div className="divider" />

      {/* ── FEATURES ── */}
      <section className="section-pad">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
            <div style={{ width: 24, height: 1, background: '#00D4FF' }} />
            <span className="section-label">Why Choose Us</span>
          </div>

          <div className="features-grid" style={{ background: 'rgba(0,212,255,0.06)' }}>
            {[
              { title: 'Fast Delivery', desc: 'Same-day delivery for local orders. Next-day nationwide.', icon: (
                <svg width="18" height="18" fill="none" stroke="#00D4FF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )},
              { title: 'Quality Assured', desc: 'All parts tested, certified, and backed by warranty.', icon: (
                <svg width="18" height="18" fill="none" stroke="#00D4FF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { title: 'Expert Support', desc: 'Technical guidance available any time, any day.', icon: (
                <svg width="18" height="18" fill="none" stroke="#00D4FF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )},
            ].map((f, i) => (
              <div key={i} className="card" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: 36, height: 36, border: '1px solid rgba(0,212,255,0.25)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <div className="divider" />

      {/* ── FOOTER ── */}
      <footer style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <span className="mono" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', color: '#00D4FF' }}>
            FAST<span style={{ color: 'rgba(255,255,255,0.7)' }}>CHILL</span>
          </span>

          <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            © 2025 FASTCHILL · ALL RIGHTS RESERVED
          </div>

          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Contact'].map((l, i) => (
              <a key={i} href="#" className="nav-link" style={{ textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}