// Site Store (Zustand)
// Manages System Builder current build, dynamic market prices, multi-retailer tracking,
// currency selection, saved user rigs, Supabase user authentication, and cloud synchronization.

import { create } from 'zustand';
import { initializeMarket, tickMarket as tickMarketEngine } from '../engine/marketSimulation';
import { getComponentById } from '../data/index';
import { isSupabaseConfigured, saveBuildToCloud, deleteCloudBuild, fetchUserCloudBuilds } from '../utils/supabase';

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
  authModalOpen: false,
  user: null,

  setUser: (user) => set({ user }),
  setAuthModalOpen: (open) => set({ authModalOpen: open }),

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
    } catch {}
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
    } catch {}
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
    } catch {}
  },

  saveCurrentBuild: async (name) => {
    const current = get().currentBuild;
    const ids = {};
    Object.entries(current).forEach(([k, v]) => {
      if (v) ids[k] = v.id;
    });

    const market = get().market;
    const totalPrice = Object.values(current).filter(Boolean).reduce((sum, item) => {
      const mData = market.prices[item.id];
      return sum + (mData ? mData.currentPrice : item.basePrice);
    }, 0);

    const buildName = name || `Custom Build #${get().savedBuilds.length + 1}`;
    const newSave = {
      id: `build_${Date.now()}`,
      name: buildName,
      savedAt: new Date().toISOString().split('T')[0],
      components: ids,
      totalPrice,
      isCloudSynced: false,
    };

    // If user is authenticated with Supabase, sync to cloud
    if (get().user && isSupabaseConfigured) {
      try {
        const { data, error } = await saveBuildToCloud({
          name: buildName,
          components: ids,
          totalPrice,
        });
        if (data && !error) {
          newSave.id = data.id;
          newSave.isCloudSynced = true;
        }
      } catch (e) {
        console.warn('Cloud save fallback to local:', e);
      }
    }

    const savedBuilds = [newSave, ...get().savedBuilds];
    set({ savedBuilds });
    try {
      localStorage.setItem(STORAGE_SAVED_BUILDS, JSON.stringify(savedBuilds));
    } catch {}
  },

  deleteSavedBuild: async (id) => {
    if (get().user && isSupabaseConfigured && !id.startsWith('saved_preset_')) {
      try {
        await deleteCloudBuild(id);
      } catch {}
    }

    const savedBuilds = get().savedBuilds.filter(b => b.id !== id);
    set({ savedBuilds });
    try {
      localStorage.setItem(STORAGE_SAVED_BUILDS, JSON.stringify(savedBuilds));
    } catch {}
  },

  syncCloudBuilds: async () => {
    if (!get().user || !isSupabaseConfigured) return;
    try {
      const { data, error } = await fetchUserCloudBuilds();
      if (data && !error && data.length > 0) {
        const formatted = data.map(dbRow => ({
          id: dbRow.id,
          name: dbRow.name,
          savedAt: new Date(dbRow.created_at).toISOString().split('T')[0],
          components: dbRow.components,
          totalPrice: dbRow.total_price,
          isCloudSynced: true,
        }));
        
        // Merge with non-cloud presets
        const localOnly = get().savedBuilds.filter(b => b.id.startsWith('saved_preset_'));
        const merged = [...formatted, ...localOnly];
        set({ savedBuilds: merged });
        localStorage.setItem(STORAGE_SAVED_BUILDS, JSON.stringify(merged));
      }
    } catch (e) {
      console.warn('Failed to sync cloud builds:', e);
    }
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
