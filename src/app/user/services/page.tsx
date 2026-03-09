'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ServicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', address: '', phone: '', alternatePhone: '',
    brand: '', category: '', description: '',
  });
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [image1Preview, setImage1Preview] = useState<string | null>(null);
  const [image2Preview, setImage2Preview] = useState<string | null>(null);

  const services = [
    { icon: '❄️', title: 'Refrigerator Repair', description: 'Complete fridge repair and maintenance including compressor replacement, gas refilling, and thermostat fixes.', features: ['Gas Refilling', 'Compressor Repair', 'Cooling Issues', 'Door Seal Replacement'] },
    { icon: '🌬️', title: 'AC Service & Repair', description: 'Professional air conditioner installation, servicing, gas charging, and repair for all brands and models.', features: ['Gas Charging', 'Deep Cleaning', 'Installation', 'PCB Repair'] },
    { icon: '🔄', title: 'Washing Machine', description: 'Expert washing machine repair including motor replacement, drum repair, and control panel fixes.', features: ['Motor Repair', 'Drum Issues', 'Water Leakage', 'Spin Problems'] },
    { icon: '🧊', title: 'Water Cooler', description: 'Water cooler and dispenser repair, maintenance, and installation services for home and office.', features: ['Cooling Repair', 'Tap Replacement', 'Cleaning', 'Installation'] },
    { icon: '🔧', title: 'General Appliances', description: 'Repair and maintenance for microwave, dishwasher, dryer, and other household appliances.', features: ['Microwave', 'Dishwasher', 'Dryer', 'Other Appliances'] },
    { icon: '⚡', title: 'Emergency Service', description: '24/7 emergency repair service for urgent appliance breakdowns. Quick response guaranteed.', features: ['24/7 Available', 'Quick Response', 'Same Day Service', 'All Brands'] },
  ];

  const whyUs = [
    { label: 'Expert Technicians', desc: '10+ years of experience in appliance repair' },
    { label: 'Genuine Parts', desc: 'Only original and certified replacement parts' },
    { label: 'Quick Service', desc: 'Same-day service available for urgent repairs' },
    { label: 'Affordable Pricing', desc: 'Transparent pricing with no hidden charges' },
    { label: '90-Day Warranty', desc: 'Warranty on all repairs and parts installed' },
    { label: 'All Brands', desc: 'Samsung, LG, Whirlpool, and more supported' },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, num: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Image size should be less than 5MB'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (num === 1) { setImage1(file); setImage1Preview(reader.result as string); }
      else           { setImage2(file); setImage2Preview(reader.result as string); }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([k, v]) => submitData.append(k, v));
      if (image1) submitData.append('image1', image1);
      if (image2) submitData.append('image2', image2);
      const response = await fetch('/api/user/addComplaint', { method: 'POST', body: submitData });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('✅ Complaint registered successfully! We will contact you soon.');
        setFormData({ name: '', address: '', phone: '', alternatePhone: '', brand: '', category: '', description: '' });
        setImage1(null); setImage2(null); setImage1Preview(null); setImage2Preview(null);
        setIsModalOpen(false);
      } else {
        alert(`Error: ${data.message || 'Failed to register complaint'}`);
      }
    } catch {
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(0,212,255,0.12)', borderRadius: 2,
    color: '#fff', padding: '11px 14px', fontSize: 13,
    fontFamily: 'Syne, sans-serif', outline: 'none',
    transition: 'border-color 0.2s',
  };

  const field = (label: string, required = false, children: React.ReactNode) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="mono" style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(0,212,255,0.7)' }}>
        {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#050A0F', color: '#fff', fontFamily: "'Syne', sans-serif" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050A0F; }
        ::-webkit-scrollbar-thumb { background: #00D4FF; border-radius: 2px; }

        @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
        @keyframes slideUp  { from { opacity:0; transform:translateY(40px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes spin     { to { transform: rotate(360deg); } }

        .anim-1 { animation: fadeUp 0.6s ease both; }
        .anim-2 { animation: fadeUp 0.6s ease 0.1s both; }
        .anim-3 { animation: fadeUp 0.6s ease 0.2s both; }

        .mono { font-family: 'Space Mono', monospace; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent); }

        .nav-link {
          font-family: 'Space Mono', monospace; font-size: 10px;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(255,255,255,0.45); text-decoration: none;
          position: relative; transition: color 0.2s;
        }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px; background:#00D4FF; transition:width 0.3s; }
        .nav-link:hover { color: #00D4FF; }
        .nav-link:hover::after { width: 100%; }

        .btn-cyan {
          background: #00D4FF; color: #050A0F; border: none;
          font-family: 'Space Mono', monospace; font-size: 10px;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; border-radius: 2px; transition: background 0.2s, box-shadow 0.2s;
        }
        .btn-cyan:hover { background: #33DDFF; box-shadow: 0 0 16px rgba(0,212,255,0.4); }
        .btn-cyan:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: transparent; border: 1px solid rgba(0,212,255,0.2);
          color: rgba(0,212,255,0.8); font-family: 'Space Mono', monospace;
          font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
          cursor: pointer; border-radius: 2px; transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: #00D4FF; background: rgba(0,212,255,0.06); color: #00D4FF; }
        .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

        .card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 2px; transition: border-color 0.25s, transform 0.25s;
        }
        .card:hover { border-color: rgba(0,212,255,0.3); transform: translateY(-2px); }

        .services-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: rgba(0,212,255,0.06); }
        @media (max-width: 900px) { .services-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px) { .services-grid { grid-template-columns: 1fr; } }

        .why-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: rgba(0,212,255,0.06); }
        @media (max-width: 900px) { .why-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px) { .why-grid { grid-template-columns: 1fr; } }

        .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: rgba(0,212,255,0.06); }
        @media (max-width: 768px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }

        .img-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 500px) { .img-grid { grid-template-columns: 1fr; } }

        .cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        .section-pad { padding: 80px 24px; }
        @media (max-width: 600px) { .section-pad { padding: 56px 16px; } }

        input:focus, textarea:focus, select:focus {
          border-color: rgba(0,212,255,0.5) !important;
          box-shadow: 0 0 0 2px rgba(0,212,255,0.08);
        }

        .modal-overlay { animation: fadeIn 0.25s ease both; }
        .modal-box     { animation: slideUp 0.3s ease both; }

        .footer-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        @media (max-width: 600px) { .footer-inner { flex-direction: column; text-align: center; } }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid rgba(0,212,255,0.08)', backdropFilter: 'blur(20px)', background: 'rgba(5,10,15,0.92)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '0.12em', color: '#00D4FF' }}>
              FAST<span style={{ color: 'rgba(255,255,255,0.9)' }}>CHILL</span>
            </span>
          </Link>

          <ul style={{ display: 'flex', gap: 32, listStyle: 'none', margin: 0, padding: 0 }} className="desktop-nav-ul">
            {['Home', 'Shop', 'Services', 'About', 'Contact'].map((item) => (
              <li key={item}>
                <Link href={item === 'Home' ? '/' : item === 'Shop' ? '/user/shop' : `/user/${item.toLowerCase()}`} className="nav-link">{item}</Link>
              </li>
            ))}
          </ul>

          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} className="hamburger-btn" aria-label="Menu">
            <div style={{ width: 22, height: 1, background: '#00D4FF', marginBottom: 5, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
            <div style={{ width: 22, height: 1, background: '#00D4FF', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <div style={{ width: 22, height: 1, background: '#00D4FF', marginTop: 5, transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
          </button>
        </div>

        {menuOpen && (
          <div style={{ padding: '12px 24px 20px', borderTop: '1px solid rgba(0,212,255,0.08)', background: 'rgba(5,10,15,0.98)', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['Home', 'Shop', 'Services', 'About', 'Contact'].map((item) => (
              <Link key={item} href={item === 'Home' ? '/' : item === 'Shop' ? '/user/shop' : `/user/${item.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="nav-link" style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'block' }}>{item}</Link>
            ))}
          </div>
        )}
      </nav>

      <style jsx>{`
        @media (max-width: 768px) { .hamburger-btn { display: block !important; } .desktop-nav-ul { display: none !important; } }
      `}</style>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 60, borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 24px 56px' }}>
          <div className="anim-1" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 24, height: 1, background: '#00D4FF' }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00D4FF' }}>Professional Repair Services</span>
          </div>
          <h1 className="anim-2" style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
            Expert Appliance<br />
            <span style={{ color: '#00D4FF' }}>Repair Services</span>
          </h1>
          <p className="anim-3" style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 480, margin: '0 0 32px', fontWeight: 400 }}>
            Fast, reliable, and affordable repair services for all your home appliances. Certified technicians ready to solve any problem.
          </p>
          <div className="anim-3">
            <button className="btn-cyan" style={{ padding: '14px 32px', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 8 }} onClick={() => setIsModalOpen(true)}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Book a Complaint
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid" style={{ marginTop: 48 }}>
            {[
              { number: '10+', label: 'Years Experience' },
              { number: '5000+', label: 'Happy Customers' },
              { number: '24/7', label: 'Support Available' },
              { number: '100%', label: 'Satisfaction Rate' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#050A0F', padding: '24px 20px' }}>
                <div className="mono" style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color: '#00D4FF', letterSpacing: '-0.02em', marginBottom: 6 }}>{s.number}</div>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="section-pad">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 24, height: 1, background: '#00D4FF' }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00D4FF' }}>Our Services</span>
          </div>

          <div className="services-grid">
            {services.map((s, i) => (
              <div key={i} style={{ background: '#050A0F', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 0 }} className="card">
                <span style={{ fontSize: 28, marginBottom: 20, display: 'block' }}>{s.icon}</span>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em' }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, marginBottom: 20 }}>{s.description}</div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                  {s.features.map((f, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="12" height="12" fill="none" stroke="#00D4FF" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className="btn-ghost" style={{ padding: '10px 0', width: '100%', marginTop: 'auto' }} onClick={() => setIsModalOpen(true)}>
                  Book Now →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── WHY US ── */}
      <section className="section-pad">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 24, height: 1, background: '#00D4FF' }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00D4FF' }}>Why Choose Us</span>
          </div>

          <div className="why-grid">
            {whyUs.map((item, i) => (
              <div key={i} className="card" style={{ background: '#050A0F', padding: '28px 24px' }}>
                <div style={{ width: 28, height: 28, border: '1px solid rgba(0,212,255,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <svg width="12" height="12" fill="none" stroke="#00D4FF" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.01em' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── ABOUT ── */}
      <section className="section-pad">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 24, height: 1, background: '#00D4FF' }} />
            <span className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00D4FF' }}>About Our Shop</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }} className="about-grid">
            {/* Image placeholder */}
            <div style={{ position: 'relative', aspectRatio: '4/3', background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -1, left: -1, width: 16, height: 16, borderTop: '2px solid #00D4FF', borderLeft: '2px solid #00D4FF' }} />
              <div style={{ position: 'absolute', bottom: -1, right: -1, width: 16, height: 16, borderBottom: '2px solid #00D4FF', borderRight: '2px solid #00D4FF' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(0,212,255,0.2)' }}>SHOP IMAGE</span>
              </div>
            </div>

            {/* Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.0, letterSpacing: '-0.02em', margin: 0 }}>
                Your Trusted<br /><span style={{ color: '#00D4FF' }}>Repair Partner</span>
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, margin: 0 }}>
                FAST CHILL has been serving the community for over 10 years with expert appliance repair and genuine parts. Our team of certified technicians is trained to handle all major brands and models with precision.
              </p>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, margin: 0 }}>
                We understand how important your appliances are to your daily life. That's why we offer quick, reliable service with transparent pricing and quality workmanship.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 8 }}>
                {[{ stat: 'Certified', sub: 'Technicians' }, { stat: 'Genuine', sub: 'Parts Only' }].map((x, i) => (
                  <div key={i} style={{ border: '1px solid rgba(0,212,255,0.12)', borderRadius: 2, padding: '16px' }}>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: '#00D4FF', marginBottom: 4 }}>{x.stat}</div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{x.sub}</div>
                  </div>
                ))}
              </div>

              <div>
                <button className="btn-cyan" style={{ padding: '14px 32px', fontSize: 11 }} onClick={() => setIsModalOpen(true)}>
                  Get Service Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 768px) {
          .about-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
      `}</style>

      <div className="divider" />

      {/* ── CTA ── */}
      <section className="section-pad">
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ border: '1px solid rgba(0,212,255,0.15)', borderRadius: 2, padding: '48px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -1, left: -1, width: 20, height: 20, borderTop: '2px solid #00D4FF', borderLeft: '2px solid #00D4FF' }} />
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderBottom: '2px solid #00D4FF', borderRight: '2px solid #00D4FF' }} />
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00D4FF', marginBottom: 16 }}>24/7 Emergency Service</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 12px' }}>Need Urgent Repair?</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, marginBottom: 32 }}>
              Our technicians are available 24/7 for emergency services.
            </p>
            <div className="cta-row">
              <button className="btn-cyan" style={{ padding: '13px 28px', fontSize: 11 }} onClick={() => setIsModalOpen(true)}>
                Book Complaint
              </button>
              <a href="tel:+919876543210" className="btn-ghost" style={{ padding: '13px 28px', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 10 }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ── FOOTER ── */}
      <footer style={{ padding: '32px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }} className="footer-inner">
          <span className="mono" style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.12em', color: '#00D4FF' }}>
            FAST<span style={{ color: 'rgba(255,255,255,0.7)' }}>CHILL</span>
          </span>
          <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em' }}>© 2025 FASTCHILL · ALL RIGHTS RESERVED</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" className="nav-link" style={{ textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── MODAL ── */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) setIsModalOpen(false); }}
        >
          <div
            className="modal-box"
            style={{ background: '#050A0F', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 2, maxWidth: 720, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
          >
            {/* Corner accents */}
            <div style={{ position: 'absolute', top: -1, left: -1, width: 20, height: 20, borderTop: '2px solid #00D4FF', borderLeft: '2px solid #00D4FF' }} />
            <div style={{ position: 'absolute', bottom: -1, right: -1, width: 20, height: 20, borderBottom: '2px solid #00D4FF', borderRight: '2px solid #00D4FF' }} />

            {/* Modal header */}
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(0,212,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#00D4FF', marginBottom: 8 }}>Service Request</div>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Book Your Complaint</h3>
              </div>
              <button
                onClick={() => !isSubmitting && setIsModalOpen(false)}
                disabled={isSubmitting}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s, color 0.2s' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: 32 }}>

              {/* Personal Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,212,255,0.5)', paddingBottom: 12, borderBottom: '1px solid rgba(0,212,255,0.08)' }}>Personal Details</div>
                <div className="form-row">
                  {field('Full Name', true,
                    <input type="text" required value={formData.name} disabled={isSubmitting}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your name" style={inputStyle} />
                  )}
                  {field('Address', true,
                    <input type="text" required value={formData.address} disabled={isSubmitting}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="Your address" style={inputStyle} />
                  )}
                </div>
                <div className="form-row">
                  {field('Primary Phone', true,
                    <input type="tel" required value={formData.phone} disabled={isSubmitting}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="+91 98765 43210" style={inputStyle} />
                  )}
                  {field('Alternate Phone',false,
                    <input type="tel" value={formData.alternatePhone} disabled={isSubmitting}
                      onChange={e => setFormData({...formData, alternatePhone: e.target.value})}
                      placeholder="Optional" style={inputStyle} />
                  )}
                </div>
              </div>

              {/* Appliance Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="mono" style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,212,255,0.5)', paddingBottom: 12, borderBottom: '1px solid rgba(0,212,255,0.08)' }}>Appliance Details</div>
                <div className="form-row">
                  {field('Brand', true,
                    <input type="text" required value={formData.brand} disabled={isSubmitting}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      placeholder="e.g., Samsung, LG" style={inputStyle} />
                  )}
                  {field('Category', true,
                    <select required value={formData.category} disabled={isSubmitting}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }}>
                      <option value="">Select category</option>
                      {['Refrigerator','Air Conditioner','Washing Machine','Water Cooler','Microwave','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                </div>
                {field('Problem Description', true,
                  <textarea required value={formData.description} disabled={isSubmitting} rows={4}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the issue you're facing..."
                    style={{ ...inputStyle, resize: 'none' }} />
                )}
              </div>

              {/* Images */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(0,212,255,0.5)', paddingBottom: 12, borderBottom: '1px solid rgba(0,212,255,0.08)', marginBottom: 4 }}>Upload Images</div>
                  <div className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', paddingTop: 8 }}>Optional · Max 5MB per image</div>
                </div>
                <div className="img-grid">
                  {([1, 2] as const).map((num) => {
                    const preview = num === 1 ? image1Preview : image2Preview;
                    return (
                      <div key={num}>
                        <input type="file" accept="image/*" id={`image${num}`} className={`img-input-${num}`}
                          onChange={e => handleImageChange(e, num)} disabled={isSubmitting}
                          style={{ display: 'none' }} />
                        <label htmlFor={`image${num}`} style={{
                          display: 'block', aspectRatio: '4/3',
                          border: '1px dashed rgba(0,212,255,0.2)', borderRadius: 2,
                          overflow: 'hidden', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          transition: 'border-color 0.2s', position: 'relative',
                        }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)')}
                        >
                          {preview ? (
                            <img src={preview} alt={`Preview ${num}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
                              <svg width="24" height="24" fill="none" stroke="rgba(0,212,255,0.4)" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                              <span className="mono" style={{ fontSize: 9, letterSpacing: '0.15em', color: 'rgba(0,212,255,0.4)' }}>IMAGE {num}</span>
                            </div>
                          )}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button type="button" className="btn-ghost" disabled={isSubmitting}
                  onClick={() => !isSubmitting && setIsModalOpen(false)}
                  style={{ flex: 1, padding: '13px 0', fontSize: 10 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-cyan" disabled={isSubmitting}
                  style={{ flex: 2, padding: '13px 0', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {isSubmitting ? (
                    <>
                      <div style={{ width: 14, height: 14, border: '2px solid rgba(5,10,15,0.3)', borderTop: '2px solid #050A0F', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                      Submitting...
                    </>
                  ) : 'Submit Complaint →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}