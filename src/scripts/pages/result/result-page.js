export default class ResultPage {
  async render() {
    return `
      <section class="min-h-screen flex items-center justify-center bg-blue-50 px-4 mt-10">
        <div class="max-w-xl w-full bg-white p-8 rounded-xl shadow text-center">
          <h2 class="text-2xl font-bold text-blue-700 mb-4">Hasil Deteksi Kesegaran Ikan</h2>
          <div id="result-content" class="text-gray-800 text-left space-y-4">
            Memuat hasil...
          </div>
          <div class="mt-6 text-center">
            <a href="#/scan" class="text-blue-600 hover:underline">Scan Ulang</a>
          </div>
        </div>
      </section>
    `
  }

  async afterRender() {
    let result;
    try {
      const stored = localStorage.getItem('scanResult');
      result = stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Gagal memuat data dari localStorage:", e);
    }

    const fallback = {
      prediction: 'Kurang Segar',
      confidence: 0.78,
      fishType: 'Ikan Kembung',
      timestamp: new Date().toLocaleString('id-ID', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      recommendation: 'Segera dimasak hari ini atau dibekukan untuk mencegah pembusukan.',
      image: '', // fallback tanpa gambar
    }

    result = result || fallback;

    const colorMap = {
      'Segar': 'text-green-600 border-green-500 bg-green-100',
      'Kurang Segar': 'text-yellow-700 border-yellow-500 bg-yellow-100',
      'Tidak Segar': 'text-red-600 border-red-500 bg-red-100'
    }

    const resultClass = colorMap[result.prediction] || 'text-gray-700 border-gray-300 bg-gray-100'

    const content = document.getElementById('result-content')

    content.innerHTML = `
      <div class="rounded-lg p-4 border ${resultClass}">
        <h3 class="text-lg font-semibold mb-1">Status Kesegaran:</h3>
        <p class="text-2xl font-bold">${result.prediction}</p>
      </div>

      <div>
        <h4 class="font-medium text-gray-700">Jenis Ikan:</h4>
        <p>${result.fishType}</p>
      </div>

      <div>
        <h4 class="font-medium text-gray-700">Akurasi AI:</h4>
        <p>${Math.round(result.confidence * 100)}%</p>
      </div>

      <div>
        <h4 class="font-medium text-gray-700">Waktu Analisis:</h4>
        <p>${result.timestamp}</p>
      </div>

      <div>
        <h4 class="font-medium text-gray-700">Saran Penggunaan:</h4>
        <p>${result.recommendation}</p>
      </div>

      ${result.image ? `
      <div>
        <h4 class="font-medium text-gray-700">Gambar Hasil Scan:</h4>
        <img src="${result.image}" alt="Gambar Hasil" class="rounded-lg mt-2 shadow max-h-64 w-full object-contain" />
      </div>` : ''}
    `
  }
}
