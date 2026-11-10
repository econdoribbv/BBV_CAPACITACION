import { api, toast } from './common.js?v=20261110';

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
      // Their game ended: offer another game with the same details, up to the allowed limit.
      for (const field of ['name', 'email', 'gender', 'ageRange']) document.getElementById(field).value = person[field];
      document.querySelector('#registerView h2').textContent = person.playsLeft > 0 ? '¿Juegas otra vez?' : 'Ya completaste tus participaciones';
      document.querySelector('#registerView > p').textContent = person.playsLeft > 0
        ? `Puedes jugar hasta ${data.maxPlays} veces. Te queda${person.playsLeft === 1 ? '' : 'n'} ${person.playsLeft}.`
        : `Cada persona puede jugar hasta ${data.maxPlays} veces. ¡Gracias por participar!`;
      if (person.playsLeft <= 0) submit.disabled = true;
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
