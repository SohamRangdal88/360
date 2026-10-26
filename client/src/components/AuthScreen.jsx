import React, { useState } from 'react';
import { AcademicCapIcon, ShieldCheckIcon, MailIcon, EditIcon } from './Icons';

export function AuthScreen({ onLogin, onRegister, onDemoAccount, onDemoRegister, onDemoAdmin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Please enter your official faculty email address.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Please enter a valid email address (e.g. faculty@college.edu.in).';
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }
    setError('');

    if (mode === 'login') {
      onLogin({ email: email.trim() });
    } else {
      onRegister({ email: email.trim() });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <img src="/wit-logo.jpg" alt="WIT Logo" className="wit-logo" />
            <div style={{ width: '1px', height: '80px', background: 'rgba(18, 69, 95, 0.2)' }} />
            <img src="/faculty360-logo-cropped.png" alt="Faculty 360" style={{ height: '42px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
          </div>
          <p className="auth-subtitle" style={{ marginTop: '16px' }}>
            {mode === 'login' 
              ? 'Enter your official email to sign in to your Faculty Dashboard' 
              : 'Enter your official email to create a new account and fill your form'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab ${mode === 'login' ? 'is-active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In (Go to Dashboard)
          </button>
          <button 
            type="button" 
            className={`auth-tab ${mode === 'register' ? 'is-active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Create Account (Start Form)
          </button>
        </div>

        {error && <div className="auth-error-box">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MailIcon size={16} color="var(--brand)" /> Official Faculty Email <span className="required">*</span>
            </label>
            <input
              type="email"
              className="input"
              placeholder="e.g. dr.faculty@college.edu.in"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoFocus
            />
            <p className="field-hint">
              {mode === 'login' 
                ? 'Signing in will direct you straight to your Faculty Dashboard.' 
                : 'Creating an account will direct you straight to the profile form procedure.'}
            </p>
          </div>

          <button type="submit" className="btn btn-primary auth-submit-btn">
            {mode === 'login' ? 'Sign In (View Dashboard)' : 'Create Account (Start Form)'}
          </button>

          <div className="auth-divider"><span>OR</span></div>

          {mode === 'login' ? (
            <>
              <button
                type="button"
                className="btn btn-outline auth-demo-btn"
                onClick={onDemoAccount}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShieldCheckIcon size={16} /> Instant Demo Sign In (Go to Dashboard)
              </button>
              <button
                type="button"
                className="btn btn-primary auth-demo-btn"
                onClick={onDemoAdmin}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <ShieldCheckIcon size={16} /> Demo Admin Workspace
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-outline auth-demo-btn"
              onClick={onDemoRegister}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <EditIcon size={16} /> Instant Demo Sign Up (Start Form)
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
