// Community Builds & Showcase View
// Players can publish their custom builds, browse community rigs, and see like counts
import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function CommunityView() {
  const [newBuildName, setNewBuildName] = useState('');
  const savedBuilds = useGameStore((s) => s.savedBuilds);
  const saveCustomBuild = useGameStore((s) => s.saveCustomBuild);
  const likeCommunityBuild = useGameStore((s) => s.likeCommunityBuild);
  const currentBuild = useGameStore((s) => s.currentBuild);

  const handlePublish = (e) => {
    e.preventDefault();
    if (!newBuildName.trim()) return;
    saveCustomBuild(newBuildName.trim());
    setNewBuildName('');
  };

  return (
    <div className="community-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">🌐 COMMUNITY RIG SHOWCASE</h2>
          <p className="page-subtitle">
            Browse high-performance PC builds engineered by enthusiast builders. Share your own workstation builds to earn community accolades.
          </p>
        </div>
      </div>

      {/* Publish Current Build Bar */}
      <div className="publish-build-bar">
        <div className="bar-info">
          <h4>Publish Current Workstation Rig:</h4>
          <span>Current parts: {currentBuild.cpu ? currentBuild.cpu.model : 'No CPU'} • {currentBuild.gpu ? currentBuild.gpu.model : 'No GPU'}</span>
        </div>
        <form onSubmit={handlePublish} className="publish-form">
          <input
            type="text"
            placeholder="Give your build an epic name..."
            value={newBuildName}
            onChange={(e) => setNewBuildName(e.target.value)}
            className="input-build-name"
          />
          <button type="submit" className="btn-primary">
            🚀 Publish to Showcase
          </button>
        </form>
      </div>

      {/* Builds Showcase Grid */}
      <div className="community-grid">
        {savedBuilds.map((build) => (
          <div key={build.id} className="build-showcase-card">
            <div className="card-top">
              <span className="author-tag">👤 {build.author}</span>
              <button
                onClick={() => likeCommunityBuild(build.id)}
                className="btn-like"
                title="Like this build"
              >
                ❤️ {build.likes}
              </button>
            </div>

            <h3 className="build-name">{build.name}</h3>

            <div className="build-metrics-row">
              <div className="metric-chip">
                <span>Total Value</span>
                <strong>₹{build.totalCost.toLocaleString('en-IN')}</strong>
              </div>
              <div className="metric-chip">
                <span>Perf Score</span>
                <strong className="text-good">{build.score}/100</strong>
              </div>
              <div className="metric-chip">
                <span>1080p FPS</span>
                <strong>{build.fps1080p} FPS</strong>
              </div>
            </div>

            <div className="build-specs-box">
              <div className="spec-line"><span>CPU:</span> <strong>{build.parts.cpu}</strong></div>
              <div className="spec-line"><span>GPU:</span> <strong>{build.parts.gpu}</strong></div>
              <div className="spec-line"><span>Motherboard:</span> <strong>{build.parts.motherboard}</strong></div>
              <div className="spec-line"><span>RAM:</span> <strong>{build.parts.ram}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
