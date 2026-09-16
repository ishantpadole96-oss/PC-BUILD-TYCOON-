import './ComponentCard.css';

export function ComponentCard({ part, isSelected, onSelect, isCompatible }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const tierClass = `tier-${part.tier}`;

  // Build spec chips based on category
  const getSpecChips = () => {
    const chips = [];
    const s = part.specs;

    switch (part.category) {
      case 'cpu':
        chips.push(`${s.cores}C/${s.threads}T`);
        chips.push(`${s.boostClock} GHz`);
        chips.push(`${s.tdp}W TDP`);
        chips.push(s.architecture);
        break;
      case 'gpu':
        chips.push(`${s.vram}GB ${s.vramType}`);
        chips.push(`${s.boostClock} MHz`);
        if (s.rayTracing) chips.push('Ray Tracing');
        if (s.dlss) chips.push(`DLSS ${s.dlss}`);
        if (s.fsr) chips.push(`FSR ${s.fsr}`);
        break;
      case 'motherboard':
        chips.push(s.formFactor);
        chips.push(s.chipset);
        chips.push(`${s.ramSlots} RAM slots`);
        chips.push(s.ramType);
        if (s.wifi) chips.push('Wi-Fi');
        break;
      case 'ram':
        chips.push(`${s.capacity}GB`);
        chips.push(s.type);
        chips.push(`${s.speed} MHz`);
        chips.push(s.latency);
        if (s.rgb) chips.push('RGB');
        break;
      case 'storage':
        chips.push(`${s.capacity >= 1000 ? (s.capacity / 1000) + 'TB' : s.capacity + 'GB'}`);
        chips.push(s.type);
        chips.push(`${s.readSpeed} MB/s R`);
        break;
      case 'psu':
        chips.push(`${s.wattage}W`);
        chips.push(s.efficiency);
        if (s.modular) chips.push('Modular');
        break;
      case 'case':
        chips.push(s.formFactor);
        chips.push(`GPU: ${s.maxGpuLength}mm`);
        chips.push(`${s.includedFans} fans`);
        if (s.rgb) chips.push('RGB');
        break;
      case 'cooler':
        chips.push(s.type);
        chips.push(`${s.tdpRating}W TDP`);
        if (s.radiatorSize) chips.push(`${s.radiatorSize}mm`);
        if (s.rgb) chips.push('RGB');
        break;
    }
    return chips;
  };

  return (
    <div
      className={`component-card ${isSelected ? 'selected' : ''} ${isCompatible === false ? 'incompatible' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      {/* Selection indicator */}
      {isSelected && <div className="selected-badge">✓</div>}

      {/* Tier badge */}
      <span className={`tier-badge ${tierClass}`}>{part.tier}</span>

      {/* Main info */}
      <div className="card-header">
        <span className="card-brand">{part.brand}</span>
        <h3 className="card-model">{part.model}</h3>
      </div>

      {/* Spec chips */}
      <div className="card-specs">
        {getSpecChips().map((chip, i) => (
          <span key={i} className="spec-chip">{chip}</span>
        ))}
      </div>

      {/* Description */}
      <p className="card-desc">{part.description}</p>

      {/* Footer */}
      <div className="card-footer">
        <span className="card-price">{formatPrice(part.basePrice)}</span>
        {part.powerDraw > 0 && (
          <span className="card-power">⚡ {part.powerDraw}W</span>
        )}
      </div>

      {/* Glow effect on hover */}
      <div className="card-glow" />
    </div>
  );
}
