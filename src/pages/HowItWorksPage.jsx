import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import { SITE_URL } from '../config/site';

const STEPS = [
  {
    num: '01',
    title: 'Fetch & Guard',
    description:
      'The URL is validated against public targets, fetched once with a hard size limit, and every redirect is checked before anything is read.',
  },
  {
    num: '02',
    title: 'Collect Evidence',
    description:
      'TLS certificate validity, HTTPS behavior, security headers, domain registration (RDAP), and page metadata become discrete, deterministic evidence items.',
  },
  {
    num: '03',
    title: 'Score & Explain',
    description:
      'The engine anchors the score at 50, applies each evidence item under category caps, and reports the score, risk level, confidence, and what could not be determined.',
  },
];

const SIGNALS = [
  'TLS certificate validity and handshake',
  'HTTPS availability and HTTP→HTTPS behavior',
  'Security headers (HSTS, CSP, nosniff, frame protection)',
  'Domain age, registrar, and registration status via RDAP',
  'Page metadata: title, description, language, viewport, canonical',
  'Substantial content presence',
  'Reputation providers (off by default, never a positive score)',
  'Strict response-size and scan-deadline boundaries',
];

const HowItWorksPage = () => (
  <SiteLayout>
    <SEO
      title="How It Works"
      description="See how the Website Truth Serum risk checker works: a guarded page fetch, deterministic evidence collection, and a transparent score with a full evidence breakdown."
      canonical={`${SITE_URL}/how-it-works`}
    />
    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        { name: 'How It Works', url: '/how-it-works' },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">Methodology</span>
        <h1>
          From URL to verdict in <span className="truth">three moves</span>
        </h1>
        <p>
          No extensions, no sign-up, no waiting. Paste a link and the serum does the rest.
        </p>
        <div className="page-hero-actions">
          <Link to="/" className="page-btn page-btn-primary">
            Try it on any URL
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <h2>The analysis pipeline</h2>
          <p>Every scan runs the same guarded, deterministic, explainable pipeline.</p>
        </div>
        <div className="page-steps">
          {STEPS.map((step) => (
            <div className="page-step" key={step.num}>
              <div className="page-step-num">{step.num}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <h2>Signals we weigh</h2>
          <p>Each evidence dimension is capped so no single signal dominates the 0–100 risk score.</p>
        </div>
        <div className="page-grid">
          {SIGNALS.map((signal) => (
            <div className="page-card" key={signal}>
              <div className="page-card-icon">🧪</div>
              <h3 style={{ fontSize: '16px' }}>{signal}</h3>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link to="/features" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
            Explore all features →
          </Link>
        </div>
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <div className="page-cta-box">
          <h2>Put the methodology to the test</h2>
          <p>Scan a suspicious domain right now — your first 10 daily scans are free.</p>
          <Link to="/" className="page-btn page-btn-primary">
            Inject Serum →
          </Link>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default HowItWorksPage;
