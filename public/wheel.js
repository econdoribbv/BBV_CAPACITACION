import { api, toast, escapeHtml } from './common.js';

const canvas = document.querySelector('#wheelCanvas');
const ctx = canvas.getContext('2d');
const imageCache = new Map();
let state;
let rotation = 0;
let spinning = false;

const segmentIds = ['pen', 'mini-notebook', 'pen', 'phone-holder', 'pen', 'ruler', 'pen', 'mini-notebook', 'pen', 'notebook-pen', 'pen', 'phone-holder'];

function loadImage(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const promise = new Promise((resolve) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = src; });
  imageCache.set(src, promise);
  return promise;
}

async function drawWheel() {
  if (!state) return;
  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2 - 10;
  const arc = Math.PI * 2 / segmentIds.length;
  const prizes = Object.fromEntries(state.prizes.map((prize) => [prize.id, prize]));
  await Promise.all(state.prizes.map((prize) => loadImage(prize.image)));
  ctx.clearRect(0, 0, size, size);

  for (let index = 0; index < segmentIds.length; index += 1) {
    const prize = prizes[segmentIds[index]];
    const start = -Math.PI / 2 + index * arc;
    const end = start + arc;
    ctx.beginPath(); ctx.moveTo(center, center); ctx.arc(center, center, radius, start, end); ctx.closePath();
    ctx.fillStyle = prize.color; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 4; ctx.stroke();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + arc / 2);
    const image = await imageCache.get(prize.image);
    if (image) {
      const imageSize = 94;
      ctx.save(); ctx.translate(radius * .63, 0); ctx.rotate(Math.PI / 2); ctx.drawImage(image, -imageSize / 2, -imageSize / 2, imageSize, imageSize); ctx.restore();
    }
    ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 23px Inter, sans-serif';
    const label = prize.name === 'Libreta con bolígrafo' ? 'Libreta + boli' : prize.name;
    ctx.save(); ctx.translate(radius * .34, 0); ctx.rotate(Math.PI / 2); ctx.fillText(label, 0, 0, 170); ctx.restore();
    ctx.restore();
  }

  ctx.beginPath(); ctx.arc(center, center, 83, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill();
  ctx.strokeStyle = 'rgba(101,67,136,.22)'; ctx.lineWidth = 15; ctx.stroke();
}

function render(data) {
  state = data;
  const eligible = data.attendees.filter((person) => !person.prizeId);
  const select = document.querySelector('#attendeeSelect');
  const selected = select.value;
  select.innerHTML = `<option value="">Selecciona un participante (${eligible.length})</option>${eligible.map((person) => `<option value="${person.id}">${escapeHtml(person.name)}</option>`).join('')}`;
  if (eligible.some((person) => person.id === selected)) select.value = selected;
  document.querySelector('#inventory').innerHTML = data.prizes.map((prize) => `<div class="inventory-item"><img src="${prize.image}" alt=""><span><strong>${escapeHtml(prize.name)}</strong><small>${prize.initial - prize.remaining} entregados de ${prize.initial}</small></span><span class="inventory-count">${prize.remaining}</span></div>`).join('');
  document.querySelector('#recentSpins').innerHTML = data.spins.length ? data.spins.slice(0, 4).map((spin, index) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.06);font-size:12px"><span><b>${escapeHtml(spin.attendeeName)}</b><br><span style="color:#b9acc5">${escapeHtml(spin.prizeName)}</span></span>${index === 0 ? `<button class="btn btn-ghost btn-sm undo-spin" style="color:#d8cfe0;border-color:rgba(255,255,255,.16);min-height:32px" data-spin="${spin.id}">Anular</button>` : ''}</div>`).join('') : '<p style="color:#b9acc5;font-size:12px">Todavía no se entregaron premios.</p>';
  document.querySelectorAll('.undo-spin').forEach((button) => button.addEventListener('click', undoSpin));
  drawWheel();
}

async function refresh() {
  try { render(await api('/api/wheel/state')); }
  catch (error) { if (error.status === 401) location.href = '/ruleta.html'; else toast(error.message, 'error'); }
}

function animateToPrize(prizeId) {
  return new Promise((resolve) => {
    const matching = segmentIds.map((id, index) => id === prizeId ? index : -1).filter((index) => index >= 0);
    const selectedIndex = matching[Math.floor(Math.random() * matching.length)];
    const segmentDegrees = 360 / segmentIds.length;
    const desired = ((-(selectedIndex + .5) * segmentDegrees) % 360 + 360) % 360;
    const current = ((rotation % 360) + 360) % 360;
    const delta = (desired - current + 360) % 360;
    const start = rotation;
    const target = rotation + 6 * 360 + delta;
    const duration = 5200;
    const started = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    function frame(now) {
      const progress = Math.min(1, (now - started) / duration);
      rotation = start + (target - start) * ease(progress);
      canvas.style.transform = `rotate(${rotation}deg)`;
      if (progress < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

function confetti() {
  const colors = ['#36BC87', '#654388', '#F7941E', '#59C8E1', '#EF99C1'];
  for (let index = 0; index < 70; index += 1) {
    const piece = document.createElement('i');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * .7}s`;
    piece.style.setProperty('--drift', `${(Math.random() - .5) * 250}px`);
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 3800);
  }
}

document.querySelector('#spinButton').addEventListener('click', async () => {
  const attendeeId = document.querySelector('#attendeeSelect').value;
  if (!attendeeId) return toast('Selecciona a un participante.', 'error');
  if (spinning) return;
  spinning = true;
  const button = document.querySelector('#spinButton');
  button.disabled = true;
  button.textContent = 'La ruleta está girando…';
  try {
    const result = await api('/api/admin/wheel/spin', { method: 'POST', body: { attendeeId } });
    await animateToPrize(result.prize.id);
    document.querySelector('#winnerImage').src = result.prize.image;
    document.querySelector('#winnerPerson').textContent = result.attendee.name;
    document.querySelector('#winnerPrize').textContent = result.prize.name;
    document.querySelector('#winnerModal').classList.add('show');
    confetti();
    await refresh();
  } catch (error) { toast(error.message, 'error'); }
  finally { spinning = false; button.disabled = false; button.textContent = '✦ Girar la ruleta'; }
});

async function undoSpin(event) {
  if (!confirm('¿Anular esta entrega y devolver el premio al inventario?')) return;
  try { await api('/api/admin/wheel/undo', { method: 'POST', body: { spinId: event.currentTarget.dataset.spin } }); toast('Entrega anulada.', 'success'); await refresh(); }
  catch (error) { toast(error.message, 'error'); }
}

document.querySelector('#closeWinner').addEventListener('click', () => document.querySelector('#winnerModal').classList.remove('show'));
document.querySelector('#fullscreenButton').addEventListener('click', async () => { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); });
document.querySelector('#wheelLogout').addEventListener('click', async () => { await api('/api/auth/logout', { method: 'POST' }); location.href = '/ruleta.html'; });

refresh();
