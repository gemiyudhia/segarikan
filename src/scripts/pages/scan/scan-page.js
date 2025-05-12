export default class ScanPage {
  async render() {
    return `
         <section class="px-4 py-6 text-center bg-gray-50 min-h-[80vh] mt-20">
    <h1 class="text-2xl md:text-4xl font-bold text-blue-700 mb-4">Scan Kesegaran Ikan</h1>
    <p class="text-gray-600 mb-6">Arahkan kamera ke ikan, lalu tekan tombol "Scan Ikan".</p>

    <div class="flex flex-col items-center gap-4">
      <video id="camera-stream" autoplay playsinline class="rounded shadow-md w-full max-w-md"></video>
      <canvas id="snapshot" class="hidden"></canvas>
      <button id="scan-button" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
        Scan Ikan
      </button>
      <div id="scan-result" class="mt-6 text-lg font-medium text-gray-800"></div>
    </div>
  </section>
        `;
  }

  async afterRender() {
    const video = document.getElementById("camera-stream");
    const canvas = document.getElementById("snapshot");
    const scanButton = document.getElementById("scan-button");
    const resultEl = document.getElementById("scan-result");

    // Mulai kamera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        video.srcObject = stream;
      } catch (err) {
        console.error("Gagal mengakses kamera", err);
        resultEl.textContent = "Gagal mengakses kamera";
      }
    }

    scanButton.addEventListener("click", async () => {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg");

      resultEl.textContent = "Memproses gambar...";

      try {
        const res = await fetch("http://localhost:5000/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: dataUrl }),
        });

        const { prediction } = await res.json();
        resultEl.textContent = `Hasil: ${prediction}`;

        // Data dummy + hasil prediksi
        const dummyResult = {
          prediction: prediction || "Kurang Segar",
          confidence: 0.78,
          fishType: "Ikan Kembung",
          timestamp: new Date().toLocaleString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          recommendation:
            "Segera dimasak hari ini atau dibekukan untuk mencegah pembusukan.",
        };

        localStorage.setItem("scanResult", JSON.stringify(dummyResult));
        window.location.hash = "#/result";
      } catch (err) {
        resultEl.textContent = "Gagal melakukan prediksi.";
        console.error(err);
      }
      
    });
  }
}
