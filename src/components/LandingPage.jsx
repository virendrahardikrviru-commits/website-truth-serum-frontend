import React, { useState, useEffect, useRef } from 'react';
import FullLogo from './FullLogo';
import SEO from './SEO';
import FAQ from './FAQ';
import { saveScanHistory } from '../services/auth';
import { homeSchema } from '../schemas';
import { SITE_URL, DEFAULT_DESCRIPTION } from '../config/site';
import { categoryLabel, classifyEffect, deriveSslStatus, signalLabel, sslStatusLabel } from '../lib/evidenceUi';
import {
  FALLBACK_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  TIMEOUT_ERROR_MESSAGE,
  scanErrorMessage,
} from '../lib/scanMessages';

// Internal marker for scan failures that already carry a safe, static,
// user-facing message. Raw exceptions are never surfaced to the user.
class ScanFailure extends Error {
  constructor(kind, status = null) {
    super(kind === 'network' ? NETWORK_ERROR_MESSAGE : scanErrorMessage(status));
    this.name = 'ScanFailure';
    this.kind = kind;
    this.status = status;
  }
}

// Bounded client-side scan budget. Render free-tier cold starts can exceed
// 50 seconds and the backend evidence deadline is 22 seconds, so 90 seconds is
// a conservative cap that rarely fires on legitimate slow scans yet stops an
// indefinite "Scanning..." wait.
const SCAN_TIMEOUT_MS = 90000;

