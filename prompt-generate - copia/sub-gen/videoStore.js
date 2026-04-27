// IndexedDB helper for persisting video files
const VideoStore = (() => {
  const DB_NAME = 'subgen_videos';
  const STORE_NAME = 'files';
  const DB_VERSION = 1;

  let db = null;

  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) return resolve(db);
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        console.error('[VideoStore] Failed to open DB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        db = request.result;
        console.log('[VideoStore] DB opened successfully');
        resolve(db);
      };
      
      request.onupgradeneeded = (event) => {
        console.log('[VideoStore] DB upgrade needed');
        const database = event.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async function save(key, file) {
    console.log('[VideoStore] Saving file:', key, 'size:', file.size, 'type:', file.type);
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id: key, file, timestamp: Date.now() });
      request.onsuccess = () => {
        console.log('[VideoStore] File saved successfully:', key);
        resolve();
      };
      request.onerror = () => {
        console.error('[VideoStore] Error saving file:', request.error);
        reject(request.error);
      };
    });
  }

  async function load(key) {
    console.log('[VideoStore] Loading file:', key);
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          console.log('[VideoStore] File loaded:', key, 'size:', result.file.size);
        } else {
          console.warn('[VideoStore] File not found:', key);
        }
        resolve(result?.file || null);
      };
      request.onerror = () => {
        console.error('[VideoStore] Error loading file:', request.error);
        reject(request.error);
      };
    });
  }

  async function remove(key) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  return { save, load, remove };
})();

window.VideoStore = VideoStore;
console.log('[VideoStore] ✓ IndexedDB storage loaded');
