import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { breadcrumbSchema } from '../schemas';

/**
 * Breadcrumb component.
 *
 * Renders a visible breadcrumb navigation trail AND injects the matching
 * BreadcrumbList JSON-LD schema via react-helmet-async.
 *
 * Props:
 *   items (Array<{name, url}>) Ordered trail. The last item is rendered as
 *         the current page (not linked, marked aria-current="page") and is
 *         still included in the JSON-LD.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { name: 'Home', url: '/' },
 *     { name: 'Features', url: '/features' },
 *   ]} />
 */
const Breadcrumb = ({ items = [] }) => {
  if (!items.length) return null;

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema(items))}</script>
      </Helmet>

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol className="breadcrumb-list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.name}-${index}`} className="breadcrumb-item">
                {isLast ? (
                  <span className="breadcrumb-current" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link to={item.url}>{item.name}</Link>
                    <svg
                      className="breadcrumb-sep"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <style>{`
        .breadcrumb{max-width:1200px;margin:0 auto;padding:20px 24px 0}
        .breadcrumb-list{display:flex;align-items:center;gap:8px;flex-wrap:wrap;list-style:none}
        .breadcrumb-item{display:flex;align-items:center;gap:8px}
        .breadcrumb-item a{font-size:13.5px;font-weight:500;color:var(--text-secondary);text-decoration:none;transition:color .2s}
        .breadcrumb-item a:hover{color:var(--accent-primary-dark)}
        .breadcrumb-sep{color:var(--text-muted)}
        .breadcrumb-current{font-size:13.5px;font-weight:600;color:var(--text-primary)}
      `}</style>
    </>
  );
};

export default Breadcrumb;
