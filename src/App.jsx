import React from 'react';
import { useGameStore } from './store/gameStore';
import { LandingPage } from './components/os/LandingPage';
import { IntroScreen } from './components/os/IntroScreen';
import { VirtualOS } from './components/os/VirtualOS';
import { AuthModal } from './components/common/AuthModal';
import './index.css';

export default function App() {
  const gameState = useGameStore((s) => s.gameState);

  return (
    <div className="game-app">
      {gameState === 'landing' && <LandingPage />}
      {gameState === 'intro' && <IntroScreen />}
      {(gameState === 'booting' || gameState === 'desktop') && <VirtualOS />}
      <AuthModal />
    </div>
  );
}
