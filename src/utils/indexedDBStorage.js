// IndexedDB helper for persistent mobile storage
const dbName = 'MinimartAuthDB';
const storeName = 'invitedMemberSession';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    };
  });
};

export const saveToIndexedDB = async (data) => {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.put(data, 'session');
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log('✅ IndexedDB save SUCCESS:', data);
        resolve();
      };
      transaction.onerror = () => {
        console.error('❌ IndexedDB save ERROR:', transaction.error);
        reject(transaction.error);
      };
    });
  } catch (err) {
    console.error('❌ IndexedDB save FAILED:', err);
    throw err;
  }
};

export const getFromIndexedDB = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get('session');
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('✅ IndexedDB read SUCCESS:', request.result);
        resolve(request.result);
      };
      request.onerror = () => {
        console.error('❌ IndexedDB read ERROR:', request.error);
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('❌ IndexedDB read FAILED:', err);
    return null;
  }
};

export const clearFromIndexedDB = async () => {
  try {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.delete('session');
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.warn('IndexedDB clear failed:', err);
  }
};
