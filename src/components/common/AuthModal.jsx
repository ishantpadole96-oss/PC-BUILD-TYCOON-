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
      setErrorMsg('Please enter a PC ID and Password.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      const { data: _data, error } = isRegistering 
        ? await signUpWithPCID(pcId, password) 
        : await signInWithPCID(pcId, password);
        
      if (error) {
        setErrorMsg(error.message);
      } else if (isRegistering) {
        // If successful registration, we are logged in.
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
                Create a custom PC ID and Password to save your progress to the cloud. You don't need a real email!
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

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Enter a Unique PC ID" 
                  value={pcId} 
                  onChange={(e) => setPcId(e.target.value)}
                  style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #475569', background: '#1e293b', color: 'white' }}
                />
                <input 
                  type="password" 
                  placeholder="Enter a Password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ padding: '0.8rem', borderRadius: '4px', border: '1px solid #475569', background: '#1e293b', color: 'white' }}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                  style={{ marginTop: '0.5rem', width: '100%' }}
                >
                  {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
                </button>
              </form>
              
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button 
                  onClick={() => setIsRegistering(!isRegistering)} 
                  style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {isRegistering ? 'Already have a PC ID? Sign In' : 'Need a new PC ID? Create Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
