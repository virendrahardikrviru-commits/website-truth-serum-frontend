import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import FAQ from '../components/FAQ';
import { SITE_URL } from '../config/site';

const APPEARANCE_ITEMS = [
  {
    icon: '🏷️',
    title: 'A recognisable, well-formed domain',
    description:
      'A clean domain name that matches the brand it claims to represent is easier to trust at a glance. Look-alike or oddly spelled domains are harder to trust — but a well-formed name still only tells you about the name, not the operator.',
  },
  {
    icon: '🕰️',
    title: 'A domain with a registration history',
    description:
      'When RDAP data is available, the scan reports how long a domain has been registered. A longer history can be one supportive signal; many legitimate businesses are also new, so age alone decides nothing.',
  },
  {
    icon: '🔒',
    title: 'A secure, verified HTTPS connection',
    description:
      'A valid TLS certificate and proper HTTP-to-HTTPS behavior support confidence in the transport layer. Security protects the connection — it does not tell you whether the people behind the site are honest.',
  },
  {
    icon: '📝',
    title: 'Complete, coherent page content',
    description:
      'Clear titles, descriptions, language, and substantial content can look more credible than an empty or broken page. These are neutral observations, not a judgment of the claims being made.',
  },
  {
    icon: '🛡️',
    title: 'Maintained security configuration',
    description:
      'Observable security headers show that a site has been configured with some care. Good hygiene can support confidence, but it does not verify a business or its intentions.',
  },
];

const VERIFY_ITEMS = [
  {
    icon: '🌐',
    title: 'Domain registration evidence (RDAP)',
    description:
      'When RDAP is available, the scan reports registration age and status. A long-established domain can be recorded as a supportive signal, while very new or suspended domains are recorded as evidence. Unavailable RDAP stays neutral.',
  },
  {
    icon: '🔒',
    title: 'TLS certificate validity',
    description:
      'A real HTTPS handshake checks whether the site presents a valid, verified certificate. A valid certificate is recorded as positive transport evidence; a failure is recorded as evidence, never as proof of fraud.',
  },
  {
    icon: '🔁',
    title: 'HTTPS reachability and redirects',
    description:
      'The scan records whether HTTPS responds successfully, whether HTTP traffic is redirected to HTTPS, and whether the connection is unexpectedly downgraded or loops.',
  },
  {
    icon: '🛡️',
    title: 'Observable security headers',
    description:
      'Response headers such as HSTS, content security policy, frame protection, and content-type options are inspected. Their presence supports confidence in configuration; their absence is not treated as proof of anything sinister.',
  },
  {
    icon: '📄',
    title: 'Page metadata and content signals',
    description:
      'The scan observes title, description, language, viewport, canonical, and whether the page has substantial content. These are reported as neutral facts about the page.',
  },
  {
    icon: '❔',
    title: 'What could not be verified',
    description:
      'Anything the scan could not measure is listed explicitly as unknown. Unknown is neither a positive nor a negative signal — it simply means the evidence was unavailable.',
  },
];

const NOT_PROOF = [
  'A valid TLS certificate or strong security headers — security protects the connection, not your judgment of the operator',
  'A long-established domain — established sites can still deceive or change ownership',
  'Polished design, professional branding, or confident copy',
  'A clean result or the absence of a red flag — that is not a clean bill of health',
  'Legal or contact pages that look complete — the scan does not verify who is behind them',
  'Anything the scan could not measure or verify — an unknown result proves nothing either way',
];

const BEFORE_TRUSTING = [
  'Confirm the exact domain spelling and reach the site through a bookmark or a known link.',
  'Check that the page is served over HTTPS before entering any personal details.',
  'Treat domain registration age as one piece of evidence, not a verdict.',
  'Read the site\'s own contact, policy, and ownership pages yourself — the scan does not verify them.',
  'Cross-check the business and its claims through independent, reputable sources.',
  'Start with a small, reversible action before committing money or credentials.',
];

