export default class ScanPage {
  async render() {
    return `
      <section class="px-4 py-8 bg-gradient-to-b from-blue-50 to-white min-h-[80vh] mt-16">
        <div class="max-w-lg mx-auto">
          <div class="text-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-blue-700 mb-3">Scan Kesegaran Ikan</h1>
            <p class="text-gray-600 max-w-md mx-auto">Gunakan kamera atau unggah gambar ikan untuk memeriksa kesegarannya secara instan.</p>
          </div>
          
          <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex border-b border-gray-200 mb-6">
              <button id="camera-tab" class="flex-1 py-3 font-medium text-blue-700 border-b-2 border-blue-700">
                <i class="fas fa-camera mr-2"></i> Kamera
              </button>
              <button id="upload-tab" class="flex-1 py-3 font-medium text-gray-500 hover:text-blue-600 transition">
                <i class="fas fa-upload mr-2"></i> Unggah Gambar
              </button>
            </div>

            <!-- Camera View -->
            <div id="camera-view" class="mb-4">
              <div class="relative rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
                <video id="camera-stream" autoplay playsinline class="w-full h-full object-cover"></video>
                <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white hidden" id="camera-placeholder">
                  <div class="text-center">
                    <i class="fas fa-camera text-3xl mb-2"></i>
                    <p>Kamera tidak tersedia</p>
                  </div>
                </div>
              </div>
              <button id="scan-button" class="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-medium" disabled>
                <i class="fas fa-search-plus mr-2"></i> Scan Ikan
              </button>
              <p id="detection-status" class="text-center font-semibold text-lg mt-2"></p>
            </div>

            <!-- Upload View -->
            <div id="upload-view" class="mb-4 hidden">
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center" id="drop-area">
                <input type="file" id="file-input" accept="image/*" class="hidden">
                <div class="mb-4">
                  <i class="fas fa-cloud-upload-alt text-blue-500 text-4xl"></i>
                </div>
                <p class="text-gray-600 mb-2">Tarik dan lepas gambar ikan di sini</p>
                <p class="text-gray-500 text-sm mb-4">atau</p>
                <button id="browse-button" class="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition font-medium">
                  Pilih File
                </button>
                <div id="preview-container" class="mt-4 hidden">
                  <p class="text-sm text-gray-600 mb-2">Preview:</p>
                  <img id="image-preview" class="max-h-48 mx-auto rounded-lg shadow-sm" alt="Preview">
                </div>
              </div>
              <button id="upload-scan-button" class="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <i class="fas fa-search-plus mr-2"></i> Scan Gambar
              </button>
            </div>
          </div>

          <div id="loading-overlay" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white p-6 rounded-xl shadow-lg text-center">
              <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto"></div>
              <p class="text-gray-700 font-medium">Memproses gambar...</p>
            </div>
          </div>

          <canvas id="snapshot" class="hidden"></canvas>
        </div>
      </section>
    `;
  }

