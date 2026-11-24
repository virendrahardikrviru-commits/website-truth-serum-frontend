import React, { useEffect, useState } from 'react';
import { supabase } from '../services/auth';
import {
  verifyVerityAdmin,
  getVerityEnquiries,
  getVerityCases,
} from '../services/verityApi';
import VerityEnquiryDetail from './VerityEnquiryDetail';
import './VerityAdmin.css';

export default function VerityAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [admin, setAdmin] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    setError('');
    setBusy(true);

    try {
      // Verify admin identity first.
      const identity = await verifyVerityAdmin();
      setAdmin(identity);

      // Load enquiries and cases independently.
      const results = await Promise.allSettled([
        getVerityEnquiries(),
        getVerityCases(),
      ]);

      const enquiryResult = results[0];
      const caseResult = results[1];

      if (enquiryResult.status === 'fulfilled') {
        setEnquiries(enquiryResult.value?.enquiries || []);
      } else {
        setEnquiries([]);
      }

      if (caseResult.status === 'fulfilled') {
        setCases(caseResult.value?.cases || []);
      } else {
        setCases([]);
      }

      const errors = [];

      if (enquiryResult.status === 'rejected') {
        errors.push(`Enquiries: ${enquiryResult.reason.message}`);
      }

      if (caseResult.status === 'rejected') {
        errors.push(`Cases: ${caseResult.reason.message}`);
      }

      if (errors.length) {
        setError(errors.join(' | '));
      }
    } catch (err) {
      // Only an identity/session verification failure removes admin access.
      setAdmin(null);
      setEnquiries([]);
      setCases([]);
      setError(err.message || 'Admin verification failed.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (data.session?.access_token && active) {
          await loadAdminData();
        } else if (active) {
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to check your session.');
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) throw loginError;

      setPassword('');
      await loadAdminData();
    } catch (err) {
      setError(err.message || 'Sign-in failed.');
      setBusy(false);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
    setEnquiries([]);
    setCases([]);
    setError('');
  };

  if (loading) {
    return <div className="verity-loading">Loading VERITYâ€¦</div>;
  }

  if (!admin) {
    return (
      <main className="verity-login-page">
        <section className="verity-login-card">
          <div className="verity-brand-mark">V</div>
          <p className="verity-eyebrow">WEBSITE TRUTH SERUM</p>
          <h1>VERITY Admin</h1>
          <p className="verity-muted">
            Secure access to vendor due-diligence operations.
          </p>

          <form onSubmit={handleLogin} className="verity-login-form">
            <label htmlFor="verity-email">Email address</label>
            <input
              id="verity-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <label htmlFor="verity-password">Password</label>
            <input
              id="verity-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {error && <div className="verity-error">{error}</div>}

            <button type="submit" disabled={busy}>
              {busy ? 'Verifying accessâ€¦' : 'Sign in securely'}
            </button>
          </form>

          <p className="verity-login-footnote">
            Access is restricted and verified by the server.
          </p>
          <a className="verity-back-link" href="/">â† Back to Website Truth Serum</a>
        </section>
      </main>
    );
  }

  return (
    <main className="verity-app">
      <header className="verity-header">
        <div className="verity-header-brand">
          <div className="verity-brand-mark small">V</div>
          <div>
            <strong>VERITY</strong>
            <span>Vendor Due Diligence</span>
          </div>
        </div>
        <div className="verity-header-actions">
          <span className="verity-secure-label">Admin verified</span>
          <button className="verity-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </header>

      <section className="verity-content">
        <div className="verity-page-heading">
          <div>
            <p className="verity-eyebrow">OPERATIONS</p>
            <h1>Admin overview</h1>
            <p className="verity-muted">Review incoming enquiries and due-diligence cases.</p>
          </div>
          <button className="verity-refresh" onClick={loadAdminData} disabled={busy}>
            {busy ? 'Refreshingâ€¦' : 'Refresh data'}
          </button>
        </div>

        {error && <div className="verity-error">{error}</div>}

        <div className="verity-stat-grid">
          <article className="verity-stat-card">
            <span>Total enquiries loaded</span>
            <strong>{enquiries.length}</strong>
          </article>
          <article className="verity-stat-card">
            <span>Total cases loaded</span>
            <strong>{cases.length}</strong>
          </article>
          <article className="verity-stat-card">
            <span>Access</span>
            <strong className="verity-access">Verified</strong>
          </article>
        </div>

        <section className="verity-panel">
          <div className="verity-panel-heading">
            <h2>Recent enquiries</h2>
            <span>{enquiries.length} loaded</span>
          </div>
          {enquiries.length === 0 ? (
            <p className="verity-empty">No enquiries returned by the API.</p>
          ) : (
            <div className="verity-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Supplier</th>
                    <th>Status</th>
                    <th>Received</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map((item) => (
                    <tr key={item.id}>
                      <td>{item.company_name || 'â€”'}</td>
                      <td>
                        <strong>{item.full_name || 'â€”'}</strong>
                        <small>{item.business_email || ''}</small>
                      </td>
                      <td>{item.supplier_website || item.business_website || 'â€”'}</td>
                      <td><span className="verity-status">{item.status || 'New'}</span></td>
                      <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'â€”'}</td>

                      <td><button type="button" className="verity-refresh" onClick={() => setSelectedEnquiry(item)}>View details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedEnquiry && (
          <VerityEnquiryDetail enquiry={selectedEnquiry} onBack={() => setSelectedEnquiry(null)} />
        )}

        <section className="verity-panel">
          <div className="verity-panel-heading">
            <h2>Due-diligence cases</h2>
            <span>{cases.length} loaded</span>
          </div>
          {cases.length === 0 ? (
            <p className="verity-empty">No cases returned by the API.</p>
          ) : (
            <div className="verity-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Case</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((item) => (
                    <tr key={item.id}>
                      <td>{item.case_number || item.id || 'â€”'}</td>
                      <td>{item.title || item.supplier_name || 'â€”'}</td>
                      <td><span className="verity-status">{item.status || 'â€”'}</span></td>
                      <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'â€”'}</td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="verity-readonly-note">
          Initial access is read-only. No enquiry or case records can be changed from this screen.
        </p>
      </section>
    </main>
  );
}
