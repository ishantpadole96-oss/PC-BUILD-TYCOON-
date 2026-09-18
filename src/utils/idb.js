export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TitanOS_Settings', 2);
    
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('wallpapers')) {
        db.createObjectStore('wallpapers');
      }
    };
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveWallpaperBlob(blob, type) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('wallpapers', 'readwrite');
    const store = tx.objectStore('wallpapers');
    store.put({ blob, type }, 'current_wallpaper');
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getWallpaperBlob() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('wallpapers', 'readonly');
    const store = tx.objectStore('wallpapers');
    const request = store.get('current_wallpaper');
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearWallpaper() {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('wallpapers', 'readwrite');
    const store = tx.objectStore('wallpapers');
    const request = store.delete('current_wallpaper');
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
