// src/views/pages/ResultPage.js
import { saveHistoryToDB } from '../../data/indexdb.js';

export default class ResultPage {
  async render() {
    return `
      <section class="px-4 py-10 min-h-screen bg-gradient-to-b from-white to-blue-50 mt-16">
        <div class="max-w-3xl mx-auto">
          <div class="bg-white rounded-2xl shadow-xl p-6 md:p-10 text-center">
            <h1 class="text-2xl md:text-4xl font-bold text-blue-700 mb-6">Hasil Pemeriksaan Ikan</h1>

            <div id="image-section" class="mb-6">
              <img id="result-image" src="" alt="Hasil Scan" class="mx-auto rounded-lg shadow-md max-h-96" />
            </div>

            <div id="result-content" class="text-left">
              <h2 class="text-xl font-semibold text-gray-700 mb-4">Detail Hasil:</h2>
              <ul id="result-list" class="list-disc list-inside text-gray-800 space-y-4"></ul>
            </div>

            <div class="mt-10 space-y-4">
              <button id="save-button" class="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 font-semibold" disabled>
                <i class="fas fa-save mr-2"></i>Simpan Hasil Scan
              </button>

              <a href="#/scan" class="inline-block w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 font-semibold">
                <i class="fas fa-redo-alt mr-2"></i>Scan Ulang
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Modal Notifikasi -->
<div id="notification-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
  <div class="bg-white w-11/12 max-w-sm rounded-xl shadow-xl p-6 text-center">
    <div id="modal-icon" class="text-4xl mb-4 text-green-600">
      <i class="fas fa-check-circle"></i>
    </div>
    <h3 id="modal-message" class="text-lg font-semibold text-gray-700 mb-4">Berhasil menyimpan hasil scan!</h3>
    <button id="close-modal" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
      Tutup
    </button>
  </div>
</div>

    `;
  }

  async afterRender() {
    const resultImage = document.getElementById('result-image');
    const resultList = document.getElementById('result-list');
    const saveButton = document.getElementById('save-button');

    if (!resultImage || !resultList || !saveButton) {
      console.error('❌ Elemen halaman tidak ditemukan.');
      return;
    }

    let data;
    const storedData = sessionStorage.getItem('scanResult');
    if (!storedData) {
      resultList.innerHTML =
        '<li class="text-red-600">Data hasil tidak ditemukan.</li>';
      return;
    }

    try {
      data = JSON.parse(storedData);
    } catch {
      resultList.innerHTML = '<li class="text-red-600">Data hasil rusak.</li>';
      return;
    }

    // Tampilkan gambar hasil scan
    if (data.imageData) {
      resultImage.src = data.imageData;
      resultImage.alt = 'Hasil Scan Ikan';
    } else {
      resultImage.src = '';
      resultImage.alt = 'Gambar tidak tersedia';
    }

    // Tampilkan hasil deteksi
    const result = data.result || [];
    if (Array.isArray(result) && result.length > 0) {
      resultList.innerHTML = '';
      result.forEach((item) => {
        const details = Object.entries(item)
          .map(([key, value]) => {
            const label = key
              .replace(/_/g, ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase());
            return `<strong>${label}</strong>: ${value}`;
          })
          .join('<br>');
        resultList.innerHTML += `
          <li>
            <div class="p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-200">
              ${details}
            </div>
          </li>`;
      });
    } else {
      resultList.innerHTML =
        '<li class="text-gray-600">Tidak ada informasi ikan yang terdeteksi.</li>';
    }

    function showModal(success = true, message = '') {
      const modal = document.getElementById('notification-modal');
      const icon = document.getElementById('modal-icon');
      const msg = document.getElementById('modal-message');
      const closeBtn = document.getElementById('close-modal');

      if (!modal || !icon || !msg || !closeBtn) return;

      icon.innerHTML = success
        ? '<i class="fas fa-check-circle"></i>'
        : '<i class="fas fa-times-circle"></i>';
      icon.className = `text-4xl mb-4 ${
        success ? 'text-green-600' : 'text-red-600'
      }`;

      msg.textContent = message;
      modal.classList.remove('hidden');

      closeBtn.onclick = () => {
        modal.classList.add('hidden');
      };
    }    

    // Validasi user login
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    let loggedInUser;
    try {
      if (!loggedInUserStr) throw new Error('Belum login');
      loggedInUser = JSON.parse(loggedInUserStr);
      if (!loggedInUser?.email || !loggedInUser?.name)
        throw new Error('Data user tidak lengkap');
    } catch (err) {
      saveButton.disabled = true;
      saveButton.title = 'Login dulu untuk menyimpan hasil scan';
      return;
    }

    // Aktifkan tombol simpan
    saveButton.disabled = false;
    saveButton.title = '';

    // Saat tombol simpan diklik
    saveButton.addEventListener('click', async () => {
      saveButton.disabled = true;

      try {
        // Pastikan data.result sudah berisi objek hasil scan lengkap
        const historyData = {
          email: loggedInUser.email,
          name: loggedInUser.name,
          imageData: data.imageData || '',
          result: data.result || [],
          savedAt: new Date().toISOString(),
        };

        await saveHistoryToDB(historyData);
        showModal(true, '✅ Hasil scan berhasil disimpan!');
      } catch (error) {
        showModal(false, '❌ Terjadi kesalahan saat menyimpan hasil scan.');
      } finally {
        saveButton.disabled = false;
      }
    });
    
    
    
  }
}
