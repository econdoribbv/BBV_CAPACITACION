import { api } from './common.js';

async function refreshQr() {
  try {
    const [qr, state] = await Promise.all([api('/api/admin/qr'), api('/api/admin/state')]);
    document.querySelector('#qrProjectorImage').src = qr.dataUrl;
    document.querySelector('#qrProjectorUrl').textContent = qr.url;
    document.querySelector('#qrRegistered').textContent = `${state.attendees.length} registrado${state.attendees.length === 1 ? '' : 's'}`;
  } catch (error) {
    if (error.status === 401) location.href = '/login.html';
  }
}

refreshQr();
setInterval(refreshQr, 1800);
