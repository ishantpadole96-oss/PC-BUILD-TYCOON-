export const OS_APPS = [
  { id: 'titanstore', label: 'Titan Store', icon: '🛒', isCore: true, desc: 'Download and install apps' },
  { id: 'browser', label: 'Web Browser', icon: '🌐', isCore: true, desc: 'Surf the simulated web' },
  { id: 'files', label: 'File Manager', icon: '📁', isCore: true, desc: 'Manage your files' },
  { id: 'notepad', label: 'Notepad', icon: '📝', isCore: true, desc: 'Take notes' },
  { id: 'settings', label: 'Settings', icon: '⚙️', isCore: true, desc: 'Manage PC settings' },
  { id: 'workstation', label: 'Assembly Desk', icon: '🛠️', isCore: true, desc: 'Build and repair PCs' },
  
  { id: 'titankart', label: 'TitanKart', icon: '🛍️', desc: 'Buy PC parts' },
  { id: 'assets', label: 'Asset Manager', icon: '💼', desc: 'Manage business assets' },
  { id: 'orders', label: 'E-mail', icon: '📧', desc: 'Check customer orders' },
  { id: 'marketplace', label: 'Shop', icon: '🏷️', desc: 'Used marketplace' },
  { id: 'inventory', label: 'Inventory', icon: '📦', desc: 'View your parts' },
  { id: 'repairs', label: 'Repairs', icon: '🔧', desc: 'Fix customer PCs' },
  { id: 'challenges', label: 'Challenges', icon: '🏆', desc: 'Complete special challenges' },
  { id: 'shop', label: 'Upgrade Shop', icon: '🏬', desc: 'Upgrade your workspace' },
  { id: 'titannetwork', label: 'Titan Network', icon: '🌐', desc: 'Friends & Leaderboards', isCore: true },
  { id: 'wallpaper', label: 'Wallpaper', icon: '🖼️', desc: 'Change your background' },
  { id: 'donate', label: 'Donate', icon: '❤️', isCore: true, desc: 'Support the developer' },
  { id: 'scrapper', label: 'Scrapper', icon: '♻️', desc: 'Scrap old parts for materials' },
  { id: 'cmd', label: 'Command Prompt', icon: '⌨️', desc: 'Terminal interface' },
  { id: 'calculator', label: 'Calculator', icon: '🧮', desc: 'Crunch numbers' },
  { id: 'minigame', label: 'Mini Games', icon: '🎮', desc: 'Play fun mini games' },
  { id: 'contact', label: 'Developer', icon: '📱', isCore: true, desc: 'Contact information' }
];

export const CORE_APPS = OS_APPS.filter(app => app.isCore).map(app => app.id);
