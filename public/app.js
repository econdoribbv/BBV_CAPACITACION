import { api, toast } from './common.js?v=20261105';

async function loadPublic() {
  try {
    const data = await api('/api/public');
    document.querySelector('#registeredCount').textContent = data.registered;
    document.querySelector('#registerForm button[type="submit"]').disabled = data.registrationOpen === false;
    document.querySelector('#registrationStatus').textContent = data.registrationOpen === false ? 'No se pudo guardar el registro. Solicita ayuda al equipo organizador.' : '';
    if (data.participant) location.href = '/participant.html';
  } catch {}
}

document.querySelector('#registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Registrando…';
  try {
    const form = new FormData(event.currentTarget);
    const data = await api('/api/register', { method: 'POST', body: Object.fromEntries(form) });
    toast('Registro guardado. Ingresando…', 'success');
    setTimeout(() => { location.href = '/participant.html'; }, 450);
  } catch (error) {
    toast(error.message, 'error');
  } finally {
    button.disabled = false;
    button.textContent = 'Registrarme y entrar →';
  }
});
loadPublic();
