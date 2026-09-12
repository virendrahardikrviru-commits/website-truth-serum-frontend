import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import FAQ from '../components/FAQ';
import { SITE_URL } from '../config/site';

const SPOT_ITEMS = [
  {
    icon: '🎣',
    title: 'Too-good-to-be-true offers',
    description:
      'Returns, prices, or freebies that seem impossible are a classic lure. Treat the offer itself as a reason to slow down and investigate — the scan does not judge pricing or promotions.',
  },
  {
    icon: '⏳',
    title: 'Fake urgency',
    description:
      'Countdowns, "only a few left", and threats that an account will be closed push you to act before checking. The scan does not measure marketing pressure; it can only report observable evidence.',
  },
  {
    icon: '🆕',
    title: 'Very new domains',
    description:
      'A domain registered days ago has little track record. When RDAP data is available, the scan reports registration age as one piece of evidence — a new domain is not automatically a scam.',
  },
  {
    icon: '📭',
    title: 'Missing or suspicious contact information',
    description:
      'Sites that hide who runs them deserve extra scrutiny. The scan can report page metadata and content signals, but it does not verify a business\'s identity or legal standing.',
  },
  {
    icon: '🔑',
    title: 'Credential-harvesting or insecure login forms',
    description:
      'Be careful entering passwords anywhere. If a page is served over HTTP and contains a password form that does not submit over HTTPS, the scan reports that observable weakness. It does not inspect what a form does with your data.',
  },
];

const EVIDENCE = [
  {
    icon: '🌐',
    title: 'Domain age & status (RDAP)',
    description:
      'When RDAP is available, the scan reports registration age and status. Registry or registrar suspension states and very recent registration appear as evidence; unavailable RDAP stays neutral and is not treated as suspicious.',
  },
  {
    icon: '🔒',
    title: 'TLS certificate validity',
    description:
      'A real HTTPS handshake checks whether the site presents a valid, verified certificate. Verification or handshake failures are recorded as evidence — they do not by themselves prove fraud.',
  },
  {
    icon: '🔁',
    title: 'HTTP/HTTPS behavior & redirects',
    description:
      'The scan records whether HTTPS works, whether HTTP redirects to HTTPS, whether a request is downgraded to HTTP, and whether a redirect loop or an error on the site\'s primary page occurs.',
  },
  {
    icon: '🛡️',
    title: 'Security headers',
    description:
      'Observable response headers — such as HSTS, content security policy, frame protection, and content-type options — are inspected and reported as evidence.',
  },
  {
    icon: '🔑',
    title: 'Insecure login form over HTTP',
    description:
      'If a page is served over HTTP and contains a password form that does not submit over HTTPS, the scan flags that observable transport weakness.',
  },
  {
    icon: '📄',
    title: 'Mixed content',
    description:
      'On an HTTPS page, subresources loaded over insecure HTTP are detected and reported as a mixed-content signal.',
  },
  {
    icon: '🧪',
    title: 'Page metadata & content signals',
    description:
      'The scan observes title, description, language, viewport, canonical, and content presence. These are neutral observations, not a judgment of the text.',
  },
];

const RED_FLAGS = [
  'A very recently registered domain (when RDAP is available)',
  'Registry or registrar hold / suspension status',
  'TLS certificate verification or handshake failure',
  'An HTTPS request downgraded to HTTP, or a redirect loop',
  'A password form served over insecure HTTP',
  'Insecure mixed content on an HTTPS page',
  'An error on the site\'s primary page over HTTPS',
  'Missing or thin page metadata and content signals',
];

const NOT_PROOF = [
  'Missing evidence or an "Unknown" result — unknown is neither safe nor dangerous',
  'A missing security header or a misconfigured server',
  'A brand-new domain — many legitimate sites are new',
  'A valid certificate or a strong score — a technically sound site can still be fraudulent',
  'An absent red flag, which is not a clean bill of health',
  'Anything the scan could not measure or verify',
];

const CHECKLIST = [
  'Check the domain spelling carefully — look-alike domains mimic real brands.',
  'Be cautious with unusually urgent offers or deadlines.',
  'Be cautious with unrealistic prices or returns.',
  'Check that the page is served over HTTPS before entering anything.',
  'Consider domain registration age as one piece of evidence, not a verdict.',
  'Avoid entering credentials or payment information until you have investigated the site through independent sources.',
];

