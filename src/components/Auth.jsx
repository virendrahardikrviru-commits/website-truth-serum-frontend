import React, { useState } from 'react';
import { signUp, signIn } from '../services/auth';

const Auth = ({ onAuthSuccess, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (isLogin) {
      const { data, error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Login successful!');
        if (onAuthSuccess) onAuthSuccess(data.user);
        setTimeout(() => {
          if (onClose) onClose();
        }, 1000);
      }
    } else {
      const { data, error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Account created! Please check your email to verify.');
        setTimeout(() => setIsLogin(true), 2000);
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }} onClick={onClose}>
      <div className="auth-modal" style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '20px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        position: 'relative',
        animation: 'slideUp 0.3s ease-out',
      }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#94a3b8',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => e.target.style.color = '#0f172a'}
          onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
        >
          ×
        </button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #00FF66 0%, #4F46E5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            marginBottom: '16px',
          }}>
            🔐
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {isLogin ? 'Sign in to access your scan history' : 'Start saving your trust reports'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '13px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#dcfce7',
            color: '#15803d',
            padding: '12px 16px',
            borderRadius: '10px',
            marginBottom: '16px',
            fontSize: '13px',
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4f46e5';
                e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength="6"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4f46e5';
                e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.3)';
            }}
          >
            {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = '#7c3aed'}
              onMouseLeave={(e) => e.target.style.color = '#4f46e5'}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>

        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Auth;