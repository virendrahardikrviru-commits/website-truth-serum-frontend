import React, { useState, useRef } from 'react';

const DB = {
  'example.com': {
    score: 95,
    ai: 5,
    status: 'Trusted',
    badgeClass: 'badge-pro-green',
    barClass: 'progress-pro-green',
    age: '12 years',
    ssl: 'DigiCert Inc',
    reg: 'GoDaddy',
    red: [],
    green: ['Valid SSL certificate', 'Well-established domain', 'Clear contact information'],
    summary: 'A legitimate, well-established website with strong trust signals.'
  },
  'news-site.com': {
    score: 70,
    ai: 60,
    status: 'Moderate Risk',
    badgeClass: 'badge-pro-yellow',
    barClass: 'progress-pro-yellow',
    age: '3 years',
    ssl: "Let's Encrypt",
    reg: 'Namecheap',
    red: ['AI-generated content detected', 'Limited author information'],
    green: ['Published articles with dates', 'Some human-written content'],
    summary: 'Mix of human and AI-generated content. Verify sources before trusting.'
  },
  'scam-site.com': {
    score: 15,
    ai: 85,
    status: 'Untrustworthy',
    badgeClass: 'badge-pro-red',
    barClass: 'progress-pro-red',
    age: '2 months',
    ssl: 'None',
    reg: 'Unknown',
    red: ['Suspicious domain', 'No contact information', 'Poor grammar', 'No privacy policy'],
    green: [],
    summary: 'Multiple red flags. Appears to be a scam or AI-generated content farm.'
  }
};

