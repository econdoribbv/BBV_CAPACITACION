import { api, toast } from './common.js';

document.querySelector('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  button.textContent = 'Verificando…';
  try {
    const form = new FormData(event.currentTarget);
    await api('/api/auth/login', { method: 'POST', body: Object.fromEntries(form) });
    const requested = new URLSearchParams(location.search).get('next');
    const allowed = ['/qr.html', '/admin.html', '/projector.html'];
    location.href = allowed.includes(requested) ? requested : '/admin.html';
  } catch (error) {
    toast(error.message, 'error');
    button.disabled = false;
    button.textContent = 'Ingresar al panel →';
  }
});
