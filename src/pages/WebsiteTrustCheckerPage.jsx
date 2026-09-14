import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import FAQ from '../components/FAQ';
import { SITE_URL } from '../config/site';

const TRUST_FACTORS = [
  {
    icon: '🔒',
    title: 'HTTPS & TLS',
    description:
      'A secure, verified HTTPS connection helps protect data in transit. TLS evidence tells you about the connection, not whether the people operating the website are trustworthy.',
  },
  {
    icon: '🌐',
    title: 'Domain information',
    description:
      'When registration data is available, the scan can report domain age, registrar information, and registration status. Domain history is one signal, not a verdict.',
  },
  {
    icon: '🛡️',
    title: 'Security configuration',
    description:
      'Observable security headers and HTTP behavior provide evidence about how the website is configured and maintained.',
  },
  {
    icon: '📄',
    title: 'Page & content signals',
    description:
      'The scan observes available page metadata and content signals, including title, description, language, viewport, canonical information, and content presence.',
  },
];

const TRUST_MEANS = [
  {
    title: 'Evidence was actually verified',
    description:
      'The report distinguishes observable evidence from information that could not be obtained.',
  },
  {
    title: 'Risk is calculated consistently',
    description:
      'The score is produced by the backend from the evidence collected during the scan rather than by an AI-generated opinion.',
  },
  {
    title: 'Confidence tells you how much is known',
    description:
      'A result supported by broader verified evidence can be interpreted differently from one where important evidence remains unavailable.',
  },
  {
    title: 'Unknown stays unknown',
    description:
      'Missing evidence is not silently converted into either a positive or negative conclusion.',
  },
];

const NOT_PROOF = [
  'A valid HTTPS certificate does not prove that a business is legitimate.',
  'A high score does not guarantee that a website is safe or honest.',
  'A newly registered domain is not automatically a scam.',
  'Missing security headers do not automatically mean a website is malicious.',
  'Unknown or unavailable evidence is not proof that a website is safe.',
  'A clean technical assessment cannot establish the intentions of the website operator.',
];

const WHEN_TO_CHECK = [
  'Before entering a password or other sensitive information.',
  'Before making a payment to a website you do not know.',
  'When a link arrives unexpectedly by email, message, or social media.',
  'When a website uses a domain that you have never seen before.',
  'When an offer or promotion makes you uncomfortable or uncertain.',
  'When you want to understand the technical evidence before investigating further.',
];

const FAQ_ITEMS = [
  {
    question: 'What is a website trust checker?',
    answer:
      'A website trust checker examines available evidence about a website and presents that evidence in a form that can help you investigate the site. Website Truth Serum checks observable technical, domain, and page signals and provides a transparent risk assessment. It does not certify that a website is trustworthy.',
  },
  {
    question: 'Can Website Truth Serum tell me whether a website is trustworthy?',
    answer:
      'Not with certainty. The service reports evidence that can be verified and calculates an assessment from that evidence. Trustworthiness also depends on factors that a technical website scan cannot establish, such as the operator’s intentions, business practices, or whether claims made by the business are true.',
  },
  {
    question: 'What does the website trust checker look at?',
    answer:
      'Depending on what can be verified during the scan, it examines HTTPS and TLS behavior, HTTP redirects, security headers, domain registration information, and observable page and content signals.',
  },
  {
    question: 'What does the risk score mean?',
    answer:
      'The risk score is a deterministic assessment derived from the evidence collected by the backend. It is intended to summarize observable risk signals, not to provide a guarantee that a website is safe or fraudulent.',
  },
  {
    question: 'What does Unknown mean?',
    answer:
      'Unknown means that the relevant evidence could not be determined from the information available during the scan. Unknown is neutral. It is not treated as evidence that the website is safe, and it is not automatically treated as evidence that the website is dangerous.',
  },
  {
    question: 'Is a website with HTTPS automatically trustworthy?',
    answer:
      'No. HTTPS helps secure the connection between your browser and the website, but it does not verify who operates the website or whether the business and its claims are legitimate.',
  },
  {
    question: 'Should I trust a website with a high score?',
    answer:
      'A high score should not be interpreted as a guarantee. It means the verified evidence did not produce the same level of concern as a lower-scoring result. You should still consider the context of the website and independently verify important claims before sending money or sensitive information.',
  },
  {
    question: 'Do I need an account to check a website?',
    answer:
      'You can start a website analysis from the Website Truth Serum scanner without creating an account.',
  },
];

