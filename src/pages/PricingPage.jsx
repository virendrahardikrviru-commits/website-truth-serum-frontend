import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import FAQ from '../components/FAQ';
import { SITE_URL } from '../config/site';

const PRICING_FAQ = [
  {
    question: 'Is Website Truth Serum really free?',
    answer:
      'Yes. The free plan gives you 10 scans per day forever — no credit card, no trial clock, no sign-up required to run your first scan.',
  },
  {
    question: 'What do I get with the Pro plan?',
    answer:
      'Pro unlocks unlimited scans, the full evidence breakdown, REST API access, bulk URL scanning, and shareable PDF trust reports.',
  },
  {
    question: 'Can I cancel my Pro subscription anytime?',
    answer:
      'Absolutely. Subscriptions are month-to-month with no lock-in. You can downgrade back to the free plan at any time and keep your scan history.',
  },
];

const PricingPage = () => (
  <SiteLayout>
    <SEO
      title="Pricing"
      description="Simple, honest pricing for the Website Truth Serum trust checker. Start free with 10 daily scans, upgrade to Pro for unlimited scans, deep audits, and API access."
      canonical={`${SITE_URL}/pricing`}
    />
    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        { name: 'Pricing', url: '/pricing' },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">Pricing</span>
        <h1>
          Truth shouldn't <span className="truth">cost a fortune</span>
        </h1>
        <p>Start free. Upgrade when the web starts feeling suspicious.</p>
        <div className="page-hero-actions">
          <Link to="/" className="page-btn page-btn-primary">
            Start scanning free
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-pricing-grid">
          <div className="page-price-card">
            <div className="page-plan-name">Free</div>
            <div className="page-plan-desc">For casual fact-checking</div>
            <div className="page-plan-price">
              <span className="amount">$0</span>
              <span className="per">/ forever</span>
            </div>
            <ul className="page-plan-features">
              <li><span className="tick">✓</span>10 scans per day</li>
              <li><span className="tick">✓</span>Risk score &amp; evidence flags</li>
              <li><span className="tick">✓</span>Domain age &amp; TLS checks</li>
              <li className="off"><span className="x">—</span>Deep evidence breakdown</li>
              <li className="off"><span className="x">—</span>API access &amp; bulk scans</li>
              <li className="off"><span className="x">—</span>PDF trust reports</li>
            </ul>
            <Link to="/" className="page-btn page-btn-ghost">
              Start scanning free
            </Link>
          </div>

          <div className="page-price-card pro">
            <div className="page-pro-badge">Most Popular</div>
            <div className="page-plan-name">Pro</div>
            <div className="page-plan-desc">For professionals &amp; teams</div>
            <div className="page-plan-price">
              <span className="amount">$29</span>
              <span className="per">/ month</span>
            </div>
            <ul className="page-plan-features">
              <li><span className="tick">✓</span>Unlimited scans</li>
              <li><span className="tick">✓</span>Full evidence breakdown</li>
              <li><span className="tick">✓</span>Priority processing</li>
              <li><span className="tick">✓</span>API access &amp; bulk URL scans</li>
              <li><span className="tick">✓</span>Shareable PDF trust reports</li>
              <li><span className="tick">✓</span>Scan history &amp; alerts</li>
            </ul>
            <Link to="/" className="page-btn page-btn-primary">
              Go Pro →
            </Link>
          </div>
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <FAQ items={PRICING_FAQ} eyebrow="FAQ" title="Pricing questions, answered" />
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <div className="page-cta-box">
          <h2>Still deciding?</h2>
          <p>
            Explore what you can do on the free plan, or read about{' '}
            <Link to="/features" style={{ color: '#00FF66' }}>all the features</Link>{' '}
            before you commit.
          </p>
          <Link to="/" className="page-btn page-btn-primary">
            Scan your first URL →
          </Link>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default PricingPage;
