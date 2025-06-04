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

            <!-- Warning untuk gambar bukan ikan -->
            <div id="fish-warning" class="hidden mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-exclamation-triangle text-red-400 text-xl"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">
                    Peringatan: Gambar Bukan Ikan
                  </h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>Gambar yang Anda upload tampaknya bukan gambar ikan. Untuk hasil yang optimal, silakan upload gambar ikan yang jelas.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Warning untuk confidence rendah -->
            <div id="low-confidence-warning" class="hidden mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <i class="fas fa-exclamation-circle text-yellow-400 text-xl"></i>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-yellow-800">
                    Peringatan: Kepercayaan Rendah
                  </h3>
                  <div class="mt-2 text-sm text-yellow-700">
                    <p>Hasil deteksi memiliki tingkat kepercayaan yang rendah. Coba upload gambar ikan yang lebih jelas atau dengan pencahayaan yang baik.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hasil deteksi - hanya ditampilkan jika gambar adalah ikan -->
            <div id="result-content" class="text-left">
              <h2 class="text-xl font-semibold text-gray-700 mb-4">Detail Hasil:</h2>
              <div id="result-list" class="space-y-4"></div>
            </div>

            <!-- Pesan untuk non-fish images -->
            <div id="non-fish-message" class="hidden text-center">
            
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
    const fishWarning = document.getElementById('fish-warning');
    const lowConfidenceWarning = document.getElementById(
      'low-confidence-warning'
    );
    const resultContent = document.getElementById('result-content');
    const nonFishMessage = document.getElementById('non-fish-message');

    if (!resultImage || !resultList || !saveButton) {
      return;
    }

    let data;
    const storedData = sessionStorage.getItem('scanResult');
    if (!storedData) {
      resultList.innerHTML =
        '<div class="text-red-600 p-4 bg-red-50 rounded-lg">Data hasil tidak ditemukan.</div>';
      return;
    }

    try {
      data = JSON.parse(storedData);
    } catch {
      resultList.innerHTML =
        '<div class="text-red-600 p-4 bg-red-50 rounded-lg">Data hasil rusak.</div>';
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

    // Function to check if image is likely a fish - IMPROVED VERSION
    const checkIfFishImage = (results) => {

      if (!Array.isArray(results) || results.length === 0) {
        return { isFish: false, maxConfidence: 0, reason: 'no_detection' };
      }

      let maxConfidence = 0;
      let fishDetected = false;
      let nonFishDetected = false;
      let detectedTypes = [];

      results.forEach((item) => {
        const score = parseFloat(item.score || 0);
        const type = (item.type || '').toLowerCase().trim();

        maxConfidence = Math.max(maxConfidence, score);
        detectedTypes.push({ type, score });


        // Expanded fish keywords (including Indonesian terms)
        const fishKeywords = [
          'fish',
          'ikan',
          'tuna',
          'salmon',
          'cod',
          'mackerel',
          'snapper',
          'grouper',
          'bass',
          'trout',
          'sardine',
          'anchovy',
          'herring',
          'mahi',
          'swordfish',
          'marlin',
          'flounder',
          'sole',
          'halibut',
          'catfish',
          'carp',
          'pike',
          'perch',
          'tilapia',
          'barramundi',
          'sea bass',
          'red snapper',
          'yellowtail',
          'amberjack',
          // Indonesian fish names
          'bandeng',
          'gurame',
          'lele',
          'nila',
          'kakap',
          'tenggiri',
          'tongkol',
          'cakalang',
          'kembung',
          'patin',
          'bawal',
          'belut',
        ];

        // Expanded non-fish keywords
        const nonFishKeywords = [
          'person',
          'orang',
          'manusia',
          'human',
          'people',
          'cat',
          'kucing',
          'dog',
          'anjing',
          'bird',
          'burung',
          'car',
          'mobil',
          'vehicle',
          'kendaraan',
          'building',
          'gedung',
          'bangunan',
          'house',
          'rumah',
          'food',
          'makanan',
          'meal',
          'dish',
          'hidangan',
          'object',
          'objek',
          'thing',
          'barang',
          'hand',
          'tangan',
          'finger',
          'jari',
          'face',
          'wajah',
          'muka',
          'plant',
          'tanaman',
          'tree',
          'pohon',
          'bottle',
          'botol',
          'cup',
          'gelas',
          'phone',
          'handphone',
          'smartphone',
          'table',
          'meja',
          'chair',
          'kursi',
          'book',
          'buku',
          'paper',
          'kertas',
          'cloth',
          'baju',
          'shirt',
          'kemeja',
        ];

        // Check for fish keywords
        if (fishKeywords.some((keyword) => type.includes(keyword))) {
          fishDetected = true;
        }

        // Check for non-fish keywords
        if (nonFishKeywords.some((keyword) => type.includes(keyword))) {
          nonFishDetected = true;
        }

        // Special case: if type is "bukan_ikan" or similar
        if (type.includes('bukan') && type.includes('ikan')) {
          nonFishDetected = true;
        }
      });


      // Decision logic - STRICTER for non-fish detection

      // Case 1: Explicit non-fish detected with reasonable confidence
      if (nonFishDetected && maxConfidence >= 0.3) {
        return {
          isFish: false,
          maxConfidence,
          reason: 'non_fish_detected',
          detectedTypes,
        };
      }

      // Case 2: No fish detected and low overall confidence
      if (!fishDetected && maxConfidence < 0.4) {
        return {
          isFish: false,
          maxConfidence,
          reason: 'low_confidence_no_fish',
          detectedTypes,
        };
      }

      // Case 3: Fish detected with reasonable confidence
      if (fishDetected && maxConfidence >= 0.3) {
        return {
          isFish: true,
          maxConfidence,
          reason: 'fish_detected',
          detectedTypes,
        };
      }

      // Case 4: Uncertain - use stricter threshold
      const isLikelyFish = maxConfidence >= 0.6 && !nonFishDetected;


      return {
        isFish: isLikelyFish,
        maxConfidence,
        reason: 'uncertain',
        detectedTypes,
      };
    };

    // Tampilkan hasil deteksi
    const result = data.result || [];
    const fishCheck = checkIfFishImage(result);


    // Handle non-fish images
    if (!fishCheck.isFish) {

      // Show warning
      fishWarning.classList.remove('hidden');

      // Update warning message based on reason
      const warningText = fishWarning.querySelector('p');
      switch (fishCheck.reason) {
        case 'no_detection':
          warningText.textContent =
            'Tidak ada objek yang terdeteksi dalam gambar. Pastikan gambar ikan terlihat jelas dan tidak buram.';
          break;
        case 'non_fish_detected':
          warningText.textContent =
            'Gambar yang terdeteksi bukan ikan. Silakan upload gambar ikan untuk mendapatkan hasil yang akurat.';
          break;
        case 'low_confidence_no_fish':
          warningText.textContent =
            'Gambar tidak dapat diidentifikasi sebagai ikan dengan baik. Coba gunakan gambar ikan yang lebih jelas.';
          break;
        default:
          warningText.textContent =
            'Gambar yang Anda upload tampaknya bukan gambar ikan. Untuk hasil yang optimal, silakan upload gambar ikan yang jelas.';
      }

      // Hide result content and show non-fish message
      resultContent.classList.add('hidden');
      nonFishMessage.classList.remove('hidden');

      // Disable save button for non-fish images
      saveButton.disabled = true;
      saveButton.classList.add('opacity-50', 'cursor-not-allowed');
      saveButton.title =
        'Tidak dapat menyimpan hasil scan karena gambar bukan ikan';



      return; // Exit early, don't show results
    }


    resultContent.classList.remove('hidden');
    nonFishMessage.classList.add('hidden');
    fishWarning.classList.add('hidden');

    // Show low confidence warning if needed
    if (fishCheck.maxConfidence < 0.6) {
      lowConfidenceWarning.classList.remove('hidden');
    }

    // Helper functions
    const formatScore = (score) => {
      if (score === undefined || score === null) return 'N/A';
      const percentage = (parseFloat(score) * 100).toFixed(1);
      return `${percentage}%`;
    };

    const getConfidenceColor = (score) => {
      if (score === undefined || score === null) return 'gray';
      const percentage = parseFloat(score) * 100;
      if (percentage >= 80) return 'green';
      if (percentage >= 60) return 'yellow';
      return 'red';
    };

    const getConfidenceText = (score) => {
      if (score === undefined || score === null) return 'Tidak diketahui';
      const percentage = parseFloat(score) * 100;
      if (percentage >= 80) return 'Tinggi';
      if (percentage >= 60) return 'Sedang';
      return 'Rendah';
    };

    // Display results for fish images
    if (Array.isArray(result) && result.length > 0) {
      resultList.innerHTML = '';
      result.forEach((item, index) => {
        let resultHtml = '';

        if (item.step && item.type && item.score !== undefined) {
          const confidenceColor = getConfidenceColor(item.score);
          const confidenceText = getConfidenceText(item.score);

          resultHtml = `
            <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold text-blue-700">
                  <i class="fas fa-fish mr-2"></i>Hasil Deteksi #${index + 1}
                </h3>
                <span class="text-sm text-gray-500">${
                  item.step || 'Analisis'
                }</span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-700">Jenis Ikan:</span>
                    <span class="text-blue-600 font-semibold">${
                      item.type || 'Tidak diketahui'
                    }</span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-700">Akurasi:</span>
                    <span class="text-${confidenceColor}-600 font-semibold">${formatScore(
            item.score
          )}</span>
                  </div>
                  
                  <div class="flex justify-between items-center">
                    <span class="font-medium text-gray-700">Tingkat Kepercayaan:</span>
                    <span class="text-${confidenceColor}-600 font-medium">${confidenceText}</span>
                  </div>
                </div>
                
                <div class="flex items-center justify-center">
                  <div class="w-20 h-20 rounded-full bg-${confidenceColor}-100 flex items-center justify-center">
                    <span class="text-2xl font-bold text-${confidenceColor}-600">${formatScore(
            item.score
          )}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        } else {
          // Handle other formats (legacy support)
          const details = Object.entries(item)
            .map(([key, value]) => {
              const label = key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());

              if (
                key.toLowerCase().includes('score') ||
                key.toLowerCase().includes('confidence')
              ) {
                const formattedValue = formatScore(value);
                const confidenceColor = getConfidenceColor(value);
                return `<div class="flex justify-between items-center">
                  <span class="font-medium text-gray-700">${label}:</span>
                  <span class="text-${confidenceColor}-600 font-semibold">${formattedValue}</span>
                </div>`;
              }

              return `<div class="flex justify-between items-center">
                <span class="font-medium text-gray-700">${label}:</span>
                <span class="text-blue-600 font-semibold">${value}</span>
              </div>`;
            })
            .join('');

          resultHtml = `
            <div class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200">
              <h3 class="text-lg font-semibold text-blue-700 mb-4">
                <i class="fas fa-fish mr-2"></i>Hasil Deteksi #${index + 1}
              </h3>
              <div class="space-y-2">
                ${details}
              </div>
            </div>
          `;
        }

        resultList.innerHTML += resultHtml;
      });
    } else {
      resultList.innerHTML =
        '<div class="text-gray-600 p-6 bg-gray-50 rounded-xl text-center">Tidak ada informasi ikan yang terdeteksi.</div>';
    }

    // Modal function
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

    // Setup save button for logged in users
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    let loggedInUser;
    try {
      if (!loggedInUserStr) throw new Error('Belum login');
      loggedInUser = JSON.parse(loggedInUserStr);
      if (!loggedInUser?.email || !loggedInUser?.name)
        throw new Error('Data user tidak lengkap');
    } catch (err) {
      saveButton.disabled = true;
      saveButton.classList.add('opacity-50', 'cursor-not-allowed');
      saveButton.title = 'Login dulu untuk menyimpan hasil scan';
      return;
    }

    // Enable save button for fish images
    saveButton.disabled = false;
    saveButton.classList.remove('opacity-50', 'cursor-not-allowed');
    saveButton.title = '';

    // Save button event listener
    saveButton.addEventListener('click', async () => {
      saveButton.disabled = true;

      try {
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