const LandingPage = ({ user, onLogin, onLogout }) => {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const resultsRef = useRef(null);
  const unmountedRef = useRef(false);
  const scanControllerRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  // API URL from environment or fallback
  const API_URL = import.meta.env.VITE_API_URL || 'https://website-truth-serum-api.onrender.com';

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Abort any in-flight scan and clear its timer when the component unmounts
  // so no state update can happen after navigation away.
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      if (scanControllerRef.current) {
        try {
          scanControllerRef.current.abort();
        } catch (abortErr) {
          // Abort errors are never user-facing.
        }
      }
      if (scanTimeoutRef.current) {
        window.clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
    };
  }, []);

  // Handle scan - NOW CALLS REAL API
  const handleScan = async (e) => {
    e.preventDefault();
    if (scanning) return;

    let domain = url.trim();
    if (!domain) {
      setApiError('Please enter a URL');
      return;
    }

    // Add https:// if missing
    if (!/^https?:\/\//i.test(domain)) {
      domain = 'https://' + domain;
    }

    try {
      // Validate URL
      new URL(domain);
    } catch {
      setApiError('Please enter a valid URL');
      return;
    }

    setScanning(true);
    setApiError(null);
    setShowResults(false);
    setResult(null);

    // One AbortController + bounded timeout per scan.
    let settled = false;
    let abortedByTimeout = false;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      abortedByTimeout = true;
      controller.abort();
    }, SCAN_TIMEOUT_MS);
    scanControllerRef.current = controller;
    scanTimeoutRef.current = timeoutId;

    try {
    let response;
    try {
      // Call the real backend API (exactly one request per scan).
      response = await fetch(`${API_URL}/api/analyze/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          url: domain,
          deep_analysis: false
        }),
      });
    } catch (fetchError) {
      // A controlled abort (timeout/unmount) is not a network failure; it is
      // re-thrown and handled by the outer catch.
      if (fetchError && fetchError.name === 'AbortError') {
        throw fetchError;
      }
      // Transport failure (offline, DNS, refused). Raw text is never shown.
      throw new ScanFailure('network');
    }

    if (!response.ok) {
      throw new ScanFailure('http', response.status);
    }

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      // A controlled abort during body read is not a parse failure.
      if (parseError && parseError.name === 'AbortError') {
        throw parseError;
      }
      // Unreadable body; treat as a service failure, never surface the error.
      throw new ScanFailure('http', 500);
    }

    settled = true;

      // Transform API response to match the existing result structure.
      // The backend is the source of truth for risk semantics: category,
      // risk_level, score, confidence, registrar, duration and the
      // transparency report are taken from the response verbatim.
      const registrar = (data.domain_intel && data.domain_intel.registrar) || null;
      // TLS display status is derived from the collected ssl evidence rather
      // than the top-level convenience field, which is null in evidence mode.
      // Absence of ssl_valid is never treated as invalidity.
      const sslStatus = deriveSslStatus(
        (data.transparency && data.transparency.verified) || null,
        data.ssl_valid
      );
      const sslLabel = sslStatusLabel(sslStatus);
      const transformedResult = {
        domain: data.domain,
        scannedUrl: domain,
        score: data.trust_score,
        category: data.category,
        ai: data.ai_probability,
        age: data.domain_age || 'Unknown',
        ssl: sslLabel,
        registrar,
        durationMs: data.duration_ms != null ? data.duration_ms : null,
        summary: data.summary || 'This assessment reflects the evidence we could verify — it is not a guarantee of legitimacy or safety.',
        isEvidenceMode: Array.isArray(data.evidence),
        riskLevel: data.risk_level || null,
        confidence: data.confidence == null ? null : data.confidence,
        evidence: data.evidence || [],
        verified: (data.transparency && data.transparency.verified) || [],
        breakdown: data.category_contributions || {},
        breakdownDetail: (data.transparency && data.transparency.breakdown_detail) || null,
        reconciliation: (data.transparency && data.transparency.reconciliation) || null,
        notDetermined: (data.transparency && data.transparency.not_determined) || [],
        notes: data.notes || [],
        profile: {
          badge: [data.category, data.category === 'trusted' ? 'Trusted' : data.category === 'moderate' ? 'Moderate Risk' : 'Untrustworthy'],
          red: data.red_flags || [],
          green: data.green_flags || [],
          ssl: [sslLabel],
          registrar: [registrar || 'Not determined'],
          age: [data.domain_age || 'Unknown'],
        }
      };

      setResult(transformedResult);
      setShowResults(true);

       // Save scan history if user is logged in
if (user) {
  try {
    await saveScanHistory(user.id, {
      domain: data.domain,
      trust_score: data.trust_score,
      category: data.category,
      ai_probability: data.ai_probability,
      red_flags: data.red_flags || [],
      green_flags: data.green_flags || [],
      summary: data.summary,
    });
    console.log('Scan saved to history!');
  } catch (historyError) {
    console.error('Failed to save scan history:', historyError);
  }
}

      // Scroll to results
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);

    } catch (error) {
      console.error('Scan Error:', error);
      // Never update UI after unmount, and never let an abort/error overwrite
      // a successful result (race guard).
      if (unmountedRef.current || settled) {
        return;
      }
      if (error instanceof ScanFailure) {
        setApiError(error.message);
      } else if (error && error.name === 'AbortError') {
        // Controlled abort (timeout/cancellation). Neutral, never a server
        // failure claim and never raw exception text.
        setApiError(TIMEOUT_ERROR_MESSAGE);
      } else {
        // Any unexpected exception: safe generic copy only.
        setApiError(FALLBACK_ERROR_MESSAGE);
      }
    } finally {
      if (scanTimeoutRef.current) {
        window.clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
      scanControllerRef.current = null;
      if (!unmountedRef.current) {
        setScanning(false);
      }
    }
  };

    // Share the generated risk report using the browser's native Share API.
  // Falls back to copying the complete report text when Web Share is unavailable.
  const shareScanReport = async () => {
    if (!result) {
      setCopyFeedback('No risk report is available to share.');
      window.setTimeout(() => setCopyFeedback(null), 3000);
      return;
    }

    const verified = Array.isArray(result.verified) ? result.verified : [];
    const notDetermined = Array.isArray(result.notDetermined)
      ? result.notDetermined
      : [];
    const redFlags = Array.isArray(result.profile?.red)
      ? result.profile.red
      : [];
    const greenFlags = Array.isArray(result.profile?.green)
      ? result.profile.green
      : [];
    const notes = Array.isArray(result.notes) ? result.notes : [];

        const measuredEvidenceAreas = new Set(
      verified
        .map((item) => item && item.category)
        .filter(Boolean)
    ).size;

    const plannedEvidenceAreas =
      measuredEvidenceAreas + notDetermined.length;

    const coverageText = `Verified across ${measuredEvidenceAreas} of ${plannedEvidenceAreas} planned evidence areas`;

    const reportLines = [
      '🛡️ Website Truth Serum — Risk Report',
      '',
      `Website: ${result.domain || result.scannedUrl || 'Unknown'}`,
      `Risk: ${result.category === 'trusted' ? 'Trusted' : result.category === 'moderate' ? 'Moderate Risk' : 'Untrustworthy'}`,
      `Risk Score: ${result.score != null ? `${result.score}/100` : 'Unknown'}`,
      `Confidence: ${
        result.confidence != null
          ? `${Math.round(result.confidence * 100)}%`
          : 'Unknown'
      }`,
      `AI Likelihood: ${
        result.ai != null ? `${Math.round(result.ai * 100)}%` : 'Not measured'
      }`,
      '',
      coverageText,
      '',
      '🚩 Red Flags',
      ...(redFlags.length
        ? redFlags.map((flag) => `• ${flag}`)
        : ['• No negative signals could be verified.']),
      '',
      '✅ Green Flags',
      ...(greenFlags.length
        ? greenFlags.map((flag) => `• ${flag}`)
        : ['• No positive signals could be verified.']),
      '',
      '✓ What We Verified',
      ...(verified.length
        ? verified.map(
            (item) =>
              `• ${item.label || item.name || item.id || String(item)}`
          )
        : ['• No signals could be verified — evidence was unavailable.']),
      '',
      '— What We Could Not Determine',
      ...(notDetermined.length
        ? notDetermined.map((item) => {
            if (typeof item === 'string') return `• ${item}`;
            return `• ${item.label || item.name || item.id || 'Unknown'} — ${
              item.reason || item.status || 'not measured'
            }`;
          })
        : ['• All planned evidence areas were measured.']),
      '',
      '⚖️ Evidence Breakdown',
      ...(Object.keys(result.breakdown || {}).length
        ? Object.entries(result.breakdown).map(
            ([key, value]) => `• ${key}: ${value}`
          )
        : [
            '• No category contributions were available.',
          ]),
      '',
      'About this score',
      result.summary || 'No additional summary was provided.',
      ...(notes.length ? ['', 'Notes', ...notes.map((note) => `• ${note}`)] : []),
      '',
      'Generated by Website Truth Serum',
    ];

    const reportText = reportLines.join('\n');

    try {
      if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function'
      ) {
        await navigator.share({
          title: 'Website Truth Serum — Risk Report',
          text: reportText,
        });
        return;
      }

      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(reportText);
        setCopyFeedback('Risk report copied to clipboard.');
        window.setTimeout(() => setCopyFeedback(null), 3000);
        return;
      }

      setCopyFeedback('Sharing is not available in this browser.');
      window.setTimeout(() => setCopyFeedback(null), 3000);
    } catch (error) {
      // User cancellation is normal and should not be reported as an error.
      if (error && error.name === 'AbortError') {
        return;
      }

      console.error('Share error:', error);
      setCopyFeedback('Sharing is not available in this browser.');
      window.setTimeout(() => setCopyFeedback(null), 3000);
    }
  };

  // Copy the scanned URL to the clipboard (no persistence, no network).
  // Uses the browser Clipboard API only, with truthful failure feedback.
  const copyScanLink = async () => {
    const text = result && (result.scannedUrl || result.domain);
    if (!text) {
      setCopyFeedback('No scanned URL is available to copy.');
      return;
    }
    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === 'function'
      ) {
        await navigator.clipboard.writeText(text);
        setCopyFeedback('Scan link copied to clipboard.');
      } else {
        setCopyFeedback('Copying is not available in this browser.');
      }
    } catch (clipError) {
      console.error('Copy error:', clipError);
      setCopyFeedback('Copying is not available in this browser.');
    }
    window.setTimeout(() => setCopyFeedback(null), 3000);
  };

  const sampleUrls = ['shady-deals-90off.store', 'github.com', 'mega-rypto-doubler.biz'];

  // Risk presentation follows the backend's interpretation. The backend maps
  // the numeric score + evidence breadth to a `category` and `risk_level`; the
  // frontend renders those values and never re-derives risk from hard-coded
  // score thresholds (a score of 76 can still be `category: "moderate"` when
  // the trusted-breadth guard applies).
  const RISK_LABELS = { low: 'Low Risk', moderate: 'Moderate Risk', elevated: 'Elevated Risk', high: 'High Risk' };
  const RISK_BADGE_CLS = { low: 'trusted', moderate: 'moderate', elevated: 'moderate', high: 'untrustworthy' };
  const CATEGORY_META = {
    trusted: { color: '#22c55e', bar: 'linear-gradient(90deg,#22c55e,#00FF66)', label: 'Trusted' },
    moderate: { color: '#eab308', bar: 'linear-gradient(90deg,#eab308,#facc15)', label: 'Moderate Risk' },
    untrustworthy: { color: '#ef4444', bar: 'linear-gradient(90deg,#ef4444,#f87171)', label: 'Untrustworthy' },
  };
  const categoryMeta = (res) => CATEGORY_META[res?.category] || CATEGORY_META.moderate;
  const displayRisk = (res) => {
    if (res && res.riskLevel && RISK_BADGE_CLS[res.riskLevel]) {
      return { label: RISK_LABELS[res.riskLevel], cls: RISK_BADGE_CLS[res.riskLevel] };
    }
    return { label: res?.profile?.badge?.[1] || 'Unknown', cls: res?.profile?.badge?.[0] || 'moderate' };
  };
  const fmtDuration = (ms) => (ms != null ? `${(ms / 1000).toFixed(1)}s` : null);
  const fmtReconciliation = (rec) => {
    if (!rec) return null;
    const terms = Object.entries(rec.contributions || {}).map(([cat, delta]) => `${cat} ${delta > 0 ? '+' : ''}${delta}`);
    const formula = `Base ${rec.base}${terms.length ? ` + (${terms.join(', ')})` : ''} = ${rec.reconciled_score}`;
    return rec.exact ? formula : `${formula} (final score ${rec.final_score})`;
  };
  // Confidence reflects usable evidence categories, not individual signal
  // counts. Derived from the backend's own verified/not-determined lists.
  const confidenceNote = (res) => {
    const measured = new Set((res?.verified || []).map((v) => v.category)).size;
    const planned = measured + (res?.notDetermined || []).length;
    return `Verified across ${measured} of ${planned} planned evidence areas`;
  };

  // FAQ content (also drives the FAQPage JSON-LD schema via the FAQ component)
  const faqItems = [
    {
      question: 'What is a website risk score?',
      answer:
        'A website risk score is a 0–100 rating anchored at 50 (unknown). Positive security and domain evidence raises it, negative evidence lowers it, and missing evidence never counts against a site. Every report shows the exact evidence and the math behind the score.',
    },
    {
      question: 'How does Website Truth Serum analyze a website?',
      answer:
        'We fetch the page once and check HTTPS behavior, TLS certificate validity, security headers, domain registration (RDAP), and page metadata. Each observed fact becomes a piece of evidence that a deterministic engine sums into a score and confidence. Dimensions we could not measure are listed explicitly as unknown.',
    },
    {
      question: 'How accurate is the trust analysis?',
      answer:
        'We show you what we could verify and what we could not. The score is deterministic — the same evidence always produces the same score — and the report lists every signal. It is an evidence summary, not a guarantee that a site is legitimate or safe.',
    },
    {
      question: 'Is Website Truth Serum free to use?',
      answer:
        'Yes. The free plan includes 10 scans per day with a risk score, confidence, and a full evidence breakdown — no credit card and no sign-up required.',
    },
    {
      question: 'Do I need an account or a browser extension?',
      answer:
        'No. You can scan any URL from the homepage without an account. Creating a free account lets you save your scan history, and a browser extension is optional.',
    },
  ];

  // Helper function for picking random items (used for mock data fallback)
  //const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  return (
    <>
      <SEO
        title="Website Trust Checker"
        description={DEFAULT_DESCRIPTION}
        canonical={`${SITE_URL}/`}
        schema={homeSchema}
      />
      <div className="wts-landing">
      <style>{`
        :root {
          --bg-main: #f8fafc;
          --bg-card: #ffffff;
          --bg-card-alt: #f1f5f9;
          --text-primary: #0f172a;
          --text-secondary: #475569;
          --text-muted: #94a3b8;
          --border-default: #e2e8f0;
          --accent-primary: #00FF66;
          --accent-primary-dark: #00c24d;
          --accent-secondary: #4f46e5;
          --accent-gradient: linear-gradient(135deg,#00FF66 0%,#4f46e5 100%);
          --trusted-green: #22c55e;
          --warning-amber: #eab308;
          --danger-red: #ef4444;
          --radius-card: 16px;
          --font-heading: 'Plus Jakarta Sans',sans-serif;
          --font-body: 'Inter',sans-serif;
          --font-mono: 'JetBrains Mono',monospace;
        }
        .wts-landing *{margin:0;padding:0;box-sizing:border-box}
        .wts-landing{font-family:var(--font-body);background:var(--bg-main);color:var(--text-primary);line-height:1.6;-webkit-font-smoothing:antialiased}
        .wts-landing h1,.wts-landing h2,.wts-landing h3,.wts-landing h4{font-family:var(--font-heading);line-height:1.15;letter-spacing:-0.02em}
        .container{max-width:1200px;margin:0 auto;padding:0 24px}
        .wts-landing section{padding:80px 0}

        .site-header{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(248,250,252,.75);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(226,232,240,.8);transition:box-shadow .3s}
        .site-header.scrolled{box-shadow:0 4px 24px rgba(15,23,42,.06)}
        .header-inner{display:flex;align-items:center;justify-content:space-between;height:68px}
        .logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text-primary);font-family:var(--font-heading);font-weight:800;font-size:17px;cursor:pointer}
        .logo-mark{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:var(--accent-gradient);box-shadow:0 4px 14px rgba(0,255,102,.35)}
        .logo-mark svg{width:18px;height:18px}
        .nav-links{display:flex;gap:32px;list-style:none}
        .nav-links a{text-decoration:none;color:var(--text-secondary);font-size:14.5px;font-weight:500;transition:color .2s}
        .nav-links a:hover{color:var(--text-primary)}
        .btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-body);font-weight:600;font-size:15px;border:none;cursor:pointer;text-decoration:none;border-radius:999px;padding:12px 26px;transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s}
        .btn-gradient{background:var(--accent-gradient);color:#04120a;box-shadow:0 6px 20px rgba(0,255,102,.35)}
        .btn-gradient:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,255,102,.45)}
        .btn-sm{padding:9px 20px;font-size:14px}
        .btn-ghost{background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-default)}
        .btn-ghost:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(15,23,42,.08)}
        .mobile-menu-btn{display:none;background:none;border:none;cursor:pointer;padding:8px}
        .mobile-nav{display:none}
        .mobile-menu-btn svg{width:24px;height:24px;stroke:var(--text-primary)}

        .hero{padding:160px 0 100px;position:relative}
        .hero-bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
        .hero-bg::before{content:"";position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:900px;height:600px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,255,102,.14) 0%,rgba(79,70,229,.07) 45%,transparent 70%);filter:blur(10px)}
        .hero-grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(15,23,42,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(15,23,42,.035) 1px,transparent 1px);background-size:56px 56px;mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,#000 30%,transparent 75%);-webkit-mask-image:radial-gradient(ellipse 80% 60% at 50% 30%,#000 30%,transparent 75%)}
        .hero-inner{position:relative;text-align:center;max-width:820px;margin:0 auto}
        .hero-badge{display:inline-flex;align-items:center;gap:9px;background:rgba(255,255,255,.7);backdrop-filter:blur(12px);border:1px solid var(--border-default);border-radius:999px;padding:8px 18px;font-size:13px;font-weight:600;color:var(--text-secondary);box-shadow:0 8px 32px rgba(0,0,0,.04);margin-bottom:28px}
        .glow-dot{width:8px;height:8px;border-radius:50%;background:var(--accent-primary-dark);position:relative}
        .glow-dot::after{content:"";position:absolute;inset:-4px;border-radius:50%;background:rgba(0,255,102,.4);animation:dotPulse 2s ease-out infinite}
        @keyframes dotPulse{0%{transform:scale(.6);opacity:1}100%{transform:scale(1.8);opacity:0}}
        .hero h1{font-size:clamp(38px,6vw,64px);font-weight:800;margin-bottom:18px}
        .hero h1 .truth{background:var(--accent-gradient);-webkit-background-clip:text;background-clip:text;color:transparent}
        .hero-headline{font-family:var(--font-heading);font-size:clamp(22px,2.8vw,30px);font-weight:700;color:var(--text-primary);letter-spacing:-0.02em;max-width:720px;margin:0 auto 14px}
        .hero-desc{font-size:clamp(16px,2.2vw,19px);color:var(--text-secondary);max-width:640px;margin:0 auto 20px}
        .trust-banner{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:13px;color:var(--text-muted);margin-bottom:36px}
        .trust-banner strong{color:var(--accent-primary-dark);font-weight:500}
        .scan-form{display:flex;align-items:center;gap:10px;max-width:620px;margin:0 auto;background:var(--bg-card);border:1px solid var(--border-default);border-radius:999px;padding:8px 8px 8px 22px;box-shadow:0 0 20px rgba(0,255,102,0),0 12px 40px rgba(15,23,42,.06);transition:box-shadow .35s,border-color .35s}
        .scan-form:focus-within{border-color:rgba(0,255,102,.5);box-shadow:0 0 20px rgba(0,255,102,.15),0 12px 40px rgba(15,23,42,.08)}
        .scan-form .url-icon{flex-shrink:0;color:var(--text-muted);display:flex}
        .scan-form input{flex:1;border:none;outline:none;background:transparent;font-family:var(--font-mono);font-size:15px;color:var(--text-primary);min-width:0}
        .scan-form input::placeholder{color:var(--text-muted)}
        .btn-pulse{position:relative;flex-shrink:0;white-space:nowrap}
        .btn-pulse::before{content:"";position:absolute;inset:-3px;border-radius:999px;background:var(--accent-gradient);opacity:.5;z-index:-1;animation:btnPulse 2.4s ease-out infinite}
        @keyframes btnPulse{0%{transform:scale(1);opacity:.5}70%{transform:scale(1.12);opacity:0}100%{transform:scale(1.12);opacity:0}}
        .hero-hints{margin-top:18px;font-size:13px;color:var(--text-muted)}
        .hero-hints button{background:none;border:none;cursor:pointer;font-family:var(--font-mono);font-size:12.5px;color:var(--accent-secondary);padding:2px 6px;border-radius:6px;transition:background .2s}
        .hero-hints button:hover{background:rgba(79,70,229,.08)}
        .api-error{color:var(--danger-red);background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.15);border-radius:12px;padding:12px 20px;margin:12px auto 0;max-width:620px;font-size:14px;text-align:left}
        .scan-note{color:var(--text-secondary);font-size:13.5px;margin:14px auto 0;max-width:620px;text-align:center}

        .results-section{display:none;padding:40px 0 80px}
        .results-section.show{display:block;animation:fadeSlideIn .5s cubic-bezier(.16,1,.3,1)}
        @keyframes fadeSlideIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .results-card{background:var(--bg-card);border:1px solid var(--border-default);border-radius:20px;box-shadow:0 24px 64px rgba(15,23,42,.1);overflow:hidden;max-width:860px;margin:0 auto}
        .results-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:26px 32px;border-bottom:1px solid var(--border-default);background:var(--bg-card-alt)}
        .results-domain{display:flex;align-items:center;gap:14px;min-width:0}
        .domain-favicon{width:44px;height:44px;border-radius:12px;flex-shrink:0;background:var(--accent-gradient);display:grid;place-items:center;font-family:var(--font-heading);font-weight:800;font-size:18px;color:#04120a}
        .results-domain h3{font-size:19px;font-weight:700;font-family:var(--font-mono);word-break:break-all}
        .results-domain .scan-time{font-size:12.5px;color:var(--text-muted)}
        .status-badge{font-size:12.5px;font-weight:700;border-radius:99px;padding:7px 16px;display:inline-flex;align-items:center;gap:7px;white-space:nowrap}
        .status-badge i{width:8px;height:8px;border-radius:50%;background:currentColor;display:block}
        .status-badge.trusted{background:rgba(34,197,94,.13);color:#15803d}
        .status-badge.moderate{background:rgba(234,179,8,.15);color:#a16207}
        .status-badge.untrustworthy{background:rgba(239,68,68,.12);color:#b91c1c}
        .results-body{padding:32px}
        .domain-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:30px}
        .domain-cell{background:var(--bg-card-alt);border-radius:12px;padding:14px 16px}
        .domain-cell .dl{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);margin-bottom:4px}
        .domain-cell .dv{font-family:var(--font-mono);font-size:13.5px;font-weight:500;color:var(--text-primary);word-break:break-all}
        .score-row{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-bottom:30px}
        .score-block .score-label{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}
        .score-block .score-label span{font-size:14px;font-weight:600;color:var(--text-secondary)}
        .score-block .score-label strong{font-family:var(--font-mono);font-size:22px;font-weight:500}
        .score-track{height:4px;background:var(--border-default);border-radius:99px;overflow:hidden}
        .score-fill{display:block;height:100%;border-radius:99px;transition:width 1.4s cubic-bezier(.16,1,.3,1)}
        .score-note{font-size:12px;color:var(--text-muted);margin-top:8px}
        .flags-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
        .flags-col h4{font-size:14px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px}
        .flags-col ul{list-style:none;display:flex;flex-direction:column;gap:10px}
        .flags-col li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;color:var(--text-secondary);background:var(--bg-card-alt);border-radius:10px;padding:11px 14px}
        .flag-dot{flex-shrink:0;width:8px;height:8px;border-radius:50%;margin-top:6px}
        .flag-dot.red{background:var(--danger-red)}
        .flag-dot.green{background:var(--trusted-green)}
        .flag-dot.evidence-positive{background:var(--trusted-green)}
        .flag-dot.evidence-neutral{background:#94a3b8}
        .flag-dot.evidence-negative{background:var(--danger-red)}
        .summary-box{background:linear-gradient(135deg,rgba(0,255,102,.06),rgba(79,70,229,.05));border:1px solid var(--border-default);border-radius:14px;padding:20px 22px;font-size:14.5px;color:var(--text-secondary);margin-bottom:28px;line-height:1.7}
        .summary-box strong{color:var(--text-primary)}
        .results-actions{display:flex;gap:12px;flex-wrap:wrap}
        .results-actions .btn{font-size:14px;padding:11px 22px}
        .results-actions .btn:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none}
        .copy-status{font-size:12.5px;color:var(--text-secondary);margin-top:12px;text-align:center}
        .sr-label,.sr-status{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
        .demo-note{text-align:center;font-size:12.5px;color:var(--text-muted);margin-top:18px;font-family:var(--font-mono)}

        .section-head{text-align:center;max-width:640px;margin:0 auto 56px}
        .section-head .eyebrow{font-family:var(--font-mono);font-size:12.5px;font-weight:500;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-secondary);display:block;margin-bottom:14px}
        .section-head h2{font-size:clamp(28px,3.6vw,40px);font-weight:800;margin-bottom:16px}
        .section-head p{color:var(--text-secondary);font-size:16.5px}
        .bento{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
        .bento-card{background:rgba(255,255,255,.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.6);border-radius:var(--radius-card);padding:32px;box-shadow:0 8px 32px rgba(0,0,0,.04);transition:transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s;position:relative;overflow:hidden}
        .bento-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(15,23,42,.1)}
        .bento-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent-gradient);opacity:0;transition:opacity .3s}
        .bento-card:hover::before{opacity:1}
        .bento-icon{width:48px;height:48px;border-radius:13px;display:grid;place-items:center;font-size:22px;margin-bottom:20px;background:var(--bg-card-alt);border:1px solid var(--border-default)}
        .bento-card h3{font-size:19px;font-weight:700;margin-bottom:10px}
        .bento-card p{color:var(--text-secondary);font-size:14.5px;margin-bottom:18px}
        .bento-tags{display:flex;flex-wrap:wrap;gap:8px}
        .bento-tags span{font-family:var(--font-mono);font-size:11.5px;color:var(--text-secondary);background:var(--bg-card-alt);border:1px solid var(--border-default);border-radius:99px;padding:4px 11px}

        .timeline{position:relative;max-width:760px;margin:0 auto}
        .timeline::before{content:"";position:absolute;left:27px;top:20px;bottom:20px;width:2px;background:linear-gradient(180deg,var(--accent-primary),var(--accent-secondary));opacity:.35;border-radius:99px}
        .t-step{display:flex;gap:28px;padding:26px 0;position:relative}
        .t-num{flex-shrink:0;width:56px;height:56px;border-radius:16px;background:var(--bg-card);border:1px solid var(--border-default);display:grid;place-items:center;font-family:var(--font-mono);font-size:18px;font-weight:500;color:var(--accent-primary-dark);box-shadow:0 8px 24px rgba(15,23,42,.06);position:relative;z-index:1}
        .t-body{flex:1;background:var(--bg-card);border:1px solid var(--border-default);border-radius:var(--radius-card);padding:24px 28px;box-shadow:0 10px 32px rgba(15,23,42,.07);transition:transform .3s,box-shadow .3s}
        .t-body:hover{transform:translateX(6px);box-shadow:0 14px 40px rgba(15,23,42,.09)}
        .t-body h3{font-size:18px;font-weight:700;margin-bottom:8px}
        .t-body p{color:var(--text-secondary);font-size:14.5px}
        .t-body .t-meta{font-family:var(--font-mono);font-size:11.5px;color:var(--text-muted);margin-top:12px;display:block}

        .pricing-grid{display:grid;grid-template-columns:repeat(2,minmax(0,420px));gap:28px;justify-content:center}
        .price-card{background:var(--bg-card);border:1px solid var(--border-default);border-radius:20px;padding:36px;transition:transform .3s,box-shadow .3s;position:relative}
        .price-card:hover{transform:translateY(-6px);box-shadow:0 20px 48px rgba(15,23,42,.09)}
        .price-card.pro{border:1.5px solid transparent;background:linear-gradient(var(--bg-card),var(--bg-card)) padding-box,var(--accent-gradient) border-box;box-shadow:0 16px 48px rgba(0,255,102,.14)}
        .pro-badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--accent-gradient);color:#04120a;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-radius:99px;padding:5px 16px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,255,102,.4)}
        .plan-name{font-family:var(--font-heading);font-size:20px;font-weight:700;margin-bottom:6px}
        .plan-desc{font-size:14px;color:var(--text-muted);margin-bottom:24px}
        .plan-price{display:flex;align-items:baseline;gap:6px;margin-bottom:28px}
        .plan-price .amount{font-family:var(--font-heading);font-size:46px;font-weight:800}
        .plan-price .per{color:var(--text-muted);font-size:15px}
        .plan-features{list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:30px}
        .plan-features li{display:flex;gap:11px;align-items:flex-start;font-size:14.5px;color:var(--text-secondary)}
        .plan-features .tick{flex-shrink:0;width:20px;height:20px;border-radius:6px;background:rgba(0,255,102,.14);color:var(--accent-primary-dark);display:grid;place-items:center;font-size:11px;font-weight:700;margin-top:1px}
        .plan-features .x{flex-shrink:0;width:20px;height:20px;border-radius:6px;background:var(--bg-card-alt);color:var(--text-muted);display:grid;place-items:center;font-size:11px;margin-top:1px}
        .plan-features li.off{color:var(--text-muted)}
        .price-card .btn{width:100%;justify-content:center}

        .footer-cta{padding:80px 0;text-align:center}
        .footer-cta-inner{position:relative;border-radius:24px;padding:72px 32px;overflow:hidden;background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);color:#fff}
        .footer-cta-inner::before{content:"";position:absolute;top:-120px;left:50%;transform:translateX(-50%);width:640px;height:380px;border-radius:50%;background:radial-gradient(ellipse,rgba(0,255,102,.22),transparent 70%)}
        .footer-cta h2{font-size:clamp(26px,3.4vw,38px);font-weight:800;margin-bottom:14px;position:relative}
        .footer-cta p{color:#94a3b8;margin-bottom:30px;position:relative}
        .footer-cta .btn{position:relative}
        .site-footer{border-top:1px solid var(--border-default);padding:56px 0 32px;background:var(--bg-card)}
        .footer-grid{display:grid;grid-template-columns:1.4fr repeat(4,1fr);gap:32px;margin-bottom:48px}
        .footer-brand p{font-size:13.5px;color:var(--text-muted);margin-top:14px;max-width:240px}
        .footer-col h4{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text-primary);margin-bottom:16px}
        .footer-col ul{list-style:none;display:flex;flex-direction:column;gap:10px}
        .footer-col a{text-decoration:none;font-size:14px;color:var(--text-secondary);transition:color .2s}
        .footer-col a:hover{color:var(--accent-primary-dark)}
        .footer-bottom{border-top:1px solid var(--border-default);padding-top:24px;display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--text-muted)}

        .score-row.three{grid-template-columns:repeat(3,1fr)}
        .unknown-notice{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.3);border-radius:12px;padding:12px 16px;font-size:13px;color:var(--text-secondary);margin-bottom:20px}
        .unknown-notice strong{color:var(--text-primary);white-space:nowrap}
        .transparency-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
        .ev-item{display:block;font-size:13px}
        .sig-cat{text-transform:capitalize;font-weight:600;color:var(--text-primary)}
        .ev-signal{font-family:var(--font-mono);font-size:12px;color:var(--accent-secondary)}
        .expl{color:var(--text-muted)}
        .effect{font-family:var(--font-mono);font-size:11.5px;color:var(--text-muted);margin-left:6px}
        .nd-chips{display:flex;flex-wrap:wrap;gap:8px}
        .nd-chip{font-family:var(--font-mono);font-size:12px;color:var(--text-muted);background:var(--bg-card-alt);border:1px solid var(--border-default);border-radius:99px;padding:5px 12px}
        .nd-chip em{font-style:normal;opacity:.65}
        .nd-note,.bd-note{font-size:12px;color:var(--text-muted);margin-top:10px;line-height:1.6}
        .breakdown-box{background:var(--bg-card-alt);border:1px solid var(--border-default);border-radius:14px;padding:20px 22px;margin-bottom:28px}
        .breakdown-box h4{font-size:14px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:8px}
        .breakdown-list{display:flex;flex-direction:column;gap:10px}
        .breakdown-row{display:grid;grid-template-columns:130px 1fr 56px;gap:12px;align-items:center}
        .bd-cat{font-family:var(--font-mono);font-size:12.5px;color:var(--text-secondary);text-transform:capitalize}
        .bd-track{height:6px;background:rgba(15,23,42,.07);border-radius:99px;overflow:hidden}
        .bd-fill{display:block;height:100%;border-radius:99px}
        .bd-delta{font-family:var(--font-mono);font-size:12.5px;font-weight:600;text-align:right}
        .bd-delta.pos{color:var(--trusted-green)}
        .bd-delta.neg{color:var(--danger-red)}
        .notes-box{background:rgba(79,70,229,.05);border:1px solid var(--border-default);border-left:3px solid var(--accent-secondary);border-radius:12px;padding:14px 18px;margin-bottom:28px}
        .notes-box h4{font-size:13px;font-weight:700;margin-bottom:8px;color:var(--text-primary)}
        .notes-box ul{list-style:none;display:flex;flex-direction:column;gap:6px}
        .notes-box li{font-size:13px;line-height:1.55;color:var(--text-secondary);padding-left:14px;position:relative}
        .notes-box li::before{content:"";position:absolute;left:0;top:8px;width:6px;height:6px;border-radius:50%;background:var(--accent-secondary)}

        @media (max-width:1024px){
          .bento{grid-template-columns:repeat(2,1fr)}
          .footer-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media (max-width:768px){
          .wts-landing section{padding:60px 0}
          .nav-links,.header-cta{display:none}
          .mobile-menu-btn{display:block}
          .mobile-nav{display:none;flex-direction:column;gap:4px;padding:12px 24px 20px;background:rgba(248,250,252,.97);border-bottom:1px solid var(--border-default)}
          .mobile-nav.open{display:flex}
          .mobile-nav a{text-decoration:none;color:var(--text-secondary);font-weight:500;padding:10px 0;font-size:15px}
          .hero{padding:130px 0 70px}
          .scan-form{flex-direction:column;border-radius:20px;padding:14px;gap:12px}
          .scan-form input{width:100%;padding:4px 8px}
          .scan-form .btn{width:100%;justify-content:center}
          .bento{grid-template-columns:1fr}
          .pricing-grid{grid-template-columns:1fr}
          .domain-grid{grid-template-columns:repeat(2,1fr)}
          .score-row,.flags-grid{grid-template-columns:1fr}
          .score-row.three{grid-template-columns:1fr}
          .transparency-grid{grid-template-columns:1fr}
          .breakdown-row{grid-template-columns:1fr 1fr;gap:8px}
          .results-head{flex-direction:column;align-items:flex-start}
          .t-step{gap:18px}
          .t-num{width:44px;height:44px;font-size:15px;border-radius:12px}
          .timeline::before{left:21px}
          .footer-grid{grid-template-columns:1fr}
        }
        @media (max-width:380px){
          .results-body{padding:20px 16px}
          .results-head{padding:20px 16px}
          .domain-grid{grid-template-columns:1fr;gap:10px}
          .results-actions .btn{width:100%;justify-content:center}
        }
      `}</style>

      {/* ========== HEADER ========== */}
<header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
  <div className="container header-inner">
    <a className="logo" href="#top" style={{ textDecoration: 'none' }}>
      <FullLogo size={36} />
    </a>
    <nav>
      <ul className="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#pricing">Pricing</a></li>
        <li><a href="#how">API</a></li>
        <li><a href="#footer">Documentation</a></li>
      </ul>
    </nav>

    {/* Header CTA with Auth Buttons - NO "Try It Now" */}
    <div className="header-cta" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {user ? (
        <>
          <span style={{
            fontSize: '13px',
            color: '#0f172a',
            fontWeight: '500',
            maxWidth: '100px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            👤 {user.email?.split('@')[0]}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onLogout}
            style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px' }}
          >
            Logout
          </button>
        </>
      ) : (
        <button
          className="btn btn-gradient btn-sm"
          onClick={onLogin}
          style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '8px' }}
        >
          Sign In
        </button>
      )}
    </div>

    <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" aria-expanded={mobileOpen} aria-controls="mobile-nav">
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  </div>

  {/* Mobile Navigation */}
  <nav id="mobile-nav" className={`mobile-nav ${mobileOpen ? 'open' : ''}`} aria-label="Mobile navigation">
    <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
    <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
    <a href="#how" onClick={() => setMobileOpen(false)}>API</a>
    <a href="#footer" onClick={() => setMobileOpen(false)}>Documentation</a>

    {user ? (
      <>
        <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500', padding: '8px 0' }}>
          👤 {user.email?.split('@')[0]}
        </span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onLogout}
          style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', width: '100%', textAlign: 'center' }}
        >
          Logout
        </button>
      </>
    ) : (
      <button
        className="btn btn-gradient btn-sm"
        onClick={onLogin}
        style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', width: '100%', textAlign: 'center' }}
      >
        Sign In
      </button>
    )}
  </nav>
</header>

      {/* ========== HERO ========== */}
      <section className="hero" id="top">
        <div className="hero-bg"><div className="hero-grid-bg"></div></div>
        <div className="container hero-inner" id="scan-section">
          <div className="hero-badge"><span className="glow-dot"></span>Evidence-Based Trust Analysis</div>
          <h1>Know What You're Really <span className="truth">Trusting</span> Online</h1>
          <h2 className="hero-headline">Instantly separate web truth from filler</h2>
          <p className="hero-desc">We scan a URL for transport security, domain registration, and page-content signals — then show you the exact evidence behind the score, including what we could not verify.</p>
          <div className="trust-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Deterministic scoring · evidence is shown, never hidden.
          </div>
          <form className="scan-form" onSubmit={handleScan}>
            <label className="sr-label" htmlFor="scan-url-input">Website URL to scan</label>
            <span className="url-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z"/></svg>
            </span>
            <input
              id="scan-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any URL — e.g. https://example.com"
              autoComplete="off"
              spellCheck="false"
            />
            <button type="submit" className="btn btn-gradient btn-pulse" disabled={scanning}>
              {scanning ? 'Scanning…' : 'Inject Serum →'}
            </button>
          </form>
          {apiError && (
            <div className="api-error" role="alert">⚠️ {apiError}</div>
          )}
          {scanning && (
            <p className="scan-note" role="status">
              Analyzing the website… first scans can take up to about a minute while the service warms up.
            </p>
          )}
          <div className="hero-hints">
            Try a sample:
            {sampleUrls.map((sample) => (
              <button key={sample} type="button" onClick={() => setUrl(sample)}>{sample}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ========== RESULTS ========== */}
      {showResults && result && (
        <section className="results-section show" ref={resultsRef}>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Scan Complete</span>
              <h2>Your risk report</h2>
            </div>
            <div className="results-card">
              <div className="results-head">
                <div className="results-domain">
                  <div className="domain-favicon">{(result.domain && result.domain[0]) ? result.domain[0].toUpperCase() : '?'}</div>
                  <div>
                    <h3>{result.domain}</h3>
                    <div className="scan-time">Scanned just now{fmtDuration(result.durationMs) ? ` · ${fmtDuration(result.durationMs)}` : ''}</div>
                  </div>
                </div>
                <span className={`status-badge ${displayRisk(result).cls}`}>
                  <i></i><span>{displayRisk(result).label}</span>
                </span>
              </div>
              <div className="results-body">
                <div className="domain-grid">
                  <div className="domain-cell"><div className="dl">Domain Age</div><div className="dv">{result.age || 'Unknown'}</div></div>
                  <div className="domain-cell"><div className="dl">SSL Status</div><div className="dv">{result.profile.ssl?.[0] || 'Unknown'}</div></div>
                  <div className="domain-cell"><div className="dl">Registrar</div><div className="dv">{result.registrar || 'Not determined'}</div></div>
                  <div className="domain-cell"><div className="dl">Last Scan</div><div className="dv">Just now</div></div>
                </div>
                {result.isEvidenceMode && result.confidence === 0 && (
                  <div className="unknown-notice">
                    <strong>⚠️ Unknown — not safe, not unsafe.</strong>
                    <span>No signals could be verified, so this site is neither trusted nor flagged. A higher-confidence verdict needs more evidence.</span>
                  </div>
                )}
                <div className="score-row three">
                  <div className="score-block">
                    <div className="score-label"><span>Risk Score</span><strong style={{ color: categoryMeta(result).color }}>{result.score}</strong></div>
                    <div className="score-track"><span className="score-fill" style={{ width: `${result.score}%`, background: categoryMeta(result).bar }}></span></div>
                    <div className="score-note">{result.category ? `${categoryMeta(result).label} · risk level ${result.riskLevel || 'unknown'}` : 'Weighted across evidence signals'}</div>
                  </div>
                  <div className="score-block">
                    <div className="score-label"><span>AI Likelihood</span>{result.ai != null ? (
                      <strong style={{ color: result.ai <= 30 ? '#22c55e' : result.ai <= 60 ? '#eab308' : '#ef4444' }}>{result.ai}%</strong>
                    ) : (
                      <strong style={{ color: '#9ca3af' }}>Not measured</strong>
                    )}</div>
                    <div className="score-track">{result.ai != null ? (
                      <span className="score-fill" style={{ width: `${result.ai}%`, background: result.ai <= 30 ? 'linear-gradient(90deg,#22c55e,#00FF66)' : result.ai <= 60 ? 'linear-gradient(90deg,#eab308,#facc15)' : 'linear-gradient(90deg,#ef4444,#f87171)' }}></span>
                    ) : null}</div>
                    <div className="score-note">Share of on-page text likely machine-generated</div>
                  </div>
                  <div className="score-block">
                    <div className="score-label"><span>Confidence</span>{result.confidence != null ? (
                      <strong style={{ color: result.confidence >= 0.6 ? '#22c55e' : result.confidence >= 0.3 ? '#eab308' : '#9ca3af' }}>{Math.round(result.confidence * 100)}%</strong>
                    ) : (
                      <strong style={{ color: '#9ca3af' }}>Not measured</strong>
                    )}</div>
                    <div className="score-track">{result.confidence != null ? (
                      <span className="score-fill" style={{ width: `${result.confidence * 100}%`, background: 'linear-gradient(90deg,#4f46e5,#8b5cf6)' }}></span>
                    ) : null}</div>
                    <div className="score-note">{result.confidence != null
                      ? confidenceNote(result)
                      : 'Available in evidence mode'}</div>
                  </div>
                </div>
                <div className="flags-grid">
                  <div className="flags-col">
                    <h4>🚩 Red Flags</h4>
                    <ul>
                      {result.profile.red && result.profile.red.length > 0 ? (
                        result.profile.red.slice(0, 3).map((flag, i) => (
                          <li key={i}><span className="flag-dot red"></span>{flag}</li>
                        ))
                      ) : (
                        <li><span className="flag-dot green"></span>{result.isEvidenceMode && result.confidence === 0
                          ? 'No negative signals could be verified — this is unknown, not safe.'
                          : 'No red flags detected'}</li>
                      )}
                    </ul>
                  </div>
                  <div className="flags-col">
                    <h4>✅ Green Flags</h4>
                    <ul>
                      {result.profile.green && result.profile.green.length > 0 ? (
                        result.profile.green.slice(0, 3).map((flag, i) => (
                          <li key={i}><span className="flag-dot green"></span>{flag}</li>
                        ))
                      ) : (
                        <li><span className="flag-dot green"></span>{result.isEvidenceMode && result.confidence === 0
                          ? 'No positive signals could be verified — this is unknown, not a clean bill of health.'
                          : 'No green flags detected'}</li>
                      )}
                    </ul>
                  </div>
                </div>
                {result.isEvidenceMode && (
                  <>
                    <div className="transparency-grid">
                      <div className="flags-col">
                        <h4>✓ What We Verified</h4>
                        {result.verified.length > 0 ? (
                          <ul>
                            {result.verified.map((item, i) => {
                              const effectValue = item.applied_effect != null ? item.applied_effect : item.effect;
                              const tone = classifyEffect(effectValue);
                              return (
                                <li key={i}>
                                  <span className={`flag-dot evidence-${tone}`}></span>
                                  <span className="ev-item">
                                    <strong className="sig-cat">{categoryLabel(item.category)}</strong>
                                    <span className="ev-signal"> · {signalLabel(item.signal)}</span>
                                    {item.explanation ? <span className="expl"> — {item.explanation}</span> : null}
                                    <span className="effect">
                                      {item.applied_effect != null ? `${item.applied_effect > 0 ? '+' : ''}${item.applied_effect}` : `${item.effect > 0 ? '+' : ''}${item.effect}`}
                                      {item.applied_effect != null && item.raw_effect !== item.applied_effect ? ` (raw ${item.raw_effect})` : ''}
                                    </span>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <ul>
                            <li><span className="flag-dot green"></span>No signals could be verified — evidence was unavailable.</li>
                          </ul>
                        )}
                      </div>
                      <div className="flags-col">
                        <h4>— What We Could Not Determine</h4>
                        {result.notDetermined.length > 0 ? (
                          <>
                            <div className="nd-chips">
                              {result.notDetermined.map((cat, i) => (
                                <span key={i} className="nd-chip">{categoryLabel(cat)}<em> not measured</em></span>
                              ))}
                            </div>
                            <p className="nd-note">Unknown is neutral — a dimension that was not measured is neither safe nor unsafe.</p>
                          </>
                        ) : (
                          <ul>
                            <li><span className="flag-dot green"></span>All planned evidence areas were measured.</li>
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="breakdown-box">
                      <h4>⚖️ Evidence Breakdown</h4>
                      {Object.keys(result.breakdown).length > 0 ? (
                        <div className="breakdown-list">
                          {Object.entries(result.breakdown).map(([cat, delta]) => {
                            const detail = result.breakdownDetail && result.breakdownDetail[cat];
                            return (
                              <div key={cat} className="breakdown-row">
                                <span className="bd-cat">{categoryLabel(cat)}{detail && detail.capped ? ' *' : ''}</span>
                                <span className="bd-track">
                                  <span className="bd-fill" style={{ width: `${Math.min(100, Math.abs(delta) * 10)}%`, background: delta >= 0 ? 'linear-gradient(90deg,#22c55e,#00FF66)' : 'linear-gradient(90deg,#ef4444,#f87171)' }}></span>
                                </span>
                                <span className={`bd-delta ${delta >= 0 ? 'pos' : 'neg'}`}>{delta > 0 ? `+${delta}` : delta}</span>
                              </div>
                            );
                          })}
                          <p className="bd-note">
                            {result.reconciliation
                              ? `${fmtReconciliation(result.reconciliation)}. Contributions are capped per category so no single signal can dominate.`
                              : 'Neutral anchor 50 + Σ contributions = ' + result.score + '. Contributions are capped per category so no single signal can dominate.'}
                            {result.breakdownDetail && Object.values(result.breakdownDetail).some((d) => d.capped) ? ' (* = category hit its influence cap.)' : ''}
                          </p>
                        </div>
                      ) : (
                        <p className="bd-note">No category contributions — the score remains at the neutral anchor (50) because nothing could be verified.</p>
                      )}
                    </div>
                    {result.notes && result.notes.length > 0 ? (
                      <div className="notes-box">
                        <h4>About this score</h4>
                        <ul>
                          {result.notes.map((note, i) => (
                            <li key={i}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </>
                )}
                <div className="summary-box">{result.summary || 'This assessment reflects the evidence we could verify — it is not a guarantee of legitimacy or safety.'}</div>
                <div className="results-actions">
                  <button
                    className="btn btn-gradient"
                    type="button"
                    onClick={shareScanReport}
                    title="Share this risk report"
                  >
                    📤 Share Report
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={copyScanLink}>📋 Copy Link</button>
                  <button className="btn btn-ghost" type="button" onClick={() => { setShowResults(false); setUrl(''); setCopyFeedback(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Scan another URL</button>
                </div>
                {copyFeedback && (
                  <p className="copy-status" role="status">{copyFeedback}</p>
                )}
              </div>
            </div>
            <p className="demo-note">// report from live API — data based on actual analysis</p>
          </div>
        </section>
      )}

      {/* ========== FEATURES ========== */}
      <section id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Serum Toolkit</span>
            <h2>Evidence in. Risk out.</h2>
            <p>Every scan runs a bounded battery of checks across transport, domain, and content — distilled into a score anyone can read, with the evidence shown beside it.</p>
          </div>
          <div className="bento">
            <div className="bento-card">
              <div className="bento-icon">🔍</div>
              <h3>Security &amp; Infrastructure Checks</h3>
              <p>We check how the page responds over HTTPS: TLS certificate validity, HTTP behavior, security headers, and strict response-size boundaries.</p>
              <div className="bento-tags">
                <span>HTTPS behavior</span><span>TLS certificate</span><span>security headers</span><span>response limits</span>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-icon">🧪</div>
              <h3>Page Content Signals</h3>
              <p>We analyze the fetched HTML for title, description, language, viewport, canonical, and substantial content. These are neutral observations, not a verdict on the text.</p>
              <div className="bento-tags">
                <span>title &amp; metadata</span><span>content presence</span><span>neutral signals</span><span>no text guessing</span>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-icon">⚖️</div>
              <h3>Deterministic Evidence Scoring</h3>
              <p>Every scan is bounded by a hard deadline. The score anchors at 50, evidence is capped per category, confidence reflects coverage, and unknown stays unknown.</p>
              <div className="bento-tags">
                <span>neutral anchor</span><span>category caps</span><span>confidence</span><span>bounded scans</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How It Works</span>
            <h2>From URL to verdict in three moves</h2>
            <p>No extensions, no sign-up, no waiting. Paste a link and the serum does the rest.</p>
          </div>
          <div className="timeline">
            <div className="t-step">
              <div className="t-num">01</div>
              <div className="t-body">
                <h3>Fetch &amp; Guard</h3>
                <p>The URL is validated against public targets, fetched once with a hard size limit, and every redirect is checked. Oversized or unavailable pages produce no evidence.</p>
                <span className="t-meta">guarded single fetch · bounded body</span>
              </div>
            </div>
            <div className="t-step">
              <div className="t-num">02</div>
              <div className="t-body">
                <h3>Collect Evidence</h3>
                <p>TLS certificate, HTTPS behavior, security headers, domain registration (RDAP), and page metadata become discrete evidence items. Reputation providers are optional and off by default.</p>
                <span className="t-meta">deterministic evidence collection</span>
              </div>
            </div>
            <div className="t-step">
              <div className="t-num">03</div>
              <div className="t-body">
                <h3>Score &amp; Explain</h3>
                <p>The deterministic engine anchors at 50, applies each evidence item under category caps, and reports the score, risk level, confidence, verified facts, and what could not be determined.</p>
                <span className="t-meta">50 anchor · capped · explainable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section id="pricing">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Pricing</span>
            <h2>Truth shouldn't cost a fortune</h2>
            <p>Start free. Upgrade when the web starts feeling suspicious.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="plan-name">Free</div>
              <div className="plan-desc">For casual fact-checking</div>
              <div className="plan-price"><span className="amount">$0</span><span className="per">/ forever</span></div>
              <ul className="plan-features">
                <li><span className="tick">✓</span>10 scans per day</li>
                <li><span className="tick">✓</span>Risk score &amp; evidence flags</li>
                <li><span className="tick">✓</span>Domain age &amp; TLS checks</li>
                <li className="off"><span className="x">—</span>Deep evidence breakdown</li>
                <li className="off"><span className="x">—</span>API access &amp; bulk scans</li>
                <li className="off"><span className="x">—</span>PDF trust reports</li>
              </ul>
              <a href="#scan-section" className="btn btn-ghost" style={{ textDecoration: 'none', textAlign: 'center' }}>Start scanning free</a>
            </div>
            <div className="price-card pro">
              <div className="pro-badge">Most Popular</div>
              <div className="plan-name">Pro</div>
              <div className="plan-desc">For professionals &amp; teams</div>
              <div className="plan-price"><span className="amount">$29</span><span className="per">/ month</span></div>
              <ul className="plan-features">
                <li><span className="tick">✓</span>Unlimited scans</li>
                <li><span className="tick">✓</span>Full evidence breakdown</li>
                <li><span className="tick">✓</span>Priority processing</li>
                <li><span className="tick">✓</span>API access &amp; bulk URL scans</li>
                <li><span className="tick">✓</span>Shareable PDF trust reports</li>
                <li><span className="tick">✓</span>Scan history &amp; alerts</li>
              </ul>
              <a href="#scan-section" className="btn btn-gradient" style={{ textDecoration: 'none', textAlign: 'center' }}>Go Pro →</a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section
        id="faq"
        style={{
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-default)',
          padding: '0',
        }}
      >
        <div className="container">
          <FAQ items={faqItems} />
        </div>
      </section>

      {/* ========== FOOTER CTA ========== */}
      <section className="footer-cta">
        <div className="container">
          <div className="footer-cta-inner">
            <h2>Ready to audit the web?</h2>
            <p>Start scanning now — your first 10 daily scans are on us.</p>
            <a href="#scan-section" className="btn btn-gradient" style={{ textDecoration: 'none' }}>Inject Serum →</a>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="site-footer" id="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="logo" href="#top">
                <span className="logo-mark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#04120a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3h6M10 3v5.5L4.8 17a3 3 0 0 0 2.6 4.5h9.2a3 3 0 0 0 2.6-4.5L14 8.5V3"/>
                    <path d="M7.5 14h9"/>
                  </svg>
                </span>
                Website Truth Serum
              </a>
              <p>The evidence-based trust analyzer for a web full of filler.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="/features">Features</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/how-it-works">How It Works</a></li>
                <li><a href="#top">Browser Extension</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="/how-it-works">Documentation</a></li>
                <li><a href="/how-it-works">Risk Score Methodology</a></li>
                <li><a href="/how-it-works">Blacklist Sources</a></li>
                <li><a href="#footer">Changelog</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About</a></li>
                <li><a href="#footer">Blog</a></li>
                <li><a href="#footer">Careers</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <ul>
                <li><a href="#footer">Privacy Policy</a></li>
                <li><a href="#footer">Terms of Service</a></li>
                <li><a href="#footer">Responsible Disclosure</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Website Truth Serum. All rights reserved.</span>
            <span>Made with 🧪 and healthy skepticism.</span>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
};

export default LandingPage;
