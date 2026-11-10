import { api, toast, escapeHtml } from './common.js?v=20261110';
import { MaxWheelAnimator } from './max-wheel.js?v=20261105-grip';

const canvas = document.querySelector('#wheelCanvas');
const ctx = canvas.getContext('2d');
const imageCache = new Map();
const params = new URLSearchParams(location.search);
const autoMode = params.has('auto');
const embedded = params.has('embedded') && window.parent !== window;
const AUTO_CLOSE_WINNER_MS = 8000;
const AUTO_RETURN_MS = 10000;
let state;
let rotation = 0;
let spinning = false;
let winnerTimer = null;
let returnTimer = null;
let wheelDrawn = false;
const bullRig = document.querySelector('#bullRig');
const bullMessage = document.querySelector('#bullMessage');
const bullButton = document.querySelector('#bullButton');
const centerButton = document.querySelector('#centerSpin');
const spinButton = document.querySelector('#spinButton');
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.body.classList.contains('motion-paused');
const maxActor = new MaxWheelAnimator(document.querySelector('.wheel-area'), bullRig, canvas);
maxActor.ready.catch(() => {});

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
    ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '700 21px Inter, sans-serif';
    const label = prize.name === 'Libreta con bolígrafo' ? 'Libreta + boli' : prize.name;
    ctx.save(); ctx.translate(radius * .39, 0);
    if (Math.cos(start + arc / 2) < 0) ctx.rotate(Math.PI);
    ctx.fillText(label, 0, 0, 145); ctx.restore();
    ctx.restore();
  }

  ctx.beginPath(); ctx.arc(center, center, 83, 0, Math.PI * 2); ctx.fillStyle = 'white'; ctx.fill();
  ctx.strokeStyle = 'rgba(101,67,136,.22)'; ctx.lineWidth = 15; ctx.stroke();
}

function nextWinner() {
  return state?.queue?.[0] || null;
}

function setSpinEnabled() {
  const ready = !spinning && Boolean(nextWinner()) && state?.prizesAvailable;
  spinButton.disabled = !ready;
  bullButton.disabled = !ready;
  centerButton.disabled = !ready;
}

function render(data) {
  state = data;
  const next = nextWinner();
  if (!spinning) {
    document.querySelector('#turnLabel').textContent = next ? 'Turno de' : 'Sin ganadores pendientes';
    document.querySelector('#turnName').textContent = next ? next.name : '—';
    document.querySelector('#turnDetail').textContent = next
      ? `Puesto ${next.rank} · Juego ${next.roundNumber}${data.queue.length > 1 ? ` · Luego ${data.queue.length - 1} más` : ''}`
      : (data.prizesAvailable ? 'Los 5 mejores puntajes aparecerán aquí al terminar cada juego.' : 'Se entregaron todos los premios.');
    bullMessage.textContent = next ? `¡Toca el centro para girar por ${next.name.split(' ')[0]}!` : 'Esperando a los ganadores del próximo juego.';
  }
  setSpinEnabled();
  const round = data.recentRound;
  document.querySelector('#winnersTitle').textContent = round ? `Ganadores del juego ${round.number}` : 'Ganadores del juego';
  document.querySelector('#winnersList').innerHTML = round?.winners.length
    ? round.winners.map((winner) => `<div class="inventory-item winner-row ${winner.attendeeId === next?.attendeeId ? 'is-next' : ''}"><span class="winner-rank">${winner.rank}</span><span><strong>${escapeHtml(winner.name)}</strong><small>${winner.score} pts</small></span><span class="winner-prize">${winner.prizeName ? escapeHtml(winner.prizeName) : (winner.attendeeId === next?.attendeeId ? 'Turno' : 'En espera')}</span></div>`).join('')
    : '<p style="color:#b9acc5;font-size:12px">Cuando termine un juego, los mejores puntajes aparecerán aquí.</p>';
  document.querySelector('#recentSpins').innerHTML = data.spins.length ? data.spins.slice(0, 4).map((spin, index) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.06);font-size:12px"><span><b>${escapeHtml(spin.attendeeName)}</b><br><span style="color:#b9acc5">${escapeHtml(spin.prizeName)}</span></span>${index === 0 ? `<button class="btn btn-ghost btn-sm undo-spin" style="color:#d8cfe0;border-color:rgba(255,255,255,.16);min-height:32px" data-spin="${spin.id}">Anular</button>` : ''}</div>`).join('') : '<p style="color:#b9acc5;font-size:12px">Todavía no se entregaron premios.</p>';
  document.querySelectorAll('.undo-spin').forEach((button) => button.addEventListener('click', undoSpin));
  if (!wheelDrawn) { wheelDrawn = true; drawWheel(); }
  scheduleReturn();
}

// Opened automatically from the projection: go back once every winner received a prize.
function scheduleReturn() {
  const done = !nextWinner() && !spinning && !document.querySelector('#winnerModal').classList.contains('show');
  if (!autoMode || !done) { clearTimeout(returnTimer); returnTimer = null; return; }
  if (!returnTimer) returnTimer = setTimeout(backToProjection, AUTO_RETURN_MS);
}

