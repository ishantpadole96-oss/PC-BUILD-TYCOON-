// Challenges View - 6 target scenarios with strict rules, objectives, and cash bounties
import React from 'react';
import { useGameStore } from '../../store/gameStore';

export function ChallengesView() {
  const challenges = useGameStore((s) => s.challenges);
  const activeChallenge = useGameStore((s) => s.activeChallenge);
  const startChallenge = useGameStore((s) => s.startChallenge);
  const setActiveTab = useGameStore((s) => s.setActiveTab);

  return (
    <div className="challenges-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">🏆 ENGINEERING CHALLENGE ARENA</h2>
          <p className="page-subtitle">
            Put your PC hardware optimization skills to the test with rigorous engineering targets. Earn massive reputation and cash prizes.
          </p>
        </div>
      </div>

      <div className="challenges-grid">
        {challenges.map((ch) => {
          const isActive = activeChallenge?.id === ch.id;

          return (
            <div key={ch.id} className={`challenge-card ${isActive ? 'card-active-challenge' : ''} ${ch.completed ? 'card-completed' : ''}`}>
              <div className="card-header">
                <span className="ch-icon">{ch.icon}</span>
                <div>
                  <h3 className="ch-name">{ch.name}</h3>
                  <span className={`diff-tag diff-${ch.difficulty}`}>{ch.difficulty.toUpperCase()}</span>
                </div>
              </div>

              <p className="ch-desc">{ch.description}</p>

              <div className="objective-box">
                <span className="obj-label">OBJECTIVE:</span>
                <p className="obj-text">{ch.objective}</p>
              </div>

              <div className="ch-rules-list">
                {ch.rules.maxBudget && (
                  <div className="rule-item">
                    <span>Max Budget:</span>
                    <strong>₹{ch.rules.maxBudget.toLocaleString('en-IN')}</strong>
                  </div>
                )}
                {ch.rules.minFps1080p && (
                  <div className="rule-item">
                    <span>Min 1080p FPS:</span>
                    <strong>{ch.rules.minFps1080p} FPS</strong>
                  </div>
                )}
                <div className="rule-item">
                  <span>Prize Bounty:</span>
                  <strong className="text-cash">+₹{ch.reward.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {ch.completed && (
                <div className="completed-badge">
                  <span>✅ CHALLENGE MASTERED (Score: {ch.bestScore}/100)</span>
                </div>
              )}

              <div className="ch-actions">
                {isActive ? (
                  <button
                    onClick={() => setActiveTab('workstation')}
                    className="btn-primary"
                  >
                    🛠️ Assemble Build in Workstation
                  </button>
                ) : (
                  <button
                    onClick={() => startChallenge(ch.id)}
                    className="btn-secondary"
                  >
                    {ch.completed ? 'Replay Challenge' : 'Accept Challenge'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
