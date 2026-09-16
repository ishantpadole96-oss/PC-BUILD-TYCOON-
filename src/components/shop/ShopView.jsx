// Shop Upgrades & Tycoon Progression View
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { shopLevels } from '../../data/shopLevels';

export function ShopView() {
  const currentShopLevel = useGameStore((s) => s.shopLevel);
  const cash = useGameStore((s) => s.cash);
  const reputation = useGameStore((s) => s.reputation);
  const upgradeShopLevel = useGameStore((s) => s.upgradeShopLevel);

  return (
    <div className="shop-progression-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">🏬 BUSINESS EXPANSION & WORKSHOP TIERS</h2>
          <p className="page-subtitle">
            Scale your humble garage operation into an international boutique custom PC empire. Higher shop tiers unlock larger warehouse inventory, VIP clientele, and high-margin contracts.
          </p>
        </div>
      </div>

      <div className="progression-timeline">
        {shopLevels.map((tier) => {
          const isCurrent = currentShopLevel === tier.level;
          const isUnlocked = currentShopLevel >= tier.level;
          const isNext = currentShopLevel + 1 === tier.level;
          const canAfford = cash >= tier.upgradeCost;
          const hasRep = reputation >= tier.requiredReputation;

          return (
            <div
              key={tier.level}
              className={`tier-card ${isCurrent ? 'tier-current' : ''} ${isUnlocked ? 'tier-unlocked' : 'tier-locked'} ${isNext ? 'tier-next' : ''}`}
            >
              <div className="tier-header">
                <span className="tier-icon">{tier.icon}</span>
                <div className="tier-meta">
                  <span className="tier-number">TIER {tier.level}</span>
                  <h3 className="tier-title">{tier.name}</h3>
                </div>
                {isCurrent && <span className="current-badge">ACTIVE HQ</span>}
              </div>

              <p className="tier-desc">{tier.description}</p>

              {/* Unlocked Benefits */}
              <div className="perks-list">
                <span className="perks-title">TIER BENEFITS & CAPACITIES:</span>
                <ul>
                  <li>Max Concurrent Orders: <strong>{tier.unlocks.maxOrders} Clients</strong></li>
                  <li>Warehouse Storage: <strong>{tier.unlocks.maxInventory} Components</strong></li>
                  <li>Hardware Catalog Access: <strong>{tier.unlocks.componentAccess.toUpperCase()}</strong></li>
                  <li>Repairs Workshop: <strong>{tier.unlocks.repairJobs ? 'Enabled' : 'Locked'}</strong></li>
                  <li>Challenges Arena: <strong>{tier.unlocks.challenges ? 'Unlocked' : 'Locked'}</strong></li>
                </ul>
              </div>

              {/* Upgrade Action Footer */}
              <div className="tier-footer">
                {isUnlocked ? (
                  <span className="text-success">✔ Tier Unlocked & Operational</span>
                ) : isNext ? (
                  <div className="upgrade-prompt">
                    <div className="req-summary">
                      <span>Cost: <strong className={canAfford ? 'text-cash' : 'text-danger'}>₹{tier.upgradeCost.toLocaleString('en-IN')}</strong></span>
                      <span>Reputation: <strong className={hasRep ? 'text-good' : 'text-danger'}>{reputation}/{tier.requiredReputation} Rep</strong></span>
                    </div>
                    <button
                      onClick={upgradeShopLevel}
                      disabled={!canAfford || !hasRep}
                      className="btn-primary btn-upgrade"
                    >
                      🚀 Upgrade to {tier.name}
                    </button>
                  </div>
                ) : (
                  <span className="text-muted">🔒 Requires Tier {tier.level - 1} Completion</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
