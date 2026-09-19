import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { useSiteStore } from './store/siteStore';
import { LandingPage } from './components/os/LandingPage';
import { IntroScreen } from './components/os/IntroScreen';
import { VirtualOS } from './components/os/VirtualOS';
import { AuthModal } from './components/common/AuthModal';
import { supabase } from './utils/supabase';
import './index.css';

export default function App() {
  const gameState = useGameStore((s) => s.gameState);
  const setUser = useSiteStore((s) => s.setUser);

  useEffect(() => {
    // 1. Try to load local mock user first (for rate limit bypass persistence)
    const mockUser = localStorage.getItem('pc_simulator_mock_user');
    if (mockUser) {
      setUser(JSON.parse(mockUser));
    }

    // 2. Setup Supabase real auth listener
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.removeItem('pc_simulator_mock_user'); // clear mock if real login works
          useSiteStore.getState().syncCloudBuilds();
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          localStorage.removeItem('pc_simulator_mock_user');
          useSiteStore.getState().syncCloudBuilds();
        } else if (!localStorage.getItem('pc_simulator_mock_user')) {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [setUser]);

  return (
    <div className="game-app">
      {gameState === 'landing' && <LandingPage />}
      {gameState === 'intro' && <IntroScreen />}
      {(gameState === 'booting' || gameState === 'desktop') && <VirtualOS />}
      <AuthModal />
    </div>
  );
}
