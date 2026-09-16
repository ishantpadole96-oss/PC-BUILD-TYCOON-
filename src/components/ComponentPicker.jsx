import { useState, useMemo } from 'react';
import { ComponentCard } from './ComponentCard';
import './ComponentPicker.css';

export function ComponentPicker({
  categories,
  activeCategory,
  onCategoryChange,
  parts,
  selectedPart,
  onSelectPart,
  build,
}) {
  const [sortBy, setSortBy] = useState('price-asc');
  const [filterTier, setFilterTier] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');

  // Get unique brands for current category
  const brands = useMemo(() => {
    const set = new Set(parts.map(p => p.brand));
    return ['all', ...Array.from(set).sort()];
  }, [parts]);

  // Sort and filter parts
  const filteredParts = useMemo(() => {
    let result = [...parts];

    // Filter by tier
    if (filterTier !== 'all') {
      result = result.filter(p => p.tier === filterTier);
    }

    // Filter by brand
    if (filterBrand !== 'all') {
      result = result.filter(p => p.brand === filterBrand);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'performance':
        result.sort((a, b) => (b.specs.performanceScore || 0) - (a.specs.performanceScore || 0));
        break;
      case 'name':
        result.sort((a, b) => a.model.localeCompare(b.model));
        break;
    }

    return result;
  }, [parts, sortBy, filterTier, filterBrand]);

  // Check basic compatibility for each part
  const checkPartCompat = (part) => {
    if (activeCategory === 'cpu' && build.motherboard) {
      return part.socket === build.motherboard.socket;
    }
    if (activeCategory === 'motherboard' && build.cpu) {
      return part.socket === build.cpu.socket;
    }
    if (activeCategory === 'ram' && build.motherboard) {
      return part.specs.type === build.motherboard.compatibility.ramType;
    }
    return null; // null = no compatibility info to show
  };

  // Reset filters when changing category
  const handleCategoryChange = (cat) => {
    setFilterTier('all');
    setFilterBrand('all');
    onCategoryChange(cat);
  };

  return (
    <section className="picker">
      {/* Category tabs */}
      <nav className="category-tabs" role="tablist">
        {categories.map(cat => (
          <button
            key={cat.key}
            className={`cat-tab ${activeCategory === cat.key ? 'active' : ''} ${build[cat.key] ? 'has-part' : ''}`}
            onClick={() => handleCategoryChange(cat.key)}
            role="tab"
            aria-selected={activeCategory === cat.key}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-label">{cat.label}</span>
            {build[cat.key] && <span className="cat-dot" />}
          </button>
        ))}
      </nav>

      {/* Filters bar */}
      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Sort</label>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="performance">Performance</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Tier</label>
          <select
            className="filter-select"
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
          >
            <option value="all">All Tiers</option>
            <option value="budget">Budget</option>
            <option value="mid">Mid-Range</option>
            <option value="high">High-End</option>
            <option value="enthusiast">Enthusiast</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Brand</label>
          <select
            className="filter-select"
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
          >
            {brands.map(b => (
              <option key={b} value={b}>{b === 'all' ? 'All Brands' : b}</option>
            ))}
          </select>
        </div>

        <span className="filter-count">{filteredParts.length} parts</span>
      </div>

      {/* Parts grid */}
      <div className="parts-grid">
        {filteredParts.map(part => (
          <ComponentCard
            key={part.id}
            part={part}
            isSelected={selectedPart?.id === part.id}
            onSelect={() => onSelectPart(part)}
            isCompatible={checkPartCompat(part)}
          />
        ))}

        {filteredParts.length === 0 && (
          <div className="no-parts">
            <span className="no-parts-icon">🔍</span>
            <p>No parts match your filters</p>
          </div>
        )}
      </div>
    </section>
  );
}
