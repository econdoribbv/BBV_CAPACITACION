import { api, toast, escapeHtml } from './common.js';

const card = document.querySelector('#gameCard');
let lastQuestion = null;
let timerId;

function renderWaiting(game, title = 'Espera al anfitrión') {
  card.innerHTML = `<div class="waiting">
    <div class="waiting-visual"><span>✦</span></div>
    <span class="room-code">Conectado al cuestionario</span>
    <h2>${title}</h2>
    <p>Ya estás conectado. Esta pantalla se actualizará automáticamente cuando comience la siguiente actividad.</p>
  </div>`;
}

function renderQuestion(game) {
  const letters = ['A', 'B', 'C', 'D'];
  card.innerHTML = `<div>
    <div class="question-meta"><span>Pregunta ${game.questionNumber} de ${game.questionCount}</span><div class="timer" id="timer"><span>—</span></div></div>
    <h2 class="question-title">${escapeHtml(game.question.text)}</h2>
    <div class="answers">${game.question.options.map((option, index) => `<button class="answer-btn ${game.selectedIndex === index ? 'selected' : ''}" data-answer="${index}" ${game.answered ? 'disabled' : ''}><span class="answer-letter">${letters[index]}</span><span>${escapeHtml(option)}</span></button>`).join('')}</div>
    <div class="answer-state">${game.answered ? 'Respuesta enviada. Espera el resultado…' : 'Elige una respuesta'}</div>
  </div>`;
  card.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', submitAnswer));
  startTimer(game);
}

function renderResults(game) {
  if (!game.question) {
    renderWaiting(game, 'Preparando la siguiente pregunta…');
    return;
  }
  const letters = ['A', 'B', 'C', 'D'];
  card.innerHTML = `<div>
    <div class="question-meta"><span>Resultado ${game.questionNumber} de ${game.questionCount}</span><span>${game.score} puntos</span></div>
    <h2 class="question-title">${escapeHtml(game.question.text)}</h2>
    <div class="answers">${game.question.options.map((option, index) => {
      const cls = index === game.result?.correctIndex ? 'correct' : (index === game.selectedIndex && game.result && !game.result.correct ? 'wrong' : '');
      return `<button class="answer-btn ${cls}" disabled><span class="answer-letter">${letters[index]}</span><span>${escapeHtml(option)}</span></button>`;
    }).join('')}</div>
    ${game.result ? `<div class="result-banner ${game.result.correct ? '' : 'wrong'}">${game.result.correct ? `¡Correcto! +${game.result.points} puntos` : 'Esta vez no fue. ¡Vamos por la siguiente!'}</div>` : '<div class="result-banner wrong">No alcanzaste a responder esta pregunta.</div>'}
  </div>`;
}

function renderFinished(game) {
  card.innerHTML = `<div class="waiting"><div class="success-icon">★</div><span class="room-code">Desafío finalizado</span><h2>¡Gracias por participar!</h2><p>Terminaste con <strong>${game.score} puntos</strong> y ocupas la posición <strong>#${game.rank || '—'}</strong>.</p></div>`;
}

function startTimer(game) {
  clearInterval(timerId);
  const element = document.querySelector('#timer');
  if (!element) return;
  const update = () => {
    const elapsed = (Date.now() - new Date(game.questionStartedAt).getTime()) / 1000;
    const left = Math.max(0, Math.ceil(game.question.duration - elapsed));
    const progress = Math.max(0, Math.min(100, ((game.question.duration - elapsed) / game.question.duration) * 100));
    element.style.setProperty('--progress', `${progress}%`);
    element.querySelector('span').textContent = left;
  };
  update();
  timerId = setInterval(update, 500);
}

async function submitAnswer(event) {
  const button = event.currentTarget;
  card.querySelectorAll('[data-answer]').forEach((item) => { item.disabled = true; });
  button.classList.add('selected');
  try {
    await api('/api/participant/answer', { method: 'POST', body: { answerIndex: Number(button.dataset.answer) } });
    const state = card.querySelector('.answer-state');
    if (state) state.textContent = 'Respuesta enviada. Espera el resultado…';
  } catch (error) {
    toast(error.message, 'error');
    refresh();
  }
}

async function refresh() {
  try {
    const data = await api('/api/participant/state');
    document.querySelector('#greeting').textContent = `¡Hola, ${data.attendee.name.split(' ')[0]}!`;
    document.querySelector('#score').textContent = `${data.game.score} pts`;
    document.querySelector('#rank').textContent = data.game.rank ? `#${data.game.rank}` : '—';
    const signature = [data.game.status, data.game.questionIndex, data.game.answered, data.game.revealed, data.game.result?.correct, data.game.score].join('|');
    if (signature !== lastQuestion) {
      lastQuestion = signature;
      if (data.game.status === 'question') renderQuestion(data.game);
      else if (data.game.status === 'results') renderResults(data.game);
      else if (data.game.status === 'finished') renderFinished(data.game);
      else renderWaiting(data.game);
    }
    const prizeArea = document.querySelector('#prizeArea');
    if (data.attendee.prizeName) {
      const imageMap = { 'Bolígrafo': '/imagenes/boligrafo2.png', 'Regla': '/imagenes/regla.png', 'Libretita': '/imagenes/libreta%20(2).png', 'Portacelular': '/imagenes/portacelular.png', 'Libreta con bolígrafo': '/imagenes/libreta.png' };
      prizeArea.innerHTML = `<div class="prize-callout"><img src="${imageMap[data.attendee.prizeName]}" alt=""><div><span class="eyebrow">Premio asignado</span><h3>${escapeHtml(data.attendee.prizeName)}</h3><p>Muéstrale esta pantalla al equipo para recibirlo.</p></div></div>`;
    }
  } catch (error) {
    if (error.status === 401) location.href = '/?ingresar=1';
  }
}

refresh();
setInterval(refresh, 1200);
