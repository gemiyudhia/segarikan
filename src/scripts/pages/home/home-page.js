export default class HomePage {
  async render() {
    return `
<section class="relative px-4 py-20 bg-gradient-to-b from-blue-50 to-white min-h-[90vh] flex items-center justify-center overflow-hidden">
  <div class="container mx-auto max-w-6xl relative mt-20">
    <div class="flex flex-col md:flex-row items-center gap-12">
      
      <!-- Left Content -->
      <div class="text-left md:w-1/2">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-700 mb-4 leading-tight">
          Segarikan: Deteksi Kesegaran Ikan Secara Instan
        </h1>
        <p class="text-gray-700 text-lg mb-8 leading-relaxed max-w-xl">
          Sistem berbasis web untuk mendeteksi kesegaran ikan secara cepat dan akurat menggunakan teknologi AI canggih. Dapatkan hasil dalam hitungan detik.
        </p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a href="#/scan" class="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition transform hover:-translate-y-1 shadow-lg text-lg font-medium">
            Scan Kesegaran Ikan
          </a>
        </div>
      </div>

      <!-- Right Image -->
      <div class="md:w-1/2 md:flex justify-center hidden">
        <img src="fish.png" alt="Ilustrasi Ikan Segar" class="w-full max-w-sm" />
      </div>

    </div>
  </div>
</section>


    <!-- Features Section -->
    <section class="px-4 py-16 bg-white">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-12">
          <span class="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-3">FITUR UNGGULAN</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Kenapa Memilih Segarikan?</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">Segarikan menggunakan teknologi terdepan untuk memastikan Anda mendapatkan hasil yang akurat dan cepat.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="bg-white rounded-xl shadow-lg hover:shadow-xl p-8 border-t-4 border-blue-600 group hover:-translate-y-2 transform transition duration-300">
            <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-blue-700 mb-3">Akurasi Tinggi</h3>
            <p class="text-gray-600 leading-relaxed">Model AI kami dilatih dengan ribuan sampel ikan untuk mengenali kesegaran dengan akurasi hingga 98.5% (masih ngasal).</p>
            
          </div>
          
          <!-- Feature 2 -->
          <div class="bg-white rounded-xl shadow-lg hover:shadow-xl  p-8 border-t-4 border-blue-600 group hover:-translate-y-2 transform transition duration-300">
            <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-blue-700 mb-3">Mudah Digunakan</h3>
            <p class="text-gray-600 leading-relaxed">Cukup unggah gambar ikan atau ambil foto langsung dari kamera dan dapatkan hasil analisis dalam hitungan detik.</p>
            
          </div>
          
          <!-- Feature 3 -->
          <div class="bg-white rounded-xl shadow-lg hover:shadow-xl p-8 border-t-4 border-blue-600 group hover:-translate-y-2 transform transition duration-300">
            <div class="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-blue-700 mb-3">Ramah Lingkungan</h3>
            <p class="text-gray-600 leading-relaxed">Bantu kurangi pemborosan makanan dengan konsumsi ikan yang lebih cerdas dan bertanggung jawab.</p>
            
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="px-4 py-16 bg-blue-50">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-12">
          <span class="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium text-sm mb-3">CARA KERJA</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Deteksi Kesegaran Ikan dalam 3 Langkah Mudah</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">Proses yang sederhana dan cepat untuk mengetahui kesegaran ikan Anda.</p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="relative">
            <div class="bg-white rounded-xl shadow-md p-8 relative z-10">
              <div class="w-12 h-12 bg-blue-600 rounded-full text-white text-xl font-bold flex items-center justify-center mb-6">1</div>
              <h3 class="text-xl font-bold text-blue-700 mb-3">Unggah Gambar</h3>
              <p class="text-gray-600">Ambil foto ikan atau unggah gambar yang sudah ada ke sistem kami.</p>
            </div>
            
          </div>
          
          <!-- Step 2 -->
          <div class="relative">
            <div class="bg-white rounded-xl shadow-md p-8 relative z-10">
              <div class="w-12 h-12 bg-blue-600 rounded-full text-white text-xl font-bold flex items-center justify-center mb-6">2</div>
              <h3 class="text-xl font-bold text-blue-700 mb-3">Proses AI</h3>
              <p class="text-gray-600">Sistem AI kami akan menganalisis gambar dan mendeteksi tingkat kesegaran ikan.</p>
            </div>
            
          </div>
          
          <!-- Step 3 -->
          <div>
            <div class="bg-white rounded-xl shadow-md p-8">
              <div class="w-12 h-12 bg-blue-600 rounded-full text-white text-xl font-bold flex items-center justify-center mb-6">3</div>
              <h3 class="text-xl font-bold text-blue-700 mb-3">Dapatkan Hasil</h3>
              <p class="text-gray-600">Terima laporan detail tentang kesegaran ikan dan rekomendasi penggunaan.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
  }

  async afterRender() {
    // Do your job here
  }
}
