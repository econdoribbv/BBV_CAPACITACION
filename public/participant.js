import { api, toast, escapeHtml } from './common.js?v=20261110';

const card = document.querySelector('#gameCard');
let lastQuestion = null;
let timerId;
let clockOffset = 0;
const serverNow = () => Date.now() + clockOffset;

function renderWaiting(title = 'Espera al anfitrión', text = 'Ya estás conectado. Esta pantalla se actualizará automáticamente cuando comience el juego.') {
  clearInterval(timerId);
  card.innerHTML = `<div class="waiting">
    <div class="waiting-visual"><span>✦</span></div>
    <span class="room-code">Conectado al cuestionario</span>
    <h2>${title}</h2>
    <p>${text}</p>
  </div>`;
}

function lockAnswers(message) {
  card.querySelectorAll('[data-answer]').forEach((button) => { button.disabled = true; });
  const state = card.querySelector('.answer-state');
  if (state && message) state.textContent = message;
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
  if (!game.question) return renderWaiting('Preparando la siguiente pregunta…');
  const letters = ['A', 'B', 'C', 'D'];
  const last = game.questionNumber >= game.questionCount;
  card.innerHTML = `<div>
    <div class="question-meta"><span>Resultado ${game.questionNumber} de ${game.questionCount}</span><span>${game.score} puntos</span></div>
    <h2 class="question-title">${escapeHtml(game.question.text)}</h2>
    <div class="answers">${game.question.options.map((option, index) => {
      const cls = index === game.correctIndex ? 'correct' : (index === game.selectedIndex && game.result && !game.result.correct ? 'wrong' : '');
      return `<button class="answer-btn ${cls}" disabled><span class="answer-letter">${letters[index]}</span><span>${escapeHtml(option)}</span></button>`;
    }).join('')}</div>
    ${game.result ? `<div class="result-banner ${game.result.correct ? '' : 'wrong'}">${game.result.correct ? `¡Correcto! +${game.result.points} puntos` : 'Esta vez no fue. ¡Vamos por la siguiente!'}</div>` : '<div class="result-banner wrong">Se acabó el tiempo y no alcanzaste a responder.</div>'}
    <div class="answer-state" id="nextIn">${last ? 'Calculando resultados finales…' : 'La siguiente pregunta empieza en unos segundos…'}</div>
  </div>`;
  clearInterval(timerId);
  if (game.resultsEndsAt && !last) {
    const update = () => {
      const element = document.querySelector('#nextIn');
      if (!element) return;
      const left = Math.max(0, Math.ceil((game.resultsEndsAt - serverNow()) / 1000));
      element.textContent = `Siguiente pregunta en ${left} s`;
    };
    update();
    timerId = setInterval(update, 300);
  }
}

function renderFinished(game, attendee) {
  clearInterval(timerId);
  const again = attendee.playsLeft > 0
    ? `<a class="btn btn-green" style="margin-top:18px" href="/?otra=1">Jugar otra vez (te queda${attendee.playsLeft === 1 ? '' : 'n'} ${attendee.playsLeft})</a>`
    : '<p style="margin-top:14px">Ya usaste tus 3 participaciones. ¡Gracias por jugar!</p>';
  const winner = game.isWinner && !attendee.prizeName ? '<p><strong>¡Estás entre los mejores puntajes! Atento a la ruleta de premios.</strong></p>' : '';
  card.innerHTML = `<div class="waiting"><div class="success-icon">★</div><span class="room-code">Desafío finalizado</span><h2>¡Gracias por participar!</h2><p>Terminaste con <strong>${game.score} puntos</strong>.</p>${winner}${again}</div>`;
}

function startTimer(game) {
  clearInterval(timerId);
  const element = document.querySelector('#timer');
  if (!element) return;
  const duration = game.question.duration * 1000;
  const update = () => {
    const leftMs = game.questionEndsAt - serverNow();
    const left = Math.max(0, Math.ceil(leftMs / 1000));
    const progress = Math.max(0, Math.min(100, (leftMs / duration) * 100));
    element.style.setProperty('--progress', `${progress}%`);
    element.querySelector('span').textContent = left;
    if (leftMs <= 0) {
      clearInterval(timerId);
      // Time is over: no more answers, even before the next refresh arrives.
      lockAnswers(game.answered || card.querySelector('.answer-btn.selected') ? 'Respuesta enviada. Espera el resultado…' : '¡Se acabó el tiempo!');
    }
  };
  update();
  timerId = setInterval(update, 250);
}

async function submitAnswer(event) {
  const button = event.currentTarget;
  lockAnswers();
  button.classList.add('selected');
  try {
    await api('/api/participant/answer', { method: 'POST', body: { answerIndex: Number(button.dataset.answer) } });
    const state = card.querySelector('.answer-state');
    if (state) state.textContent = 'Respuesta enviada. Espera el resultado…';
  } catch (error) {
    toast(error.message, 'error');
    button.classList.remove('selected');
    lastQuestion = null;
    refresh();
  }
}

async function refresh() {
  try {
    const requested = Date.now();
    const data = await api('/api/participant/state');
    if (data.game.serverNow) clockOffset = data.game.serverNow - Math.round((requested + Date.now()) / 2);
    document.querySelector('#greeting').textContent = `¡Hola, ${data.attendee.name.split(' ')[0]}!`;
    document.querySelector('#score').textContent = `${data.game.score} pts`;
    const signature = [data.game.status, data.game.roundNumber, data.game.questionIndex, data.game.answered, data.game.revealed, data.game.result?.correct, data.game.score, data.game.isWinner, data.attendee.prizeName].join('|');
    if (signature !== lastQuestion) {
      lastQuestion = signature;
      if (data.game.status === 'question') renderQuestion(data.game);
      else if (data.game.status === 'results') renderResults(data.game);
      else if (data.game.status === 'finished') renderFinished(data.game, data.attendee);
      else if (data.game.status === 'waiting-next') renderWaiting('Entrarás en el siguiente juego', 'Hay un juego en curso. Quédate en esta pantalla: cuando el anfitrión abra el próximo juego, empezarás automáticamente.');
      else renderWaiting();
    }
    const prizeArea = document.querySelector('#prizeArea');
    if (data.attendee.prizeName) {
      const imageMap = { 'Bolígrafo': '/imagenes/boligrafo2.png', 'Regla': '/imagenes/regla.png', 'Libretita': '/imagenes/libreta%20(2).png', 'Portacelular': '/imagenes/portacelular.png', 'Libreta con bolígrafo': '/imagenes/libreta.png' };
      prizeArea.innerHTML = `<div class="prize-callout"><img src="${imageMap[data.attendee.prizeName]}" alt=""><div><span class="eyebrow">Premio asignado</span><h3>${escapeHtml(data.attendee.prizeName)}</h3><p>Muéstrale esta pantalla al equipo para recibirlo.</p></div></div>`;
    } else prizeArea.innerHTML = '';
  } catch (error) {
    if (error.status === 401) location.href = '/?ingresar=1';
  }
}

refresh();
setInterval(refresh, 1200);
