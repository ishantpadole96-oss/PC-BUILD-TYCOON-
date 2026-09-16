import React, { useState } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { signInWithGoogle, isSupabaseConfigured, signOutUser } from '../../utils/supabase';
import './AuthModal.css';

export function AuthModal() {
  const isOpen = useSiteStore((s) => s.authModalOpen);
  const setOpen = useSiteStore((s) => s.setAuthModalOpen);
  const user = useSiteStore((s) => s.user);
  const setUser = useSiteStore((s) => s.setUser);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during Google Sign-in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    setOpen(false);
  };

  return (
    <div className="modal-backdrop" onClick={() => setOpen(false)}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-category-chip">ACCOUNT & CLOUD SYNC</span>
            <h2 className="modal-component-name">
              {user ? 'My Profile' : 'Sign in to PCPartPulse'}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={() => setOpen(false)}>✕</button>
        </div>

        <div className="modal-body">
          {user ? (
            <div className="user-profile-card">
              <div className="user-avatar-circle">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="user-avatar-img" />
                ) : (
                  <span>{user.email?.[0]?.toUpperCase() || '👤'}</span>
                )}
              </div>
              <div className="user-profile-info">
                <h3>{user.user_metadata?.full_name || 'PC Builder'}</h3>
                <p>{user.email}</p>
                <span className="cloud-status-badge">✓ Cloud Sync Active</span>
              </div>

              <div className="profile-actions">
                <button className="btn-signout" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="login-flow-box">
              <p className="login-prompt-text">
                Sign in with your Google account to dynamically sync custom PC builds across all your devices, track live price drop alerts, and share public links.
              </p>

              {errorMsg && (
                <div className="auth-error-alert">
                  <span>⚠️ {errorMsg}</span>
                </div>
              )}

              {!isSupabaseConfigured && (
                <div className="supabase-config-notice">
                  <h4>⚡ Supabase Setup Required</h4>
                  <p>
                    To enable live Google OAuth and PostgreSQL cloud storage, add your project credentials to <code>.env.local</code> or in <strong>Vercel Project Settings</strong>:
                  </p>
                  <pre className="env-code-preview">
                    VITE_SUPABASE_URL=https://your-project.supabase.co{'\n'}
                    VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
                  </pre>
                </div>
              )}

              <button
                className="btn-google-oauth"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="google-icon" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
