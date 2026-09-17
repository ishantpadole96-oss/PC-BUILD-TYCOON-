// Workstation View - 3D Interactive Assembly, Power/POST simulation, Component installation, and Compatibility inspector
import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CATEGORIES } from '../../data/index';
import { checkCompatibility, calcTotalPowerDraw, calcTotalCost } from '../../engine/compatibility';
import { soundFx } from '../../utils/audio';
import { Canvas } from '@react-three/fiber';
import { PCViewer } from './PCModel3D';

export function WorkstationView({ onOpenBenchmark }) {
  const [selectedCategory, setSelectedCategory] = useState('cpu');
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'schematic'

  const currentBuild = useGameStore((s) => s.currentBuild);
  const inventory = useGameStore((s) => s.inventory);
  const installPartFromInventory = useGameStore((s) => s.installPartFromInventory);
  const removePartToInventory = useGameStore((s) => s.removePartToInventory);
  const clearCurrentBuild = useGameStore((s) => s.clearCurrentBuild);
  const pcPowerState = useGameStore((s) => s.pcPowerState);
  const postFailReason = useGameStore((s) => s.postFailReason);
  const powerOnPC = useGameStore((s) => s.powerOnPC);
  const activeOrder = useGameStore((s) => s.activeOrder);
  const deliverOrder = useGameStore((s) => s.deliverOrder);
  const activeRepair = useGameStore((s) => s.activeRepair);
  const completeRepairJob = useGameStore((s) => s.completeRepairJob);
  const activeChallenge = useGameStore((s) => s.activeChallenge);
  const submitChallenge = useGameStore((s) => s.submitChallenge);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const biosSettings = useGameStore((s) => s.biosSettings);
  const setBiosSetting = useGameStore((s) => s.setBiosSetting);

  const [showBiosOverlay, setShowBiosOverlay] = useState(false);

  const compatibility = checkCompatibility(currentBuild);
  const totalPower = calcTotalPowerDraw(currentBuild);
  const totalCost = calcTotalCost(currentBuild);
  const psuCapacity = currentBuild.psu?.specs?.wattage || 0;
  const powerLoadPercent = psuCapacity > 0 ? Math.min(100, Math.round((totalPower / psuCapacity) * 100)) : 0;

  // Inventory items matching currently selected slot
  const matchingInventory = inventory.filter((i) => i.category === selectedCategory);
  const installedPart = currentBuild[selectedCategory];

  // Start/stop ambient fan hum based on PC power state
  useEffect(() => {
    const isPcOn = pcPowerState === 'desktop' || pcPowerState === 'booting_os' || pcPowerState === 'post';
    if (isPcOn) {
      soundFx.startFanHum();
    } else {
      soundFx.stopFanHum();
    }
    return () => soundFx.stopFanHum();
  }, [pcPowerState]);

  return (
    <div className="workstation-container">
      {/* Top Context Banner for Active Order / Repair / Challenge */}
      {(activeOrder || activeRepair || activeChallenge) && (
        <div className="workstation-banner">
          {activeOrder && (
            <div className="banner-content">
              <span className="banner-badge">CLIENT ORDER</span>
              <span className="banner-title">
                {activeOrder.customer.avatar} {activeOrder.customer.name}: "{activeOrder.dialogue}"
              </span>
              <div className="banner-targets">
                <span>Budget: <strong>₹{activeOrder.requirements.budget.toLocaleString('en-IN')}</strong> (Current: ₹{totalCost.toLocaleString('en-IN')})</span>
                <span>Target: <strong>{activeOrder.requirements.resolution} {activeOrder.requirements.fpsTarget > 0 ? `${activeOrder.requirements.fpsTarget}+ FPS` : ''}</strong></span>
                <span>Est. Payout: <strong className="text-success">₹{(totalCost + activeOrder.reward.base).toLocaleString('en-IN')}</strong></span>
              </div>
              <button
                onClick={deliverOrder}
                className="btn-primary btn-deliver"
                disabled={!compatibility.isBootable}
                title={compatibility.isBootable ? 'Deliver to client' : 'PC must be bootable to deliver'}
              >
                🚚 Deliver PC
              </button>
            </div>
          )}

          {activeRepair && (
            <div className="banner-content banner-repair">
              <span className="banner-badge badge-warning">REPAIR JOB</span>
              <span className="banner-title">
                🔧 {activeRepair.customerName}: {activeRepair.title}
              </span>
              <span className="banner-clue">
                Symptom: {activeRepair.symptom}
              </span>
              <button
                onClick={completeRepairJob}
                className="btn-primary btn-repair"
              >
                ✅ Return Repaired PC (Earn ₹{activeRepair.laborFee.toLocaleString('en-IN')})
              </button>
            </div>
          )}

          {activeChallenge && (
            <div className="banner-content banner-challenge">
              <span className="banner-badge badge-challenge">CHALLENGE</span>
              <span className="banner-title">
                🏆 {activeChallenge.name}: {activeChallenge.objective}
              </span>
              <button
                onClick={submitChallenge}
                className="btn-primary"
                disabled={!compatibility.isBootable}
              >
                🏁 Submit Build
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Workstation Layout */}
      <div className="workstation-grid">
        {/* Left Column: 3D Scene Viewport & Virtual Monitor */}
        <div className="workstation-viewport-panel">
          {/* Viewport Toolbar */}
          <div className="viewport-toolbar">
            <div className="toolbar-left">
              <span className="panel-title">🛠️ ASSEMBLY WORKBENCH</span>
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${viewMode === '3d' ? 'active' : ''}`}
                  onClick={() => setViewMode('3d')}
                >
                  3D View
                </button>
                <button
                  className={`toggle-btn ${viewMode === 'schematic' ? 'active' : ''}`}
                  onClick={() => setViewMode('schematic')}
                >
                  2D Slots
                </button>
              </div>
            </div>

            <div className="toolbar-right">
              {/* Physical Power Button */}
              <button
                onClick={powerOnPC}
                className={`btn-power ${pcPowerState !== 'off' && pcPowerState !== 'failed' ? 'power-active' : ''}`}
                title="Press PC Case Power Button"
              >
                <span className="power-led" />
                <span>{pcPowerState === 'off' ? 'POWER ON' : pcPowerState === 'failed' ? 'RETRY POWER' : 'SHUTDOWN'}</span>
              </button>

              <button
                onClick={clearCurrentBuild}
                className="btn-secondary btn-clear"
                title="Disassemble all parts and return to inventory"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* 3D Scene / 2D Schematic */}
          <div className="viewport-canvas-box">
            <div className="work-bench" style={{ width: '100%', height: '100%' }}>
              <div className="bench-pc-container" style={{ width: '100%', height: '100%', minHeight: '600px' }}>
                <Canvas camera={{ position: [5, 3, 5], fov: 50 }}>
                  <PCViewer build={currentBuild} powerState={pcPowerState} />
                </Canvas>
              </div>
            </div>
          </div>

          {/* Virtual Gaming Monitor Screen */}
          <div className="virtual-monitor-panel">
            <div className="monitor-bezel">
              <div className="monitor-screen">
                {pcPowerState === 'off' && (
                  <div className="screen-off">
                    <div className="standby-led" />
                    <span>NO SIGNAL • SYSTEM POWER OFF</span>
                  </div>
                )}

                {pcPowerState === 'powering_on' && (
                  <div className="screen-post">
                    <div className="bios-logo">⚡ TITAN GAMING ROG UEFI BIOS</div>
                    <div className="post-logs">
                      <p>POST Initializing hardware registers...</p>
                      <p>Detecting CPU Core Frequency: {currentBuild.cpu ? `${currentBuild.cpu.model}` : 'NONE'}</p>
                      <p>Testing System Memory Rails: {currentBuild.ram ? `${currentBuild.ram.model}` : 'NONE'}</p>
                    </div>
                  </div>
                )}

                {pcPowerState === 'post' && (
                  <div className="screen-post">
                    <div className="bios-logo">⚡ AMERICAN HARDWARE MEGATRENDS</div>
                    <div className="post-logs">
                      <p className="text-cyan">CPU Check ................... [OK]</p>
                      <p className="text-cyan">Memory Parity Check ......... [OK]</p>
                      <p className="text-cyan">PCIe x16 Video Controller ... [OK]</p>
                      <p className="text-cyan">NVMe Boot Volume ............ [OK]</p>
                      <p className="blink-text">Single Beep! POST Succeeded. Passing control to UEFI OS Loader...</p>
                    </div>
                  </div>
                )}

                {pcPowerState === 'booting_os' && (
                  <div className="screen-boot-os">
                    <div className="win-logo">⊞</div>
                    <div className="win-spinner" />
                    <p>Starting Windows 11 Pro...</p>
                  </div>
                )}

                {pcPowerState === 'failed' && (
                  <div className="screen-error">
                    <div className="error-header">⚠️ HARDWARE POST MALFUNCTION</div>
                    <div className="error-body">
                      <p className="error-main">{postFailReason || 'System failed power-on self test.'}</p>
                      <p className="error-sub">Press the POWER button to shutdown and inspect component compatibility on the workbench.</p>
                    </div>
                  </div>
                )}

                {pcPowerState === 'desktop' && (
                  <div className="screen-desktop">
                    <div className="desktop-icons">
                      <div
                        className="desktop-icon"
                        onClick={onOpenBenchmark}
                        title="Click to launch benchmark simulation"
                      >
                        <span className="icon-img">🔥</span>
                        <span className="icon-name">TimeSpy Sim 3D</span>
                      </div>
                      <div className="desktop-icon" onClick={() => setShowBiosOverlay(true)}>
                        <span className="icon-img">⚙️</span>
                        <span className="icon-name">BIOS Config</span>
                      </div>
                    </div>

                    {showBiosOverlay && (
                      <div className="bios-overlay">
                        <div className="bios-window">
                          <div className="bios-header">
                            <span>MEGATRENDS BIOS - ADVANCED</span>
                            <button onClick={() => setShowBiosOverlay(false)}>✕</button>
                          </div>
                          <div className="bios-body">
                            <p className="bios-warning">⚠️ Overclocking increases performance but generates extreme heat.</p>
                            
                            <label className="bios-label">
                              <span>CPU Core Offset (+MHz): {biosSettings.cpuClockOffset}</span>
                              <input 
                                type="range" min="0" max="1000" step="50" 
                                value={biosSettings.cpuClockOffset}
                                onChange={(e) => setBiosSetting('cpuClockOffset', parseInt(e.target.value))}
                              />
                            </label>

                            <label className="bios-label">
                              <span>GPU Core Offset (+MHz): {biosSettings.gpuClockOffset}</span>
                              <input 
                                type="range" min="0" max="1000" step="50" 
                                value={biosSettings.gpuClockOffset}
                                onChange={(e) => setBiosSetting('gpuClockOffset', parseInt(e.target.value))}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* On-Screen Hardware Sensor Overlay */}
                    <div className="desktop-sensors">
                      <div className="sensor-chip">
                        <span>CPU</span>
                        <strong>{currentBuild.cpu ? `${currentBuild.cpu.specs.cores}C / ${(currentBuild.cpu.specs.boostClock || 4.0)}GHz` : 'N/A'}</strong>
                      </div>
                      <div className="sensor-chip">
                        <span>GPU</span>
                        <strong>{currentBuild.gpu ? currentBuild.gpu.model : 'iGPU'}</strong>
                      </div>
                      <div className="sensor-chip">
                        <span>RAM</span>
                        <strong>{currentBuild.ram ? `${currentBuild.ram.specs.capacity}GB` : 'N/A'}</strong>
                      </div>
                      <button
                        onClick={onOpenBenchmark}
                        className="btn-launch-bench"
                      >
                        🚀 RUN BENCHMARK
                      </button>
                    </div>

                    <div className="taskbar">
                      <span>⊞ Start</span>
                      <span className="taskbar-clock">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Slot Selection, Inventory Installer & Compatibility */}
        <div className="workstation-controls-panel">
          {/* Category Tabs */}
          <div className="category-tabs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              const hasInstalled = !!currentBuild[cat.key];
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedCategory(cat.key);
                  }}
                  className={`cat-btn ${isSelected ? 'cat-btn-active' : ''} ${hasInstalled ? 'cat-installed' : ''}`}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-label">{cat.label}</span>
                  {hasInstalled && <span className="cat-check">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Selected Slot Inspector & Installer */}
          <div className="slot-installer-box">
            <div className="box-header">
              <span className="slot-title">
                {CATEGORIES.find((c) => c.key === selectedCategory)?.icon} {selectedCategory.toUpperCase()} SLOT
              </span>
              {installedPart && (
                <button
                  onClick={() => removePartToInventory(selectedCategory)}
                  className="btn-remove-part"
                  title="Remove part and return to inventory"
                >
                  ✖ Remove
                </button>
              )}
            </div>

            {/* Currently Installed Part Info */}
            {installedPart ? (
              <div className="installed-part-card">
                <div className="part-main-info">
                  <span className="part-model">{installedPart.model}</span>
                  <span className="part-brand">{installedPart.brand}</span>
                </div>
                <div className="part-specs-row">
                  {installedPart.socket && <span className="spec-badge">Socket: {installedPart.socket}</span>}
                  {installedPart.powerDraw && <span className="spec-badge">TDP: {installedPart.powerDraw}W</span>}
                  {installedPart.specs?.vram && <span className="spec-badge">VRAM: {installedPart.specs.vram}GB</span>}
                  {installedPart.specs?.capacity && <span className="spec-badge">Size: {installedPart.specs.capacity}GB</span>}
                  {installedPart.specs?.wattage && <span className="spec-badge">Output: {installedPart.specs.wattage}W</span>}
                </div>
              </div>
            ) : (
              <div className="empty-slot-card">
                <span>Slot is currently empty</span>
              </div>
            )}

            {/* Inventory Items Available for this Slot */}
            <div className="inventory-options">
              <div className="inv-header">
                <span>OWNED IN INVENTORY ({matchingInventory.length})</span>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="btn-link"
                >
                  + Buy from Marketplace
                </button>
              </div>

              {matchingInventory.length === 0 ? (
                <div className="no-parts-msg">
                  <p>You do not own any {selectedCategory.toUpperCase()} components in your inventory.</p>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="btn-primary btn-sm"
                  >
                    🛒 Browse {selectedCategory.toUpperCase()} in Marketplace
                  </button>
                </div>
              ) : (
                <div className="matching-inv-list">
                  {matchingInventory.map((invItem) => (
                    <div key={invItem.instanceId} className="matching-inv-row">
                      <div className="inv-row-info">
                        <strong>{invItem.item.model}</strong>
                        <span className="inv-row-sub">
                          {invItem.item.socket ? `Socket: ${invItem.item.socket} • ` : ''}
                          Power: {invItem.item.powerDraw || 0}W
                        </span>
                      </div>
                      <button
                        onClick={() => installPartFromInventory(invItem)}
                        className="btn-install"
                      >
                        Install
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Compatibility Engine Inspector Panel */}
          <div className="compatibility-panel">
            <div className="comp-header">
              <span className="panel-title">⚡ BUILD VALIDATION</span>
              <span className={`comp-badge ${compatibility.isBootable ? 'badge-pass' : 'badge-fail'}`}>
                {compatibility.isBootable ? '✅ BOOT READY' : '❌ NOT BOOTABLE'}
              </span>
            </div>

            {/* Power Budget Gauge */}
            <div className="metric-row">
              <div className="metric-labels">
                <span>Power Draw: <strong>{totalPower}W</strong></span>
                <span>PSU Capacity: <strong>{psuCapacity}W</strong> ({powerLoadPercent}%)</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className={`progress-bar-fill ${powerLoadPercent > 100 ? 'fill-danger' : powerLoadPercent > 80 ? 'fill-warning' : 'fill-good'}`}
                  style={{ width: `${Math.min(100, powerLoadPercent)}%` }}
                />
              </div>
            </div>

            {/* Total Cost Calculation */}
            <div className="cost-summary-row">
              <span>Total Build Value:</span>
              <strong className="cost-value">₹{totalCost.toLocaleString('en-IN')}</strong>
            </div>

            {/* Detailed Issues List */}
            <div className="issues-container">
              {compatibility.issues.length === 0 ? (
                <div className="no-issues-msg">
                  <span>🎉 All parts are 100% compatible! System is ready to power on.</span>
                </div>
              ) : (
                compatibility.issues.map((issue, idx) => (
                  <div key={idx} className={`issue-card issue-${issue.severity}`}>
                    <div className="issue-msg">
                      <span className="issue-icon">
                        {issue.severity === 'critical' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'}
                      </span>
                      <span>{issue.message}</span>
                    </div>
                    {issue.suggestion && (
                      <div className="issue-fix">
                        💡 <em>Fix: {issue.suggestion}</em>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
