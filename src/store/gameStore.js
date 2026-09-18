// Master Game Store (Zustand)
// Coordinates Cash (₹50,000 start), Orders, Inventory, Workstation Build, Marketplace,
// Boot state, Benchmarks, Repairs, Challenges, and Shop Progression.

import { create } from 'zustand';
import { generateOrder } from '../data/customers';
import { shopLevels } from '../data/shopLevels';
import { challenges } from '../data/challenges';
import { checkCompatibility } from '../engine/compatibility';
import { runBenchmark, evaluateCustomerSatisfaction } from '../engine/benchmark';
import { initializeMarket, advanceMarketDay } from '../engine/marketSimulation';
import { generateRepairJob } from '../engine/repairDiagnostics';
import { soundFx } from '../utils/audio';
import { saveTycoonGameToCloud, fetchUserTycoonGame, isSupabaseConfigured } from '../utils/supabase';
import { DEFAULT_FS } from '../data/filesystem';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'pc_builder_tycoon_save_v1';

const INITIAL_BUILD = {
  cpu: null,
  motherboard: null,
  gpu: null,
  ram: null,
  storage: null,
  psu: null,
  case: null,
  cooler: null,
  fans: [],
};

const INITIAL_BIOS = {
  cpuClockOffset: 0,
  gpuClockOffset: 0,
};

function getInitialState() {
  const market = initializeMarket();
  const initialOrders = [
    generateOrder(1, 0),
    generateOrder(1, 0),
    generateOrder(1, 0),
  ];
  const initialRepairs = [
    generateRepairJob(1),
  ];

  return {
    gameState: 'landing', // 'landing', 'intro', 'booting', 'desktop'
    cash: 50000, // ₹50,000 starting cash as specified
    reputation: 0,
    shopLevel: 1,
    day: 1,
    activeTab: 'workstation', // start on workstation for immediate gameplay
    inventory: [],
    currentBuild: { ...INITIAL_BUILD },
    biosSettings: { ...INITIAL_BIOS },
    installedFromInventory: {}, // map of category -> inventory item ID

    wallpaper: null, // { type: 'image' | 'video', url: string }
    fileSystem: DEFAULT_FS,
    activeNotepadFile: null, // { name, path, content }
    perks: [], // IDs of purchased TitanKart products

    orders: initialOrders,
    activeOrder: null,

    repairJobs: initialRepairs,
    activeRepair: null,

    challenges: challenges.map(c => ({ ...c, completed: false, bestScore: null })),
    activeChallenge: null,

    market,

    // PC Runtime State
    pcPowerState: 'off', // 'off' | 'powering_on' | 'post' | 'bios' | 'booting_os' | 'desktop' | 'failed'
    postFailReason: null,
    benchmarkResult: null,

    savedBuilds: [
      {
        id: 'build_starter_rig',
        name: 'Thunderbolt 1080p Budget King',
        author: 'ProBuilder99',
        totalCost: 52400,
        score: 64,
        fps1080p: 85,
        likes: 142,
        parts: {
          cpu: 'Ryzen 5 5600',
          gpu: 'GeForce RTX 4060',
          motherboard: 'B550 Gaming Plus',
          ram: '16GB DDR4-3200',
          psu: '550W Bronze',
        },
      },
      {
        id: 'build_beast_4k',
        name: 'Cyberpunk HyperRig 4K',
        author: 'TechTitan_IN',
        totalCost: 285000,
        score: 96,
        fps1080p: 210,
        likes: 389,
        parts: {
          cpu: 'Ryzen 7 7800X3D',
          gpu: 'GeForce RTX 4090',
          motherboard: 'X670E Carbon WiFi',
          ram: '32GB DDR5-6000',
          psu: '1000W Gold',
        },
      },
    ],

    transactions: [
      { id: 'tx_init', description: 'Business Seed Capital', amount: 50000, type: 'credit', timestamp: Date.now() },
    ],

    notification: null,
  };
}

