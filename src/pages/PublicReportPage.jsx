import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { SITE_URL, SITE_NAME } from '../config/site';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://website-truth-serum-api.onrender.com';

const formatConfidence = (value) => {
  if (typeof value !== 'number') return 'Unknown';
  return `${Math.round(value * 100)}%`;
};

const formatEffect = (value) => {
  if (typeof value !== 'number' || value === 0) return '0';
  return value > 0 ? `+${value}` : `${value}`;
};

const humanize = (value) => {
  if (!value) return 'Unknown';

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const PublicReportPage = () => {
  const { scanId } = useParams();

  const [report, setReport] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadReport = async () => {
      if (!scanId) {
        setStatus('not-found');
        return;
      }

      try {
        setStatus('loading');
        setErrorMessage('');

        const response = await fetch(
          `${API_URL}/api/reports/${encodeURIComponent(scanId)}`
        );

        if (cancelled) return;

        if (response.status === 404) {
          setStatus('not-found');
          return;
        }

        if (!response.ok) {
          setStatus('error');
          setErrorMessage(
            'The public report service is temporarily unavailable.'
          );
          return;
        }

        const data = await response.json();

        if (cancelled) return;

        setReport(data);
        setStatus('success');
      } catch (error) {
        if (cancelled) return;

        console.error('Public report load error:', error);
        setStatus('error');
        setErrorMessage('Unable to load this public report right now.');
      }
    };

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [scanId]);

  const canonicalUrl = `${SITE_URL}/report/${encodeURIComponent(scanId || '')}`;

  if (status === 'loading') {
    return (
      <>
        <SEO
          title="Loading Risk Report"
          canonical={canonicalUrl}
          noindex
        />

        <main className="public-report-page">
          <div className="public-report-state">
            <div className="public-report-spinner" aria-hidden="true" />
            <h1>Loading risk report…</h1>
            <p>Retrieving the saved analysis.</p>
          </div>
        </main>
      </>
    );
  }

  if (status === 'not-found') {
    return (
      <>
        <SEO
          title="Report Not Found"
          canonical={canonicalUrl}
          noindex
        />

        <main className="public-report-page">
          <div className="public-report-state">
            <div className="public-report-state-icon" aria-hidden="true">
              🔎
            </div>
            <p className="public-report-eyebrow">PUBLIC REPORT</p>
            <h1>Report not found</h1>
            <p>
              This report does not exist or is no longer available.
            </p>
            <Link className="btn btn-gradient" to="/">
              Analyze a Website
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <SEO
          title="Report Unavailable"
          canonical={canonicalUrl}
          noindex
        />

        <main className="public-report-page">
          <div className="public-report-state">
            <div className="public-report-state-icon" aria-hidden="true">
              ⚠️
            </div>
            <p className="public-report-eyebrow">PUBLIC REPORT</p>
            <h1>Report unavailable</h1>
            <p>{errorMessage}</p>
            <Link className="btn btn-gradient" to="/">
              Analyze a Website
            </Link>
          </div>
        </main>
      </>
    );
  }

  const transparency = report?.transparency || {};
  const evidence = Array.isArray(transparency.verified)
    ? transparency.verified
    : Array.isArray(report?.evidence)
      ? report.evidence
      : [];

  const notDetermined = Array.isArray(transparency.not_determined)
    ? transparency.not_determined
    : [];

  const breakdown = transparency.breakdown || report?.category_contributions || {};
  const score =
    typeof transparency.score === 'number'
      ? transparency.score
      : report?.trust_score;

  const confidence =
    typeof transparency.confidence === 'number'
      ? transparency.confidence
      : report?.confidence;

  const category =
    transparency.category ||
    report?.category ||
    report?.risk_level ||
    'Unknown';

  const domain = report?.domain || report?.scanned_url || 'Unknown';

  const summary =
    transparency.summary ||
    report?.summary ||
    'No summary was provided for this report.';

  const reportTitle =
    typeof score === 'number'
      ? `${domain} Website Risk Report — Score ${score}`
      : `${domain} Website Risk Report`;

  const reportDescription = `View the Website Truth Serum risk report for ${domain}, including its score, confidence, verified evidence, and what could not be determined.`;

  const analyzedAt =
    typeof report?.analyzed_at === 'string' &&
    report.analyzed_at.trim() !== '' &&
    !Number.isNaN(Date.parse(report.analyzed_at))
      ? report.analyzed_at
      : null;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${reportTitle} | ${SITE_NAME}`,
    description: reportDescription,
    url: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(analyzedAt
      ? { datePublished: analyzedAt, dateModified: analyzedAt }
      : {}),
  };

  const baseScore =
    typeof transparency.reconciliation?.base === 'number'
      ? transparency.reconciliation.base
      : null;

  const contributionTotal =
    typeof transparency.reconciliation?.sum_of_contributions === 'number'
      ? transparency.reconciliation.sum_of_contributions
      : null;

  return (
    <>
      <SEO
        title={reportTitle}
        description={reportDescription}
        canonical={canonicalUrl}
        type="article"
        schema={articleSchema}
      />

      <main className="public-report-page">
        <div className="public-report-container">
          <header className="public-report-header">
            <Link to="/" className="public-report-brand">
              Website Truth Serum
            </Link>

            <span className="public-report-badge">
              Public Risk Report
            </span>
          </header>

          <section className="public-report-hero">
            <p className="public-report-eyebrow">
              WEBSITE RISK ANALYSIS
            </p>

            <h1>{domain}</h1>

            <p className="public-report-subtitle">
              A saved Website Truth Serum assessment based on available
              evidence at the time of analysis.
            </p>
          </section>

          <section className="public-report-score-card">
            <div className="public-report-score-block">
              <span className="public-report-label">Trust Score</span>

              <div className="public-report-score">
                {typeof score === 'number' ? score : '—'}
                <span>/100</span>
              </div>
            </div>

            <div className="public-report-stat">
              <span className="public-report-label">Risk Classification</span>
              <strong>{humanize(category)}</strong>
            </div>

            <div className="public-report-stat">
              <span className="public-report-label">Confidence</span>
              <strong>{formatConfidence(confidence)}</strong>
            </div>
          </section>

          <section className="public-report-summary public-report-card">
            <div>
              <p className="public-report-eyebrow">ASSESSMENT</p>
              <h2>What the evidence says</h2>
            </div>

            <p>{summary}</p>
          </section>

          {evidence.length > 0 && (
            <section className="public-report-section">
              <div className="public-report-section-heading">
                <div>
                  <p className="public-report-eyebrow">VERIFIED EVIDENCE</p>
                  <h2>What was observed</h2>
                </div>

                <span className="public-report-count">
                  {evidence.length} signals
                </span>
              </div>

              <div className="public-report-evidence-grid">
                {evidence.map((item, index) => (
                  <article
                    className="public-report-evidence-card"
                    key={`${item.id || item.signal || 'evidence'}-${index}`}
                  >
                    <div className="public-report-evidence-top">
                      <span className="public-report-evidence-source">
                        {humanize(item.category || item.source)}
                      </span>

                      <span
                        className={`public-report-effect ${
                          item.applied_effect > 0
                            ? 'positive'
                            : item.applied_effect < 0
                              ? 'negative'
                              : 'neutral'
                        }`}
                      >
                        {formatEffect(item.applied_effect ?? item.effect)}
                      </span>
                    </div>

                    <h3>
                      {item.explanation ||
                        item.signal ||
                        'Observed evidence'}
                    </h3>

                    <p className="public-report-evidence-meta">
                      {humanize(item.signal)}
                      {item.confidence != null
                        ? ` · ${formatConfidence(item.confidence)} confidence`
                        : ''}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="public-report-section">
            <div className="public-report-section-heading">
              <div>
                <p className="public-report-eyebrow">CONTRIBUTION BREAKDOWN</p>
                <h2>How the evidence contributed</h2>
              </div>
            </div>

            <div className="public-report-breakdown">
              {Object.entries(breakdown).map(([key, value]) => (
                <div className="public-report-breakdown-row" key={key}>
                  <span>{humanize(key)}</span>
                  <strong>{formatEffect(value)}</strong>
                </div>
              ))}

              {baseScore !== null && (
                <div className="public-report-breakdown-row total">
                  <span>Base score</span>
                  <strong>{baseScore}</strong>
                </div>
              )}

              {contributionTotal !== null && (
                <div className="public-report-breakdown-row total">
                  <span>Total contribution</span>
                  <strong>{formatEffect(contributionTotal)}</strong>
                </div>
              )}

              {typeof score === 'number' && (
                <div className="public-report-breakdown-final">
                  <span>Final trust score</span>
                  <strong>{score}/100</strong>
                </div>
              )}
            </div>
          </section>

          {notDetermined.length > 0 && (
            <section className="public-report-unknown public-report-card">
              <div>
                <p className="public-report-eyebrow">NOT DETERMINED</p>
                <h2>Evidence that was unavailable</h2>
              </div>

              <p className="public-report-unknown-note">
                These areas were not determined by this scan. Unknown does
                not mean safe, and it does not mean dangerous.
              </p>

              <div className="public-report-tag-list">
                {notDetermined.map((item) => (
                  <span key={item}>{humanize(item)}</span>
                ))}
              </div>
            </section>
          )}

          <section className="public-report-methodology public-report-card">
            <p className="public-report-eyebrow">TRANSPARENCY</p>
            <h2>Evidence-based assessment</h2>

            <p>
              Website Truth Serum calculates the report from collected
              evidence. Missing or unavailable evidence is not treated as
              negative evidence, and the AI layer does not determine the
              score.
            </p>

            <div className="public-report-principles">
              <span>Evidence → score</span>
              <span>Unknown ≠ Safe</span>
              <span>Unknown ≠ Dangerous</span>
            </div>
          </section>

          <footer className="public-report-footer">
            <div>
              <p>
                Report ID: <code>{report?.scan_id || scanId}</code>
              </p>

              {report?.analyzed_at && (
                <p>
                  Analyzed:{' '}
                  {new Date(report.analyzed_at).toLocaleString()}
                </p>
              )}
            </div>

            <Link className="btn btn-gradient" to="/">
              Analyze Another Website
            </Link>
          </footer>
        </div>
      </main>
    </>
  );
};

export default PublicReportPage;