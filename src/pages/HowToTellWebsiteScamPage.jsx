import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import FAQ from '../components/FAQ';
import { SITE_URL } from '../config/site';

const SCAM_STEPS = [
  {
    number: '01',
    title: 'Check the exact link',
    description:
      'Look closely at the domain before interacting with the site. Look-alike domains and unexpected domain names can imitate familiar brands.',
  },
  {
    number: '02',
    title: 'Slow down when there is pressure',
    description:
      'Urgent deadlines, threats, countdowns, and unusually aggressive requests to pay or provide credentials are reasons to investigate rather than act immediately.',
  },
  {
    number: '03',
    title: 'Check HTTPS and TLS',
    description:
      'Confirm that the connection is secure and that TLS can be established correctly. Remember that HTTPS protects the connection but does not prove the operator is trustworthy.',
  },
  {
    number: '04',
    title: 'Look at domain evidence',
    description:
      'When registration information is available, examine domain age and status as part of the broader evidence. A new domain is not automatically a scam.',
  },
  {
    number: '05',
    title: 'Look for technical red flags',
    description:
      'Redirect problems, TLS failures, insecure login forms, mixed content, HTTP downgrades, and other observable weaknesses can warrant caution.',
  },
  {
    number: '06',
    title: 'Verify before paying or sharing credentials',
    description:
      'For money, passwords, personal information, or other sensitive actions, independently verify the business and the request before proceeding.',
  },
];

const RED_FLAGS = [
  'A domain that closely imitates another brand.',
  'Unexpected requests for passwords, payment, or sensitive information.',
  'Unusually strong pressure to act immediately.',
  'TLS or HTTPS failures.',
  'HTTPS requests that downgrade to HTTP.',
  'A password form being served over insecure HTTP.',
  'Insecure mixed content on an HTTPS page.',
  'A very recently registered or suspended domain when registry data is available.',
];

const NOT_PROOF = [
  'A low technical score does not by itself prove that a website is a scam.',
  'A new domain is not automatically fraudulent.',
  'A missing security header does not automatically mean malicious intent.',
  'A valid TLS certificate does not prove legitimacy.',
  'A clean technical result does not prove that a website is honest.',
  'Unknown evidence is neither proof of safety nor proof of danger.',
];

const FAQ_ITEMS = [
  {
    question: 'How can I tell if a website is a scam?',
    answer:
      'There is no single technical signal that can prove a website is a scam. Check the exact domain, look for suspicious pressure or payment requests, examine HTTPS and TLS, consider available domain information, and investigate observable technical red flags. For important decisions, verify the business through independent sources.',
  },
  {
    question: 'Does HTTPS mean a website is not a scam?',
    answer:
      'No. HTTPS protects data in transit, but legitimate certificates can also be used by fraudulent websites. HTTPS is useful evidence about the connection, not proof of the operator’s intentions.',
  },
  {
    question: 'Does a new domain mean the website is a scam?',
    answer:
      'No. A new domain may deserve additional scrutiny because it has less history, but legitimate websites can also be new. Domain age should be interpreted together with other evidence.',
  },
  {
    question: 'What scam-related signals can Website Truth Serum find?',
    answer:
      'When available, the scan can report observable technical and domain signals such as TLS problems, HTTPS and redirect behavior, insecure login forms, mixed content, page errors, and domain registration information. It does not determine intent or prove fraud.',
  },
  {
    question: 'What does Unknown mean?',
    answer:
      'Unknown means that the relevant evidence could not be determined during the scan. It should not be interpreted as either a clean bill of health or proof of danger.',
  },
  {
    question: 'What should I do if a website looks suspicious?',
    answer:
      'Pause before entering credentials or making a payment. Check the exact domain, investigate the available evidence, and independently verify important business claims. If you cannot establish enough confidence to proceed safely, do not rush into the transaction.',
  },
];