// Helper for deep merging FS
function mergeFs(defaultFs, savedFs) {
  if (!savedFs) return defaultFs;
  if (!defaultFs) return savedFs;
  
  const result = { ...defaultFs };
  for (const key in savedFs) {
    if (savedFs[key] && savedFs[key].type === 'dir' && defaultFs[key] && defaultFs[key].type === 'dir') {
      result[key] = {
        ...savedFs[key],
        children: mergeFs(defaultFs[key].children || {}, savedFs[key].children || {})
      };
    } else {
      result[key] = savedFs[key];
    }
  }
  return result;
}

// Load saved state or default
function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw);
    
    // Deep merge to ensure all default paths exist for older saves
    const validFs = mergeFs(DEFAULT_FS, parsed.fileSystem || {});
    
    return {
      ...getInitialState(),
      ...parsed,
      fileSystem: validFs,
      // reset transient power state on reload
      pcPowerState: 'off',
      postFailReason: null,
    };
  } catch {
    return getInitialState();
  }
}

export const useGameStore = create((set, get) => ({
  ...loadPersistedState(),

  setGameState: (state) => set({ gameState: state }),
  setWallpaper: (wallpaper) => set({ wallpaper }),
  setActiveTab: (tab) => {
    soundFx.playTabSwitch();
    set({ activeTab: tab });
  },
  setFileSystem: (fs) => set({ fileSystem: fs }),
  setActiveNotepadFile: (file) => set({ activeNotepadFile: file }),

  saveGame: async () => {
    const state = get();
    const saveData = {
      cash: state.cash,
      reputation: state.reputation,
      shopLevel: state.shopLevel,
      day: state.day,
      inventory: state.inventory,
      orders: state.orders,
      repairJobs: state.repairJobs,
      completedChallenges: state.completedChallenges,
      market: state.market,
      fileSystem: state.fileSystem,
      perks: state.perks,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    
    if (isSupabaseConfigured) {
      await saveTycoonGameToCloud(saveData);
    }
    
    soundFx.playCash();
    get().triggerNotification('Game Saved Successfully!', 'success');
  },

  exportSaveToFile: () => {
    const state = get();
    const saveData = {
      cash: state.cash,
      reputation: state.reputation,
      shopLevel: state.shopLevel,
      day: state.day,
      inventory: state.inventory,
      orders: state.orders,
      repairJobs: state.repairJobs,
      completedChallenges: state.completedChallenges,
      market: state.market,
      fileSystem: state.fileSystem,
      perks: state.perks,
    };
    
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titan_os_save_day_${state.day}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    get().triggerNotification('Save exported!', 'success');
  },

  loadGame: async () => {
    let savedData = null;
    
    if (isSupabaseConfigured) {
      const { data } = await fetchUserTycoonGame();
      if (data) savedData = data;
    }
    
    if (!savedData) {
      const savedStr = localStorage.getItem(STORAGE_KEY);
      if (savedStr) {
        try {
          savedData = JSON.parse(savedStr);
        } catch {
          console.error("Save file corrupted");
        }
      }
    }
    
    if (savedData) {
      set({
        ...savedData,
        gameState: 'desktop', // load straight to OS
        currentBuild: { ...INITIAL_BUILD },
        biosSettings: { ...INITIAL_BIOS },
        installedFromInventory: {},
        pcPowerState: 'off',
        activeOrder: null,
        activeRepair: null,
        activeChallenge: null,
      });
      soundFx.playBootChime();
    }
  },

  importSaveFromFile: (jsonString) => {
    try {
      const savedData = JSON.parse(jsonString);
      if (savedData && savedData.cash !== undefined) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
        set({
          ...savedData,
          gameState: 'desktop', // load straight to OS
          currentBuild: { ...INITIAL_BUILD },
          biosSettings: { ...INITIAL_BIOS },
          installedFromInventory: {},
          pcPowerState: 'off',
          activeOrder: null,
          activeRepair: null,
          activeChallenge: null,
        });
        soundFx.playBootChime();
        get().triggerNotification('Save imported successfully!', 'success');
      } else {
        get().triggerNotification('Invalid save file format!', 'error');
      }
    } catch (e) {
      console.error("Failed to parse save file", e);
      get().triggerNotification('Failed to read save file!', 'error');
    }
  },

  clearSave: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ ...getInitialState() });
  },

  triggerNotification: (msg, type = 'info') => {
    get().setNotification(msg, type);
  },


  // Navigation
  setActiveTab: (tab) => {
    soundFx.playTabSwitch();
    set({ activeTab: tab });
  },

  setNotification: (msg, type = 'info') => {
    // Play appropriate sound based on notification type
    if (type === 'success') {
      soundFx.playSuccess();
    } else if (type === 'error') {
      soundFx.playError();
    } else if (type === 'warning') {
      soundFx.playWarning();
    } else {
      soundFx.playNotification();
    }
    set({ notification: { message: msg, type, id: Date.now() } });
    setTimeout(() => {
      set(state => (state.notification?.message === msg ? { notification: null } : {}));
    }, 4500);
  },

  setBiosSetting: (key, val) => {
    soundFx.playClick();
    set(state => ({
      biosSettings: {
        ...state.biosSettings,
        [key]: val
      }
    }));
  },

  // ── ORDER SYSTEM ──
  acceptOrder: (orderId) => {
    const state = get();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    soundFx.playClick();
    set({
      activeOrder: order,
      orders: state.orders.map(o => o.id === orderId ? { ...o, status: 'accepted' } : o),
      activeTab: 'workstation',
    });
    get().setNotification(`Accepted order for ${order.customer.name}! Budget: ₹${order.requirements.budget.toLocaleString('en-IN')}`, 'success');
  },

  abandonOrder: () => {
    soundFx.playWarning();
    set({ activeOrder: null });
    get().setNotification('Order abandoned.', 'warning');
  },

  deliverOrder: () => {
    const state = get();
    if (!state.activeOrder) return;

    const build = state.currentBuild;
    const compatibility = checkCompatibility(build);

    if (!compatibility.isBootable) {
      soundFx.playWarning();
      get().setNotification('Cannot deliver an unbootable PC! Fix critical issues first.', 'error');
      return;
    }

    const benchmark = state.benchmarkResult || runBenchmark(build, state.biosSettings, state.perks);
    
    if (benchmark.thermal.isOverheating) {
      soundFx.playWarning();
      get().setNotification('PC is overheating and crashing! Reduce overclock or improve cooling.', 'error');
      return;
    }

    const satisfaction = evaluateCustomerSatisfaction(build, state.activeOrder.requirements, benchmark);

    // Calculate payout
    const totalCost = benchmark.value.totalCost;
    const baseReward = state.activeOrder.reward.base;
    const satisfactionMultiplier = satisfaction / 100;
    const profit = Math.round(baseReward * satisfactionMultiplier);
    const totalPayout = totalCost + profit; // Customer pays for components + labor/profit
    
    let repGained = satisfaction >= 70 ? Math.round(satisfaction / 10) : -5;
    if (repGained > 0 && state.perks.includes('perk_deskmat')) {
      repGained += 1; // RGB Desk Mat perk
    }

    soundFx.playCash();

    const newTx = {
      id: `tx_${Date.now()}`,
      description: `Delivery to ${state.activeOrder.customer.name} (${satisfaction}% satisfaction)`,
      amount: totalPayout,
      type: 'credit',
      timestamp: Date.now(),
    };

    set(prev => ({
      cash: prev.cash + totalPayout,
      reputation: Math.max(0, prev.reputation + repGained),
      activeOrder: null,
      orders: prev.orders.filter(o => o.id !== prev.activeOrder.id),
      currentBuild: { ...INITIAL_BUILD },
      installedFromInventory: {},
      pcPowerState: 'off',
      benchmarkResult: null,
      transactions: [newTx, ...prev.transactions],
    }));

    // Auto-replenish order list
    setTimeout(() => {
      get().refreshOrders();
    }, 1000);

    get().setNotification(`PC Delivered! Earned ₹${totalPayout.toLocaleString('en-IN')} (Profit: ₹${profit.toLocaleString('en-IN')}, Rep +${repGained})`, 'success');
    get().persist();
    
    // Confetti!
    if (satisfaction >= 90) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  },

  refreshOrders: () => {
    const state = get();
    const currentLevel = shopLevels.find(l => l.level === state.shopLevel) || shopLevels[0];
    const maxOrders = currentLevel.unlocks.maxOrders + 2;
    const needed = Math.max(0, maxOrders - state.orders.length);

    const newOrders = [];
    for (let i = 0; i < needed; i++) {
      newOrders.push(generateOrder(state.shopLevel, state.reputation));
    }

    set({ orders: [...state.orders, ...newOrders] });
  },

  // ── MARKETPLACE & INVENTORY ──
  buyComponent: (component, livePrice) => {
    const state = get();
    const price = livePrice || component.basePrice;

    if (state.cash < price) {
      soundFx.playWarning();
      get().setNotification(`Insufficient funds! Need ₹${price.toLocaleString('en-IN')}`, 'error');
      return false;
    }

    soundFx.playCash();

    const invItem = {
      instanceId: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      componentId: component.id,
      category: component.category,
      item: component,
      purchasePrice: price,
      purchasedAt: Date.now(),
    };

    const newTx = {
      id: `tx_${Date.now()}`,
      description: `Purchased ${component.model}`,
      amount: -price,
      type: 'debit',
      timestamp: Date.now(),
    };

    set(prev => ({
      cash: prev.cash - price,
      inventory: [invItem, ...prev.inventory],
      transactions: [newTx, ...prev.transactions],
    }));

    get().setNotification(`Purchased ${component.model} for ₹${price.toLocaleString('en-IN')}`, 'success');
    get().persist();
    return true;
  },

  buyShadyDeal: (dealId) => {
    const state = get();
    const deal = state.market.shadyDeals?.find(d => d.id === dealId);
    if (!deal) return false;

    if (state.cash < deal.price) {
      soundFx.playWarning();
      get().setNotification(`Insufficient funds! Need ₹${deal.price.toLocaleString('en-IN')}`, 'error');
      return false;
    }

    soundFx.playCash();

    const invItem = {
      instanceId: `inv_shady_${Date.now()}`,
      componentId: deal.item.id,
      category: deal.item.category,
      item: deal.isScam ? { ...deal.item, isDamaged: true, model: `[BROKEN] ${deal.item.model}`, description: 'This part is completely fried.' } : deal.item,
      purchasePrice: deal.price,
      purchasedAt: Date.now(),
    };

    const newTx = {
      id: `tx_${Date.now()}`,
      description: `Dark Web Purchase: ${deal.item.model}`,
      amount: -deal.price,
      type: 'debit',
      timestamp: Date.now(),
    };

    set(prev => ({
      cash: prev.cash - deal.price,
      inventory: [invItem, ...prev.inventory],
      transactions: [newTx, ...prev.transactions],
      market: {
        ...prev.market,
        shadyDeals: prev.market.shadyDeals.filter(d => d.id !== dealId)
      }
    }));

    if (deal.isScam) {
      get().setNotification(`SCAMMED! The ${deal.item.model} you bought is a broken brick!`, 'error');
    } else {
      get().setNotification(`LUCKY! You got a working ${deal.item.model} for dirt cheap!`, 'success');
    }
    get().persist();
    return true;
  },

  sellInventoryItem: (instanceId) => {
    const state = get();
    const invItem = state.inventory.find(i => i.instanceId === instanceId);
    if (!invItem) return;

    // Resell at 85% of market price
    const marketPrice = state.market.prices[invItem.componentId]?.currentPrice || invItem.purchasePrice;
    const sellPrice = Math.round(marketPrice * 0.85);

    soundFx.playCash();

    const newTx = {
      id: `tx_${Date.now()}`,
      description: `Sold ${invItem.item.model}`,
      amount: sellPrice,
      type: 'credit',
      timestamp: Date.now(),
    };

    set(prev => ({
      cash: prev.cash + sellPrice,
      inventory: prev.inventory.filter(i => i.instanceId !== instanceId),
      transactions: [newTx, ...prev.transactions],
    }));

    get().setNotification(`Sold ${invItem.item.model} for ₹${sellPrice.toLocaleString('en-IN')}`, 'info');
    get().persist();
  },

  // ── WORKSTATION ASSEMBLY ──
  installPartFromInventory: (invItem) => {
    const state = get();
    const category = invItem.category;

    soundFx.playInstall();

    // If a part was already installed, put it back in inventory
    const existing = state.currentBuild[category];
    let updatedInv = state.inventory.filter(i => i.instanceId !== invItem.instanceId);

    if (existing) {
      const returnedInvItem = {
        instanceId: `inv_ret_${Date.now()}`,
        componentId: existing.id,
        category,
        item: existing,
        purchasePrice: existing.basePrice,
        purchasedAt: Date.now(),
      };
      updatedInv = [returnedInvItem, ...updatedInv];
    }

    set(prev => ({
      currentBuild: {
        ...prev.currentBuild,
        [category]: invItem.item,
      },
      inventory: updatedInv,
      installedFromInventory: {
        ...prev.installedFromInventory,
        [category]: invItem.instanceId,
      },
      biosSettings: { ...INITIAL_BIOS }, // reset overclock on hardware swap
      pcPowerState: 'off', // Turn off PC on hardware change
      postFailReason: null,
      benchmarkResult: null,
    }));

    get().setNotification(`Installed ${invItem.item.model}`, 'info');
    get().persist();
  },

  removePartToInventory: (category) => {
    const state = get();
    const part = state.currentBuild[category];
    if (!part) return;

    soundFx.playRemove();

    const returnedInvItem = {
      instanceId: `inv_rem_${Date.now()}`,
      componentId: part.id,
      category,
      item: part,
      purchasePrice: part.basePrice,
      purchasedAt: Date.now(),
    };

    const newInstalledMap = { ...state.installedFromInventory };
    delete newInstalledMap[category];

    set(prev => ({
      currentBuild: {
        ...prev.currentBuild,
        [category]: null,
      },
      inventory: [returnedInvItem, ...prev.inventory],
      installedFromInventory: newInstalledMap,
      pcPowerState: 'off',
      postFailReason: null,
      benchmarkResult: null,
    }));

    get().setNotification(`Removed ${part.model} to inventory`, 'info');
    get().persist();
  },

  clearCurrentBuild: () => {
    const state = get();
    soundFx.playRemove();

    // Return all parts to inventory
    const returnedItems = [];
    Object.entries(state.currentBuild).forEach(([cat, part]) => {
      if (part && typeof part === 'object') {
        returnedItems.push({
          instanceId: `inv_ret_all_${Date.now()}_${cat}`,
          componentId: part.id,
          category: cat,
          item: part,
          purchasePrice: part.basePrice,
          purchasedAt: Date.now(),
        });
      }
    });

    set(prev => ({
      currentBuild: { ...INITIAL_BUILD },
      inventory: [...returnedItems, ...prev.inventory],
      installedFromInventory: {},
      biosSettings: { ...INITIAL_BIOS },
      pcPowerState: 'off',
      postFailReason: null,
      benchmarkResult: null,
    }));

    get().setNotification('Cleared workstation build; parts returned to inventory.', 'info');
    get().persist();
  },

  // ── POWER & BOOT SIMULATION ──
  powerOnPC: () => {
    const state = get();
    soundFx.playPowerClick();

    if (state.pcPowerState !== 'off' && state.pcPowerState !== 'failed') {
      // Toggle off
      set({ pcPowerState: 'off', postFailReason: null });
      return;
    }

    set({ pcPowerState: 'powering_on', postFailReason: null });

    // Sequence Step 1: Check power delivery / PSU
    setTimeout(() => {
      const build = get().currentBuild;
      const comp = checkCompatibility(build);

      if (!build.psu) {
        soundFx.playPostError();
        set({ pcPowerState: 'failed', postFailReason: 'NO POWER: Power Supply Unit (PSU) is missing.' });
        return;
      }

      const critError = comp.criticals.find(c => c.message.toLowerCase().includes('psu'));
      if (critError) {
        soundFx.playPostError();
        set({ pcPowerState: 'failed', postFailReason: `PSU TRIP: ${critError.message}` });
        return;
      }

      // Step 2: POST Check (CPU + RAM + Motherboard)
      set({ pcPowerState: 'post' });

      setTimeout(() => {
        const curBuild = get().currentBuild;
        const curComp = checkCompatibility(curBuild);

        if (curComp.criticals.length > 0) {
          soundFx.playPostError();
          const primaryIssue = curComp.criticals[0];
          set({
            pcPowerState: 'failed',
            postFailReason: `POST FAILURE: ${primaryIssue.message}. Suggestion: ${primaryIssue.suggestion}`,
          });
          return;
        }

        // Single POST Beep! Everything is green
        soundFx.playPostBeep();

        // Step 3: Booting OS
        set({ pcPowerState: 'booting_os' });

        setTimeout(() => {
          soundFx.playBootChime();
          set({ pcPowerState: 'desktop' });
          get().setNotification('PC Booted Successfully into Windows 11 Desktop!', 'success');
        }, 1400);

      }, 1200);

    }, 800);
  },

  powerOffPC: () => {
    soundFx.playPowerClick();
    set({ pcPowerState: 'off', postFailReason: null });
  },

  // ── BENCHMARK SUITE ──
  runBenchmarkSuite: () => {
    const state = get();
    if (state.pcPowerState !== 'desktop') {
      soundFx.playWarning();
      get().setNotification('Boot the PC into desktop before running benchmarks!', 'warning');
      return;
    }

    soundFx.playClick();
    const result = runBenchmark(state.currentBuild, state.biosSettings, state.perks);
    
    if (result.thermal.isOverheating) {
      soundFx.playPostError();
      set({ pcPowerState: 'failed', postFailReason: 'THERMAL TRIP: CPU/GPU critically overheated during load. System halted to prevent damage.' });
      get().setNotification('Benchmark crashed due to overheating!', 'error');
      return;
    }

    set({ benchmarkResult: result });
    get().setNotification(`Benchmark Complete! Overall Score: ${result.overallScore}/100`, 'success');
    get().persist();
  },

  // ── REPAIR SYSTEM ──
  acceptRepairJob: (repairId) => {
    const state = get();
    const job = state.repairJobs.find(r => r.id === repairId);
    if (!job) return;

    soundFx.playClick();
    set({
      activeRepair: job,
      repairJobs: state.repairJobs.filter(r => r.id !== repairId),
      currentBuild: { ...job.build },
      installedFromInventory: {},
      pcPowerState: 'off',
      activeTab: 'workstation',
    });
    get().setNotification(`Customer PC on workbench: "${job.title}"`, 'info');
  },

  diagnoseRepair: () => {
    const state = get();
    if (!state.activeRepair) return;

    soundFx.playInstall();
    set(prev => ({
      activeRepair: {
        ...prev.activeRepair,
        diagnosed: true,
      },
    }));
    get().setNotification(`Diagnostic Results: ${state.activeRepair.diagnosticClue}`, 'info');
  },

  // ── TITANKART PERKS ──
  buyPerk: (perk) => {
    const state = get();
    if (state.perks.includes(perk.id)) return false;
    
    if (state.cash < perk.price) {
      soundFx.playWarning();
      get().setNotification(`Insufficient funds to buy ${perk.name}!`, 'error');
      return false;
    }

    soundFx.playCash();
    
    const newTx = {
      id: `tx_${Date.now()}`,
      description: `TitanKart: ${perk.name}`,
      amount: -perk.price,
      type: 'debit',
      timestamp: Date.now(),
    };

    set(prev => ({
      cash: prev.cash - perk.price,
      perks: [...prev.perks, perk.id],
      transactions: [newTx, ...prev.transactions],
    }));

    get().setNotification(`Purchased ${perk.name} from TitanKart!`, 'success');
    get().persist();
    return true;
  },

  completeRepairJob: () => {
    const state = get();
    if (!state.activeRepair) return;

    // Check if the faulty part was replaced with a working, compatible part
    const faultyCat = state.activeRepair.faultyPartCategory;
    const currentPart = state.currentBuild[faultyCat];

    if (!currentPart || currentPart.isDamaged) {
      soundFx.playWarning();
      get().setNotification(`The ${faultyCat.toUpperCase()} is still faulty or missing! Replace it with a functional unit.`, 'error');
      return;
    }

    // Must be bootable
    const comp = checkCompatibility(state.currentBuild);
    if (!comp.isBootable) {
      soundFx.playWarning();
      get().setNotification('The PC must be fully functional and bootable to return to the customer.', 'error');
      return;
    }

    soundFx.playCash();
    let reward = state.activeRepair.laborFee;
    
    if (state.perks.includes('perk_screwdriver')) {
      reward = Math.round(reward * 1.15); // Electric Screwdriver Pro perk
    }

    const newTx = {
      id: `tx_${Date.now()}`,
      description: `Repair completed: ${state.activeRepair.title}`,
      amount: reward,
      type: 'credit',
      timestamp: Date.now(),
    };

    set(prev => ({
      cash: prev.cash + reward,
      reputation: prev.reputation + 8,
      activeRepair: null,
      currentBuild: { ...INITIAL_BUILD },
      pcPowerState: 'off',
      transactions: [newTx, ...prev.transactions],
    }));

    // Add new repair job after a short delay
    setTimeout(() => {
      set(prev => ({
        repairJobs: [...prev.repairJobs, generateRepairJob(prev.repairJobs.length + 1)],
      }));
    }, 1500);

    get().setNotification(`Repair Completed! Earned ₹${reward.toLocaleString('en-IN')} +8 Rep`, 'success');
    get().persist();
  },

  // ── CHALLENGES ──
  startChallenge: (challengeId) => {
    const state = get();
    const ch = state.challenges.find(c => c.id === challengeId);
    if (!ch) return;

    soundFx.playClick();
    set({
      activeChallenge: ch,
      activeTab: 'workstation',
    });
    get().setNotification(`Active Challenge: ${ch.name}! ${ch.objective}`, 'info');
  },

  submitChallenge: () => {
    const state = get();
    const ch = state.activeChallenge;
    if (!ch) return;

    const build = state.currentBuild;
    const comp = checkCompatibility(build);

    if (!comp.isBootable) {
      soundFx.playWarning();
      get().setNotification('Build must be 100% compatible and bootable to pass the challenge!', 'error');
      return;
    }

    const benchmark = state.benchmarkResult || runBenchmark(build, state.biosSettings, state.perks);
    
    if (benchmark.thermal.isOverheating) {
      soundFx.playWarning();
      get().setNotification('Challenge failed: System crashed due to overheating.', 'error');
      return;
    }

    const totalCost = benchmark.value.totalCost;

    // Check rules
    if (ch.rules.maxBudget && totalCost > ch.rules.maxBudget) {
      soundFx.playWarning();
      get().setNotification(`Exceeded max budget of ₹${ch.rules.maxBudget.toLocaleString('en-IN')}! Total: ₹${totalCost.toLocaleString('en-IN')}`, 'error');
      return;
    }

    if (ch.rules.minFps1080p && benchmark.fps['1080p'].avg < ch.rules.minFps1080p) {
      soundFx.playWarning();
      get().setNotification(`Need at least ${ch.rules.minFps1080p} FPS at 1080p! Current: ${benchmark.fps['1080p'].avg} FPS`, 'error');
      return;
    }

    soundFx.playCash();
    const reward = ch.reward;

    const newTx = {
      id: `tx_${Date.now()}`,
      description: `Challenge Won: ${ch.name}`,
      amount: reward,
      type: 'credit',
      timestamp: Date.now(),
    };

    set(prev => ({
      cash: prev.cash + reward,
      reputation: prev.reputation + 25,
      activeChallenge: null,
      challenges: prev.challenges.map(c => c.id === ch.id ? { ...c, completed: true, bestScore: benchmark.overallScore } : c),
      transactions: [newTx, ...prev.transactions],
    }));

    get().setNotification(`🏆 Challenge Complete: ${ch.name}! Won ₹${reward.toLocaleString('en-IN')} +25 Rep!`, 'success');
    get().persist();
    
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#ffd700', '#ff8c00', '#ff0000']
    });
  },

  // ── SHOP UPGRADES ──
  upgradeShopLevel: () => {
    const state = get();
    const nextLevelNum = state.shopLevel + 1;
    const nextTier = shopLevels.find(l => l.level === nextLevelNum);

    if (!nextTier) {
      get().setNotification('Already at Maximum Shop Level: Premium Build Studio!', 'info');
      return;
    }

    if (state.reputation < nextTier.requiredReputation) {
      soundFx.playWarning();
      get().setNotification(`Need ${nextTier.requiredReputation} Reputation (Current: ${state.reputation}) to upgrade!`, 'warning');
      return;
    }

    if (state.cash < nextTier.upgradeCost) {
      soundFx.playWarning();
      get().setNotification(`Insufficient cash! Upgrade costs ₹${nextTier.upgradeCost.toLocaleString('en-IN')}`, 'error');
      return;
    }

    soundFx.playCash();

    const newTx = {
      id: `tx_${Date.now()}`,
      description: `Shop Upgrade: ${nextTier.name}`,
      amount: -nextTier.upgradeCost,
      type: 'debit',
      timestamp: Date.now(),
    };

    set(prev => ({
      cash: prev.cash - nextTier.upgradeCost,
      shopLevel: nextLevelNum,
      transactions: [newTx, ...prev.transactions],
    }));

    soundFx.playLevelUp();
    get().setNotification(`🎉 Shop Upgraded to Level ${nextLevelNum}: ${nextTier.name}!`, 'success');
    get().refreshOrders();
    get().persist();
    
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.3 }
    });
  },

  // ── ADVANCE IN-GAME DAY ──
  advanceDay: () => {
    soundFx.playClick();
    const state = get();
    const nextDay = state.day + 1;
    const updatedMarket = advanceMarketDay(state.market, nextDay);

    // Minor shop daily operating cost based on shop level
    const rent = state.shopLevel * 450;
    const newTx = {
      id: `tx_${Date.now()}`,
      description: `Day ${nextDay} Operating Overheads & Utilities`,
      amount: -rent,
      type: 'debit',
      timestamp: Date.now(),
    };

    set(prev => ({
      day: nextDay,
      cash: Math.max(0, prev.cash - rent),
      market: updatedMarket,
      transactions: [newTx, ...prev.transactions],
    }));

    get().refreshOrders();
    get().setNotification(`Day ${nextDay} arrived. Live hardware prices updated!`, 'info');
    get().persist();
  },

  // ── COMMUNITY & CUSTOM BUILDS ──
  saveCustomBuild: (buildName) => {
    const state = get();
    const build = state.currentBuild;
    const comp = checkCompatibility(build);
    if (!comp.isBootable) {
      get().setNotification('Cannot publish an unbootable build!', 'error');
      return;
    }

    const bench = state.benchmarkResult || runBenchmark(build, state.biosSettings, state.perks);
    if (bench.thermal.isOverheating) {
      get().setNotification('Cannot publish a PC that overheats and crashes!', 'error');
      return;
    }

    soundFx.playCash();

    const newSaved = {
      id: `build_${Date.now()}`,
      name: buildName || 'Custom Masterpiece',
      author: 'You (Shop Owner)',
      totalCost: bench.value.totalCost,
      score: bench.overallScore,
      fps1080p: bench.fps['1080p'].avg,
      likes: 1,
      parts: {
        cpu: build.cpu?.model || 'N/A',
        gpu: build.gpu?.model || 'Integrated',
        motherboard: build.motherboard?.model || 'N/A',
        ram: build.ram?.model || 'N/A',
        psu: build.psu?.model || 'N/A',
      },
    };

    set(prev => ({
      savedBuilds: [newSaved, ...prev.savedBuilds],
    }));

    get().setNotification(`Published "${newSaved.name}" to Community Showcase!`, 'success');
    get().persist();
  },

  likeCommunityBuild: (buildId) => {
    soundFx.playClick();
    set(prev => ({
      savedBuilds: prev.savedBuilds.map(b => b.id === buildId ? { ...b, likes: b.likes + 1 } : b),
    }));
  },

  // ── SAVE / RESET ──
  persist: () => {
    try {
      const state = get();
      const serialized = {
        cash: state.cash,
        reputation: state.reputation,
        shopLevel: state.shopLevel,
        day: state.day,
        inventory: state.inventory,
        currentBuild: state.currentBuild,
        biosSettings: state.biosSettings,
        installedFromInventory: state.installedFromInventory,
        orders: state.orders,
        activeOrder: state.activeOrder,
        repairJobs: state.repairJobs,
        activeRepair: state.activeRepair,
        challenges: state.challenges,
        savedBuilds: state.savedBuilds,
        transactions: state.transactions.slice(0, 30),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch {
      // storage quota or disabled
    }
  },

  resetGame: () => {
    localStorage.removeItem(STORAGE_KEY);
    set(getInitialState());
    soundFx.playClick();
    get().setNotification('Game reset to Day 1 with ₹50,000 capital.', 'info');
  },
}));