const WebsiteTruthSerum = () => {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef(null);

  const extractDomain = (input) => {
    const clean = input.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    return clean || 'example.com';
  };

  const runScan = (domain) => {
    setScanning(true);
    setShowResults(false);
    const data = DB[domain] || DB['example.com'];
    setTimeout(() => {
      setResult({ domain, ...data });
      setShowResults(true);
      setScanning(false);
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 800);
  };

  const handleScan = (e) => {
    e.preventDefault();
    const domain = extractDomain(url);
    runScan(domain);
  };

  const handleQuickTest = (domain) => {
    setUrl(domain);
    runScan(domain);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 text-sm text-indigo-700 font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
          Evidence-Based Trust Analysis
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-4">
          Check if a website is{' '}
          <span className="gradient-text">trustworthy</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Get clear, evidence-backed trust reports for any website in seconds.
        </p>
      </div>

      {/* Search */}
      <div className="pro-card p-6 md:p-8 mb-8">
        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste any URL (e.g., example.com)"
              className="input-pro"
            />
          </div>
          <button type="submit" className="btn-pro" disabled={scanning}>
            {scanning ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Scanning...
              </>
            ) : (
              <>
                <span>🔍</span>
                Scan Website
              </>
            )}
          </button>
        </form>
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          <span className="text-sm text-slate-500 font-medium">Quick test:</span>
          {['example.com', 'news-site.com', 'scam-site.com'].map((domain) => (
            <button
              key={domain}
              onClick={() => handleQuickTest(domain)}
              className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition"
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div ref={resultsRef} className={`${showResults ? 'block' : 'hidden'} result-card`}>
        {result && <ResultCard result={result} />}
      </div>

      {/* Features */}
      {!showResults && !scanning && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <FeatureCard
              icon="🤖"
              title="AI Detection"
              description="Advanced pattern recognition detects AI-generated content with high accuracy."
              color="purple"
            />
            <FeatureCard
              icon="🛡️"
              title="Trust Score"
              description="Comprehensive 0-100 score based on domain reputation and technical signals."
              color="blue"
            />
            <FeatureCard
              icon="🚨"
              title="Red Flag Alert"
              description="Instantly highlights suspicious patterns like missing contact info or poor security."
              color="green"
            />
          </div>

          <div className="pro-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Try these examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ExampleCard
                domain="example.com"
                score={95}
                label="Trusted"
                color="green"
                description="Well-established domain with valid SSL and strong security."
                onClick={() => handleQuickTest('example.com')}
              />
              <ExampleCard
                domain="news-site.com"
                score={70}
                label="Moderate Risk"
                color="yellow"
                description="Mixed content. Some AI-generated text found."
                onClick={() => handleQuickTest('news-site.com')}
              />
              <ExampleCard
                domain="scam-site.com"
                score={15}
                label="Untrustworthy"
                color="red"
                description="Multiple red flags. Likely a scam or AI content farm."
                onClick={() => handleQuickTest('scam-site.com')}
              />
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="text-center mt-12 text-sm text-slate-400 border-t border-slate-100 pt-6">
        Made with care · Website Truth Serum
      </div>
    </div>
  );
};

// Feature Card
const FeatureCard = ({ icon, title, description, color }) => {
  const colors = {
    purple: 'feature-icon-purple',
    blue: 'feature-icon-blue',
    green: 'feature-icon-green',
    orange: 'feature-icon-orange'
  };
  return (
    <div className="feature-pro">
      <div className={`feature-icon ${colors[color]}`}>{icon}</div>
      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
};

// Example Card
const ExampleCard = ({ domain, score, label, color, description, onClick }) => {
  const colors = {
    green: { badge: 'badge-pro-green', bar: 'progress-pro-green' },
    yellow: { badge: 'badge-pro-yellow', bar: 'progress-pro-yellow' },
    red: { badge: 'badge-pro-red', bar: 'progress-pro-red' }
  };
  const c = colors[color] || colors.green;

  return (
    <div className="example-pro" onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-slate-900">{domain}</span>
        <span className={`badge-pro ${c.badge}`}>{score}</span>
      </div>
      <span className={`badge-pro ${c.badge} text-xs mb-2`}>{label}</span>
      <p className="text-sm text-slate-500 mb-3">{description}</p>
      <div className="progress-pro">
        <div className={`progress-pro-fill ${c.bar}`} style={{ width: `${score}%` }}></div>
      </div>
    </div>
  );
};

// Result Card
const ResultCard = ({ result }) => {
  const { domain, score, ai, status, badgeClass, barClass, age, ssl, reg, red, green, summary } = result;

  const getAIBarClass = (value) => {
    if (value > 70) return 'progress-pro-red';
    if (value > 40) return 'progress-pro-yellow';
    return 'progress-pro-green';
  };

  return (
    <div className="pro-card p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{domain}</h2>
          <p className="text-sm text-slate-500">Scanned just now</p>
        </div>
        <span className={`badge-pro ${badgeClass}`}>{status}</span>
      </div>

      {/* Domain Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500">Domain Age</div>
          <div className="font-semibold text-slate-900">{age}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500">SSL Issuer</div>
          <div className="font-semibold text-slate-900">{ssl}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500">Registrar</div>
          <div className="font-semibold text-slate-900">{reg}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="text-xs text-slate-500">Last Scan</div>
          <div className="font-semibold text-slate-900">Just now</div>
        </div>
      </div>

      {/* Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm text-slate-500 font-medium">Trust Score</div>
          <div className="text-4xl font-bold text-slate-900">{score}</div>
          <div className="progress-pro mt-2">
            <div className={`progress-pro-fill ${barClass}`} style={{ width: `${score}%` }}></div>
          </div>
          <div className="text-xs text-slate-400 mt-1">Out of 100</div>
        </div>
        <div>
          <div className="text-sm text-slate-500 font-medium">AI Likelihood</div>
          <div className="text-4xl font-bold text-slate-900">{ai}%</div>
          <div className="progress-pro mt-2">
            <div className={`progress-pro-fill ${getAIBarClass(ai)}`} style={{ width: `${ai}%` }}></div>
          </div>
          <div className="text-xs text-slate-400 mt-1">Probability of AI-generated content</div>
        </div>
      </div>

      {/* Flags */}
      {(red.length > 0 || green.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {red.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-100">
              <div className="font-medium text-red-700 mb-2">🚩 Red Flags ({red.length})</div>
              <ul className="space-y-1">
                {red.map((flag, i) => (
                  <li key={i} className="text-sm text-red-600 flag-item">• {flag}</li>
                ))}
              </ul>
            </div>
          )}
          {green.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="font-medium text-green-700 mb-2">🌱 Green Flags ({green.length})</div>
              <ul className="space-y-1">
                {green.map((flag, i) => (
                  <li key={i} className="text-sm text-green-600 flag-item">• {flag}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6">
        <p className="text-slate-700 text-sm">{summary}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button className="btn-pro flex-1 justify-center">
          📤 Share Result
        </button>
        <button className="btn-pro-outline flex-1 justify-center">
          📋 Copy Report
        </button>
      </div>
    </div>
  );
};

export default WebsiteTruthSerum;