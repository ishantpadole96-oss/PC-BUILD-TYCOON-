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
          <li><strong>📧 1. Check E-mail:</strong> Open the E-mail app to find customer orders. Read their requirements and click 'Accept' to start the job.</li>
          <li><strong>🛒 2. Buy Parts:</strong> Open the Shop app. Use the search and category filters to find the specific parts that your customer requested, and purchase them.</li>
          <li><strong>🛠️ 3. Build the PC:</strong> Go to the Assembly Desk. Click on the empty slots to install the parts you just bought from your inventory.</li>
          <li><strong>🔌 4. Boot & Test:</strong> Hit the POWER ON button at the assembly desk. Ensure it boots and you didn't forget any required parts.</li>
          <li><strong>📦 5. Deliver:</strong> Once the PC boots successfully, click 'Deliver PC' to complete the order and get paid!</li>
          <li><strong>🖼️ 6. Customize:</strong> You can personalize your workspace! Open the Wallpaper app to change your desktop background to any image or video URL.</li>
          <li><strong>🎮 7. Mini Games:</strong> Waiting for orders? Open the Mini Game hub to play Flappy Bird, Snake, or Pong!</li>
          <li><strong>🌐 8. Browse Web:</strong> Check out the Web Browser to visit real websites or our simulated hardware news and part picker tools.</li>
        </ul>
        <button className="btn-primary btn-tutorial-close" onClick={() => setClosed(true)}>
          Got it, let's build! 🚀
        </button>
      </div>
    </div>
  );
}
