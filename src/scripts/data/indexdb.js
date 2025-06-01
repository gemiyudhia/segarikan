// src/data/indexdb.js
import { openDB } from 'idb';

const DB_NAME = 'segarikanDB';
const DB_VERSION = 3;
const STORE_HISTORY = 'history';
const STORE_USERS = 'users';

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_HISTORY)) {
        db.createObjectStore(STORE_HISTORY, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    },
  });
}

export async function initDB() {
  return getDB();
}

export async function saveUser(user) {
  const db = await getDB();
  const tx = db.transaction(STORE_USERS, 'readwrite');
  const store = tx.objectStore(STORE_USERS);
  await store.add(user);
  await tx.done;
  return true;
}

export async function getUserByEmail(email) {
  const db = await getDB();
  const tx = db.transaction(STORE_USERS, 'readonly');
  const store = tx.objectStore(STORE_USERS);
  const allUsers = await store.getAll();
  await tx.done;
  return allUsers.find((user) => user.email === email);
}

export async function saveHistoryToDB(data) {
  const db = await getDB();
  const tx = db.transaction(STORE_HISTORY, 'readwrite');
  const store = tx.objectStore(STORE_HISTORY);
  const insertedId = await store.add(data); // tangkap key hasil autoIncrement
  await tx.done;
  return insertedId; // opsional: return id jika ingin dipakai
}


export async function getAllHistoryFromDB() {
  const db = await getDB();
  const tx = db.transaction(STORE_HISTORY, 'readonly');
  const store = tx.objectStore(STORE_HISTORY);
  const allHistory = await store.getAll();
  await tx.done;
  return allHistory;
}
