import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import FAQ from '../components/FAQ';
import { SITE_URL } from '../config/site';

const FAQ_ITEMS = [
  {
    question: 'How does the Website Safety Checker work?',
    answer:
      'Website Truth Serum analyzes observable evidence from a website, including HTTPS and TLS behavior, HTTP behavior, security headers, domain registration information, and page-content signals. The evidence is evaluated by a deterministic scoring system and the report shows what was verified and what could not be determined.',
  },
  {
    question: 'Does a high score guarantee that a website is safe?',
    answer:
      'No. A score is an evidence-based assessment, not a guarantee of safety or legitimacy. A website can have a technically sound configuration and still be fraudulent, while missing evidence does not automatically mean a website is dangerous.',
  },
  {
    question: 'What does "Unknown" mean in a website safety report?',
    answer:
      'Unknown means that a particular dimension could not be determined from the available evidence. Unknown is neutral: it is not treated as proof that the website is safe or unsafe.',
  },
  {
    question: 'What does the confidence score mean?',
    answer:
      'Confidence reflects how much of the planned evidence could actually be verified. A report with limited evidence should be interpreted more cautiously than a report supported by broader evidence.',
  },
  {
    question: 'Do I need to create an account to scan a website?',
    answer:
      'You can start a website analysis from the Website Truth Serum scanner without creating an account.',
  },
];

const CHECKS = [
  {
    icon: '🔒',
    title: 'HTTPS & TLS',
    description:
      'We examine HTTPS behavior and TLS certificate evidence when it can be verified.',
  },
  {
    icon: '🌐',
    title: 'Domain Information',
    description:
      'Domain registration evidence such as registration age is considered when available.',
  },
  {
    icon: '🛡️',
    title: 'Security Headers',
    description:
      'We inspect observable HTTP security headers and report the evidence that can be verified.',
  },
  {
    icon: '📄',
    title: 'Page & Content Signals',
    description:
      'The analysis also considers observable page and metadata signals available during the scan.',
  },
];

const WebsiteSafetyCheckerPage = () => (
  <SiteLayout>
    <SEO
      title="Website Safety Checker — Is This Website Safe?"
      description="Check if a website appears safe or suspicious using HTTPS, TLS, domain, security-header, and page evidence with a transparent risk score."
      canonical={`${SITE_URL}/website-safety-checker`}
    />

    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        { name: 'Website Safety Checker', url: '/website-safety-checker' },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">Website Safety Checker</span>

        <h1>
          Is This Website <span className="truth">Safe?</span>
        </h1>

        <p>
          Check a website before you trust it. Website Truth Serum analyzes
          observable security, domain, and page evidence and explains what the
          evidence actually shows.
        </p>

        <div className="page-hero-actions">
          <Link to="/" className="page-btn page-btn-primary">
            Check a website now →
          </Link>

          <Link to="/how-it-works" className="page-btn page-btn-ghost">
            See how it works
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">What we check</span>
          <h2>Evidence before conclusions</h2>
          <p>
            A website safety assessment should show its evidence instead of
            pretending that a single signal can prove everything about a site.
          </p>
        </div>

        <div className="page-grid">
          {CHECKS.map((check) => (
            <div className="page-card" key={check.title}>
              <div className="page-card-icon">{check.icon}</div>
              <h3>{check.title}</h3>
              <p>{check.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Transparent results</span>
          <h2>See what we know — and what we don't</h2>
          <p>
            Website Truth Serum starts from a neutral score of 50. Verified
            evidence can move the score, while missing evidence remains
            unknown rather than being automatically treated as dangerous or
            safe.
          </p>
        </div>

        <div className="page-grid">
          <div className="page-card">
            <h3>Risk score</h3>
            <p>
              A deterministic score summarizes the observed evidence. The
              backend is the source of truth for the resulting assessment.
            </p>
          </div>

          <div className="page-card">
            <h3>Confidence</h3>
            <p>
              Confidence indicates how broadly the planned evidence areas were
              verified. Limited evidence means the result should be treated
              more cautiously.
            </p>
          </div>

          <div className="page-card">
            <h3>Verified evidence</h3>
            <p>
              The report identifies evidence that was actually observed and
              explains its contribution to the assessment.
            </p>
          </div>

          <div className="page-card">
            <h3>Not determined</h3>
            <p>
              Evidence that could not be obtained is explicitly shown as
              undetermined. Unknown is not a clean bill of health.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Important limitation</span>
          <h2>A safety check is not a guarantee</h2>
          <p>
            No automated website checker can establish with certainty that a
            website is legitimate, safe to transact with, or free from every
            possible threat. Use the report as evidence to investigate further,
            especially before entering sensitive information or making a
            payment.
          </p>
        </div>

        <div className="page-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3>Why transparency matters</h3>
          <p>
            A result should distinguish between evidence that was verified and
            information that was unavailable. Website Truth Serum is designed
            around that distinction so that an absence of evidence is not
            silently converted into a positive or negative claim.
          </p>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Frequently asked questions</span>
          <h2>Website safety checker FAQ</h2>
        </div>

        <FAQ items={FAQ_ITEMS} />
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <div className="page-cta-box">
          <h2>Check a website before you trust it</h2>

          <p>
            Run an evidence-based website analysis and see the reasoning behind
            the result.
          </p>

          <Link to="/" className="page-btn page-btn-primary">
            Scan a website →
          </Link>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default WebsiteSafetyCheckerPage;