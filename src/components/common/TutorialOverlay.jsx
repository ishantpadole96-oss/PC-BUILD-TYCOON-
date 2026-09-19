import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundFx } from '../../utils/audio';
import './TutorialOverlay.css';

const TUTORIAL_TEXT = `👋 Welcome to TITAN OS!

You have just opened your brand new PC building shop.
Here is how to get started:

📧 1. Check E-mail: Find customer orders and accept them.
🛒 2. Buy Parts: Open the Shop app and purchase requested components.
🛠️ 3. Build the PC: Go to the Assembly Desk and install parts.
🔌 4. Boot & Test: Power on the PC and ensure it works.
📦 5. Deliver: Send the PC back to the customer and get paid!
🖼️ 6. Customize: Change your wallpaper to personalize your workspace.
🎮 7. Mini Games: Play games while waiting for orders.
🌐 8. Browse Web: Visit simulated websites and tools.`;

export function TutorialOverlay() {
  const day = useGameStore((s) => s.day);
  const reputation = useGameStore((s) => s.reputation);
  const [closed, setClosed] = useState(() => {
    return localStorage.getItem('titanos_tutorial_seen') === 'true';
  });

  const [text, setText] = useState('');
  const [phase, setPhase] = useState(0);
  const keystrokeCounter = useRef(0);

  useEffect(() => {
    if (day !== 1 || reputation > 0 || closed) {
      return;
    }
    soundFx.ensureContext();
    let i = 0;
    const interval = setInterval(() => {
      setText(TUTORIAL_TEXT.slice(0, i));
      i++;
      keystrokeCounter.current++;
      if (keystrokeCounter.current % 3 === 0) {
        soundFx.playKeystroke();
      }
      if (i > TUTORIAL_TEXT.length) {
        clearInterval(interval);
        soundFx.playNotification();
        setTimeout(() => setPhase(1), 1000);
      }
    }, 20); // Faster typing for tutorial
    return () => clearInterval(interval);
  }, [day, reputation, closed]);

  if (day !== 1 || reputation > 0 || closed) {
    return null;
  }

  const handleClose = () => {
    soundFx.playClick();
    localStorage.setItem('titanos_tutorial_seen', 'true');
    setClosed(true);
  };

  return (
    <div className="tutorial-intro-screen" onClick={handleClose}>
      <div className="tutorial-intro-content">
        <p className="tutorial-typewriter">{text}</p>
        {phase === 1 && (
          <button className="btn-start-tutorial" onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}>
            Got it, let's build! 🚀
          </button>
        )}
      </div>
      <div className="skip-hint">Click anywhere to skip</div>
    </div>
  );
}
