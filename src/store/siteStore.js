// Site Store (Zustand)
// Manages System Builder current build, dynamic market prices, multi-retailer tracking,
// currency selection, saved user rigs, and live market sync intervals.

import { create } from 'zustand';
import { initializeMarket, tickMarket as tickMarketEngine } from '../engine/marketSimulation';
import { getComponentById } from '../data/index';

const STORAGE_SAVED_BUILDS = 'pcpartpulse_saved_builds_v1';
const STORAGE_CURRENT_BUILD = 'pcpartpulse_current_build_v1';
const STORAGE_CURRENCY = 'pcpartpulse_currency_v1';

const INITIAL_BUILD = {
  cpu: null,
  motherboard: null,
  gpu: null,
  ram: null,
  storage: null,
  psu: null,
  case: null,
  cooler: null,
};

function loadStoredCurrentBuild() {
  try {
    const raw = localStorage.getItem(STORAGE_CURRENT_BUILD);
    if (raw) {
      const parsed = JSON.parse(raw);
      const build = { ...INITIAL_BUILD };
      Object.keys(INITIAL_BUILD).forEach(slot => {
        if (parsed[slot]) {
          const comp = getComponentById(parsed[slot]);
          if (comp) build[slot] = comp;
        }
      });
      return build;
    }
  } catch (e) {
    console.error('Failed to restore current build:', e);
  }
  return { ...INITIAL_BUILD };
}

function loadStoredSavedBuilds() {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_BUILDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load saved builds:', e);
  }
  return [
    {
      id: 'saved_preset_1440p',
      name: 'My Ideal 1440p High-Refresh Battlestation',
      savedAt: '2026-09-15',
      components: {
        cpu: 'cpu_r5_7600x',
        motherboard: 'mb_b650_gaming_plus',
        gpu: 'gpu_rtx4070_super',
        ram: 'ram_gskill_flare_32gb_ddr5_6000',
        storage: 'stor_wd_black_sn850x_1tb',
        psu: 'psu_corsair_rm750e',
        case: 'case_corsair_4000d_airflow',
        cooler: 'cool_thermalright_peerless_assassin_120',
      },
    },
  ];
}

export const useSiteStore = create((set, get) => ({
  activeTab: 'builder', // 'builder' | 'market' | 'catalog' | 'guides' | 'benchmarks' | 'saved'
  currency: localStorage.getItem(STORAGE_CURRENCY) || 'USD',
  currentBuild: loadStoredCurrentBuild(),
  savedBuilds: loadStoredSavedBuilds(),
  market: initializeMarket(),
  autoMarketSync: true,
  activePickerCategory: null,
  selectedComponentForDetail: null,
  exportModalOpen: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setCurrency: (currency) => {
    localStorage.setItem(STORAGE_CURRENCY, currency);
    set({ currency });
  },

  setAutoMarketSync: (val) => set({ autoMarketSync: val }),

  setComponent: (category, component) => {
    const currentBuild = { ...get().currentBuild, [category]: component };
    set({ currentBuild, activePickerCategory: null });
    try {
      const ids = {};
      Object.entries(currentBuild).forEach(([k, v]) => {
        if (v) ids[k] = v.id;
      });
      localStorage.setItem(STORAGE_CURRENT_BUILD, JSON.stringify(ids));
    } catch (e) {}
  },

  removeComponent: (category) => {
    const currentBuild = { ...get().currentBuild, [category]: null };
    set({ currentBuild });
    try {
      const ids = {};
      Object.entries(currentBuild).forEach(([k, v]) => {
        if (v) ids[k] = v.id;
      });
      localStorage.setItem(STORAGE_CURRENT_BUILD, JSON.stringify(ids));
    } catch (e) {}
  },

  clearBuild: () => {
    set({ currentBuild: { ...INITIAL_BUILD } });
    localStorage.removeItem(STORAGE_CURRENT_BUILD);
  },

  loadBuildFromComponents: (componentMap) => {
    const newBuild = { ...INITIAL_BUILD };
    Object.entries(componentMap).forEach(([slot, id]) => {
      const comp = getComponentById(id);
      if (comp) newBuild[slot] = comp;
    });
    set({ currentBuild: newBuild, activeTab: 'builder' });
    try {
      localStorage.setItem(STORAGE_CURRENT_BUILD, JSON.stringify(componentMap));
    } catch (e) {}
  },

  saveCurrentBuild: (name) => {
    const current = get().currentBuild;
    const ids = {};
    Object.entries(current).forEach(([k, v]) => {
      if (v) ids[k] = v.id;
    });

    const newSave = {
      id: `build_${Date.now()}`,
      name: name || `Custom Build #${get().savedBuilds.length + 1}`,
      savedAt: new Date().toISOString().split('T')[0],
      components: ids,
    };

    const savedBuilds = [newSave, ...get().savedBuilds];
    set({ savedBuilds });
    try {
      localStorage.setItem(STORAGE_SAVED_BUILDS, JSON.stringify(savedBuilds));
    } catch (e) {}
  },

  deleteSavedBuild: (id) => {
    const savedBuilds = get().savedBuilds.filter(b => b.id !== id);
    set({ savedBuilds });
    try {
      localStorage.setItem(STORAGE_SAVED_BUILDS, JSON.stringify(savedBuilds));
    } catch (e) {}
  },

  tickMarket: () => {
    const updated = tickMarketEngine(get().market);
    set({ market: updated });
  },

  openPicker: (category) => set({ activePickerCategory: category }),
  closePicker: () => set({ activePickerCategory: null }),

  openDetail: (component) => set({ selectedComponentForDetail: component }),
  closeDetail: () => set({ selectedComponentForDetail: null }),

  setExportModalOpen: (open) => set({ exportModalOpen: open }),
}));
