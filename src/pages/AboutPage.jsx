import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import { SITE_URL } from '../config/site';

const VALUES = [
  {
    icon: '🔬',
    title: 'Radical transparency',
    description:
      'Every trust score comes with the evidence behind it — no black-box verdicts. You can always see which signals fired and why.',
  },
  {
    icon: '🧪',
    title: 'Healthy skepticism',
    description:
      'The web rewards the loudest claims, not the truest ones. We build tools that assume nothing and verify everything.',
  },
  {
    icon: '🌍',
    title: 'A safer web for everyone',
    description:
      'From casual browsers to security teams, everyone deserves to know what they\'re really trusting online.',
  },
];

const AboutPage = () => (
  <SiteLayout>
    <SEO
      title="About"
      description="Website Truth Serum is an evidence-based website risk checker on a mission to separate real websites from the filler. Learn about our story and approach."
      canonical={`${SITE_URL}/about`}
    />
    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        { name: 'About', url: '/about' },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">Our Story</span>
        <h1>
          We're on a mission to make the web <span className="truth">verifiable</span>
        </h1>
        <p>
          Website Truth Serum started with a simple frustration: it was getting too easy to be fooled online.
        </p>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head" style={{ maxWidth: '720px' }}>
          <h2>Why we built a website trust checker</h2>
          <p>
            Every day, millions of people land on sites engineered to look trustworthy — inflated
            reviews, AI-generated endorsements, cloned storefronts, and manufactured urgency. Most
            tools either bury the answer in jargon or only check one narrow signal. We wanted one
            place that strips a site down to the evidence, examines it honestly, and tells you — in
            plain English — how much risk the available evidence supports.
          </p>
          <p style={{ marginTop: '16px' }}>
            So we built an evidence-based risk checker that combines transport-security checks,
            domain registration facts, and page-content signals into a deterministic 0–100 score.
            Every report shows the evidence behind the score and what we could not determine. It's
            free to start, honest by design, and always explainable. You can see exactly how it
            works on our{' '}
            <Link to="/how-it-works" style={{ color: 'var(--accent-secondary)' }}>
              methodology page
            </Link>
            .
          </p>
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <h2>What we believe</h2>
        </div>
        <div className="page-grid">
          {VALUES.map((value) => (
            <div className="page-card" key={value.title}>
              <div className="page-card-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <div className="page-cta-box">
          <h2>See trust in action</h2>
          <p>
            Run your first scan in seconds. Questions?{' '}
            <Link to="/contact" style={{ color: '#00FF66' }}>Get in touch</Link>.
          </p>
          <Link to="/" className="page-btn page-btn-primary">
            Scan a website →
          </Link>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default AboutPage;
