import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import { SITE_URL } from '../config/site';

const FEATURES = [
  {
    icon: '🔍',
    title: 'Security & Infrastructure Checks',
    description:
      'We check how the page responds over HTTPS: TLS certificate validity, HTTP behavior, security headers, and strict response-size boundaries.',
    tags: ['HTTPS behavior', 'TLS certificate', 'security headers', 'response limits'],
  },
  {
    icon: '🌐',
    title: 'Domain Registration Intelligence',
    description:
      'RDAP lookup returns domain age, registrar, and registration status — objective facts about the domain itself, shown in the report.',
    tags: ['domain age', 'registrar', 'registration status', 'RDAP'],
  },
  {
    icon: '🧪',
    title: 'Page Content Signals',
    description:
      'We analyze the fetched HTML for title, description, language, viewport, canonical, and substantial content. These are neutral observations, not a verdict on the text.',
    tags: ['title & metadata', 'content presence', 'neutral signals'],
  },
  {
    icon: '⚖️',
    title: 'Deterministic Evidence Scoring',
    description:
      'The score anchors at 50 (unknown), evidence is capped per category, confidence reflects coverage, and the report shows the exact reconciliation: 50 + contributions = score.',
    tags: ['neutral anchor', 'category caps', 'confidence', 'reconciliation'],
  },
  {
    icon: '📊',
    title: 'One Readable Risk Report',
    description:
      'Every scan reports a risk level, a confidence value, what we verified, what we could not determine, and the evidence breakdown — no technical background required.',
    tags: ['risk level', 'what we verified', 'not determined', 'evidence breakdown'],
  },
  {
    icon: '🚀',
    title: 'API & Bulk Scanning',
    description:
      'Developers get programmatic access to the same engine via a REST API, plus bulk URL scanning for teams, researchers, and content moderators.',
    tags: ['REST API', 'bulk scans', 'team workflows', 'automation'],
  },
];

const FeaturesPage = () => (
  <SiteLayout>
    <SEO
      title="Features"
      description="See the evidence-based checks behind Website Truth Serum: HTTPS/TLS behavior, security headers, domain registration, page content signals, and a deterministic risk score with a full evidence breakdown."
      canonical={`${SITE_URL}/features`}
    />
    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        { name: 'Features', url: '/features' },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">The Serum Toolkit</span>
        <h1>
          The evidence behind every <span className="truth">website</span>
        </h1>
        <p>
          One bounded scan checks transport security, domain registration, and page content — then shows the exact evidence behind the risk score.
        </p>
        <div className="page-hero-actions">
          <Link to="/" className="page-btn page-btn-primary">
            Scan a website now
          </Link>
          <Link to="/pricing" className="page-btn page-btn-ghost">
            See pricing
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <h2>Evidence in. Risk out.</h2>
          <p>Every feature works together to show what a site really is — and what we could not determine.</p>
        </div>
        <div className="page-grid">
          {FEATURES.map((feature) => (
            <div className="page-card" key={feature.title}>
              <div className="page-card-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="page-card-tags">
                {feature.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <h2>Built for curious minds, security teams, and skeptics</h2>
          <p>
            Use our website trust checker to vet vendors, research domains, moderate content,
            or simply avoid sketchy links. Learn more about{' '}
            <Link to="/how-it-works" style={{ color: 'var(--accent-secondary)' }}>
              how the analysis works
            </Link>
            .
          </p>
        </div>
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <div className="page-cta-box">
          <h2>Ready to audit the web?</h2>
          <p>Your first 10 daily scans are on us — no sign-up required.</p>
          <Link to="/" className="page-btn page-btn-primary">
            Inject Serum →
          </Link>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default FeaturesPage;
