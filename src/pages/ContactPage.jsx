import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';
import SiteLayout from '../components/SiteLayout';
import { SITE_URL, CONTACT_EMAIL } from '../config/site';

const CONTACT_OPTIONS = [
  {
    icon: '✉️',
    title: 'Email us',
    description: 'For support, feedback, and feature requests.',
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: '🐦',
    title: 'Twitter / X',
    description: 'Fastest response for quick questions.',
    value: '@websitetruthserum',
    href: 'https://twitter.com/websitetruthserum',
  },
  {
    icon: '🐙',
    title: 'GitHub',
    description: 'Report issues or follow our public work.',
    value: 'websitetruthserum',
    href: 'https://github.com/websitetruthserum',
  },
];

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailtoLink = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `Contact from ${form.name || 'Website Truth Serum visitor'}`
    )}&body=${encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)}`;
    window.location.href = mailtoLink;
    setSubmitted(true);
  };

  return (
    <SiteLayout>
      <SEO
        title="Contact"
        description="Get in touch with the Website Truth Serum team for support, feedback, partnership, or press inquiries. We usually reply within one business day."
        canonical={`${SITE_URL}/contact`}
      />
      <Breadcrumb
        items={[
          { name: 'Home', url: '/' },
          { name: 'Contact', url: '/contact' },
        ]}
      />

      <section className="page-hero">
        <div className="page-container">
          <span className="page-eyebrow">Contact</span>
          <h1>
            Let's <span className="truth">talk</span>
          </h1>
          <p>
            Found a suspicious site worth investigating? Spotted a bug? Just want to say hi?
            We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="page-container">
          <div className="page-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {CONTACT_OPTIONS.map((option) => (
              <a
                key={option.title}
                href={option.href}
                className="page-card"
                style={{ textDecoration: 'none', display: 'block' }}
                target={option.href.startsWith('http') ? '_blank' : undefined}
                rel={option.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <div className="page-card-icon">{option.icon}</div>
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <p style={{ color: 'var(--accent-secondary)', fontWeight: 600, marginTop: '12px' }}>
                  {option.value}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section page-band">
        <div className="page-container">
          <div className="page-section-head">
            <h2>Or send us a message</h2>
            <p>We usually reply within one business day.</p>
          </div>
          <form
            onSubmit={handleSubmit}
            style={{ maxWidth: '560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <input
              type="text"
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <input
              type="email"
              required
              placeholder="Your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <textarea
              required
              rows="5"
              placeholder="How can we help?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <button type="submit" className="page-btn page-btn-primary" style={{ justifyContent: 'center' }}>
              {submitted ? 'Opening your email app…' : 'Send message'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
              Prefer to run a scan first?{' '}
              <Link to="/" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
                Try the trust checker
              </Link>{' '}
              or explore{' '}
              <Link to="/pricing" style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>
                pricing
              </Link>
              .
            </p>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
};

export default ContactPage;
