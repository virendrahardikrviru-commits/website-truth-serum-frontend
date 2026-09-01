import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * FAQ component.
 *
 * Renders a visually styled FAQ accordion and injects the matching
 * FAQPage JSON-LD schema via react-helmet-async, making the questions
 * eligible for rich results in Google search.
 *
 * Props:
 *   items      (Array<{question, answer}>) The FAQ items to render + index.
 *   title      (string)  Section heading text (default "Frequently Asked Questions").
 *   eyebrow    (string)  Small eyebrow label above the title (default "FAQ").
 *   openByDefault (boolean) Expand the first item on load (default true).
 */
const FAQ = ({ items = [], title = 'Frequently Asked Questions', eyebrow = 'FAQ', openByDefault = true }) => {
  if (!items.length) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <section className="faq-root" aria-labelledby="faq-heading">
        <div className="faq-head">
          <span className="faq-eyebrow">{eyebrow}</span>
          <h2 className="faq-title" id="faq-heading">{title}</h2>
        </div>

        <div className="faq-list">
          {items.map((item, index) => (
            <details
              key={index}
              className="faq-item"
              open={openByDefault && index === 0}
            >
              <summary className="faq-question">
                <h3>{item.question}</h3>
                <span className="faq-toggle" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <style>{`
        .faq-root{max-width:760px;margin:0 auto;padding:80px 0}
        .faq-head{text-align:center;max-width:640px;margin:0 auto 44px}
        .faq-eyebrow{font-family:var(--font-mono);font-size:12.5px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-secondary);display:block;margin-bottom:14px}
        .faq-title{font-size:clamp(28px,3.6vw,40px);font-weight:800;line-height:1.15;letter-spacing:-0.02em}
        .faq-list{display:flex;flex-direction:column;gap:14px}
        .faq-item{background:var(--bg-card);border:1px solid var(--border-default);border-radius:16px;overflow:hidden;transition:border-color .25s,box-shadow .25s}
        .faq-item[open]{border-color:rgba(0,255,102,.4);box-shadow:0 12px 32px rgba(15,23,42,.07)}
        .faq-question{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;cursor:pointer;list-style:none}
        .faq-question::-webkit-details-marker{display:none}
        .faq-question h3{font-size:16.5px;font-weight:700;line-height:1.35}
        .faq-question:hover h3{color:var(--accent-primary-dark)}
        .faq-toggle{flex-shrink:0;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--bg-card-alt);color:var(--text-secondary);transition:transform .25s}
        .faq-item[open] .faq-toggle{transform:rotate(180deg);background:rgba(0,255,102,.14);color:var(--accent-primary-dark)}
        .faq-answer{padding:0 24px 22px;color:var(--text-secondary);font-size:15px;line-height:1.7;max-width:640px}

        @media (max-width:768px){
          .faq-root{padding:60px 0}
          .faq-question{padding:16px 18px}
          .faq-answer{padding:0 18px 18px}
        }
      `}</style>
    </>
  );
};

export default FAQ;
