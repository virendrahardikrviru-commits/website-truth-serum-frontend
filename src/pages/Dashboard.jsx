import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/auth';
import FullLogo from '../components/FullLogo';

export default function Dashboard({ user, onLogin, onLogout }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

                const fetchScans = async () => {
      const { data, error } = await supabase
        .from('scan_reports')
        .select('*')
        .eq('user_id', user.id) // Only fetch scans for THIS user
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch Error:", error);
      }

      if (!error && data) {
        const formattedScans = data.map(item => ({
          id: item.id,
          domain: item.domain,
          date: item.created_at,
          score: item.report?.trust_score || 0,
          category: item.report?.category || 'Unknown',
          scanId: item.scan_id
        }));
        setScans(formattedScans);
      }
      setLoading(false);
    };

    fetchScans();
  }, [user]);

  return (
    <div className="wts-landing">
      {/* Injecting the critical CSS so the dashboard doesn't break */}
      <style>{`
        :root {
          --bg-main: #f8fafc;
          --bg-card: #ffffff;
          --border-default: #e2e8f0;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #94a3b8;
          --accent-primary-dark: #00c24d;
          --accent-gradient: linear-gradient(135deg,#00FF66 0%,#4f46e5 100%);
          --font-heading: 'Plus Jakarta Sans',sans-serif;
          --font-body: 'Inter',sans-serif;
        }
        .wts-landing *{margin:0;padding:0;box-sizing:border-box}
        .wts-landing{font-family:var(--font-body);background:var(--bg-main);color:var(--text-primary);line-height:1.6;-webkit-font-smoothing:antialiased; min-height: 100vh; display: flex; flex-direction: column;}
        .wts-landing h1,.wts-landing h2,.wts-landing h3,.wts-landing h4{font-family:var(--font-heading);line-height:1.15;letter-spacing:-0.02em}
        .container{max-width:1200px;margin:0 auto;padding:0 24px; width: 100%;}
        
        /* Header CSS */
        .site-header{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,250,252,.75);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(226,232,240,.8);transition:box-shadow .3s}
        .site-header.scrolled{box-shadow:0 4px 24px rgba(15,23,42,.06)}
        .header-inner{display:flex;align-items:center;justify-content:space-between;height:68px}
        .logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text-primary);font-family:var(--font-heading);font-weight:800;font-size:17px;cursor:pointer}
        .logo-mark{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--accent-gradient);box-shadow:0 4px 14px rgba(0,255,102,.35)}
        .logo-mark svg{width:18px;height:18px}
        .nav-links{display:flex;gap:32px;list-style:none}
        .nav-links a{text-decoration:none;color:var(--text-secondary);font-size:14.5px;font-weight:500;transition:color .2s}
        .nav-links a:hover{color:var(--text-primary)}
        .btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-body);font-weight:600;font-size:15px;border:none;cursor:pointer;text-decoration:none;border-radius:999px;padding:12px 26px;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s}
        .btn-gradient{background:var(--accent-gradient);color:#04120a;box-shadow:0 6px 20px rgba(0,255,102,.35)}
        .btn-gradient:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,255,102,.45)}
        .btn-sm{padding:9px 20px;font-size:14px}
        .btn-ghost{background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-default)}
        .btn-ghost:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(15,23,42,.08)}
        
        /* Mobile CSS */
        .mobile-menu-btn{display:none;background:none;border:none;cursor:pointer;padding:8px}
        .mobile-nav{display:none}
        @media (max-width:768px){
          .nav-links,.header-cta{display:none}
          .mobile-menu-btn{display:block}
          .mobile-nav{display:none;flex-direction:column;gap:4px;padding:12px 24px 20px;background:rgba(248,250,252,.97);border-bottom:1px solid var(--border-default)}
          .mobile-nav.open{display:flex}
          .mobile-nav a{text-decoration:none;color:var(--text-secondary);font-weight:500;padding:10px 0;font-size:15px}
        }
        
        /* Footer CSS */
        .site-footer{border-top:1px solid var(--border-default);padding:56px 0 32px;background:var(--bg-card); margin-top: auto;}
        .footer-grid{display:grid;grid-template-columns:1.4fr repeat(4,1fr);gap:32px;margin-bottom:48px}
        .footer-brand p{font-size:13.5px;color:var(--text-muted);margin-top:14px;max-width:240px}
        .footer-col h4{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-primary);margin-bottom:16px}
        .footer-col ul{list-style:none;display:flex;flex-direction:column;gap:10px}
        .footer-col a{text-decoration:none;font-size:14px;color:var(--text-secondary);transition:color .2s}
        .footer-col a:hover{color:var(--accent-primary-dark)}
        .footer-bottom{border-top:1px solid var(--border-default);padding-top:24px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--text-muted)}
        @media (max-width:1024px){ .footer-grid{grid-template-columns:repeat(2,1fr)} }
        @media (max-width:768px){ .footer-grid{grid-template-columns:1fr} }
      `}</style>

      {/* ========== HEADER ========== */}
      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container header-inner">
          <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
            <FullLogo size={36} />
          </Link>
          <nav>
            <ul className="nav-links">
              <li><Link to="/#features">Features</Link></li>
              <li><Link to="/#pricing">Pricing</Link></li>
              <li><Link to="/#how">API</Link></li>
              <li><Link to="/#footer">Documentation</Link></li>
            </ul>
          </nav>

          <div className="header-cta" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#4f46e5',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '14px', textTransform: 'uppercase'
                }}>
                  {user.email?.charAt(0) || 'U'}
                </div>
                <Link to="/dashboard" style={{ textDecoration: 'none', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                  Dashboard
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={() => { onLogout(); navigate('/'); }} style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px' }}>
                  Logout
                </button>
              </>
            ) : (
              <button className="btn btn-gradient btn-sm" onClick={onLogin} style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '8px' }}>
                Sign In
              </button>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>

        <nav className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
          <Link to="/#features" onClick={() => setMobileOpen(false)}>Features</Link>
          <Link to="/#pricing" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link to="/#how" onClick={() => setMobileOpen(false)}>API</Link>
          <Link to="/#footer" onClick={() => setMobileOpen(false)}>Documentation</Link>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} style={{ textDecoration: 'none', color: '#475569', fontWeight: '500', padding: '8px 0' }}>
                Dashboard
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={onLogout} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', width: '100%' }}>
                Logout
              </button>
            </div>
          ) : (
            <button className="btn btn-gradient btn-sm" onClick={onLogin} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', width: '100%' }}>
              Sign In
            </button>
          )}
        </nav>
      </header>

      {/* ========== DASHBOARD CONTENT ========== */}
      <main style={{ flex: 1, padding: '100px 0 60px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>Dashboard</h1>
              <p style={{ color: '#475569', fontSize: '14px' }}>
                Welcome back, <strong style={{ color: '#0f172a' }}>{user?.email}</strong>
              </p>
            </div>
            <Link
              to="/"
              className="btn btn-gradient"
              style={{ textDecoration: 'none', padding: '12px 22px', fontSize: '14px' }}
            >
              + New Scan
            </Link>
          </div>

          {/* Scans Table */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(15,23,42,.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>Recent Scans</h2>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Loading...</div>
            ) : scans.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>No scans yet</h3>
                <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Run your first scan to see the results here.</p>
                <Link to="/" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>
                  Go to scanner →
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <tr>
                      <th style={{ padding: '14px 24px' }}>Domain</th>
                      <th style={{ padding: '14px 24px' }}>Score</th>
                      <th style={{ padding: '14px 24px' }}>Category</th>
                      <th style={{ padding: '14px 24px' }}>Date</th>
                    </tr>
                  </thead>
                                    <tbody>
                    {scans.map((scan) => (
                      <tr key={scan.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '16px 24px', fontWeight: '500', color: '#0f172a' }}>{scan.domain}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            fontWeight: '700', fontFamily: 'monospace',
                            color: scan.score >= 70 ? '#22c55e' : scan.score >= 40 ? '#eab308' : '#ef4444'
                          }}>
                            {scan.score}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: '#475569', fontSize: '14px' }}>{scan.category}</td>
                        <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '14px' }}>
                          {new Date(scan.date).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          {/* Link to the public report page we built earlier */}
                          <Link to={`/report/${scan.scanId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
                            View Report →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                <span className="logo-mark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#04120a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3h6M10 3v5.5L4.8 17a3 3 0 0 0 2.6 4.5h9.2a3 3 0 0 0 2.6-4.5L14 8.5V3"/>
                    <path d="M7.5 14h9"/>
                  </svg>
                </span>
                Website Truth Serum
              </Link>
              <p>The evidence-based trust analyzer for a web full of filler.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><Link to="/#features">Features</Link></li>
                <li><Link to="/#pricing">Pricing</Link></li>
                <li><Link to="/#how">How It Works</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><Link to="/#how">Documentation</Link></li>
                <li><Link to="/#how">Risk Score Methodology</Link></li>
                <li><Link to="/#how">Blacklist Sources</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link to="/#footer">About</Link></li>
                <li><Link to="/#footer">Blog</Link></li>
                <li><Link to="/#footer">Contact</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><Link to="/#footer">Privacy Policy</Link></li>
                <li><Link to="/#footer">Terms of Service</Link></li>
                <li><Link to="/#footer">Responsible Disclosure</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Website Truth Serum. All rights reserved.</span>
            <span>Made with 🧪 and healthy skepticism.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}