  async afterRender() {
    console.log('🚀 ScanPage afterRender started');

    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('snapshot');
    const scanButton = document.getElementById('scan-button');
    const cameraTab = document.getElementById('camera-tab');
    const uploadTab = document.getElementById('upload-tab');
    const cameraView = document.getElementById('camera-view');
    const uploadView = document.getElementById('upload-view');
    const fileInput = document.getElementById('file-input');
    const browseButton = document.getElementById('browse-button');
    const dropArea = document.getElementById('drop-area');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const uploadScanButton = document.getElementById('upload-scan-button');
    const cameraPlaceholder = document.getElementById('camera-placeholder');
    const loadingOverlay = document.getElementById('loading-overlay');
    const detectionStatus = document.getElementById('detection-status');

    let selectedFile = null;
    let detectionInterval = null;
    let fishDetected = false;
    let currentImageData = null;

    detectionStatus.textContent = '';
    detectionStatus.className = 'text-center font-semibold text-lg mt-2';

    const API_BASE = 'http://127.0.0.1:9000/api';

    // Function to make API call to check fish
    const checkFishWithAPI = async (imageData, endpoint = 'predict') => {
      console.log(`🌐 Making API call to /${endpoint}`);

      try {
        const response = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageData }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`📊 API response from /${endpoint}:`, data);
        return data;
      } catch (error) {
        console.error(`❌ API error for /${endpoint}:`, error);

        // Fallback to /check_fish if /predict fails
        if (endpoint === 'predict') {
          console.log('🔄 Trying fallback route /check_fish');
          return await checkFishWithAPI(imageData, 'check_fish');
        }

        throw error;
      }
    };

    // Function to navigate to result page with data
    const navigateToResult = (resultData, imageData) => {
      console.log('📄 Navigating to result page with data:', resultData);

      try {
        // Store result data in sessionStorage for the result page
        const resultToStore = {
          ...resultData,
          imageData: imageData,
          timestamp: new Date().toISOString(),
        };

        console.log('💾 Storing result in sessionStorage:', resultToStore);
        sessionStorage.setItem('scanResult', JSON.stringify(resultToStore));

        // Navigate to result page
        console.log('🔄 Changing hash to #/result');
        window.location.hash = '#/result';
      } catch (error) {
        console.error('❌ Error in navigateToResult:', error);
        alert('Terjadi kesalahan saat menyimpan hasil scan');
      }
    };

    // Function to process API response and extract valid results
    const processAPIResponse = (data) => {
      console.log('🔍 Processing API response:', data);
      console.log('📋 Response keys:', Object.keys(data));

      // Debug semua properti response
      for (const [key, value] of Object.entries(data)) {
        console.log(`📋 ${key}:`, value, `(type: ${typeof value})`);
      }

      // Check berbagai kemungkinan format response
      let hasValidResult = false;
      let resultToUse = null;

      // Format 1: data.result (array)
      if (data.result && Array.isArray(data.result) && data.result.length > 0) {
        console.log('✅ Format 1: Found data.result array');
        hasValidResult = true;
        resultToUse = data;
      }
      // Format 2: data langsung adalah array
      else if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Format 2: Data is direct array');
        hasValidResult = true;
        resultToUse = { result: data };
      }
      // Format 3: data.predictions atau data.detections
      else if (
        (data.predictions && data.predictions.length > 0) ||
        (data.detections && data.detections.length > 0)
      ) {
        console.log('✅ Format 3: Found predictions/detections');
        hasValidResult = true;
        resultToUse = {
          result: data.predictions || data.detections,
        };
      }
      // Format 4: data.fish_type atau data.freshness langsung ada
      else if (
        data.fish_type ||
        data.freshness ||
        data.type ||
        data.class ||
        data.species
      ) {
        console.log('✅ Format 4: Found direct fish data');
        hasValidResult = true;
        resultToUse = {
          result: [data],
        };
      }
      // Format 5: cek jika ada property yang mengandung array
      else {
        console.log('🔍 Checking for arrays in response...');
        for (const [key, value] of Object.entries(data)) {
          if (Array.isArray(value) && value.length > 0) {
            console.log(`✅ Format 5: Found array in ${key}`);
            hasValidResult = true;
            resultToUse = { result: value };
            break;
          }
        }
      }

      return { hasValidResult, resultToUse };
    };

    const initCamera = async () => {
      console.log('📷 Initializing camera...');
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          video.srcObject = stream;
          cameraPlaceholder.classList.add('hidden');
          scanButton.disabled = true;
          detectionStatus.textContent = '🔄 Mendeteksi ikan...';
          detectionStatus.className =
            'text-gray-700 font-semibold text-lg mt-2';
          console.log('✅ Camera initialized successfully');
          startFishDetection();
        } catch (err) {
          console.error('❌ Camera initialization failed:', err);
          cameraPlaceholder.classList.remove('hidden');
          scanButton.disabled = true;
          stopFishDetection();
          detectionStatus.textContent = '⚠️ Kamera tidak tersedia';
          detectionStatus.className = 'text-red-600 font-semibold text-lg mt-2';
        }
      } else {
        console.error('❌ Camera not supported');
        cameraPlaceholder.classList.remove('hidden');
        scanButton.disabled = true;
        detectionStatus.textContent = '⚠️ Kamera tidak didukung browser';
        detectionStatus.className = 'text-red-600 font-semibold text-lg mt-2';
      }
    };

    const stopFishDetection = () => {
      console.log('⏹️ Stopping fish detection');
      if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
      }
    };

    const startFishDetection = () => {
      console.log('🔍 Starting fish detection');
      if (detectionInterval) clearInterval(detectionInterval);

      detectionInterval = setInterval(async () => {
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.6);
        currentImageData = base64Image;

        try {
          console.log('🔍 Sending detection request...');
          const data = await checkFishWithAPI(base64Image);

          if (data.fishDetected && !fishDetected) {
            fishDetected = true;
            detectionStatus.textContent = '✅ Ikan terdeteksi!';
            detectionStatus.className =
              'text-green-600 font-semibold text-lg mt-2';
            scanButton.disabled = false;
            console.log('🐟 Fish detected! Scan button enabled');
          } else if (!data.fishDetected) {
            fishDetected = false;
            detectionStatus.textContent = '🔄 Mendeteksi ikan...';
            detectionStatus.className =
              'text-gray-700 font-semibold text-lg mt-2';
            scanButton.disabled = true;
          }
        } catch (error) {
          console.error('❌ Fish detection error:', error);
          detectionStatus.textContent = '❌ Terjadi kesalahan saat mendeteksi';
          detectionStatus.className = 'text-red-600 font-semibold text-lg mt-2';
          scanButton.disabled = true;
        }
      }, 2000);
    };

    scanButton.addEventListener('click', async () => {
      console.log('🎯 Scan button clicked!');
      scanButton.disabled = true;
      detectionStatus.textContent = '';
      loadingOverlay.classList.remove('hidden');

      try {
        console.log('📸 Capturing image from camera...');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);

        console.log('🌐 Sending scan request to API...');
        const data = await checkFishWithAPI(base64Image);

        const { hasValidResult, resultToUse } = processAPIResponse(data);

        if (hasValidResult && resultToUse) {
          console.log('✅ Valid result found, navigating to result page');
          stopFishDetection();

          if (video.srcObject) {
            video.srcObject.getTracks().forEach((track) => track.stop());
          }

          navigateToResult(resultToUse, base64Image);
        } else {
          console.log('⚠️ No valid result found');
          detectionStatus.textContent = '⚠️ Tidak dapat mendeteksi jenis ikan.';
          detectionStatus.className = 'text-red-600 font-semibold text-lg mt-2';
        }
      } catch (error) {
        console.error('❌ Scan error:', error);
        detectionStatus.textContent = '⚠️ Gagal memproses scan.';
        detectionStatus.className = 'text-red-600 font-semibold text-lg mt-2';
      } finally {
        console.log('🔄 Hiding loading overlay');
        loadingOverlay.classList.add('hidden');
        scanButton.disabled = false;
      }
    });

    // Tab toggle
    cameraTab.addEventListener('click', () => {
      console.log('📷 Camera tab clicked');
      cameraTab.classList.add('text-blue-700', 'border-b-2', 'border-blue-700');
      cameraTab.classList.remove('text-gray-500');
      uploadTab.classList.remove(
        'text-blue-700',
        'border-b-2',
        'border-blue-700'
      );
      uploadTab.classList.add('text-gray-500');
      cameraView.classList.remove('hidden');
      uploadView.classList.add('hidden');
      detectionStatus.textContent = '';
      initCamera();
    });

    uploadTab.addEventListener('click', () => {
      console.log('📤 Upload tab clicked');
      uploadTab.classList.add('text-blue-700', 'border-b-2', 'border-blue-700');
      uploadTab.classList.remove('text-gray-500');
      cameraTab.classList.remove(
        'text-blue-700',
        'border-b-2',
        'border-blue-700'
      );
      cameraTab.classList.add('text-gray-500');
      uploadView.classList.remove('hidden');
      cameraView.classList.add('hidden');
      detectionStatus.textContent = '';
      stopFishDetection();
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
    });

    // Upload file
    browseButton.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files[0]) {
        selectedFile = fileInput.files[0];
        const url = URL.createObjectURL(selectedFile);
        imagePreview.src = url;
        previewContainer.classList.remove('hidden');
        uploadScanButton.disabled = false;
        detectionStatus.textContent = '';
        console.log('📁 File selected:', selectedFile.name);
      } else {
        selectedFile = null;
        previewContainer.classList.add('hidden');
        uploadScanButton.disabled = true;
      }
    });

    // Drag & drop file support
    dropArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.classList.add('border-blue-500', 'bg-blue-50');
    });

    dropArea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
    });

    dropArea.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.classList.remove('border-blue-500', 'bg-blue-50');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        selectedFile = e.dataTransfer.files[0];
        fileInput.files = e.dataTransfer.files;
        const url = URL.createObjectURL(selectedFile);
        imagePreview.src = url;
        previewContainer.classList.remove('hidden');
        uploadScanButton.disabled = false;
        detectionStatus.textContent = '';
        console.log('🗂️ File dropped:', selectedFile.name);
      }
    });

    uploadScanButton.addEventListener('click', async () => {
      if (!selectedFile) return;

      console.log('📤 Upload scan button clicked');
      uploadScanButton.disabled = true;
      loadingOverlay.classList.remove('hidden');
      detectionStatus.textContent = '';

      try {
        console.log('📖 Reading file as base64...');
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });

        console.log('🌐 Sending upload scan request to API...');
        const data = await checkFishWithAPI(base64Image);

        const { hasValidResult, resultToUse } = processAPIResponse(data);

        if (hasValidResult && resultToUse) {
          console.log(
            '✅ Valid upload result found, navigating to result page'
          );
          navigateToResult(resultToUse, base64Image);
        } else {
          console.log('⚠️ No valid upload result found');
          detectionStatus.textContent = '⚠️ Tidak dapat mendeteksi jenis ikan.';
          detectionStatus.className = 'text-red-600 font-semibold text-lg mt-2';
        }
      } catch (error) {
        console.error('❌ Upload scan error:', error);
        detectionStatus.textContent = '⚠️ Gagal memproses scan.';
        detectionStatus.className = 'text-red-600 font-semibold text-lg mt-2';
      } finally {
        console.log('🔄 Hiding upload loading overlay');
        loadingOverlay.classList.add('hidden');
        uploadScanButton.disabled = false;
      }
    });

    // Start camera tab by default
    console.log('🚀 Starting camera tab by default');
    cameraTab.click();
  }
}
