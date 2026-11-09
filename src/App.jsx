import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getCurrentUser, supabase } from './services/auth';

// Lazy load all pages so they are not bundled into main.js
const LandingPage = lazy(() => import('./components/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Auth = lazy(() => import('./components/Auth'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PublicReportPage = lazy(() => import('./pages/PublicReportPage'));
const WebsiteSafetyCheckerPage = lazy(() => import('./pages/WebsiteSafetyCheckerPage'));
const WebsiteScamCheckerPage = lazy(() => import('./pages/WebsiteScamCheckerPage'));
const WebsiteLegitimacyCheckerPage = lazy(() => import('./pages/WebsiteLegitimacyCheckerPage'));
const WebsiteTrustCheckerPage = lazy(() => import('./pages/WebsiteTrustCheckerPage'));
const HowToCheckWebsiteLegitimatePage = lazy(() => import('./pages/HowToCheckWebsiteLegitimatePage'));
const HowToCheckWebsiteSafePage = lazy(() => import('./pages/HowToCheckWebsiteSafePage'));
const HowToTellWebsiteScamPage = lazy(() => import('./pages/HowToTellWebsiteScamPage'));

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = (user) => {
    setUser(user);
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #4f46e5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Suspense fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      }>
        {showAuth && (
          <Auth
            onAuthSuccess={handleAuthSuccess}
            onClose={() => setShowAuth(false)}
          />
        )}

        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                user={user}
                onLogin={() => setShowAuth(true)}
                onLogout={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                }}
              />
            }
          />
	  <Route
  path="/dashboard"
  element={
    <Dashboard
      user={user}
      onLogin={() => setShowAuth(true)}
      onLogout={async () => {
        await supabase.auth.signOut();
        setUser(null);
      }}
    />
  }
/>
          <Route path="/website-safety-checker" element={<WebsiteSafetyCheckerPage />} />
          <Route path="/website-scam-checker" element={<WebsiteScamCheckerPage />} />
          <Route path="/website-legitimacy-checker" element={<WebsiteLegitimacyCheckerPage />} />
          <Route path="/website-trust-checker" element={<WebsiteTrustCheckerPage />} />
          <Route path="/how-to-check-if-a-website-is-legitimate" element={<HowToCheckWebsiteLegitimatePage />} />
          <Route path="/how-to-check-if-a-website-is-safe" element={<HowToCheckWebsiteSafePage />} />
          <Route path="/how-to-tell-if-a-website-is-a-scam" element={<HowToTellWebsiteScamPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/report/:scanId" element={<PublicReportPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;