import { initDB, getUserByEmail } from '../../data/indexdb.js';

export default class LoginPage {
  async render() {
    return `
      <section class="min-h-screen flex items-center justify-center bg-gray-50 px-4 mt-9">
        <div class="max-w-md w-full bg-white rounded-xl shadow-md p-8">
          <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">Masuk ke Akun Anda</h2>
          <form id="login-form" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" required
                class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Kata Sandi</label>
              <input type="password" id="password" name="password" required
                class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <button type="submit"
              class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">Masuk</button>
          </form>
          <p class="text-center text-sm text-gray-600 mt-6">
            Belum punya akun?
            <a href="#/register" class="text-blue-600 hover:underline">Daftar di sini</a>
          </p>
        </div>
      </section>

      <!-- Modal Notifikasi -->
    <div id="notification-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden z-50">
      <div class="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 text-center relative">
        <button id="modal-close-btn" class="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold">&times;</button>
        <p id="modal-message" class="text-gray-800 text-lg"></p>
        <button id="modal-ok-btn" class="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">OK</button>
      </div>
    </div>
    `;
  }

  async afterRender() {
    await initDB();

    // Modal Elements
    const modal = document.getElementById('notification-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalOkBtn = document.getElementById('modal-ok-btn');

    function showModal(message) {
      modalMessage.textContent = message;
      modal.classList.remove('hidden');
    }

    function hideModal() {
      modal.classList.add('hidden');
    }

    modalCloseBtn.addEventListener('click', hideModal);
    modalOkBtn.addEventListener('click', () => {
      hideModal();
      // Setelah user tutup modal, redirect ke homepage
      window.location.hash = '/';
    });

    const form = document.querySelector('#login-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = form.email.value.trim();
      const password = form.password.value.trim();

      if (!email || !password) {
        alert('Semua field wajib diisi!');
        return;
      }

      try {
        const user = await getUserByEmail(email);

        if (!user) {
          alert('Email tidak terdaftar!');
          return;
        }

        if (user.password !== password) {
          alert('Kata sandi salah!');
          return;
        }

        // Simpan data user ke localStorage untuk sesi login
        localStorage.setItem('loggedInUser', JSON.stringify(user));

        showModal('Login berhasil!');
      } catch (error) {
        console.error('Gagal login:', error);
        alert('Terjadi kesalahan saat login. Silakan coba lagi.');
      }
    });
  }
}
