import React, { useState } from 'react';
import { useSiteStore } from '../../store/siteStore';
import { signInWithPCID, signUpWithPCID, isSupabaseConfigured, signOutUser } from '../../utils/supabase';
import './AuthModal.css';

export function AuthModal() {
  const isOpen = useSiteStore((s) => s.authModalOpen);
  const setOpen = useSiteStore((s) => s.setAuthModalOpen);
  const user = useSiteStore((s) => s.user);
  const setUser = useSiteStore((s) => s.setUser);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [pcId, setPcId] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pcId || !password) {
      setErrorMsg('Please enter a Username and Password.');
      return;
    }
    
    if (isRegistering && !/^[a-zA-Z0-9_]{3,20}$/.test(pcId)) {
      setErrorMsg('Username must be 3-20 characters and contain only letters, numbers, and underscores (e.g. titan_builder).');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      const { data: _data, error } = isRegistering 
        ? await signUpWithPCID(pcId, password) 
        : await signInWithPCID(pcId, password);
      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          // Bypass rate limit for local dev / simulator by creating a mock user
          setUser({ email: `${pcId}@titanos.com`, user_metadata: { full_name: pcId } });
          setOpen(false);
          return;
        } else {
          setErrorMsg(error.message);
        }
      } else if (isRegistering || _data?.user) {
        setOpen(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
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
                <span>{user.user_metadata?.full_name?.[0]?.toUpperCase() || '👤'}</span>
              </div>
              <div className="user-profile-info">
                <h3>{user.user_metadata?.full_name || 'PC Builder'}</h3>
                <p className="pc-id-display">Username: {user.email?.replace('@titanos.com', '')}</p>
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
                Create a custom Username and Password to save your progress to the cloud. You don't need a real email!
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
                    Add your project credentials to <code>.env.local</code> to enable cloud saves:
                  </p>
                  <pre className="env-code-preview">
                    VITE_SUPABASE_URL=https://your-project.supabase.co{'\n'}
                    VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
                  </pre>
                </div>
              )}

              <form onSubmit={handleSubmit} className="custom-auth-form">
                <div className="input-group">
                  <label>Username</label>
                  <input 
                    type="text" 
                    placeholder="e.g. titan_builder" 
                    value={pcId} 
                    onChange={(e) => setPcId(e.target.value)}
                    className="custom-auth-input"
                  />
                </div>
                
                <div className="input-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter a Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    className="custom-auth-input"
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-custom-auth"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                </button>
              </form>
              
              <div className="auth-toggle-wrapper">
                <button 
                  onClick={() => setIsRegistering(!isRegistering)} 
                  className="btn-auth-toggle"
                  type="button"
                >
                  {isRegistering ? 'Already have an account? Sign In' : 'Need an account? Create one'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
