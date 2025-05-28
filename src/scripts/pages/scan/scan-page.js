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
              <!-- Status deteksi ikan -->
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
    `
  }

  async afterRender() {
    const video = document.getElementById("camera-stream")
    const canvas = document.getElementById("snapshot")
    const scanButton = document.getElementById("scan-button")
    const cameraTab = document.getElementById("camera-tab")
    const uploadTab = document.getElementById("upload-tab")
    const cameraView = document.getElementById("camera-view")
    const uploadView = document.getElementById("upload-view")
    const fileInput = document.getElementById("file-input")
    const browseButton = document.getElementById("browse-button")
    const dropArea = document.getElementById("drop-area")
    const previewContainer = document.getElementById("preview-container")
    const imagePreview = document.getElementById("image-preview")
    const uploadScanButton = document.getElementById("upload-scan-button")
    const cameraPlaceholder = document.getElementById("camera-placeholder")
    const loadingOverlay = document.getElementById("loading-overlay")
    const detectionStatus = document.getElementById("detection-status")

    let selectedFile = null
    let detectionInterval = null

    // Reset status deteksi awal
    detectionStatus.textContent = ''
    detectionStatus.className = 'text-center font-semibold text-lg mt-2'

    const initCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
          video.srcObject = stream
          cameraPlaceholder.classList.add("hidden")
          scanButton.disabled = true
          detectionStatus.textContent = '🔄 Mendeteksi ikan...'
          detectionStatus.className = 'text-gray-700 font-semibold text-lg mt-2'
          startFishDetection(stream)
        } catch (err) {
          console.error("Gagal mengakses kamera", err)
          cameraPlaceholder.classList.remove("hidden")
          scanButton.disabled = true
          stopFishDetection()
          detectionStatus.textContent = '⚠️ Kamera tidak tersedia'
          detectionStatus.className = 'text-red-600 font-semibold text-lg mt-2'
        }
      } else {
        cameraPlaceholder.classList.remove("hidden")
        scanButton.disabled = true
        detectionStatus.textContent = '⚠️ Kamera tidak didukung browser'
        detectionStatus.className = 'text-red-600 font-semibold text-lg mt-2'
      }
    }

    initCamera()

    cameraTab.addEventListener("click", () => {
      cameraTab.classList.add("text-blue-700", "border-b-2", "border-blue-700")
      cameraTab.classList.remove("text-gray-500")
      uploadTab.classList.remove("text-blue-700", "border-b-2", "border-blue-700")
      uploadTab.classList.add("text-gray-500")
      cameraView.classList.remove("hidden")
      uploadView.classList.add("hidden")
      scanButton.disabled = true
      detectionStatus.textContent = ''
      detectionStatus.className = 'text-center font-semibold text-lg mt-2'
      initCamera()
    })

    uploadTab.addEventListener("click", () => {
      uploadTab.classList.add("text-blue-700", "border-b-2", "border-blue-700")
      uploadTab.classList.remove("text-gray-500")
      cameraTab.classList.remove("text-blue-700", "border-b-2", "border-blue-700")
      cameraTab.classList.add("text-gray-500")
      uploadView.classList.remove("hidden")
      cameraView.classList.add("hidden")
      scanButton.disabled = true
      stopFishDetection()
      detectionStatus.textContent = ''
      detectionStatus.className = 'text-center font-semibold text-lg mt-2'
    })

    browseButton.addEventListener("click", () => {
      fileInput.click()
    })

    fileInput.addEventListener("change", (e) => {
      handleFileSelect(e.target.files[0])
    })

    ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, preventDefaults, false)
    })

    function preventDefaults(e) {
      e.preventDefault()
      e.stopPropagation()
    }

    ;["dragenter", "dragover"].forEach((eventName) => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.add("border-blue-500", "bg-blue-50")
      }, false)
    })

    ;["dragleave", "drop"].forEach((eventName) => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove("border-blue-500", "bg-blue-50")
      }, false)
    })

    dropArea.addEventListener("drop", (e) => {
      handleFileSelect(e.dataTransfer.files[0])
    })

    function handleFileSelect(file) {
      if (!file || !file.type.match("image.*")) return
      selectedFile = file
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.src = e.target.result
        previewContainer.classList.remove("hidden")
      }
      reader.readAsDataURL(file)
      uploadScanButton.disabled = false
      detectionStatus.textContent = ''
      detectionStatus.className = 'text-center font-semibold text-lg mt-2'
    }

    uploadScanButton.addEventListener("click", async () => {
      if (!selectedFile) return
      loadingOverlay.classList.remove("hidden")

      try {
        const base64 = await fileToBase64(selectedFile)
        const response = await fetch("/scan-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64 }),
        })
        const result = await response.json()

        loadingOverlay.classList.add("hidden")

        if (result.error) {
          alert("Terjadi kesalahan: " + result.error)
          return
        }

        alert(`Hasil scan: ${result.message}`)
      } catch (err) {
        loadingOverlay.classList.add("hidden")
        alert("Gagal memproses gambar: " + err.message)
      }
    })

    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }

    // Fungsi deteksi ikan dari video secara berkala
    async function detectFishFromVideo() {
      if (video.readyState !== 4) {
        // Video belum siap
        detectionStatus.textContent = '⚠️ Menunggu kamera...'
        detectionStatus.className = 'text-gray-600 font-semibold text-lg mt-2'
        return
      }
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL("image/jpeg")

      try {
        const response = await fetch("/check-fish", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64 }),
        })

        const result = await response.json()

        if (result.isFish) {
          scanButton.disabled = false
          detectionStatus.textContent = "✅ Ikan terdeteksi"
          detectionStatus.className = "text-green-600 font-semibold text-lg mt-2"
        } else {
          scanButton.disabled = true
          detectionStatus.textContent = "❌ Bukan ikan"
          detectionStatus.className = "text-red-600 font-semibold text-lg mt-2"
        }
      } catch (err) {
        console.error("Error deteksi ikan:", err)
        scanButton.disabled = true
        detectionStatus.textContent = "⚠️ Gagal deteksi"
        detectionStatus.className = "text-yellow-600 font-semibold text-lg mt-2"
      }
    }

    // Mulai interval deteksi ikan
    function startFishDetection(stream) {
      if (detectionInterval) clearInterval(detectionInterval)
      detectionInterval = setInterval(detectFishFromVideo, 3000)
    }

    // Stop interval deteksi ikan
    function stopFishDetection() {
      if (detectionInterval) {
        clearInterval(detectionInterval)
        detectionInterval = null
      }
    }

    // Event tombol scan kamera (ambil gambar & scan)
    scanButton.addEventListener("click", async () => {
      if (video.readyState !== 4) return
      loadingOverlay.classList.remove("hidden")

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const base64 = canvas.toDataURL("image/jpeg")

      try {
        const response = await fetch("/scan-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64 }),
        })

        const result = await response.json()

        loadingOverlay.classList.add("hidden")

        if (result.error) {
          alert("Terjadi kesalahan: " + result.error)
          return
        }

        alert(`Hasil scan: ${result.message}`)
      } catch (err) {
        loadingOverlay.classList.add("hidden")
        alert("Gagal memproses gambar: " + err.message)
      }
    })
  }
}
