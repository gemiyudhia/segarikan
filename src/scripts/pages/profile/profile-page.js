import { initDB, getAllHistoryFromDB } from '../../data/indexdb.js';

export default class ProfilePage {
  async render() {
    return `
<section class="relative px-4 py-20 bg-gradient-to-b from-blue-50 to-white min-h-[90vh]">
  <div class="container mx-auto max-w-6xl">
    <!-- Profile Header -->
    <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <div class="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div class="text-center md:text-left">
          <h1 class="text-3xl font-bold text-blue-700 mb-2" id="user-name">Nama Pengguna</h1>
          <p class="text-gray-600" id="user-email">email@example.com</p>
          <p class="text-sm text-gray-500 mt-1">Member sejak <span id="member-since">-</span></p>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Total Scan</p>
            <p class="text-2xl font-bold text-blue-700" id="total-scans">0</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Ikan Segar</p>
            <p class="text-2xl font-bold text-green-700" id="fresh-count">0</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Ikan Tidak Segar</p>
            <p class="text-2xl font-bold text-red-700" id="not-fresh-count">0</p>
          </div>
          <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
      
      <div id="history-container" class="space-y-4">
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="ml-3 text-gray-600">Memuat riwayat...</p>
        </div>
      </div>
      
      <!-- Empty State -->
      <div id="empty-state" class="hidden text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Belum Ada Riwayat Scan</h3>
        <p class="text-gray-500 mb-4">Mulai scan ikan pertama Anda untuk melihat riwayat di sini</p>
        <button id="start-scan-btn" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Mulai Scan Sekarang
        </button>
      </div>
    </div>
  </div>
</section>
    `;
  }

  async afterRender() {
    // Load user data
    this.loadUserData();

    // Initialize database
    await initDB();

    // Load and display history
    await this.loadHistory();
  }

  loadUserData() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      document.getElementById('user-name').textContent =
        userData.name || 'Nama Pengguna';
      document.getElementById('user-email').textContent =
        userData.email || 'email@example.com';

      // Set member since date (you can store this when user registers)
      const memberSince =
        userData.memberSince || new Date().toLocaleDateString();
      document.getElementById('member-since').textContent = memberSince;
    }
  }

  async loadHistory() {
    const historyContainer = document.getElementById('history-container');
    const emptyState = document.getElementById('empty-state');

    try {
      const historyList = await getAllHistoryFromDB();

      const loggedInUser = localStorage.getItem('loggedInUser');
      const userEmail = loggedInUser ? JSON.parse(loggedInUser).email : null;

      const filteredHistory = userEmail
        ? historyList.filter((item) => item.email === userEmail)
        : [];

      if (!filteredHistory || filteredHistory.length === 0) {
        historyContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
      } 

      // Calculate statistics
      this.calculateStatistics(filteredHistory);

      // Clear loading state
      historyContainer.innerHTML = '';
      emptyState.classList.add('hidden');

      // Sort by date (newest first)
      historyList.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));

      // Render each history item
      historyList.forEach((item, index) => {
        const date = new Date(item.savedAt);
        const dateStr = date.toLocaleString();
        const dateIso = date.toISOString();

        const result = item.result?.[0] || {};

        const confidence =
          result.confidence !== undefined
            ? (result.confidence * 100).toFixed(2) + '%'
            : '-';
        const freshness = result.freshness || '-';
        const recommendation = result.recommendation || '-';

        // Determine freshness status for styling
        const isFresh =
          freshness.toLowerCase().includes('segar') ||
          freshness.toLowerCase().includes('fresh');
        const statusColor = isFresh ? 'green' : 'red';
        const statusBg = isFresh
          ? 'bg-green-50 border-green-200'
          : 'bg-red-50 border-red-200';

        const html = `
          <div class="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-shadow ${statusBg}">
            <div class="flex flex-col md:flex-row md:items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-sm font-medium text-gray-500">Scan #${
                    historyList.length - index
                  }</span>
                  <span class="w-2 h-2 bg-${statusColor}-500 rounded-full"></span>
                  <span class="text-sm font-medium text-${statusColor}-700">${freshness}</span>
                </div>
                
                <p class="font-semibold text-blue-700 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <time datetime="${dateIso}">${dateStr}</time>
                </p>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span class="font-medium text-gray-700">Confidence:</span>
                    <span class="ml-1 text-gray-600">${confidence}</span>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700">Status:</span>
                    <span class="ml-1 text-${statusColor}-600 font-medium">${freshness}</span>
                  </div>
                  <div class="md:col-span-1">
                    <span class="font-medium text-gray-700">Rekomendasi:</span>
                    <span class="ml-1 text-gray-600">${recommendation}</span>
                  </div>
                </div>
              </div>
              
              ${
                item.imageData
                  ? `<div class="flex-shrink-0">
                       <img src="${item.imageData}" alt="Hasil Gambar Ikan" class="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg shadow-sm border">
                     </div>`
                  : ''
              }
            </div>
          </div>
        `;

        historyContainer.insertAdjacentHTML('beforeend', html);
      });
    } catch (error) {
      console.error('Error loading history:', error);
      historyContainer.innerHTML = `
        <div class="text-center py-8">
          <p class="text-red-600">Terjadi kesalahan saat memuat riwayat.</p>
        </div>
      `;
    }
  }

  calculateStatistics(historyList) {
    const totalScans = historyList.length;
    let freshCount = 0;
    let notFreshCount = 0;

    historyList.forEach((item) => {
      const result = item.result?.[0] || {};
      const freshness = result.freshness || '';

      if (
        freshness.toLowerCase().includes('segar') ||
        freshness.toLowerCase().includes('fresh')
      ) {
        freshCount++;
      } else {
        notFreshCount++;
      }
    });

    document.getElementById('total-scans').textContent = totalScans;
    document.getElementById('fresh-count').textContent = freshCount;
    document.getElementById('not-fresh-count').textContent = notFreshCount;
  }
}