const HowToTellWebsiteScamPage = () => (
  <SiteLayout>
    <SEO
      title="How to Tell if a Website Is a Scam"
      description="Learn how to evaluate a suspicious website using technical evidence, domain information, security signals, and clear indicators of what is known or unknown."
      canonical={`${SITE_URL}/how-to-tell-if-a-website-is-a-scam`}
    />

    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        {
          name: 'How to Tell if a Website Is a Scam',
          url: '/how-to-tell-if-a-website-is-a-scam',
        },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">
          Suspicious website guide
        </span>

        <h1>
          How to Tell if a Website Is a <span className="truth">Scam</span>
        </h1>

        <p>
          A suspicious website should not be judged by one signal. Check the
          domain, connection security, available registration information,
          technical configuration, and page evidence—and understand what those
          signals cannot prove.
        </p>

        <div className="page-hero-actions">
          <Link
            to="/website-scam-checker"
            className="page-btn page-btn-primary"
          >
            Check a website for scam signals →
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
          <span className="page-eyebrow">Investigate first</span>

          <h2>Six steps for checking a suspicious website</h2>

          <p>
            Scam investigation works better when you slow down and collect
            evidence instead of relying on a single warning sign.
          </p>
        </div>

        <div className="page-grid">
          {SCAM_STEPS.map((step) => (
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
          <span className="page-eyebrow">Warning signs</span>

          <h2>Signals that deserve closer investigation</h2>

          <p>
            These observations can justify caution. They are not, individually
            or collectively, a guaranteed determination of fraudulent intent.
          </p>
        </div>

        <div className="page-grid">
          {RED_FLAGS.map((item) => (
            <div className="page-card" key={item}>
              <h3>Check this</h3>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Avoid false certainty</span>

          <h2>What is not proof that a website is a scam</h2>

          <p>
            Technical problems and domain characteristics can be useful
            evidence, but they do not establish intent by themselves.
          </p>
        </div>

        <div className="page-grid">
          {NOT_PROOF.map((item) => (
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
          <span className="page-eyebrow">Understand the report</span>

          <h2>Risk, evidence, and Unknown are not the same thing</h2>

          <p>
            A trustworthy assessment should show what was actually verified.
            If evidence could not be obtained, that limitation should remain
            visible rather than being silently converted into a positive or
            negative conclusion.
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
              Evidence that could not be determined from the available
              information. Unknown is neutral.
            </p>
          </div>

          <div className="page-card">
            <h3>Risk assessment</h3>
            <p>
              A deterministic assessment derived from collected evidence. It
              is not an AI-generated claim about whether someone intends to
              commit fraud.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Related checker</span>

          <h2>Check a suspicious website's observable evidence</h2>

          <p>
            Website Truth Serum's Website Scam Checker can help you examine
            available technical, domain, and page evidence before you decide
            whether further investigation is necessary.
          </p>
        </div>

        <div className="page-hero-actions">
          <Link
            to="/website-scam-checker"
            className="page-btn page-btn-primary"
          >
            Open Website Scam Checker →
          </Link>

          <Link
            to="/website-legitimacy-checker"
            className="page-btn page-btn-ghost"
          >
            Check website legitimacy
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
            A scam investigation can benefit from looking at several different
            dimensions of the same website.
          </p>
        </div>

        <div className="page-grid">
          <Link to="/website-scam-checker" className="page-card">
            <h3>Website Scam Checker</h3>
            <p>
              Look for observable technical and security evidence that may
              warrant caution.
            </p>
          </Link>

          <Link to="/website-trust-checker" className="page-card">
            <h3>Website Trust Checker</h3>
            <p>
              Review broader website evidence and understand what remains
              unknown.
            </p>
          </Link>

          <Link to="/website-safety-checker" className="page-card">
            <h3>Website Safety Checker</h3>
            <p>
              Examine HTTPS, TLS, security configuration, domain information,
              and page evidence.
            </p>
          </Link>

          <Link
            to="/how-to-check-if-a-website-is-legitimate"
            className="page-card"
          >
            <h3>How to Check if a Website Is Legitimate</h3>
            <p>
              Follow a broader evidence-based process for investigating an
              unfamiliar website.
            </p>
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <FAQ
          items={FAQ_ITEMS}
          eyebrow="Website scam guide FAQ"
        />
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <h2>Don't rush when a website feels suspicious</h2>

        <p>
          Check the evidence, understand its limitations, and independently
          verify important claims before sending money or sensitive information.
        </p>

        <Link
          to="/website-scam-checker"
          className="page-btn page-btn-primary"
        >
          Check Website Scam Signals →
        </Link>
      </div>
    </section>
  </SiteLayout>
);

export default HowToTellWebsiteScamPage;