const WebsiteTrustCheckerPage = () => (
  <SiteLayout>
    <SEO
      title="Website Trust Checker"
      description="Check whether a website appears trustworthy using verified domain, HTTPS, TLS, security, and page evidence. See risk, confidence, and what remains unknown."
      canonical={`${SITE_URL}/website-trust-checker`}
    />

    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        { name: 'Website Trust Checker', url: '/website-trust-checker' },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">Website Trust Checker</span>

        <h1>
          Can You <span className="truth">Trust</span> This Website?
        </h1>

        <p>
          Check the evidence before you trust a website. Website Truth Serum
          analyzes observable domain, security, and page signals and shows what
          was verified, what affects the assessment, and what could not be
          determined.
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
          <span className="page-eyebrow">Trust needs evidence</span>

          <h2>What can actually support website trust?</h2>

          <p>
            There is no single technical signal that can prove a website is
            trustworthy. A better approach is to look at several observable
            dimensions and understand the limits of each one.
          </p>
        </div>

        <div className="page-grid">
          {TRUST_FACTORS.map((factor) => (
            <div className="page-card" key={factor.title}>
              <div className="page-card-icon">{factor.icon}</div>
              <h3>{factor.title}</h3>
              <p>{factor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">A transparent assessment</span>

          <h2>Trust the evidence, not just the score</h2>

          <p>
            Website Truth Serum is designed to make the evidence behind an
            assessment visible instead of hiding uncertainty behind a simple
            yes-or-no answer.
          </p>
        </div>

        <div className="page-grid">
          {TRUST_MEANS.map((item) => (
            <div className="page-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Know the limits</span>

          <h2>What a trust check cannot prove</h2>

          <p>
            A technical assessment can provide useful evidence, but it cannot
            establish everything about a website or the people behind it.
          </p>
        </div>

        <div
          className="page-card"
          style={{
            maxWidth: '850px',
            margin: '0 auto',
          }}
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              color: 'var(--text-secondary)',
              fontSize: '15px',
              lineHeight: '1.8',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {NOT_PROOF.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">When it helps</span>

          <h2>When should you check a website?</h2>

          <p>
            A quick evidence check can be useful whenever you are about to
            interact with a website you do not fully know or understand.
          </p>
        </div>

        <div
          className="page-card"
          style={{
            maxWidth: '850px',
            margin: '0 auto',
          }}
        >
          <ul
            style={{
              margin: 0,
              paddingLeft: '20px',
              color: 'var(--text-secondary)',
              fontSize: '15px',
              lineHeight: '1.8',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {WHEN_TO_CHECK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Explore a specific question</span>

          <h2>Check the type of risk that concerns you</h2>

          <p>
            Different questions call for different perspectives. Explore the
            more specific Website Truth Serum checkers when you want to focus
            on scams, technical safety, or legitimacy.
          </p>
        </div>

        <div className="page-grid">
          <Link
            to="/website-scam-checker"
            className="page-card"
            style={{ textDecoration: 'none' }}
          >
            <h3>Website Scam Checker</h3>
            <p>
              Look for observable signals that may warrant caution when a
              website appears suspicious.
            </p>
          </Link>

          <Link
            to="/website-safety-checker"
            className="page-card"
            style={{ textDecoration: 'none' }}
          >
            <h3>Website Safety Checker</h3>
            <p>
              Focus on HTTPS, TLS, security configuration, and other technical
              safety evidence.
            </p>
          </Link>

          <Link
            to="/website-legitimacy-checker"
            className="page-card"
            style={{ textDecoration: 'none' }}
          >
            <h3>Website Legitimacy Checker</h3>
            <p>
              Examine evidence that can help you investigate whether a website
              appears legitimate.
            </p>
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <FAQ
          items={FAQ_ITEMS}
          eyebrow="Website trust checker FAQ"
          title="Questions about checking website trust"
        />
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <div className="page-cta-box">
          <h2>Check the evidence before you trust a website</h2>

          <p>
            Run an evidence-based scan and see the risk assessment, confidence,
            verified evidence, and anything that remains unknown.
          </p>

          <Link to="/" className="page-btn page-btn-primary">
            Check a website →
          </Link>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default WebsiteTrustCheckerPage;