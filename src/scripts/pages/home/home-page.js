export default class LoginPage {
  async render() {
    return `
      <section class="min-h-screen flex items-center justify-center bg-gray-50 px-4 mt-9">
        <div class="max-w-md w-full bg-white rounded-xl shadow-md p-8">
          <h2 class="text-2xl font-bold text-blue-700 mb-6 text-center">Masuk ke Akun Anda</h2>
          <form id="login-form" class="space-y-5">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" required class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Kata Sandi</label>
              <input type="password" id="password" name="password" required class="w-full mt-1 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">Masuk</button>
          </form>
          <p class="text-center text-sm text-gray-600 mt-6">
            Belum punya akun?
            <a href="#/register" class="text-blue-600 hover:underline">Daftar di sini</a>
          </p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.querySelector('#login-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.querySelector('#email').value.trim();
      const password = document.querySelector('#password').value.trim();

      try {
        // Ambil data user.json (dari public folder)
        const response = await fetch('/data/user.json');
        if (!response.ok) throw new Error('Gagal mengambil data pengguna');

        const users = await response.json();

        // Cari user yang cocok
        const foundUser = users.find(user => user.email === email && user.password === password);

        if (foundUser) {
          alert('Login berhasil!');
          localStorage.setItem('user', JSON.stringify(foundUser));

          // Redirect ke halaman home-page
          window.location.hash = '/home';
        } else {
          alert('Email atau password salah!');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Terjadi kesalahan saat login.');
      }
    });
  }
}