function backToProjection() {
  if (embedded) window.parent.postMessage('wheel-done', location.origin);
  else location.href = '/projector.html';
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
    const delta = (current - desired + 360) % 360;
    const start = rotation;
    const target = rotation - 7 * 360 - delta;
    const duration = reduceMotion() ? 120 : 8500;
    const started = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
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
  if (reduceMotion()) return;
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

async function spin() {
  const winner = nextWinner();
  if (spinning) return;
  if (document.querySelector('#winnerModal').classList.contains('show')) closeWinner();
  if (!winner) return toast('No hay ganadores pendientes de sorteo.', 'error');
  spinning = true;
  setSpinEnabled();
  spinButton.textContent = 'MAX prepara el giro…';
  try {
    const result = await api('/api/admin/wheel/spin', { method: 'POST', body: { attendeeId: winner.attendeeId } });
    bullRig.classList.remove('is-celebrating');
    bullMessage.textContent = `Girando por ${result.attendee.name.split(' ')[0]}…`;
    if (!reduceMotion()) {
      try {
        await maxActor.gripAndPush((angle) => { rotation = angle; canvas.style.transform = `rotate(${angle}deg)`; }, rotation);
      } catch { maxActor.reset(); }
    }
    bullRig.classList.add('is-spinning');
    bullMessage.textContent = '¡La ruleta está girando!';
    spinButton.textContent = 'La ruleta está girando…';
    await Promise.all([animateToPrize(result.prize.id), maxActor.layer.hidden ? Promise.resolve() : maxActor.release()]);
    bullRig.classList.remove('is-spinning');
    bullRig.classList.add('is-celebrating');
    bullMessage.textContent = `¡Premio listo: ${result.prize.name}!`;
    document.querySelector('#winnerImage').src = result.prize.image;
    await document.querySelector('#winnerImage').decode().catch(() => {});
    await maxActor.showPrize(document.querySelector('#winnerMax'), document.querySelector('#winnerImage')).catch(() => {});
    document.querySelector('#winnerMax').setAttribute('aria-label', `MAX sosteniendo ${result.prize.name}`);
    document.querySelector('#winnerPerson').textContent = result.attendee.name;
    document.querySelector('#winnerPrize').textContent = result.prize.name;
    await refresh();
    const upcoming = nextWinner();
    document.querySelector('#winnerNext').textContent = upcoming ? `Siguiente: ${upcoming.name}` : '';
    const modal = document.querySelector('#winnerModal');
    modal.classList.add('show');
    modal.inert = false;
    modal.setAttribute('aria-hidden', 'false');
    document.querySelector('#closeWinner').focus();
    confetti();
    clearTimeout(winnerTimer);
    winnerTimer = setTimeout(closeWinner, AUTO_CLOSE_WINNER_MS);
  } catch (error) {
    toast(error.message, 'error');
    bullMessage.textContent = 'Revisa los últimos premios antes de repetir el giro.';
  }
  finally {
    spinning = false;
    maxActor.reset();
    bullRig.classList.remove('is-winding', 'is-spinning');
    spinButton.textContent = 'Girar ruleta';
    await refresh();
  }
}

spinButton.addEventListener('click', spin);
centerButton.addEventListener('click', spin);
bullButton.addEventListener('click', spin);

async function undoSpin(event) {
  if (!confirm('¿Anular esta entrega y devolver el premio al inventario?')) return;
  try { await api('/api/admin/wheel/undo', { method: 'POST', body: { spinId: event.currentTarget.dataset.spin } }); toast('Entrega anulada.', 'success'); await refresh(); }
  catch (error) { toast(error.message, 'error'); }
}

function closeWinner() {
  clearTimeout(winnerTimer);
  const modal = document.querySelector('#winnerModal');
  if (!modal.classList.contains('show')) return;
  modal.classList.remove('show');
  modal.inert = true;
  modal.setAttribute('aria-hidden', 'true');
  centerButton.focus();
  if (state) render(state);
}
document.querySelector('#closeWinner').addEventListener('click', closeWinner);
document.querySelector('#winnerModal').addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeWinner();
  if (event.key === 'Tab') { event.preventDefault(); document.querySelector('#closeWinner').focus(); }
});
document.querySelector('#fullscreenButton').addEventListener('click', async () => { if (!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); });
const logoutButton = document.querySelector('#wheelLogout');
if (embedded) {
  logoutButton.textContent = '← Volver a la proyección';
  logoutButton.addEventListener('click', backToProjection);
  document.querySelector('#fullscreenButton').hidden = true;
} else {
  logoutButton.addEventListener('click', async () => { await api('/api/auth/logout', { method: 'POST' }); location.href = '/ruleta.html'; });
}

refresh();
setInterval(() => { if (!spinning && !document.hidden && !document.querySelector('#winnerModal').classList.contains('show')) refresh(); }, 2000);
