import React, { useState, useEffect, useRef } from 'react';
import FullLogo from './FullLogo';

const LandingPage = () => {
  const [url, setUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const resultsRef = useRef(null);

  // Handle scroll for header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sample data
  const PROFILES = [
    {
      test: d => /shady|rypto|deal|off|biz|free|win|doubler|crypto-give/i.test(d),
      score: [14, 32],
      ai: [78, 94],
      badge: ['untrustworthy', 'Untrustworthy'],
      age: ['11 days', '3 weeks', '1 month'],
      ssl: ['Self-signed ⚠', 'Invalid ⚠'],
      registrar: ['AnonymousShield LLC', 'Unknown (privacy-locked)'],
      red: ['Domain registered less than 30 days ago', 'Unregistered / privacy-locked ownership', 'Redirect chain through 4 domains', 'Fake countdown timer detected', '96% of reviews share identical phrasing'],
      green: ['Page loads over HTTPS (certificate invalid)'],
      summary: s => `Verdict: do not trust this site. The domain is ${s.age}, ownership is hidden, and the page shows classic scam markers — manufactured urgency, cloned review text, and an obfuscated redirect chain. Trust Score: ${s.score}/100.`
    },
    {
      test: d => /github|google|wikipedia|apple|microsoft|mozilla|stackoverflow|vercel|linear/i.test(d),
      score: [88, 97],
      ai: [4, 15],
      badge: ['trusted', 'Trusted'],
      age: ['9y 4m', '14y 1m', '18y 7m'],
      ssl: ["Valid (Let's Encrypt)", 'Valid (DigiCert)'],
      registrar: ['MarkMonitor Inc.', 'GoDaddy.com, LLC', 'Cloudflare, Inc.'],
      red: ['2 third-party analytics trackers'],
      green: ['Domain registered 9+ years ago', 'Valid SSL with full certificate chain', 'Zero blacklist hits across 14 databases', 'Consistent ownership history', 'No obfuscated scripts found'],
      summary: s => `Verdict: this site checks out. Long registration history, a clean certificate chain, and no blacklist or deception signals. Minor note: standard third-party analytics present. Trust Score: ${s.score}/100.`
    },
    {
      test: () => true,
      score: [46, 68],
      ai: [31, 55],
      badge: ['moderate', 'Moderate Risk'],
      age: ['1y 8m', '2y 3m', '7 months'],
      ssl: ["Valid (Let's Encrypt)"],
      registrar: ['Namecheap, Inc.', 'Porkbun LLC', 'Cloudflare, Inc.'],
      red: ['Mixed AI-generated product copy detected', '5 third-party trackers, 1 fingerprinting script', 'Reviews lack verified-purchase markers'],
      green: ['Valid SSL certificate', 'No blacklist hits', 'Consistent registrar history'],
      summary: s => `Verdict: proceed with caution. The infrastructure is legitimate, but a large share of the copy reads as machine-generated and the tracking footprint is heavy. Nothing dangerous — just don't take the reviews at face value. Trust Score: ${s.score}/100.`
    }
  ];

  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = arr => arr[rand(0, arr.length - 1)];

  const handleScan = (e) => {
    e.preventDefault();
    if (scanning) return;
    let domain = url.trim();
    if (!domain) return;
    if (!/^https?:\/\//i.test(domain)) domain = 'https://' + domain;
    try {
      domain = new URL(domain).hostname.replace(/^www\./, '');
    } catch {
      return;
    }
    setScanning(true);
    setTimeout(() => {
      const profile = PROFILES.find(p => p.test(domain));
      const score = rand(...profile.score);
      const ai = rand(...profile.ai);
      const age = pick(profile.age);
      setResult({ domain, score, ai, age, profile });
      setShowResults(true);
      setScanning(false);
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 1500);
  };

  const sampleUrls = ['shady-deals-90off.store', 'github.com', 'mega-rypto-doubler.biz'];

  return (
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
        .hero h1{font-size:clamp(38px,6vw,64px);font-weight:800;margin-bottom:22px}
        .hero h1 .truth{background:var(--accent-gradient);-webkit-background-clip:text;background-clip:text;color:transparent}
        .hero-sub{font-size:clamp(16px,2.2vw,19px);color:var(--text-secondary);max-width:640px;margin:0 auto 20px}
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
        .summary-box{background:linear-gradient(135deg,rgba(0,255,102,.06),rgba(79,70,229,.05));border:1px solid var(--border-default);border-radius:14px;padding:20px 22px;font-size:14.5px;color:var(--text-secondary);margin-bottom:28px;line-height:1.7}
        .summary-box strong{color:var(--text-primary)}
        .results-actions{display:flex;gap:12px;flex-wrap:wrap}
        .results-actions .btn{font-size:14px;padding:11px 22px}
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
          .results-head{flex-direction:column;align-items:flex-start}
          .t-step{gap:18px}
          .t-num{width:44px;height:44px;font-size:15px;border-radius:12px}
          .timeline::before{left:21px}
          .footer-grid{grid-template-columns:1fr}
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
          <div className="header-cta">
            <a href="#scan-section" className="btn btn-gradient btn-sm">Try It Now</a>
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
        <nav className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
          <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
          <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
          <a href="#how" onClick={() => setMobileOpen(false)}>API</a>
          <a href="#footer" onClick={() => setMobileOpen(false)}>Documentation</a>
          <a href="#scan-section" className="btn btn-gradient btn-sm" style={{ marginTop: '8px', textDecoration: 'none', textAlign: 'center' }}>Try It Now →</a>
        </nav>
      </header>

      {/* ========== HERO ========== */}
      <section className="hero" id="top">
        <div className="hero-bg"><div className="hero-grid-bg"></div></div>
        <div className="container hero-inner" id="scan-section">
          <div className="hero-badge"><span className="glow-dot"></span>AI-Powered Trust Analysis</div>
          <h1>Instantly separate web <span className="truth">truth</span> from filler</h1>
          <p className="hero-sub">The AI-powered trust analyzer that scans any URL for hidden risks, fake reviews, and security vulnerabilities in 3 seconds.</p>
          <div className="trust-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Over <strong>&nbsp;142,000&nbsp;</strong> domains analyzed today alone.
          </div>
          <form className="scan-form" onSubmit={handleScan}>
            <span className="url-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20 15.3 15.3 0 0 1 0-20z"/></svg>
            </span>
            <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste any URL — e.g. https://example.com" autoComplete="off" spellCheck="false" />
            <button type="submit" className="btn btn-gradient btn-pulse" disabled={scanning}>
              {scanning ? 'Scanning...' : 'Inject Serum →'}
            </button>
          </form>
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
              <h2>Your trust report</h2>
            </div>
            <div className="results-card">
              <div className="results-head">
                <div className="results-domain">
                  <div className="domain-favicon">{result.domain[0].toUpperCase()}</div>
                  <div>
                    <h3>{result.domain}</h3>
                    <div className="scan-time">Scanned just now · 2.8s</div>
                  </div>
                </div>
                <span className={`status-badge ${result.profile.badge[0]}`}>
                  <i></i><span>{result.profile.badge[1]}</span>
                </span>
              </div>
              <div className="results-body">
                <div className="domain-grid">
                  <div className="domain-cell"><div className="dl">Domain Age</div><div className="dv">{result.age}</div></div>
                  <div className="domain-cell"><div className="dl">SSL Status</div><div className="dv">{pick(result.profile.ssl)}</div></div>
                  <div className="domain-cell"><div className="dl">Registrar</div><div className="dv">{pick(result.profile.registrar)}</div></div>
                  <div className="domain-cell"><div className="dl">Last Scan</div><div className="dv">Just now</div></div>
                </div>
                <div className="score-row">
                  <div className="score-block">
                    <div className="score-label"><span>Trust Score</span><strong style={{ color: result.score >= 75 ? '#22c55e' : result.score >= 45 ? '#eab308' : '#ef4444' }}>{result.score}</strong></div>
                    <div className="score-track"><span className="score-fill" style={{ width: `${result.score}%`, background: result.score >= 75 ? 'linear-gradient(90deg,#22c55e,#00FF66)' : result.score >= 45 ? 'linear-gradient(90deg,#eab308,#facc15)' : 'linear-gradient(90deg,#ef4444,#f87171)' }}></span></div>
                    <div className="score-note">Weighted across security, reputation &amp; content signals</div>
                  </div>
                  <div className="score-block">
                    <div className="score-label"><span>AI Likelihood</span><strong style={{ color: result.ai <= 30 ? '#22c55e' : result.ai <= 60 ? '#eab308' : '#ef4444' }}>{result.ai}%</strong></div>
                    <div className="score-track"><span className="score-fill" style={{ width: `${result.ai}%`, background: result.ai <= 30 ? 'linear-gradient(90deg,#22c55e,#00FF66)' : result.ai <= 60 ? 'linear-gradient(90deg,#eab308,#facc15)' : 'linear-gradient(90deg,#ef4444,#f87171)' }}></span></div>
                    <div className="score-note">Share of on-page text likely machine-generated</div>
                  </div>
                </div>
                <div className="flags-grid">
                  <div className="flags-col">
                    <h4>🚩 Red Flags</h4>
                    <ul>
                      {result.profile.red.slice(0, 3).map((flag, i) => (
                        <li key={i}><span className="flag-dot red"></span>{flag}</li>
                      ))}
                      {result.profile.red.length === 0 && <li><span className="flag-dot green"></span>No red flags detected</li>}
                    </ul>
                  </div>
                  <div className="flags-col">
                    <h4>✅ Green Flags</h4>
                    <ul>
                      {result.profile.green.slice(0, 3).map((flag, i) => (
                        <li key={i}><span className="flag-dot green"></span>{flag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="summary-box" dangerouslySetInnerHTML={{ __html: result.profile.summary({ score: result.score, age: result.age }) }} />
                <div className="results-actions">
                  <button className="btn btn-gradient">📤 Share Report</button>
                  <button className="btn btn-ghost">📋 Copy Link</button>
                  <button className="btn btn-ghost" onClick={() => { setShowResults(false); setUrl(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Scan another URL</button>
                </div>
              </div>
            </div>
            <p className="demo-note">// demo report — simulated data for illustration</p>
          </div>
        </section>
      )}

      {/* ========== FEATURES ========== */}
      <section id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Serum Toolkit</span>
            <h2>Three engines. One verdict.</h2>
            <p>Every scan runs a full battery of checks across code, language, and infrastructure — distilled into a score anyone can read.</p>
          </div>
          <div className="bento">
            <div className="bento-card">
              <div className="bento-icon">🔍</div>
              <h3>Deep Script Audit</h3>
              <p>We deobfuscate and trace every script on the page, surfacing what the site would rather you didn't see.</p>
              <div className="bento-tags">
                <span>hidden trackers</span><span>malware</span><span>redirect loops</span><span>fingerprinting</span>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-icon">🤖</div>
              <h3>Linguistic Truth Evaluation</h3>
              <p>Our LLM cross-examines reviews, claims, and copy for the statistical fingerprints of manufactured persuasion.</p>
              <div className="bento-tags">
                <span>inflated reviews</span><span>synthetic claims</span><span>urgency bait</span><span>AI text ratio</span>
              </div>
            </div>
            <div className="bento-card">
              <div className="bento-icon">⚡</div>
              <h3>Edge-Engine Diagnostics</h3>
              <p>Scans execute at the edge, close to you — full reports in about 3 seconds, from anywhere on the planet.</p>
              <div className="bento-tags">
                <span>3-second reports</span><span>global infrastructure</span><span>40+ signals</span><span>API access</span>
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
                <h3>Ingestion</h3>
                <p>The URL is stripped down to its raw source code — every script, pixel, and network call laid bare for inspection.</p>
                <span className="t-meta">~0.4s · raw DOM + network trace</span>
              </div>
            </div>
            <div className="t-step">
              <div className="t-num">02</div>
              <div className="t-body">
                <h3>Cross-Examination</h3>
                <p>Our LLM evaluates the content for deceptive patterns — fake-review cadence, manufactured urgency, claims that don't add up.</p>
                <span className="t-meta">~1.8s · linguistic + behavioral analysis</span>
              </div>
            </div>
            <div className="t-step">
              <div className="t-num">03</div>
              <div className="t-body">
                <h3>Verification</h3>
                <p>Domain history, registration records, SSL chain, and global blacklist databases are checked to confirm who's really behind the site.</p>
                <span className="t-meta">~0.8s · WHOIS + blacklist cross-check</span>
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
                <li><span className="tick">✓</span>Trust Score &amp; basic flags</li>
                <li><span className="tick">✓</span>Domain age &amp; SSL checks</li>
                <li className="off"><span className="x">—</span>Deep script audit</li>
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
                <li><span className="tick">✓</span>Full deep script audit</li>
                <li><span className="tick">✓</span>AI text ratio &amp; linguistic analysis</li>
                <li><span className="tick">✓</span>API access &amp; bulk URL scans</li>
                <li><span className="tick">✓</span>Shareable PDF trust reports</li>
                <li><span className="tick">✓</span>Priority edge processing</li>
              </ul>
              <a href="#scan-section" className="btn btn-gradient" style={{ textDecoration: 'none', textAlign: 'center' }}>Go Pro →</a>
            </div>
          </div>
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
              <p>The AI-powered trust analyzer for a web full of filler.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#how">API</a></li>
                <li><a href="#top">Browser Extension</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <ul>
                <li><a href="#footer">Documentation</a></li>
                <li><a href="#footer">Trust Score Methodology</a></li>
                <li><a href="#footer">Blacklist Sources</a></li>
                <li><a href="#footer">Changelog</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#footer">About</a></li>
                <li><a href="#footer">Blog</a></li>
                <li><a href="#footer">Careers</a></li>
                <li><a href="#footer">Contact</a></li>
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
  );
};

export default LandingPage;