const FAQ_ITEMS = [
  {
    question: 'How can I tell if a website is a scam?',
    answer:
      'There is no single reliable signal. Scam sites often combine pressure, unrealistic offers, and thin or hidden ownership details. A practical approach is to gather independent evidence: check the exact domain, look at how long it has been registered, confirm the connection is secure, and be careful with any request for money or credentials. An evidence-based check can surface technical and registration facts, but it cannot prove intent.',
  },
  {
    question: 'Can Website Truth Serum tell me for certain that a website is a scam?',
    answer:
      'No. It reports observable evidence and a deterministic assessment derived from that evidence. It does not detect intent and cannot prove that a website is a scam or that it is legitimate.',
  },
  {
    question: 'What scam-related red flags can the checker actually find?',
    answer:
      'When available, it reports a very recently registered or suspended domain, TLS certificate verification or handshake failures, HTTPS requests downgraded to HTTP, redirect loops, an error on the site\'s primary HTTPS page, a password form served over insecure HTTP, mixed content on an HTTPS page, and missing or thin page metadata and content signals.',
  },
  {
    question: 'Does a low score or a red flag mean the website is definitely a scam?',
    answer:
      'No. A low score or a specific red flag means the evidence warrants caution. A misconfigured or poorly maintained site can still be honest, while a well-configured site can still be fraudulent. Use the report as one input, not a verdict.',
  },
  {
    question: 'Does a clean result mean the website is not a scam?',
    answer:
      'No. A clean result only means the evidence we could collect did not surface a red flag. Missing evidence is unknown, not proof of legitimacy, and the scan does not judge intent, pricing, or business practices.',
  },
  {
    question: 'Do I need an account to check a website?',
    answer:
      'No. You can analyze a public webpage URL without creating an account.',
  },
  {
    question: 'Can it scan emails, files, or marketplace listings?',
    answer:
      'No. The scan analyzes one public webpage URL at a time. It does not read emails, inspect files or attachments, or evaluate marketplace listings.',
  },
];

const WebsiteScamCheckerPage = () => (
  <SiteLayout>
    <SEO
      title="Website Scam Checker — Is This Website a Scam?"
      description="Use our free website scam checker to look for scam red flags: newly registered domains, TLS and HTTPS issues, insecure login forms, and page signals — with evidence shown."
      canonical={`${SITE_URL}/website-scam-checker`}
    />

    <style>{`
      .scam-compare{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
      @media (max-width:768px){.scam-compare{grid-template-columns:1fr}}
    `}</style>

    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        { name: 'Website Scam Checker', url: '/website-scam-checker' },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">Website Scam Checker</span>

        <h1>
          Is This Website a <span className="truth">Scam?</span>
        </h1>

        <p>
          When a site feels off, it helps to look at what can actually be
          observed. Website Truth Serum examines technical, domain, and page
          evidence that can help you investigate a suspicious website — and
          shows what could and could not be verified.
        </p>

        <div className="page-hero-actions">
          <Link to="/" className="page-btn page-btn-primary">
            Check a website for scam signals →
          </Link>

          <Link to="/how-it-works" className="page-btn page-btn-ghost">
            See how the scan works
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Stay skeptical</span>
          <h2>How to spot a scam website</h2>
          <p>
            These are patterns worth watching for when a site feels
            suspicious. They are habits for you to apply — the scan only reports
            the observable evidence it can actually collect.
          </p>
        </div>

        <div className="page-grid">
          {SPOT_ITEMS.map((item) => (
            <div className="page-card" key={item.title}>
              <div className="page-card-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">What the scan measures</span>
          <h2>What the scam checker can actually verify</h2>
          <p>
            The assessment is deterministic and built from specific, observable
            facts. Anything that cannot be measured stays unknown rather than
            being treated as suspicious.
          </p>
        </div>

        <div className="page-grid">
          {EVIDENCE.map((item) => (
            <div className="page-card" key={item.title}>
              <div className="page-card-icon">{item.icon}</div>
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
          <span className="page-eyebrow">Read it carefully</span>
          <h2>Red flags versus not proof of a scam</h2>
          <p>
            Evidence can raise or lower concern, but it rarely stands alone.
            Technical problems, missing evidence, or an unknown result do not by
            themselves prove fraud.
          </p>
        </div>

        <div className="scam-compare">
          <div className="page-card">
            <h3>Red flags the evidence can reveal</h3>
            <ul style={{ marginTop: '14px', paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '14.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {RED_FLAGS.map((flag) => (
                <li key={flag}>{flag}</li>
              ))}
            </ul>
          </div>

          <div className="page-card">
            <h3>What is NOT proof of a scam</h3>
            <ul style={{ marginTop: '14px', paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '14.5px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {NOT_PROOF.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section className="page-section page-band">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Before you commit</span>
          <h2>Before you enter payment or login details</h2>
          <p>
            These steps are practical precautions. The scan does not verify that
            a business is legitimate, so treat any result as one input among
            your own checks.
          </p>
        </div>

        <div className="page-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {CHECKLIST.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <FAQ
          items={FAQ_ITEMS}
          eyebrow="Website scam checker FAQ"
          title="Questions about checking a site for scams"
        />
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <div className="page-cta-box">
          <h2>Check a website for scam red flags</h2>

          <p>
            Run an evidence-based scan and see exactly what the site reveals —
            and what it does not.
          </p>

          <Link to="/" className="page-btn page-btn-primary">
            Check a website for scam signals →
          </Link>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default WebsiteScamCheckerPage;
