import { api, toast } from './common.js?v=20261112';

async function loadPublic() {
  try {
    const data = await api('/api/public');
    document.querySelector('#registeredCount').textContent = data.registered;
    const submit = document.querySelector('#registerForm button[type="submit"]');
    submit.disabled = data.registrationOpen === false;
    document.querySelector('#registrationStatus').textContent = data.registrationOpen === false ? 'No se pudo guardar el registro. Solicita ayuda al equipo organizador.' : '';
    const person = data.participant;
    if (person?.active) { location.href = '/participant.html'; return; }
    if (person) {
      // Their game ended. Each email registers once, so another game needs another email.
      document.querySelector('#registerView h2').textContent = person.wonPrize ? '¡Ya ganaste tu premio!' : '¿Juegas otra vez?';
      document.querySelector('#registerView > p').textContent = person.wonPrize
        ? 'Quien gana un premio ya no vuelve a jugar. ¡Felicidades y gracias por participar!'
        : 'Cada correo se registra una sola vez. Para volver a jugar, regístrate con otro correo.';
      if (person.wonPrize) submit.disabled = true;
    }
  } catch {}
}

document.querySelector('#registerForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.currentTarget.querySelector('button[type="submit"]');
  button.disabled = true;
  button.textContent = 'Registrando…';
  try {
    const form = new FormData(event.currentTarget);
    await api('/api/register', { method: 'POST', body: Object.fromEntries(form) });
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
