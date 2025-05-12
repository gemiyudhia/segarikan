// CSS imports
import '../styles/styles.css';

import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  const updateHeaderVisibility = () => {
    const header = document.querySelector("header");
    const currentHash = window.location.hash;
    if (currentHash === "#/login" || currentHash === "#/register") {
      header.style.display = "none";
    } else {
      header.style.display = "block";
    }
  };

  await app.renderPage();
  updateHeaderVisibility();

  const drawerButton = document.querySelector("#drawer-button");
  const navigationDrawer = document.querySelector("#navigation-drawer");

  drawerButton.addEventListener("click", () => {
    navigationDrawer.classList.toggle("hidden");
  });

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
    updateHeaderVisibility();
  });
});
