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
    if (!supabase) return;
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const isLoggingIn = session?.user && !useSiteStore.getState().user;
      setUser(session?.user ?? null);
      
      if (isLoggingIn) {
        // When user logs in, try to load from cloud or push local progress to cloud
        await useGameStore.getState().loadGame();
        // Force a save to ensure cloud has the latest state if it was a local-only save
        await useGameStore.getState().saveGame();
      }
    });

    return () => subscription.unsubscribe();
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
