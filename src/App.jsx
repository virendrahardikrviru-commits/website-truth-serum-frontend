import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import { getCurrentUser, supabase } from './services/auth';
import PublicReportPage from './pages/PublicReportPage';
import WebsiteSafetyCheckerPage from './pages/WebsiteSafetyCheckerPage';

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle email confirmation redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      // User confirmed email, redirect to home
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      const { user } = await getCurrentUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
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
          path="/website-safety-checker"
          element={<WebsiteSafetyCheckerPage />}
        />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
	<Route path="/report/:scanId" element={<PublicReportPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