const FAQ_ITEMS = [
  {
    question: 'What does a website legitimacy check look for?',
    answer:
      'It looks for observable evidence that may support confidence: domain registration age and status when RDAP is available, a valid TLS certificate, proper HTTPS and redirect behavior, observable security headers, and page metadata and content signals. It reports those facts and the assessment derived from them — it does not verify a business or its intentions.',
  },
  {
    question: 'Does a high score prove a website is legitimate?',
    answer:
      'No. A high score means the evidence that could be collected was broadly positive; it is not proof of legitimacy. A technically well-configured site can still be deceptive, and the scan does not verify ownership, business practices, or intent.',
  },
  {
    question: 'Why does the report show "Unknown" for some dimensions?',
    answer:
      'Unknown means a dimension could not be measured or verified from the available evidence. Unknown is explicitly neutral: it is never converted into a positive or negative claim about the website.',
  },
  {
    question: 'Does a long-established domain prove a website is legitimate?',
    answer:
      'No. A long registration history can be one supportive piece of evidence, but it does not prove who operates the site today or how they behave. Domain age is a single signal, not a verdict.',
  },
  {
    question: 'Is the score generated by AI?',
    answer:
      'No. The assessment is produced by a deterministic scoring engine that applies fixed rules to collected evidence. The same evidence always produces the same result, and the report shows the evidence behind it. AI is not the scoring mechanism.',
  },
  {
    question: 'Can Website Truth Serum verify who owns or operates a website?',
    answer:
      'No. The scan does not perform identity or ownership verification and does not validate a business registration. It reports technical, registration, and page evidence only.',
  },
  {
    question: 'Do I need an account to run a check?',
    answer:
      'No. You can analyze a public webpage URL without creating an account.',
  },
];

const WebsiteLegitimacyCheckerPage = () => (
  <SiteLayout>
    <SEO
      title="Website Legitimacy Checker — Is This Website Legit?"
      description="Check what evidence supports confidence in a website: domain registration age, a valid TLS certificate, HTTPS behavior, security headers, and page signals — with unknowns shown honestly."
      canonical={`${SITE_URL}/website-legitimacy-checker`}
    />

    <Breadcrumb
      items={[
        { name: 'Home', url: '/' },
        { name: 'Website Legitimacy Checker', url: '/website-legitimacy-checker' },
      ]}
    />

    <section className="page-hero">
      <div className="page-container">
        <span className="page-eyebrow">Website Legitimacy Checker</span>

        <h1>
          Is This Website <span className="truth">Legit?</span>
        </h1>

        <p>
          Some websites deserve a closer look before you trust them. Website
          Truth Serum gathers observable evidence that can support confidence —
          and just as importantly, it shows what remains unverified.
        </p>

        <div className="page-hero-actions">
          <Link to="/" className="page-btn page-btn-primary">
            Check what a website shows →
          </Link>

          <Link to="/how-it-works" className="page-btn page-btn-ghost">
            See how the evidence works
          </Link>
        </div>
      </div>
    </section>

    <section className="page-section">
      <div className="page-container">
        <div className="page-section-head">
          <span className="page-eyebrow">Appearances can help</span>
          <h2>What can make a website look more legitimate</h2>
          <p>
            These qualities can reasonably raise your confidence, but they
            describe how a site presents itself — not who is behind it. The scan
            reports only the observable parts.
          </p>
        </div>

        <div className="page-grid">
          {APPEARANCE_ITEMS.map((item) => (
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
          <span className="page-eyebrow">Evidence, not vibes</span>
          <h2>What Website Truth Serum can verify</h2>
          <p>
            The assessment is deterministic and grounded in specific,
            observable evidence. What could not be measured is reported as
            unknown rather than assumed either way.
          </p>
        </div>

        <div className="page-grid">
          {VERIFY_ITEMS.map((item) => (
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
          <span className="page-eyebrow">Where confidence stops</span>
          <h2>What a legitimate-looking website does NOT prove</h2>
          <p>
            A professional appearance and a well-configured server are worth
            something, but they are not evidence of good intentions. None of the
            following proves a website is legitimate.
          </p>
        </div>

        <div className="page-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
          <span className="page-eyebrow">Do your own checks too</span>
          <h2>Before trusting a website</h2>
          <p>
            A scan is one input, not a replacement for your judgment. These
            steps help you decide what to do with the evidence.
          </p>
        </div>

        <div className="page-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {BEFORE_TRUSTING.map((item) => (
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
          eyebrow="Website legitimacy FAQ"
          title="Questions about judging if a site is legit"
        />
      </div>
    </section>

    <section className="page-cta">
      <div className="page-container">
        <div className="page-cta-box">
          <h2>See what evidence a website can show</h2>

          <p>
            Run a deterministic scan and see exactly what supports confidence —
            and what stays unverified.
          </p>

          <Link to="/" className="page-btn page-btn-primary">
            Check a website now →
          </Link>
        </div>
      </div>
    </section>
  </SiteLayout>
);

export default WebsiteLegitimacyCheckerPage;
