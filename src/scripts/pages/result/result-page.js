// Example ResultPage class untuk handle data dari scan
export default class ResultPage {
  async render() {
    return `
      <section class="px-4 py-8 bg-gradient-to-b from-blue-50 to-white min-h-[80vh] mt-16">
        <div class="max-w-2xl mx-auto">
          <div class="bg-white rounded-xl shadow-lg p-6">
            <div class="text-center mb-6">
              <h1 class="text-3xl font-bold text-blue-700 mb-2">Hasil Analisis</h1>
              <p class="text-gray-600">Hasil prediksi kesegaran ikan</p>
            </div>
            
            <div id="result-content">
              <div class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Memuat hasil...</p>
              </div>
            </div>
            
            <div class="mt-6 text-center">
              <button id="back-button" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                <i class="fas fa-arrow-left mr-2"></i>
                Kembali ke Scan
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log('📊 ResultPage afterRender started');

    const resultContent = document.getElementById('result-content');
    const backButton = document.getElementById('back-button');

    // Get scan result data
    let scanResult = null;

    try {
      // Try sessionStorage first
      const storedResult = sessionStorage.getItem('scanResult');
      if (storedResult) {
        scanResult = JSON.parse(storedResult);
      } else if (window.scanResult) {
        // Fallback to window object
        scanResult = window.scanResult;
      }
    } catch (error) {
      console.error('❌ Error loading scan result:', error);
    }

    if (scanResult && scanResult.result && scanResult.result.length > 0) {
      console.log('✅ Displaying scan result:', scanResult);
      displayResult(scanResult);
    } else {
      console.log('⚠️ No scan result found, redirecting to scan');
      resultContent.innerHTML = `
        <div class="text-center text-red-600">
          <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
          <p class="mb-4">Tidak ada hasil scan yang ditemukan.</p>
          <button onclick="window.location.hash = '#/scan'" class="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Kembali ke Scan
          </button>
        </div>
      `;
    }

    function displayResult(data) {
      const result = data.result[0]; // Ambil hasil pertama
      const freshness = result.freshness;
      const confidence =
        result.confidence_percentage || result.confidence * 100;
      const recommendation = result.recommendation || '';

      // Tentukan warna dan icon berdasarkan kesegaran
      const freshnessColor =
        freshness === 'Segar' ? 'text-green-600' : 'text-red-600';
      const freshnessIcon =
        freshness === 'Segar'
          ? 'fas fa-check-circle'
          : 'fas fa-exclamation-triangle';
      const backgroundColorClass =
        freshness === 'Segar'
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200';

      resultContent.innerHTML = `
        <div class="space-y-6">
          <!-- Gambar hasil -->
          <div class="text-center">
            <img src="${
              data.imageData
            }" alt="Scanned Fish" class="max-h-64 mx-auto rounded-lg shadow-md">
          </div>
          
          <!-- Hasil utama -->
          <div class="border-2 ${backgroundColorClass} rounded-lg p-6">
            <div class="text-center mb-4">
              <i class="${freshnessIcon} text-6xl ${freshnessColor} mb-4"></i>
              <h2 class="text-3xl font-bold ${freshnessColor}">${freshness}</h2>
              <p class="text-lg text-gray-600 mt-2">Tingkat Keyakinan: ${confidence.toFixed(
                1
              )}%</p>
            </div>
            
            <!-- Progress bar confidence -->
            <div class="mb-4">
              <div class="bg-gray-200 rounded-full h-3">
                <div class="h-3 rounded-full transition-all duration-500 ${
                  freshness === 'Segar' ? 'bg-green-500' : 'bg-red-500'
                }" 
                     style="width: ${confidence}%"></div>
              </div>
            </div>
            
            ${
              recommendation
                ? `
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                <h3 class="font-semibold text-gray-800 mb-2">📋 Rekomendasi:</h3>
                <p class="text-gray-700">${recommendation}</p>
              </div>
            `
                : ''
            }
          </div>
          
          <!-- Detail informasi -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">🐟 Jenis Ikan</h3>
              <p class="text-gray-700">${result.fish_type || 'Ikan Umum'}</p>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-semibold text-gray-800 mb-2">⏰ Waktu Scan</h3>
              <p class="text-gray-700">${new Date(
                data.timestamp
              ).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
      `;
    }

    // Back button handler
    backButton.addEventListener('click', () => {
      // Clear stored result
      try {
        sessionStorage.removeItem('scanResult');
        delete window.scanResult;
      } catch (e) {
        console.log('Could not clear stored result');
      }

      window.location.hash = '#/scan';
    });
  }
}
