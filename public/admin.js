import { api, toast, escapeHtml, formatDate, downloadReport } from './common.js?v=20261112';

let state;
let localQuestions = [];
let questionEditing = false;
const titles = {
  resumen: ['Resumen', 'Todo lo que está pasando en la feria.'],
  participantes: ['Participantes', 'Registro y datos de asistentes.'],
  juego: ['Cuestionario en vivo', 'Controla la experiencia que verá el público.'],
  preguntas: ['Preguntas', 'Prepara el contenido antes de iniciar el juego.']
};
const statusNames = { lobby: 'En sala', question: 'Pregunta activa', results: 'Mostrando respuesta', finished: 'Finalizado' };

function showSection(name) {
  document.querySelectorAll('.admin-section').forEach((section) => section.classList.toggle('active', section.id === `section-${name}`));
  document.querySelectorAll('.nav [data-section]').forEach((link) => link.classList.toggle('active', link.dataset.section === name));
  document.querySelector('#pageTitle').textContent = titles[name][0];
  document.querySelector('#pageSubtitle').textContent = titles[name][1];
  history.replaceState(null, '', `#${name}`);
}

function attendeeRows(attendees, columns = 8) {
  if (!attendees.length) return `<tr><td colspan="${columns}" class="empty">Aún no hay participantes registrados.</td></tr>`;
  return attendees.map((person) => `<tr><td><strong>${escapeHtml(person.name)}</strong></td><td>${escapeHtml(person.email)}</td><td>${escapeHtml(person.gender)}</td><td>${escapeHtml(person.ageRange)}</td>${columns > 6 ? `<td>${person.plays}</td><td>${person.bestScore}</td>` : ''}<td>${escapeHtml(person.prizeName || '—')}</td><td>${formatDate(person.createdAt)}</td></tr>`).join('');
}

function leaderList(leaders, limit = 20) {
  if (!leaders.length || leaders.every((item) => item.score === 0)) return '<div class="empty">La clasificación aparecerá cuando comience el cuestionario.</div>';
  return leaders.slice(0, limit).map((person, index) => `<div class="leader"><span class="leader-rank">${index + 1}</span><strong>${escapeHtml(person.name)}</strong><span>${person.score} pts</span></div>`).join('');
}

function renderActiveQuestion(game) {
  const target = document.querySelector('#activeQuestion');
  if (!game.currentQuestion) {
    target.innerHTML = '<div class="empty">Inicia el juego para ver la pregunta y las respuestas en tiempo real.</div>';
    return;
  }
  const total = Math.max(1, game.answerCount);
  target.innerHTML = `<h3 style="line-height:1.4">${escapeHtml(game.currentQuestion.text)}</h3><div style="display:grid;gap:9px">${game.currentQuestion.options.map((option, index) => {
    const count = game.distribution[index] || 0;
    return `<div style="padding:10px 12px;border-radius:10px;background:${game.revealed && index === game.currentQuestion.correctIndex ? 'var(--green-soft)' : '#f7f6f8'}"><div style="display:flex;justify-content:space-between;gap:10px;font-size:12px;font-weight:750"><span>${escapeHtml(option)}</span><b>${count}</b></div><div style="height:5px;background:#e6e2e9;border-radius:9px;margin-top:7px;overflow:hidden"><div style="height:100%;width:${count / total * 100}%;background:var(--green)"></div></div></div>`;
  }).join('')}</div>`;
}

function renderQuestions() {
  const editor = document.querySelector('#questionEditor');
  editor.innerHTML = localQuestions.map((question, qIndex) => `<article class="question-item" data-question="${qIndex}">
    <div class="question-item-head"><span class="question-number">${qIndex + 1}</span><input class="q-text" maxlength="240" value="${escapeHtml(question.text)}" aria-label="Texto de pregunta ${qIndex + 1}"><button class="icon-btn delete-question" type="button" title="Eliminar">×</button></div>
    <div class="option-editor">${question.options.map((option, oIndex) => `<label class="option-row"><input type="radio" name="correct-${qIndex}" value="${oIndex}" ${question.correctIndex === oIndex ? 'checked' : ''}><input type="text" class="q-option" maxlength="120" value="${escapeHtml(option)}" aria-label="Opción ${oIndex + 1}"></label>`).join('')}</div>
    <div class="question-footer"><span class="duration">Tiempo <input class="q-duration" type="number" min="10" max="90" value="${question.duration}"> segundos</span><span style="color:var(--muted);font-size:11px">Marca el círculo de la respuesta correcta</span></div>
  </article>`).join('');
  editor.querySelectorAll('input').forEach((input) => input.addEventListener('input', () => { questionEditing = true; }));
  editor.querySelectorAll('.delete-question').forEach((button) => button.addEventListener('click', () => {
    if (localQuestions.length === 1) return toast('Debe quedar al menos una pregunta.', 'error');
    localQuestions.splice(Number(button.closest('[data-question]').dataset.question), 1);
    questionEditing = true;
    renderQuestions();
  }));
}

