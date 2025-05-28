import { openDB } from 'idb';

const DB_NAME = 'SegarikanDB';
const DB_VERSION = 1;
const USER_STORE = 'users';

let dbPromise = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(USER_STORE)) {
          const store = db.createObjectStore(USER_STORE, { keyPath: 'email' });
          store.createIndex('name', 'name', { unique: false });
        }
      },
    });
  }
  return dbPromise;
};

export const saveUser = async (user) => {
  try {
    const db = await initDB();
    const tx = db.transaction(USER_STORE, 'readwrite');
    const store = tx.objectStore(USER_STORE);
    await store.put(user);
    await tx.done;
    return true;
  } catch (error) {
    console.error('Gagal menyimpan user ke IndexedDB:', error);
    return false;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const db = await initDB();
    const tx = db.transaction(USER_STORE, 'readonly');
    const store = tx.objectStore(USER_STORE);
    const user = await store.get(email);
    await tx.done;
    return user || null;
  } catch (error) {
    console.error('Gagal mengambil user berdasarkan email:', error);
    return null;
  }
};
