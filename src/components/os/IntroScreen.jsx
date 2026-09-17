import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundFx } from '../../utils/audio';
import './IntroScreen.css';

export function IntroScreen() {
  const setGameState = useGameStore((s) => s.setGameState);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState(0);
  const keystrokeCounter = useRef(0);

  const fullText = "You've inherited an old PC repair shop...\\n\\nThe bank is breathing down your neck.\\nThe tech is outdated.\\nThe clients are demanding.\\n\\nBut you know hardware.\\nIt's time to build your empire.";

  useEffect(() => {
    soundFx.ensureContext();
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      // Play keystroke sound every 3rd character for subtle feedback
      keystrokeCounter.current++;
      if (keystrokeCounter.current % 3 === 0) {
        soundFx.playKeystroke();
      }
      if (i > fullText.length) {
        clearInterval(interval);
        soundFx.playNotification();
        setTimeout(() => setPhase(1), 1000);
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    soundFx.playClick();
    setGameState('booting');
  };

  return (
    <div className="intro-screen" onClick={handleSkip}>
      <div className="intro-content">
        <p className="typewriter">{text}</p>
        {phase === 1 && (
          <button className="btn-start-os" onClick={handleSkip}>
            BOOT SYSTEM &rarr;
          </button>
        )}
      </div>
      <div className="skip-hint">Click anywhere to skip</div>
    </div>
  );
}
