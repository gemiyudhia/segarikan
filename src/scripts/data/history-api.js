import CONFIG from "../config";

export async function fetchUserHistory(token) {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/v1/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error('Gagal mengambil data riwayat');
    }
    const data = await response.json();
    return data; // Pastikan ini array
  } catch (error) {
    console.error(error);
    return null;
  }
}
