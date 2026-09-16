import React, { useState } from 'react';
import { useSiteStore } from '../../store/siteStore';
import './BenchmarkView.css';

export function BenchmarkView() {
  const currentBuild = useSiteStore((s) => s.currentBuild);
  const setActiveTab = useSiteStore((s) => s.setActiveTab);

  const [resolution, setResolution] = useState('1440p'); // '1080p' | '1440p' | '4k'

  const cpu = currentBuild.cpu;
  const gpu = currentBuild.gpu;
  const ram = currentBuild.ram;

  const hasCoreParts = cpu && gpu;

  // Performance calculations
  const cpuScore = cpu?.specs?.performanceScore || 50;
  const gpuScore = gpu?.specs?.performanceScore || 50;
  const ramBonus = ram?.specs?.type === 'DDR5' ? 1.08 : 1.0;

  // Resolution multiplier
  const resMultipliers = {
    '1080p': { cpuWeight: 0.45, gpuWeight: 0.55, baseFps: 1.4 },
    '1440p': { cpuWeight: 0.25, gpuWeight: 0.75, baseFps: 1.0 },
    '4k': { cpuWeight: 0.10, gpuWeight: 0.90, baseFps: 0.58 },
  };

  const currentMult = resMultipliers[resolution];
  const compositeScore = ((cpuScore * currentMult.cpuWeight) + (gpuScore * currentMult.gpuWeight)) * ramBonus;

  // Games estimations
  const games = [
    {
      name: 'Cyberpunk 2077',
      genre: 'Ultra + Ray Tracing',
      fps: Math.round(compositeScore * 1.05 * currentMult.baseFps),
      recommendedFps: 60,
    },
    {
      name: 'Black Myth: Wukong',
      genre: 'Very High Preset',
      fps: Math.round(compositeScore * 0.98 * currentMult.baseFps),
      recommendedFps: 60,
    },
    {
      name: 'Call of Duty: Warzone',
      genre: 'Competitive High',
      fps: Math.round(compositeScore * 1.55 * currentMult.baseFps),
      recommendedFps: 100,
    },
    {
      name: 'Valorant / CS2',
      genre: 'eSports Ultra High',
      fps: Math.round((cpuScore * 2.8 + gpuScore * 1.2) * (resolution === '4k' ? 0.8 : 1.0)),
      recommendedFps: 240,
    },
    {
      name: 'Grand Theft Auto V',
      genre: 'Very High FXAA',
      fps: Math.round(compositeScore * 1.65 * currentMult.baseFps),
      recommendedFps: 80,
    },
    {
      name: 'Red Dead Redemption 2',
      genre: 'Favor Quality High',
      fps: Math.round(compositeScore * 1.12 * currentMult.baseFps),
      recommendedFps: 60,
    },
  ];

  // Bottleneck estimation
  const cpuGpuDelta = Math.abs(cpuScore - gpuScore);
  const bottleneckPercent = Math.min(28, Math.round((cpuGpuDelta / 100) * 30));
  const bottleneckType = cpuScore < gpuScore ? 'CPU Bottleneck' : 'GPU Bottleneck';
  const isBalanced = bottleneckPercent <= 8;

  // Productivity
  const blenderTimeSec = Math.max(18, Math.round(180 - (cpuScore * 1.2 + gpuScore * 0.4)));
  const cinebenchMulti = Math.round(cpuScore * 320);

  return (
    <div className="benchmarks-view">
      <div className="benchmarks-header">
        <div>
          <h2 className="benchmarks-title">FPS & Bottleneck Performance Simulation</h2>
          <p className="benchmarks-sub">
            Estimated gaming frame rates and compute throughput calculated from your selected CPU, GPU, and RAM topology.
          </p>
        </div>

        {/* Resolution Selector */}
        <div className="res-toggle-group">
          {['1080p', '1440p', '4k'].map((res) => (
            <button
              key={res}
              className={`res-btn ${resolution === res ? 'active' : ''}`}
              onClick={() => setResolution(res)}
            >
              {res.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {!hasCoreParts && (
        <div className="missing-parts-callout">
          <span>⚠️ A CPU and dedicated GPU are required to calculate real-world FPS estimates.</span>
          <button className="btn-go-builder" onClick={() => setActiveTab('builder')}>
            Go to System Builder to pick components ↗
          </button>
        </div>
      )}

      {/* Bottleneck Analyzer Card */}
      <div className="bottleneck-card">
        <div className="bottleneck-header">
          <span className="bottleneck-badge">
            {isBalanced ? '✓ Highly Balanced System' : `⚠️ ${bottleneckPercent}% ${bottleneckType}`}
          </span>
          <span className="resolution-label">Evaluated at {resolution.toUpperCase()}</span>
        </div>

        <div className="bottleneck-body">
          <div className="bottleneck-meter">
            <div className="bottleneck-meter-labels">
              <span>Balanced</span>
              <span>Moderate</span>
              <span>Severe</span>
            </div>
            <div className="meter-track">
              <div
                className={`meter-thumb ${isBalanced ? 'thumb-green' : 'thumb-orange'}`}
                style={{ left: `${Math.min(95, bottleneckPercent * 3.5)}%` }}
              ></div>
            </div>
          </div>
          <p className="bottleneck-explanation">
            {isBalanced
              ? `Your ${cpu?.model || 'CPU'} and ${gpu?.model || 'GPU'} work in near-perfect harmony with minimal idle cycles.`
              : `${bottleneckType === 'CPU Bottleneck' ? `Your GPU is faster than your processor at ${resolution}, meaning higher CPU clock speeds would unlock more frames.` : `Your GPU is operating near 100% capacity at ${resolution}, which is standard for AAA gaming.`}`}
          </p>
        </div>
      </div>

      {/* Game FPS Simulation Cards */}
      <div className="games-section">
        <h3 className="section-title">Estimated Game Frame Rates ({resolution.toUpperCase()})</h3>
        <div className="games-grid">
          {games.map((g) => {
            const isPassing = g.fps >= g.recommendedFps;
            return (
              <div key={g.name} className="game-card">
                <div className="game-card-top">
                  <h4 className="game-title">{g.name}</h4>
                  <span className="game-genre">{g.genre}</span>
                </div>

                <div className="game-fps-display">
                  <span className="fps-number">{g.fps}</span>
                  <span className="fps-unit">FPS</span>
                </div>

                <div className="fps-meter-row">
                  <div className="fps-bar-track">
                    <div
                      className={`fps-bar-fill ${isPassing ? 'fill-smooth' : 'fill-stutter'}`}
                      style={{ width: `${Math.min(100, (g.fps / (g.recommendedFps * 1.5)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="fps-verdict">{isPassing ? '✓ Ultra Smooth' : '⚠️ Sub-60 FPS'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workstation & Productivity Benchmarks */}
      <div className="workstation-bench-card">
        <h3 className="section-title">Synthetic & Productivity Projections</h3>
        <div className="workstation-grid">
          <div className="workstation-box">
            <span className="workstation-label">Cinebench R23 Multi-Core</span>
            <span className="workstation-val">{cinebenchMulti.toLocaleString()} pts</span>
            <span className="workstation-sub">CPU rendering score</span>
          </div>
          <div className="workstation-box">
            <span className="workstation-label">Blender 3.0 Classroom</span>
            <span className="workstation-val">{blenderTimeSec}s</span>
            <span className="workstation-sub">Estimated render completion</span>
          </div>
          <div className="workstation-box">
            <span className="workstation-label">4K 60FPS Video Export</span>
            <span className="workstation-val">{Math.max(45, Math.round(140 - (cpuScore * 0.9)))}s</span>
            <span className="workstation-sub">H.265 / AV1 Hardware NVENC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