function readQuestionEditor() {
  return [...document.querySelectorAll('.question-item')].map((item, index) => ({
    id: localQuestions[index]?.id,
    text: item.querySelector('.q-text').value,
    options: [...item.querySelectorAll('.q-option')].map((input) => input.value),
    correctIndex: Number(item.querySelector('input[type="radio"]:checked')?.value ?? -1),
    duration: Number(item.querySelector('.q-duration').value)
  }));
}

function render(data) {
  state = data;
  const notice = document.querySelector('#storageNotice');
  notice.classList.toggle('storage-warning', !data.storage?.writable || data.storage?.temporary);
  notice.textContent = !data.storage?.writable
    ? 'Registro cerrado. Configura un disco persistente en /var/data y DATA_DIR=/var/data en Render. Si el disco ya existe, revisa sus permisos y espacio disponible. Puedes descargar los registros actuales.'
    : data.storage.temporary ? 'Registro y ruleta habilitados. El plan gratuito guarda archivos temporales: descarga el informe y el respaldo antes de reiniciar o desplegar.' : data.storage.persistent ? 'Almacenamiento persistente activo · Descarga un respaldo al finalizar cada evento.' : 'Modo local · Los registros se guardan en este equipo.';
  document.querySelector('#staffUser').textContent = data.user;
  document.querySelector('#avatar').textContent = data.user[0];
  document.querySelector('#statAttendees').textContent = data.attendees.length;
  document.querySelector('#statQuestions').textContent = data.questions.length;
  document.querySelector('#statPrizes').textContent = data.spinCount;
  document.querySelector('#statRemaining').textContent = data.prizes.reduce((sum, prize) => sum + prize.remaining, 0);
  document.querySelector('#dashboardCode').textContent = data.game.code;
  document.querySelector('#controlCode').textContent = data.game.code;
  document.querySelector('#gameStatus').textContent = statusNames[data.game.status] || data.game.status;
  document.querySelector('#controlStatus').textContent = statusNames[data.game.status] || data.game.status;
  const game = data.game;
  const missing = Math.max(0, data.minPlayers - game.playerCount);
  const waiting = game.waitingCount ? ` · ${game.waitingCount} esperando el siguiente juego` : '';
  const roundInfo = game.status === 'lobby'
    ? `Juego ${game.number} · ${game.playerCount} en sala${missing ? ` · falta${missing === 1 ? '' : 'n'} ${missing} para iniciar (mínimo ${data.minPlayers})` : ' · listo para iniciar'}${waiting}`
    : game.status === 'finished'
      ? `Juego ${game.number} finalizado · ${game.winners.length} pasan a la ruleta${data.pendingWinners ? ` · ${data.pendingWinners} premios por sortear` : ''}${waiting}. Pulsa “Nuevo juego” o “Iniciar juego” para el siguiente.`
      : `Juego ${game.number} en curso · ${game.playerCount} jugadores${waiting}`;
  document.querySelector('#controlRoundInfo').textContent = roundInfo;
  document.querySelector('#dashboardRoundInfo').textContent = roundInfo;
  document.querySelector('#prizeStock').innerHTML = data.prizes.map((prize) => `<div class="prize-stock-item"><img src="${prize.image}" alt=""><span><strong>${escapeHtml(prize.name)}: ${prize.remaining}</strong><small>${prize.initial - prize.remaining} entregados de ${prize.initial}</small></span></div>`).join('');
  document.querySelector('#recentAttendees').innerHTML = `<div class="table-wrap"><table><tbody>${attendeeRows(data.attendees.slice(0, 5), 6)}</tbody></table></div>`;
  renderFilteredAttendees();
  document.querySelector('#summaryLeaders').innerHTML = leaderList(data.game.leaderboard, 5);
  document.querySelector('#fullLeaders').innerHTML = leaderList(data.game.leaderboard);
  document.querySelector('#answerCount').textContent = `${data.game.answerCount} respuesta${data.game.answerCount === 1 ? '' : 's'}`;
  const left = (end) => Math.max(0, Math.ceil((end - data.game.serverNow) / 1000));
  document.querySelector('#questionProgress').textContent = data.game.currentQuestion && ['question', 'results'].includes(data.game.status)
    ? `Pregunta ${data.game.currentQuestionIndex + 1} de ${data.questions.length} · ${data.game.status === 'question' ? `quedan ${left(data.game.questionEndsAt)} s` : `siguiente en ${left(data.game.resultsEndsAt)} s`}`
    : 'Ninguna pregunta activa.';
  renderActiveQuestion(data.game);
  if (!questionEditing) {
    localQuestions = structuredClone(data.questions);
    renderQuestions();
  }
}

