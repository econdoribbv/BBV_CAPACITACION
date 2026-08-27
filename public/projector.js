import { api, escapeHtml } from './common.js';

const stage = document.querySelector('#projectorStage');
let signature = '';
let lastData;
let timerInterval;

function renderLobby(data) {
  stage.innerHTML = `<div class="lobby-stage"><span class="live-label"><span class="dot"></span> Participantes conectados</span><h1>¿Listos para el desafío?</h1><p>Si ya completaste tu registro, espera aquí el inicio de la primera pregunta.</p><div class="projector-code"><small>Código de sala</small><strong>${escapeHtml(data.game.code)}</strong></div></div>`;
}

function renderQuestion(data) {
  const game = data.game;
  const letters = ['A', 'B', 'C', 'D'];
  const maxCount = Math.max(1, ...game.distribution);
  stage.innerHTML = `<div class="question-stage"><div class="projector-qmeta"><span>Pregunta ${game.questionNumber} de ${game.questionCount}</span><span class="projector-timer" id="projectorTimer">00:${game.question.duration}</span></div><h1>${escapeHtml(game.question.text)}</h1><div class="projector-answers">${game.question.options.map((option, index) => `<div class="projector-answer ${game.revealed ? (index === game.question.correctIndex ? 'correct' : 'dim') : ''}"><span class="answer-letter">${letters[index]}</span><span>${escapeHtml(option)}</span>${game.revealed ? `<div class="bar" style="width:${(game.distribution[index] || 0) / maxCount * 100}%"></div>` : ''}</div>`).join('')}</div></div>`;
  startTimer(game);
}

function renderResults(data) {
  const game = data.game;
  if (!game.question) return renderLobby(data);
  const letters = ['A', 'B', 'C', 'D'];
  const maxCount = Math.max(1, ...game.distribution);
  stage.innerHTML = `<div class="question-stage"><div class="projector-qmeta"><span>Resultado de la pregunta ${game.questionNumber}</span><span>${game.answerCount} respuestas</span></div><h1>${escapeHtml(game.question.text)}</h1><div class="projector-answers">${game.question.options.map((option, index) => `<div class="projector-answer ${index === game.question.correctIndex ? 'correct' : 'dim'}"><span class="answer-letter">${letters[index]}</span><span>${escapeHtml(option)}</span><div class="bar" style="width:${(game.distribution[index] || 0) / maxCount * 100}%"></div></div>`).join('')}</div></div>`;
}

function renderFinished(data) {
  const leaders = data.game.leaderboard;
  stage.innerHTML = `<div class="result-stage"><div><span class="live-label"><span class="dot"></span> Desafío finalizado</span><h1>¡Tenemos resultados!</h1><p>Gracias a todos por participar, aprender y compartir con nosotros.</p></div><div class="projector-leaders"><h2>Clasificación final</h2>${leaders.length ? leaders.slice(0, 6).map((person, index) => `<div class="projector-leader"><b>${index + 1}</b><span>${escapeHtml(person.name)}</span><b>${person.score} pts</b></div>`).join('') : '<p>Aún no hay puntajes.</p>'}</div></div>`;
}

function startTimer(game) {
  clearInterval(timerInterval);
  const update = () => {
    const element = document.querySelector('#projectorTimer');
    if (!element) return;
    const elapsed = (Date.now() - new Date(game.questionStartedAt).getTime()) / 1000;
    const left = Math.max(0, Math.ceil(game.question.duration - elapsed));
    element.textContent = `00:${String(left).padStart(2, '0')}`;
  };
  update();
  timerInterval = setInterval(update, 400);
}

function render(data) {
  lastData = data;
  document.querySelector('#projectorRegistered').textContent = `${data.registered} participante${data.registered === 1 ? '' : 's'}`;
  document.querySelector('#projectorAnswers').textContent = `${data.game.answerCount} respuesta${data.game.answerCount === 1 ? '' : 's'}`;
  const nextSignature = [data.game.status, data.game.questionNumber, data.game.revealed, data.game.answerCount].join('|');
  if (signature === nextSignature) return;
  signature = nextSignature;
  if (data.game.status === 'question') renderQuestion(data);
  else if (data.game.status === 'results') renderResults(data);
  else if (data.game.status === 'finished') renderFinished(data);
  else renderLobby(data);
}

async function refresh() {
  try { render(await api('/api/projector/state')); }
  catch (error) { if (error.status === 401) location.href = '/login.html'; }
}

document.querySelector('#fullscreenButton').addEventListener('click', async () => {
  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
  else await document.exitFullscreen();
});

refresh();
setInterval(refresh, 900);
