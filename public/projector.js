import { api, escapeHtml, confetti } from './common.js?v=20261112';

const stage = document.querySelector('#projectorStage');
const WHEEL_DELAY_MS = 7000;
let signature = '';
let timerInterval;
let clockOffset = 0;
let qrCode = null;
let wheelTimer = null;
let wheelFrame = null;
let celebrated = null;
let confettiTimer = null;
const serverNow = () => Date.now() + clockOffset;

async function loadQr() {
  try { qrCode = await api('/api/admin/qr'); } catch {}
}

function qrBlock() {
  if (!qrCode) return '';
  return `<div class="projector-qr"><img src="${qrCode.dataUrl}" alt="Código QR para registrarse"><span>Escanea para jugar</span></div>`;
}

function renderLobby(data) {
  const missing = Math.max(0, data.minPlayers - data.registered);
  stage.innerHTML = `<div class="lobby-stage lobby-with-qr"><div><span class="live-label"><span class="dot"></span> Juego ${data.game.roundNumber} · ${data.registered} en sala</span><h1>¿Listos para el desafío?</h1><p>Escanea el código, regístrate y espera aquí el inicio de la primera pregunta.</p><p class="lobby-hint">${missing ? `Falta${missing === 1 ? '' : 'n'} ${missing} participante${missing === 1 ? '' : 's'} para comenzar.` : 'Todo listo: el anfitrión puede iniciar el juego.'}</p></div>${qrBlock()}</div>`;
}

function renderQuestion(data) {
  const game = data.game;
  const letters = ['A', 'B', 'C', 'D'];
  stage.innerHTML = `<div class="question-stage"><div class="projector-qmeta"><span>Pregunta ${game.questionNumber} de ${game.questionCount}</span><span class="projector-timer" id="projectorTimer">00:${String(game.question.duration).padStart(2, '0')}</span></div><h1>${escapeHtml(game.question.text)}</h1><div class="projector-answers">${game.question.options.map((option, index) => `<div class="projector-answer"><span class="answer-letter">${letters[index]}</span><span>${escapeHtml(option)}</span></div>`).join('')}</div></div>`;
  startCountdown(game.questionEndsAt, (left) => `00:${String(left).padStart(2, '0')}`);
}

function renderResults(data) {
  const game = data.game;
  if (!game.question) return renderLobby(data);
  const letters = ['A', 'B', 'C', 'D'];
  const maxCount = Math.max(1, ...game.distribution);
  const last = game.questionNumber >= game.questionCount;
  stage.innerHTML = `<div class="question-stage"><div class="projector-qmeta"><span>Resultado de la pregunta ${game.questionNumber}</span><span id="projectorTimer">${last ? 'Resultados finales…' : 'Siguiente…'}</span></div><h1>${escapeHtml(game.question.text)}</h1><div class="projector-answers">${game.question.options.map((option, index) => `<div class="projector-answer ${index === game.question.correctIndex ? 'correct' : 'dim'}"><span class="answer-letter">${letters[index]}</span><span>${escapeHtml(option)}</span><div class="bar" style="width:${(game.distribution[index] || 0) / maxCount * 100}%"></div></div>`).join('')}</div></div>`;
  if (!last) startCountdown(game.resultsEndsAt, (left) => `Siguiente pregunta en ${left} s`);
  else clearInterval(timerInterval);
}

function renderFinished(data) {
  clearInterval(timerInterval);
  const winners = data.game.winners;
  const goesToWheel = data.pendingWinners > 0;
  stage.innerHTML = `<div class="result-stage"><div><span class="live-label"><span class="dot"></span> Juego ${data.game.roundNumber} finalizado</span><h1>¡Tenemos ganadores!</h1><p>${goesToWheel ? 'Los mejores puntajes pasan a la ruleta de premios. ¡Prepárense!' : 'Gracias a todos por participar. Muy pronto comienza el siguiente juego.'}</p></div><div class="projector-leaders"><h2>${winners.length ? 'Pasan a la ruleta' : 'Clasificación final'}</h2>${winners.length ? winners.map((person) => `<div class="projector-leader"><b>${person.rank}</b><span>${escapeHtml(person.name)}</span><b>${person.score} pts</b></div>`).join('') : '<p>Nadie respondió en este juego.</p>'}${goesToWheel ? '' : qrBlock()}</div></div>`;
  if (winners.length) celebrate(data.game.id);
  // The wheel opens by itself once the final ranking has been on screen for a moment.
  if (goesToWheel && !wheelTimer && !wheelFrame) wheelTimer = setTimeout(openWheel, WHEEL_DELAY_MS);
}

// Confetti for the winners, once per game, until the wheel takes over the screen.
function celebrate(gameId) {
  if (celebrated === gameId) return;
  celebrated = gameId;
  let bursts = 1;
  confetti();
  clearInterval(confettiTimer);
  confettiTimer = setInterval(() => {
    if (bursts >= 4 || wheelFrame) return clearInterval(confettiTimer);
    bursts += 1;
    confetti();
  }, 1600);
}

// The wheel opens on top of this page so a projector in full screen stays in full screen.
function openWheel() {
  wheelTimer = null;
  if (wheelFrame) return;
  wheelFrame = document.createElement('iframe');
  wheelFrame.className = 'wheel-overlay';
  wheelFrame.title = 'Ruleta de premios';
  wheelFrame.src = '/wheel.html?auto=1&embedded=1';
  document.body.appendChild(wheelFrame);
}

function closeWheel() {
  wheelFrame?.remove();
  wheelFrame = null;
  signature = '';
  refresh();
}

addEventListener('message', (event) => {
  if (event.origin === location.origin && event.data === 'wheel-done') closeWheel();
});

function startCountdown(endsAt, format) {
  clearInterval(timerInterval);
  const update = () => {
    const element = document.querySelector('#projectorTimer');
    if (!element || !endsAt) return;
    const left = Math.max(0, Math.ceil((endsAt - serverNow()) / 1000));
    element.textContent = format(left);
  };
  update();
  timerInterval = setInterval(update, 250);
}

function render(data) {
  document.querySelector('#projectorRegistered').textContent = `${data.registered} participante${data.registered === 1 ? '' : 's'}`;
  document.querySelector('#projectorAnswers').textContent = `${data.game.answerCount} respuesta${data.game.answerCount === 1 ? '' : 's'}`;
  const nextSignature = [data.game.id, data.game.status, data.game.questionNumber, data.game.revealed, data.game.status === 'lobby' ? data.registered : '', data.game.status === 'results' ? data.game.answerCount : '', data.pendingWinners > 0, Boolean(qrCode)].join('|');
  if (signature === nextSignature) return;
  signature = nextSignature;
  if (data.game.status !== 'finished' && wheelTimer) { clearTimeout(wheelTimer); wheelTimer = null; }
  // A new game has priority over the wheel; pending winners keep their turn for the next opening.
  if (data.game.status === 'question' && wheelFrame) { wheelFrame.remove(); wheelFrame = null; }
  if (data.game.status === 'question') renderQuestion(data);
  else if (data.game.status === 'results') renderResults(data);
  else if (data.game.status === 'finished') renderFinished(data);
  else renderLobby(data);
}

async function refresh() {
  try {
    const requested = Date.now();
    const data = await api('/api/projector/state');
    clockOffset = data.game.serverNow - Math.round((requested + Date.now()) / 2);
    render(data);
  } catch (error) { if (error.status === 401) location.href = '/login.html?next=%2Fprojector.html'; }
}

document.querySelector('#fullscreenButton').addEventListener('click', async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
});

loadQr().then(refresh);
setInterval(refresh, 900);
