// Component database index - aggregates all component files
import { cpus } from './components/cpus';
import { gpus } from './components/gpus';
import { motherboards } from './components/motherboards';
import { ram } from './components/ram';
import { storage } from './components/storage';
import { psus } from './components/psus';
import { cases } from './components/cases';
import { coolers } from './components/coolers';

export const ALL_COMPONENTS = {
  cpu: cpus,
  gpu: gpus,
  motherboard: motherboards,
  ram: ram,
  storage: storage,
  psu: psus,
  case: cases,
  cooler: coolers,
};

// Flat lookup map for quick ID-based access
export const COMPONENT_MAP = {};
Object.values(ALL_COMPONENTS).forEach(arr => {
  arr.forEach(c => {
    COMPONENT_MAP[c.id] = c;
  });
});

export const CATEGORIES = [
  { key: 'cpu', label: 'CPU', icon: '🔲', required: true },
  { key: 'motherboard', label: 'Motherboard', icon: '🔌', required: true },
  { key: 'gpu', label: 'GPU', icon: '🎮', required: false },
  { key: 'ram', label: 'RAM', icon: '📊', required: true },
  { key: 'storage', label: 'Storage', icon: '💾', required: true },
  { key: 'psu', label: 'PSU', icon: '⚡', required: true },
  { key: 'case', label: 'Case', icon: '🖥️', required: true },
  { key: 'cooler', label: 'Cooler', icon: '❄️', required: true },
];

export function getComponentById(id) {
  return COMPONENT_MAP[id] || null;
}

export function getComponentsByCategory(category) {
  return ALL_COMPONENTS[category] || [];
}

export function getComponentsByTier(category, tier) {
  return (ALL_COMPONENTS[category] || []).filter(c => c.tier === tier);
}
