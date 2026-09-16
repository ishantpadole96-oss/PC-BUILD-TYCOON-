// Benchmark Simulation Modal
// Deterministic synthetic benchmark with simulated 3D test scenes, FPS breakdowns, thermals, and value ratings
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { runBenchmark } from '../../engine/benchmark';

export function BenchmarkModal({ isOpen, onClose }) {
  const [benchState, setBenchState] = useState('ready'); // 'ready' | 'running' | 'done'
  const [progress, setProgress] = useState(0);
  const [activeStage, setActiveStage] = useState('');

  const currentBuild = useGameStore((s) => s.currentBuild);
  const benchmarkResult = useGameStore((s) => s.benchmarkResult);
  const runBenchmarkSuite = useGameStore((s) => s.runBenchmarkSuite);

  useEffect(() => {
    if (!isOpen) {
      setBenchState('ready');
      setProgress(0);
    }
  }, [isOpen]);

  const handleStartBenchmark = () => {
    setBenchState('running');
    setProgress(0);

    const stages = [
      { name: 'Testing CPU Multi-Thread Core Physics...', pct: 25, delay: 600 },
      { name: 'Simulating DirectX 12 3D Graphics Shaders...', pct: 55, delay: 1300 },
      { name: 'Running Ray Tracing & VRAM Stress Matrix...', pct: 85, delay: 2000 },
      { name: 'Calculating Thermal Equilibrium & Power Curves...', pct: 100, delay: 2700 },
    ];

    stages.forEach((s) => {
      setTimeout(() => {
        setActiveStage(s.name);
        setProgress(s.pct);
        if (s.pct === 100) {
          runBenchmarkSuite();
          setBenchState('done');
        }
      }, s.delay);
    });
  };

  if (!isOpen) return null;

  const result = benchmarkResult || runBenchmark(currentBuild);

  return (
    <div className="modal-backdrop">
      <div className="modal-box benchmark-modal">
        {/* Header */}
        <div className="modal-header">
          <div className="header-title-box">
            <span className="modal-icon">🔥</span>
            <div>
              <h3>TITAN BENCHMARK 3D SIMULATOR</h3>
              <span className="disclaimer-badge">
                ⚠ SIMULATED GAME VALUES — NOT REAL-WORLD BENCHMARKS
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn-close">✖</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {benchState === 'ready' && (
            <div className="bench-ready-state">
              <div className="bench-preview-rig">
                <h4>System Under Test:</h4>
                <p><strong>CPU:</strong> {currentBuild.cpu?.model || 'None'} • <strong>GPU:</strong> {currentBuild.gpu?.model || 'Integrated'} • <strong>RAM:</strong> {currentBuild.ram?.model || 'None'}</p>
              </div>

              <p className="ready-info">
                The benchmark suite will stress-test the installed CPU, GPU, memory latency, thermal dissipation headroom, and power consumption under high-fidelity gaming workloads.
              </p>

              <button
                onClick={handleStartBenchmark}
                className="btn-primary btn-lg"
              >
                🚀 Begin Benchmark Run
              </button>
            </div>
          )}

          {benchState === 'running' && (
            <div className="bench-running-state">
              <div className="spinner-large" />
              <h4>{activeStage}</h4>
              <div className="bench-progress-bar">
                <div className="bench-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-percent">{progress}%</span>
            </div>
          )}

          {benchState === 'done' && result && (
            <div className="bench-results-state">
              {/* Overall Score Banner */}
              <div className="score-banner">
                <div className="score-circle">
                  <span className="score-num">{result.overallScore}</span>
                  <span className="score-max">/100</span>
                </div>
                <div className="score-details">
                  <h4>Overall Performance Index</h4>
                  <span className="synthetic-score">Synthetic Index: <strong>{result.benchmarkScore.toLocaleString()} PTS</strong></span>
                  <span className="value-index">Value Rating: <strong className="text-cash">{result.value.rating} ({result.value.perfPerRupee} Pts / ₹1k)</strong></span>
                </div>
              </div>

              {/* Resolution FPS Breakdown */}
              <div className="benchmark-section">
                <h4>🎮 ESTIMATED GAMING FRAME RATES</h4>
                <div className="fps-grid">
                  <div className="fps-card">
                    <span className="res-title">1080p Ultra</span>
                    <span className="fps-avg">{result.fps['1080p'].avg} <small>FPS</small></span>
                    <span className="fps-low">1% Low: {result.fps['1080p'].low1} FPS</span>
                  </div>
                  <div className="fps-card">
                    <span className="res-title">1440p High</span>
                    <span className="fps-avg">{result.fps['1440p'].avg} <small>FPS</small></span>
                    <span className="fps-low">1% Low: {result.fps['1440p'].low1} FPS</span>
                  </div>
                  <div className="fps-card">
                    <span className="res-title">4K UHD</span>
                    <span className="fps-avg">{result.fps['4k'].avg} <small>FPS</small></span>
                    <span className="fps-low">1% Low: {result.fps['4k'].low1} FPS</span>
                  </div>
                </div>
              </div>

              {/* Thermal & Power Telemetry */}
              <div className="telemetry-grid">
                <div className="telemetry-card">
                  <span className="telem-label">CPU Temperature (Peak)</span>
                  <strong className={`telem-val ${result.thermal.cpuTemp > 85 ? 'text-danger' : 'text-good'}`}>
                    {result.thermal.cpuTemp}°C
                  </strong>
                  <span className="telem-sub">Thermal Throttling: {result.thermal.thermalPenalty > 0 ? `-${result.thermal.thermalPenalty}% Penalty` : 'None (Adequate Cooler)'}</span>
                </div>

                <div className="telemetry-card">
                  <span className="telem-label">GPU Temperature (Peak)</span>
                  <strong className={`telem-val ${result.thermal.gpuTemp > 80 ? 'text-danger' : 'text-good'}`}>
                    {result.thermal.gpuTemp}°C
                  </strong>
                  <span className="telem-sub">Cooling Headroom: {result.thermal.thermalHeadroom}%</span>
                </div>

                <div className="telemetry-card">
                  <span className="telem-label">System Power Draw</span>
                  <strong className="telem-val">
                    {result.power.totalDraw}W
                  </strong>
                  <span className="telem-sub">PSU Capacity: {result.power.psuCapacity}W</span>
                </div>

                <div className="telemetry-card">
                  <span className="telem-label">Acoustics & Noise</span>
                  <strong className="telem-val">
                    {result.noise.estimated} dBA
                  </strong>
                  <span className="telem-sub">Rating: {result.noise.rating}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={onClose} className="btn-primary">
                  Done & Close Benchmark
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
