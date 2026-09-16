import { useEffect, useRef } from 'react';
import './PerformanceGauge.css';

export function PerformanceGauge({ score }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const currentScore = useRef(0);

  const getScoreLabel = (s) => {
    if (s === 0) return { label: 'No Parts', color: '#4a5568' };
    if (s < 30) return { label: 'Basic', color: '#ef4444' };
    if (s < 50) return { label: 'Entry', color: '#f59e0b' };
    if (s < 70) return { label: 'Good', color: '#22c55e' };
    if (s < 85) return { label: 'Great', color: '#3b82f6' };
    if (s < 95) return { label: 'Beast', color: '#a855f7' };
    return { label: 'Godlike', color: '#ff2ecb' };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 200;
    canvas.width = size * dpr;
    canvas.height = (size * 0.65) * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size * 0.65}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size * 0.55;
    const radius = size * 0.38;
    const lineWidth = 10;
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;

    const draw = (s) => {
      ctx.clearRect(0, 0, size, size);

      // Background arc
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Tick marks
      for (let i = 0; i <= 10; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / 10);
        const innerR = radius - lineWidth / 2 - 4;
        const outerR = radius - lineWidth / 2 - (i % 5 === 0 ? 14 : 8);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.stroke();
      }

      if (s > 0) {
        // Score arc
        const scoreAngle = startAngle + (endAngle - startAngle) * (s / 100);
        const { color } = getScoreLabel(s);

        // Gradient
        const grad = ctx.createLinearGradient(
          cx - radius, cy, cx + radius, cy
        );
        grad.addColorStop(0, '#22c55e');
        grad.addColorStop(0.5, '#3b82f6');
        grad.addColorStop(0.8, '#a855f7');
        grad.addColorStop(1, '#ff2ecb');

        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, scoreAngle);
        ctx.strokeStyle = grad;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, scoreAngle);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth + 6;
        ctx.lineCap = 'round';
        ctx.globalAlpha = 0.15;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Needle dot
        const dotX = cx + Math.cos(scoreAngle) * radius;
        const dotY = cy + Math.sin(scoreAngle) * radius;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dotX, dotY, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    };

    // Animate to target
    const animate = () => {
      const diff = score - currentScore.current;
      if (Math.abs(diff) < 0.5) {
        currentScore.current = score;
        draw(score);
        return;
      }
      currentScore.current += diff * 0.08;
      draw(currentScore.current);
      animRef.current = requestAnimationFrame(animate);
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [score]);

  const { label, color } = getScoreLabel(score);

  return (
    <div className="perf-gauge">
      <canvas ref={canvasRef} className="perf-canvas" />
      <div className="perf-info">
        <span className="perf-score" style={{ color }}>{score}</span>
        <span className="perf-label" style={{ color }}>{label}</span>
      </div>
    </div>
  );
}
