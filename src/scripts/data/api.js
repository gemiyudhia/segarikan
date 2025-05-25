import CONFIG from '../config.js';

// Ambil data lokal dari file db.json di public folder
export const getLocalData = async () => {
  try {
    const response = await fetch('/data/db.json');
    if (!response.ok) throw new Error('Gagal mengambil data lokal');
    const result = await response.json();
    if (Array.isArray(result)) return result;
    return [];
  } catch (error) {
    console.error('Gagal mengambil data lokal:', error);
    return [];
  }
};

// Ambil semua data dari API, fallback ke lokal jika API gagal atau data kosong
export const getData = async () => {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/data`);
    if (!response.ok) throw new Error('Gagal mengambil data');

    const result = await response.json();
    if (Array.isArray(result) && result.length > 0) return result;

    // Jika data kosong, ambil dari lokal
    return await getLocalData();
  } catch (error) {
    console.error('Gagal mengambil data API, fallback ke data lokal:', error);
    return await getLocalData();
  }
};

// Tambah data baru (berupa objek: { id, nama, status })
export const addData = async (newData) => {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    });

    if (!response.ok) throw new Error('Gagal menambahkan data');

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Gagal menambahkan data:', error);
    return null;
  }
};

// Hapus data berdasarkan ID
export const deleteDataById = async (id) => {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/data/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Gagal menghapus data');

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Gagal menghapus data:', error);
    return null;
  }
};

// ====================
// Fungsi baru untuk user.json
// ====================

// Register user baru ke backend (simpan di user.json)
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) throw new Error('Gagal registrasi user');

    const result = await response.json();
    return result; // bisa { success: true, message: '...' } atau sejenisnya
  } catch (error) {
    console.error('Error registerUser:', error);
    return null;
  }
};

// Login user dengan cek email & password di backend user.json
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error('Login gagal');

    const result = await response.json();
    return result; // contoh: { success: true, user: {...} } atau { success: false, message: '...' }
  } catch (error) {
    console.error('Error loginUser:', error);
    return null;
  }
};
