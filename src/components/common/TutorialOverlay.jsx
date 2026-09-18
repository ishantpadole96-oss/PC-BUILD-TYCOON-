import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import './TutorialOverlay.css';

export function TutorialOverlay() {
  const day = useGameStore((s) => s.day);
  const reputation = useGameStore((s) => s.reputation);
  const [closed, setClosed] = useState(false);

  // Only show tutorial on Day 1 when reputation is 0
  if (day !== 1 || reputation > 0 || closed) {
    return null;
  }

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-box">
        <h3>👋 Welcome to TITAN OS!</h3>
        <p>You have just opened your brand new PC building shop. Here is how to get started:</p>
        <ul className="tutorial-steps">
          <li><strong>1. Check E-mail:</strong> Open the E-mail app to find customer orders and accept them.</li>
          <li><strong>2. Buy Parts:</strong> Use the Shop app to buy the parts needed for your customer's build.</li>
          <li><strong>3. Build the PC:</strong> Open the Assembly Desk, click the empty slots to install your parts.</li>
          <li><strong>4. Boot & Deliver:</strong> Hit POWER ON at the desk, ensure it boots, then deliver the PC!</li>
        </ul>
        <button className="btn-primary btn-tutorial-close" onClick={() => setClosed(true)}>
          Got it, let's build! 🚀
        </button>
      </div>
    </div>
  );
}
