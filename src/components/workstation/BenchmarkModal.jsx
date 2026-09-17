// Benchmark Modal - Runs from the Workstation Desktop
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { soundFx } from '../../utils/audio';
import './BenchmarkModal.css';

export function BenchmarkModal({ isOpen, onClose }) {
  const benchmarkResult = useGameStore((s) => s.benchmarkResult);
  const runBenchmarkSuite = useGameStore((s) => s.runBenchmarkSuite);
  const currentBuild = useGameStore((s) => s.currentBuild);

  if (!isOpen) return null;

  const hasBench = !!benchmarkResult;

  return (
    <div className="bench-modal-backdrop" onClick={() => { soundFx.playClick(); onClose(); }}>
      <div className="bench-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bench-modal-header">
          <div>
            <span className="bench-chip">BENCHMARK SUITE</span>
            <h2 className="bench-title">🔥 TimeSpy 3D Performance Analyzer</h2>
          </div>
          <button className="bench-close" onClick={onClose}>✕</button>
        </div>

        <div className="bench-modal-body">
          {!hasBench ? (
            <div className="bench-start-box">
              <div className="bench-system-info">
                <h3>System Under Test</h3>
                <div className="bench-specs-grid">
                  <div className="bench-spec">
                    <span className="bs-label">CPU</span>
                    <span className="bs-val">{currentBuild.cpu?.model || 'Not Installed'}</span>
                  </div>
                  <div className="bench-spec">
                    <span className="bs-label">GPU</span>
                    <span className="bs-val">{currentBuild.gpu?.model || 'Not Installed'}</span>
                  </div>
                  <div className="bench-spec">
                    <span className="bs-label">RAM</span>
                    <span className="bs-val">{currentBuild.ram?.model || 'Not Installed'}</span>
                  </div>
                  <div className="bench-spec">
                    <span className="bs-label">Storage</span>
                    <span className="bs-val">{currentBuild.storage?.model || 'Not Installed'}</span>
                  </div>
                </div>
              </div>

              <button className="btn-run-bench" onClick={() => { soundFx.playBenchmarkPulse(); runBenchmarkSuite(); }}>
                🚀 RUN FULL BENCHMARK SUITE
              </button>
              <p className="bench-hint">PC must be booted to desktop first</p>
            </div>
          ) : (
            <div className="bench-results">
              {/* Overall Score */}
              <div className="bench-score-hero">
                <div className="score-circle">
                  <span className="score-num">{benchmarkResult.overallScore}</span>
                  <span className="score-max">/100</span>
                </div>
                <span className="score-label">OVERALL PERFORMANCE SCORE</span>
              </div>

              {/* FPS Results */}
              <div className="bench-fps-section">
                <h3>🎮 Gaming Frame Rates</h3>
                <div className="bench-fps-grid">
                  {Object.entries(benchmarkResult.fps).map(([res, data]) => (
                    <div key={res} className="bench-fps-card">
                      <span className="fps-res">{res.toUpperCase()}</span>
                      <span className="fps-avg">{data.avg} <small>FPS</small></span>
                      <div className="fps-bar-track">
                        <div
                          className={`fps-bar-fill ${data.avg >= 60 ? 'fill-good' : 'fill-low'}`}
                          style={{ width: `${Math.min(100, (data.avg / 200) * 100)}%` }}
                        />
                      </div>
                      <span className="fps-range">{data.min}–{data.max} FPS range</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thermals */}
              {benchmarkResult.thermals && (
                <div className="bench-thermals-section">
                  <h3>🌡️ Thermal Analysis</h3>
                  <div className="thermals-grid">
                    <div className="thermal-item">
                      <span>CPU Temp</span>
                      <strong className={benchmarkResult.thermals.cpuTemp > 85 ? 'text-danger' : 'text-good'}>
                        {benchmarkResult.thermals.cpuTemp}°C
                      </strong>
                    </div>
                    <div className="thermal-item">
                      <span>GPU Temp</span>
                      <strong className={benchmarkResult.thermals.gpuTemp > 80 ? 'text-danger' : 'text-good'}>
                        {benchmarkResult.thermals.gpuTemp}°C
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Value */}
              {benchmarkResult.value && (
                <div className="bench-value-section">
                  <h3>💎 Value Analysis</h3>
                  <div className="value-grid">
                    <div className="value-item">
                      <span>Total Build Cost</span>
                      <strong>₹{benchmarkResult.value.totalCost?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="value-item">
                      <span>Performance per ₹</span>
                      <strong>{benchmarkResult.value.perfPerRupee?.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              )}

              <button className="btn-run-bench btn-rerun" onClick={runBenchmarkSuite}>
                🔄 Re-Run Benchmark
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
