import { api, toast, escapeHtml, formatDate } from './common.js';

let state;
let localQuestions = [];
let questionEditing = false;
const titles = {
  resumen: ['Resumen', 'Todo lo que está pasando en la feria.'],
  participantes: ['Participantes', 'Registro y datos de asistentes.'],
  juego: ['Cuestionario en vivo', 'Controla la experiencia que verá el público.'],
  preguntas: ['Preguntas', 'Prepara el contenido antes de iniciar el juego.']
};
const statusNames = { lobby: 'En sala', question: 'Pregunta activa', results: 'Resultados', finished: 'Finalizado' };

function showSection(name) {
  document.querySelectorAll('.admin-section').forEach((section) => section.classList.toggle('active', section.id === `section-${name}`));
  document.querySelectorAll('.nav [data-section]').forEach((link) => link.classList.toggle('active', link.dataset.section === name));
  document.querySelector('#pageTitle').textContent = titles[name][0];
  document.querySelector('#pageSubtitle').textContent = titles[name][1];
  history.replaceState(null, '', `#${name}`);
}

function attendeeRows(attendees) {
  if (!attendees.length) return '<tr><td colspan="6" class="empty">Aún no hay participantes registrados.</td></tr>';
  return attendees.map((person) => `<tr><td><strong>${escapeHtml(person.name)}</strong></td><td>${escapeHtml(person.email)}</td><td>${escapeHtml(person.gender)}</td><td>${escapeHtml(person.ageRange)}</td><td>${escapeHtml(person.prizeName || '—')}</td><td>${formatDate(person.createdAt)}</td></tr>`).join('');
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
  document.querySelector('#recentAttendees').innerHTML = `<div class="table-wrap"><table><tbody>${attendeeRows(data.attendees.slice(0, 5))}</tbody></table></div>`;
  document.querySelector('#attendeeTable').innerHTML = attendeeRows(data.attendees);
  document.querySelector('#summaryLeaders').innerHTML = leaderList(data.game.leaderboard, 5);
  document.querySelector('#fullLeaders').innerHTML = leaderList(data.game.leaderboard);
  document.querySelector('#answerCount').textContent = `${data.game.answerCount} respuesta${data.game.answerCount === 1 ? '' : 's'}`;
  document.querySelector('#questionProgress').textContent = data.game.currentQuestion ? `Pregunta ${data.game.currentQuestionIndex + 1} de ${data.questions.length}` : 'Ninguna pregunta activa.';
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
  if (action === 'start' && state?.game.status !== 'lobby' && !confirm('Esto reiniciará puntajes y comenzará desde la primera pregunta. ¿Continuar?')) return;
  button.disabled = true;
  try {
    await api(`/api/admin/game/${action}`, { method: 'POST' });
    toast(action === 'new-code' ? 'Se generó un nuevo código de sala.' : 'Control actualizado.', 'success');
    await refresh();
  } catch (error) { toast(error.message, 'error'); }
  finally { button.disabled = false; }
}));

document.querySelector('#participantSearch').addEventListener('input', (event) => {
  const term = event.target.value.toLowerCase().trim();
  const filtered = state.attendees.filter((person) => `${person.name} ${person.email}`.toLowerCase().includes(term));
  document.querySelector('#attendeeTable').innerHTML = attendeeRows(filtered);
});

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