async function refresh() {
  try {
    render(await api('/api/admin/state'));
  } catch (error) {
    if (error.status === 401) location.href = '/login.html';
    else toast(error.message, 'error');
  }
}

async function loadQr() {
  try {
    const qr = await api('/api/admin/qr');
    document.querySelector('#qrImage').src = qr.dataUrl;
    document.querySelector('#qrUrl').textContent = qr.url;
    document.querySelector('#downloadQr').onclick = () => {
      const link = document.createElement('a');
      link.href = qr.dataUrl;
      link.download = 'qr-registro-feria.png';
      link.click();
    };
  } catch (error) { if (error.status === 401) location.href = '/login.html'; }
}

document.querySelectorAll('.nav [data-section]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); showSection(link.dataset.section); }));
document.querySelectorAll('[data-go]').forEach((link) => link.addEventListener('click', (event) => { event.preventDefault(); showSection(link.dataset.go); }));

document.querySelectorAll('[data-game-action]').forEach((button) => button.addEventListener('click', async () => {
  const action = button.dataset.gameAction;
  const running = ['question', 'results'].includes(state?.game.status);
  if (action === 'start' && running && !confirm('Hay un juego en curso. Esto reiniciará sus puntajes y comenzará desde la primera pregunta. ¿Continuar?')) return;
  if (action === 'finish' && !confirm('¿Finalizar el juego ahora? Los 5 mejores puntajes pasarán a la ruleta.')) return;
  button.disabled = true;
  try {
    await api(`/api/admin/game/${action}`, { method: 'POST' });
    toast(action === 'new-round' ? 'Nuevo juego abierto: los participantes que llegan ya pueden unirse.' : 'Control actualizado.', 'success');
    await refresh();
  } catch (error) { toast(error.message, 'error'); }
  finally { button.disabled = false; }
}));

function renderFilteredAttendees() {
  if (!state) return;
  const term = document.querySelector('#participantSearch').value.toLowerCase().trim();
  const filtered = state.attendees.filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(term));
  document.querySelector('#attendeeTable').innerHTML = attendeeRows(filtered);
}
document.querySelector('#participantSearch').addEventListener('input', renderFilteredAttendees);

for (const [id, endpoint, prefix, extension, type] of [
  ['exportExcel', '/api/admin/export.xlsx', 'participantes', 'xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ['exportBackup', '/api/admin/backup.json', 'respaldo', 'json', 'application/json']
]) {
  document.getElementById(id).addEventListener('click', async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await downloadReport(endpoint, `${prefix}-bbv-${new Date().toISOString().slice(0, 10)}.${extension}`, type);
      toast('Descarga iniciada. Revisa las descargas del navegador.', 'success');
    } catch (error) { toast(error.message, 'error'); }
    finally { button.disabled = false; }
  });
}

document.querySelector('#addQuestion').addEventListener('click', () => {
  localQuestions = readQuestionEditor();
  localQuestions.push({ id: crypto.randomUUID(), text: 'Nueva pregunta', options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'], correctIndex: 0, duration: 25 });
  questionEditing = true;
  renderQuestions();
  document.querySelector('.question-item:last-child').scrollIntoView({ behavior: 'smooth', block: 'center' });
});

document.querySelector('#saveQuestions').addEventListener('click', async () => {
  const button = document.querySelector('#saveQuestions');
  button.disabled = true;
  try {
    const result = await api('/api/admin/questions', { method: 'PUT', body: { questions: readQuestionEditor() } });
    localQuestions = result.questions;
    questionEditing = false;
    toast('Cuestionario guardado.', 'success');
    await refresh();
  } catch (error) { toast(error.message, 'error'); }
  finally { button.disabled = false; }
});

document.querySelector('#logoutButton').addEventListener('click', async () => {
  await api('/api/auth/logout', { method: 'POST' });
  location.href = '/login.html';
});

const initialSection = location.hash.slice(1);
if (titles[initialSection]) showSection(initialSection);
refresh();
loadQr();
setInterval(() => { if (!questionEditing) refresh(); }, 1500);
