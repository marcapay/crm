// IndexedDB persistence for Property Photos to avoid localStorage quota limits

const DB_NAME = 'araujo_crm_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'property_photos';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePhotosToIndexedDB(id, photos) {
  if (!id || !Array.isArray(photos) || photos.length === 0) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id: String(id), photos, updatedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[ImageStorage] Erro ao salvar fotos no IndexedDB:', err);
  }
}

export async function getPhotosFromIndexedDB(id) {
  if (!id) return [];
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(id));
      req.onsuccess = () => {
        resolve(req.result?.photos || []);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getAllPhotosFromIndexedDB() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const map = {};
        (req.result || []).forEach(item => {
          if (item?.id && item?.photos) {
            map[item.id] = item.photos;
          }
        });
        resolve(map);
      };
      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}
