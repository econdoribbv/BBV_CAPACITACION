import { api, toast } from './common.js';

document.querySelector('#rouletteLoginForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button');
  button.disabled = true;
  button.textContent = 'Verificando…';
  try {
    const form = new FormData(event.currentTarget);
    await api('/api/auth/login', { method: 'POST', body: Object.fromEntries(form) });
    location.href = '/wheel.html';
  } catch (error) {
    toast(error.message, 'error');
    button.disabled = false;
    button.textContent = 'Entrar a la ruleta →';
  }
});
