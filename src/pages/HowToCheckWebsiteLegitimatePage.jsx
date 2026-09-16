import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import FAQ from '../components/FAQ';
import { SITE_URL } from '../config/site';

const CHECK_STEPS = [
  {
    number: '01',
    title: 'Check the exact domain',
    description:
      'Look carefully at the domain name. Pay attention to spelling, unexpected subdomains, and look-alike domains. A familiar brand name in a URL does not by itself establish that the website is operated by that brand.',
  },
  {
    number: '02',
    title: 'Check HTTPS and TLS',
    description:
      'Confirm that the page uses HTTPS and that the TLS connection can be established correctly. HTTPS protects data in transit, but a valid certificate does not prove that the website or its operator is legitimate.',
  },
  {
    number: '03',
    title: 'Look at domain information',
    description:
      'When registration information is available, consider the domain registration date, registrar, and status. A newly registered domain deserves context and further investigation, but a new domain is not automatically fraudulent.',
  },
  {
    number: '04',
    title: 'Examine security configuration',
    description:
      'Observable security headers, redirects, and HTTP behavior can provide useful technical evidence about how a website is configured and maintained.',
  },
  {
    number: '05',
    title: 'Examine the actual page',
    description:
      'Look at page metadata, content presence, language, canonical information, and other observable page signals. These observations can provide context, but they do not verify the truth of every claim made on the page.',
  },
  {
    number: '06',
    title: 'Verify important claims independently',
    description:
      'For purchases, financial decisions, account credentials, or other sensitive actions, use independent sources to verify the business, contact details, and important claims before proceeding.',
  },
];

const WHAT_IT_CAN_SHOW = [
  'Domain registration information when it is available.',
  'HTTPS and TLS connection evidence.',
  'HTTP behavior and redirect information.',
  'Observable security headers and configuration.',
  'Page metadata and content-presence signals.',
  'Which evidence was verified and which evidence could not be determined.',
];

const WHAT_IT_CANNOT_PROVE = [
  'That the business behind a website is honest.',
  'That the people operating the domain are who they claim to be.',
  'That every statement or product claim on the website is true.',
  'That a website with HTTPS is automatically legitimate.',
  'That a newly registered domain is automatically fraudulent.',
  'That missing evidence means the website is safe.',
];

const FAQ_ITEMS = [
  {
    question: 'How can I check if a website is legitimate?',
    answer:
      'Start by checking the exact domain, HTTPS and TLS connection, available domain registration information, security configuration, and observable page signals. For important transactions or sensitive information, also verify the business and its claims through independent sources.',
  },
  {
    question: 'Does HTTPS mean a website is legitimate?',
    answer:
      'No. HTTPS helps protect the connection between your browser and the website. It does not establish who operates the website or whether the business, product, or claims are legitimate.',
  },
  {
    question: 'Does the age of a domain prove whether a website is legitimate?',
    answer:
      'No. Domain age is only one piece of evidence. A very new domain may warrant additional investigation, but legitimate websites can also be newly registered.',
  },
  {
    question: 'What does Website Truth Serum check?',
    answer:
      'Website Truth Serum examines observable technical, domain, and page evidence when that evidence is available. The report distinguishes verified evidence from information that could not be determined.',
  },
  {
    question: 'What does Unknown mean in a website check?',
    answer:
      'Unknown means that the relevant evidence could not be determined from the information available during the scan. Unknown is neutral. It is not treated as evidence that a website is safe or dangerous.',
  },
  {
    question: 'Can a technical website scan prove that a business is legitimate?',
    answer:
      'No. Technical evidence can help you investigate a website, but it cannot establish the intentions of its operator or verify every business claim. Important decisions should include independent verification.',
  },
];

