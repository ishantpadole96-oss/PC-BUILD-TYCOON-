import React, { useState } from 'react';
import { GameHUD } from './components/layout/GameHUD';
import { GameNav } from './components/layout/GameNav';
import { WorkstationView } from './components/workstation/WorkstationView';
import { OrdersView } from './components/orders/OrdersView';
import { MarketplaceView } from './components/marketplace/MarketplaceView';
import { InventoryView } from './components/inventory/InventoryView';
import { RepairsView } from './components/repairs/RepairsView';
import { ChallengesView } from './components/challenges/ChallengesView';
import { ShopView } from './components/shop/ShopView';
import { CommunityView } from './components/community/CommunityView';
import { BenchmarkModal } from './components/workstation/BenchmarkModal';
import { useGameStore } from './store/gameStore';
import './index.css';

export default function App() {
  const activeTab = useGameStore((s) => s.activeTab);
  const [benchModalOpen, setBenchModalOpen] = useState(false);

  return (
    <div className="game-app">
      {/* Game HUD - Cash, Rep, Day, Shop Level */}
      <GameHUD />

      {/* Game Navigation - 8 Tabs */}
      <GameNav />

      {/* Main Game Viewport */}
      <main className="game-viewport">
        {activeTab === 'workstation' && (
          <WorkstationView onOpenBenchmark={() => setBenchModalOpen(true)} />
        )}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'marketplace' && <MarketplaceView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'repairs' && <RepairsView />}
        {activeTab === 'challenges' && <ChallengesView />}
        {activeTab === 'shop' && <ShopView />}
        {activeTab === 'community' && <CommunityView />}
      </main>

      {/* Benchmark Suite Modal */}
      <BenchmarkModal
        isOpen={benchModalOpen}
        onClose={() => setBenchModalOpen(false)}
      />

      {/* Footer */}
      <footer className="game-footer">
        <span>⚡ <strong>PC Builder Tycoon</strong> — Build PCs, Serve Customers, Expand Your Empire</span>
      </footer>
    </div>
  );
}
