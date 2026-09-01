import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import FullLogo from './FullLogo';
import { SITE_NAME } from '../config/site';

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/how-it-works', label: 'How It Works' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const FOOTER_COLUMNS = [
  {
    heading: 'Product',
    links: [
      { to: '/features', label: 'Features' },
      { to: '/pricing', label: 'Pricing' },
      { to: '/how-it-works', label: 'How It Works' },
      { to: '/', label: 'Trust Scanner' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
      { to: '/', label: 'Blog' },
      { to: '/', label: 'Careers' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { to: '/how-it-works', label: 'Risk Score Methodology' },
      { to: '/how-it-works', label: 'Blacklist Sources' },
      { to: '/', label: 'Documentation' },
      { to: '/', label: 'Changelog' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { to: '/', label: 'Privacy Policy' },
      { to: '/', label: 'Terms of Service' },
      { to: '/', label: 'Responsible Disclosure' },
    ],
  },
];

/**
 * Shared header/footer layout for the SEO subpages (Features, Pricing,
 * How It Works, About, Contact). Provides persistent internal linking and
 * a CTA back to the scanner. Styles come from index.css (".page-*" classes).
 */
const SiteLayout = ({ children }) => (
  <div className="page-shell">
    <header className="page-header">
      <div className="page-container page-header-inner">
        <Link to="/" className="page-logo" aria-label="Website Truth Serum — home">
          <FullLogo size={36} />
        </Link>

        <nav aria-label="Main navigation">
          <ul className="page-nav">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) => (isActive ? 'active' : undefined)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="page-header-cta">
          <Link to="/" className="page-btn page-btn-primary page-btn-sm">
            Scan a URL
          </Link>
        </div>
      </div>
    </header>

    <main>{children}</main>

    <footer className="page-footer">
      <div className="page-container">
        <div className="page-footer-grid">
          <div className="page-footer-brand">
            <Link to="/" className="page-logo">
              <FullLogo size={32} />
            </Link>
            <p>The evidence-based trust analyzer for a web full of filler.</p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div className="page-footer-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="page-footer-bottom">
          <span>© 2026 {SITE_NAME}. All rights reserved.</span>
          <span>Made with 🧪 and healthy skepticism.</span>
        </div>
      </div>
    </footer>
  </div>
);

export default SiteLayout;