const HowToCheckWebsiteLegitimatePage = () => (
  <SiteLayout>
    <SEO
      title="How to Check if a Website Is Legitimate"
      description="Learn how to check whether a website is legitimate using domain information, HTTPS, security evidence, page signals, and transparent risk indicators."
      canonical={`${SITE_URL}/how-to-check-if-a-website-is-legitimate`}
    />

    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        {
          name: 'How to Check if a Website Is Legitimate',
          url: '/how-to-check-if-a-website-is-legitimate',
        },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">
          Website legitimacy guide
        </span>

        <h1>
          How to Check if a Website Is <span className="truth">Legitimate</span>
        </h1>

        <p>
          Before trusting an unfamiliar website, check the evidence you can
          actually verify. Domain information, HTTPS, security configuration,
          and page signals can help you investigate a site—but none of them
          alone proves that a business is legitimate.
        </p>

        <div className="page-hero-actions">
          <Link
            to="/website-legitimacy-checker"
            className="page-btn page-btn-primary"
          >
            Check a website now →
          </Link>

          <Link
            to="/website-trust-checker"
            className="page-btn page-btn-ghost"
          >
            Use the trust checker
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">A practical process</span>

          <h2>Six things to check before you trust a website</h2>

          <p>
            No single technical signal can establish legitimacy. A stronger
            approach is to collect several independent pieces of evidence and
            understand what each one can—and cannot—tell you.
          </p>
        </div>

        <div className="page-grid">
          {CHECK_STEPS.map((step) => (
            <div className="page-card" key={step.number}>
              <div className="page-card-icon">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Technical evidence</span>

          <h2>What a website check can actually tell you</h2>

          <p>
            Website Truth Serum focuses on evidence that can be observed during
            a scan rather than presenting an unsupported opinion about the
            website operator.
          </p>
        </div>

        <div className="page-grid">
          {WHAT_IT_CAN_SHOW.map((item) => (
            <div className="page-card" key={item}>
              <h3>Verified signal</h3>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Know the limits</span>

          <h2>What technical evidence cannot prove</h2>

          <p>
            A technically well-configured website can still be dishonest, while
            a poorly configured website can belong to an honest operator.
            Technical evidence should therefore be treated as one part of the
            investigation.
          </p>
        </div>

        <div className="page-grid">
          {WHAT_IT_CANNOT_PROVE.map((item) => (
            <div className="page-card" key={item}>
              <h3>Not proof</h3>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">A better interpretation</span>

          <h2>Verified, unknown, and risk are different things</h2>

          <p>
            A useful website assessment should make the boundary between known
            and unknown visible. If evidence cannot be obtained, it should not
            quietly be turned into either a positive or negative conclusion.
          </p>
        </div>

        <div className="page-grid">
          <div className="page-card">
            <h3>Verified</h3>
            <p>
              Evidence that was actually observed or determined during the
              scan.
            </p>
          </div>

          <div className="page-card">
            <h3>Unknown</h3>
            <p>
              Evidence that could not be determined from the information
              available. Unknown is neutral.
            </p>
          </div>

          <div className="page-card">
            <h3>Risk</h3>
            <p>
              A deterministic assessment derived from the evidence collected,
              rather than an AI-generated guess about intent.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Related checker</span>

          <h2>Check the evidence for yourself</h2>

          <p>
            If you have a website you are unsure about, the Website Legitimacy
            Checker can help you review available domain, security, and page
            evidence before you decide what to do next.
          </p>
        </div>

        <div className="page-hero-actions">
          <Link
            to="/website-legitimacy-checker"
            className="page-btn page-btn-primary"
          >
            Open Website Legitimacy Checker →
          </Link>

          <Link
            to="/website-trust-checker"
            className="page-btn page-btn-ghost"
          >
            Learn about website trust
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Further reading</span>

          <h2>Related website checks</h2>

          <p>
            Legitimacy is only one part of evaluating an unfamiliar website.
          </p>
        </div>

        <div className="page-grid">
          <Link to="/website-trust-checker" className="page-card">
            <h3>Website Trust Checker</h3>
            <p>
              Review the broader evidence used to assess website trust and
              understand what remains unknown.
            </p>
          </Link>

          <Link to="/website-safety-checker" className="page-card">
            <h3>Website Safety Checker</h3>
            <p>
              Examine HTTPS, TLS, security configuration, domain information,
              and page evidence.
            </p>
          </Link>

          <Link to="/website-scam-checker" className="page-card">
            <h3>Website Scam Checker</h3>
            <p>
              Investigate technical and security evidence that may warrant
              additional caution.
            </p>
          </Link>

          <Link
            to="/how-to-tell-if-a-website-is-a-scam"
            className="page-card"
          >
            <h3>How to Tell if a Website Is a Scam</h3>
            <p>
              Learn how to investigate suspicious websites without treating a
              single signal as proof.
            </p>
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <FAQ
          items={FAQ_ITEMS}
          eyebrow="Website legitimacy guide FAQ"
        />
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <h2>Check a website before you trust it</h2>

        <p>
          Start with observable evidence, understand what is unknown, and
          investigate important claims independently.
        </p>

        <Link
          to="/website-legitimacy-checker"
          className="page-btn page-btn-primary"
        >
          Check Website Legitimacy →
        </Link>
      </div>
    </section>
  </SiteLayout>
);

export default HowToCheckWebsiteLegitimatePage;