'use strict';

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const crypto = require('crypto');
const path = require('path');
const { openStorage } = require('./storage');
const { buildXlsx } = require('./xlsx');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const DEFAULT_QUESTIONS = [
  {
    id: crypto.randomUUID(),
    text: '¿Qué representa una acción en el mercado de valores?',
    options: ['Una deuda personal', 'Una parte de una empresa', 'Un impuesto', 'Una moneda extranjera'],
    correctIndex: 1,
    duration: 25
  },
  {
    id: crypto.randomUUID(),
    text: '¿Cuál es una buena práctica antes de invertir?',
    options: ['Invertir sin informarse', 'Usar dinero prestado', 'Conocer el riesgo y diversificar', 'Elegir solo por rumores'],
    correctIndex: 2,
    duration: 25
  },
  {
    id: crypto.randomUUID(),
    text: '¿Qué significa diversificar una inversión?',
    options: ['Poner todo en una opción', 'Repartir entre distintas alternativas', 'Retirar todo el dinero', 'Comprar únicamente dólares'],
    correctIndex: 1,
    duration: 25
  },
  {
    id: crypto.randomUUID(),
    text: '¿Qué relación suele existir entre riesgo y rendimiento?',
    options: ['Nunca se relacionan', 'Más rendimiento esperado suele implicar más riesgo', 'Menos riesgo siempre da más rendimiento', 'El riesgo garantiza ganancias'],
    correctIndex: 1,
    duration: 25
  },
  {
    id: crypto.randomUUID(),
    text: '¿Para qué sirve una bolsa de valores?',
    options: ['Para organizar eventos', 'Para conectar a quienes buscan capital con inversionistas', 'Para fijar salarios', 'Para emitir documentos de identidad'],
    correctIndex: 1,
    duration: 25
  }
];

const DEFAULT_PRIZES = [
  { id: 'pen', name: 'Bolígrafo', initial: 150, remaining: 150, image: '/imagenes/boligrafo2.png', color: '#36BC87' },
  { id: 'ruler', name: 'Regla', initial: 20, remaining: 20, image: '/imagenes/regla.png', color: '#59C8E1' },
  { id: 'mini-notebook', name: 'Libretita', initial: 50, remaining: 50, image: '/imagenes/libreta%20(2).png', color: '#F7941E' },
  { id: 'phone-holder', name: 'Portacelular', initial: 40, remaining: 40, image: '/imagenes/portacelular.png', color: '#654388' },
  { id: 'notebook-pen', name: 'Libreta con bolígrafo', initial: 20, remaining: 20, image: '/imagenes/libreta.png', color: '#EF99C1' }
];

const MIN_PLAYERS = Math.max(1, Number(process.env.MIN_PLAYERS) || 3);
const MAX_WINNERS = 5;
const MAX_PLAYS_PER_EMAIL = 1;
const RESULTS_MS = Math.max(2, Number(process.env.RESULTS_SECONDS) || 6) * 1000;
const ANSWER_GRACE_MS = 800;

function newRound(number) {
  return {
    id: crypto.randomUUID(),
    number,
    code: makeDigits(6),
    status: 'lobby',
    currentQuestionIndex: -1,
    questionStartedAt: null,
    resultsStartedAt: null,
    revealed: false,
    answers: [],
    winners: [],
    createdAt: new Date().toISOString(),
    startedAt: null,
    finishedAt: null,
    updatedAt: new Date().toISOString()
  };
}

function freshStore() {
  return {
    attendees: [],
    questions: DEFAULT_QUESTIONS,
    prizes: DEFAULT_PRIZES,
    spins: [],
    rounds: [],
    game: newRound(1)
  };
}

function normalizeStore(value) {
  const base = freshStore();
  const rounds = Array.isArray(value?.rounds) ? value.rounds : [];
  const game = { ...base.game, ...(value?.game || {}) };
  if (!value?.game?.id) game.number = rounds.length + 1;
  game.answers = Array.isArray(value?.game?.answers) ? value.game.answers : [];
  game.winners = Array.isArray(value?.game?.winners) ? value.game.winners : [];
  const attendees = (Array.isArray(value?.attendees) ? value.attendees : []).map((person) => {
    // Registrations made before rounds existed belong to the game that was running.
    const roundId = person.roundId === undefined ? game.id : person.roundId;
    const roundIds = Array.isArray(person.roundIds) ? person.roundIds : (roundId ? [roundId] : []);
    return { ...person, roundId, roundIds, plays: Number(person.plays) || 1 };
  });
  return {
    ...base,
    ...value,
    attendees,
    questions: Array.isArray(value?.questions) && value.questions.length ? value.questions : base.questions,
    prizes: Array.isArray(value?.prizes) && value.prizes.length ? value.prizes : base.prizes,
    spins: Array.isArray(value?.spins) ? value.spins : [],
    rounds,
    game
  };
}

const storage = openStorage({ root: ROOT, freshStore, normalizeStore });
let store = storage.initial;

function saveStore() {
  try { storage.save(store); }
  catch (error) { store = storage.rollback(); throw error; }
}

function makeDigits(length) {
  let result = '';
  while (result.length < length) result += crypto.randomInt(0, 10).toString();
  return result;
}

function cleanText(value, max = 120) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function roundById(id) {
  if (!id) return null;
  if (store.game.id === id) return store.game;
  return store.rounds.find((round) => round.id === id) || null;
}

// Each email is one row: `roundIds` lists every game played and `roundId` the current one
// (null while waiting for the next game to open).
function roundPlayers(round) {
  return store.attendees.filter((person) => person.roundIds.includes(round.id));
}

function pendingPlayers() {
  return store.attendees.filter((person) => !person.roundId);
}

function joinRound(person, round) {
  person.roundId = round.id;
  if (!person.roundIds.includes(round.id)) person.roundIds.push(round.id);
}

// Whoever received a prize, or is in line for the wheel, cannot play again.
function hasWon(person) {
  if (person.prizeId) return true;
  return [...store.rounds, store.game].some((round) => round.status === 'finished' && (round.winners || []).some((winner) => winner.attendeeId === person.id));
}

// A registration is finished once its game ended; pending players (no game yet) are still active.
function registrationFinished(person) {
  if (!person.roundId) return false;
  const round = roundById(person.roundId);
  return !round || round.status === 'finished';
}

function playsUsed(email) {
  return store.attendees.filter((person) => person.email === email).reduce((sum, person) => sum + person.plays, 0);
}

function scoreBoard(round = store.game) {
  return roundPlayers(round)
    .map((person) => {
      const personAnswers = round.answers.filter((answer) => answer.attendeeId === person.id);
      return {
        id: person.id,
        name: person.name,
        score: personAnswers.reduce((sum, answer) => sum + answer.points, 0),
        correct: personAnswers.filter((answer) => answer.correct).length,
        answered: personAnswers.length
      };
    })
    .sort((a, b) => b.score - a.score || b.correct - a.correct || a.name.localeCompare(b.name, 'es'));
}

function personScore(person, round = roundById(person.roundId)) {
  if (!round) return 0;
  return round.answers.filter((answer) => answer.attendeeId === person.id).reduce((sum, answer) => sum + answer.points, 0);
}

function publicAttendee(person) {
  if (!person) return null;
  const round = roundById(person.roundId);
  const played = person.roundIds.map(roundById).filter(Boolean);
  const won = hasWon(person);
  return {
    id: person.id,
    name: person.name,
    email: person.email,
    gender: person.gender,
    ageRange: person.ageRange,
    createdAt: person.createdAt,
    roundNumber: round?.number || null,
    games: played.map((item) => item.number),
    plays: person.plays,
    score: personScore(person, round),
    bestScore: Math.max(0, ...played.map((item) => personScore(person, item))),
    active: !registrationFinished(person),
    wonPrize: won,
    playsLeft: won ? 0 : Math.max(0, MAX_PLAYS_PER_EMAIL - playsUsed(person.email)),
    prizeId: person.prizeId || null,
    prizeName: store.prizes.find((prize) => prize.id === person.prizeId)?.name || null
  };
}

// Winners still waiting for their spin, oldest game first, then by position.
function winnerQueue() {
  const queue = [];
  for (const round of [...store.rounds, store.game]) {
    if (round.status !== 'finished') continue;
    for (const winner of round.winners || []) {
      const person = store.attendees.find((item) => item.id === winner.attendeeId);
      if (person && !person.prizeId) queue.push({ attendeeId: person.id, name: person.name, rank: winner.rank, score: winner.score, roundNumber: round.number });
    }
  }
  return queue;
}

// Owner-requested reset for the complete staff roster. Old plaintext Render
// variables no longer override the credentials delivered to the owner.
const configuredStaffHashes = require('./staff-credentials.json');
const staffHashes = {};
for (const username of ['admin', 'cjustiniano', 'dpinto', 'avega']) {
  const key = `${username.toUpperCase()}_PASSWORD_HASH`;
  const hash = process.env[key] || configuredStaffHashes[username];
  if (typeof hash !== 'string' || !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash)) {
    throw new Error(`${key} debe contener un hash bcrypt válido.`);
  }
  staffHashes[username] = hash;
}

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !req.path.startsWith('/auth/') && !storage.status.writable) {
    return res.status(503).json({ error: 'El registro está temporalmente cerrado: el equipo debe habilitar el almacenamiento seguro.' });
  }
  next();
});
app.use(session({
  name: 'feria.sid',
  secret: process.env.SESSION_SECRET || 'solo-desarrollo-cambiar-antes-de-publicar-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: IS_PRODUCTION, maxAge: 1000 * 60 * 60 * 10 }
}));
app.use('/imagenes', express.static(path.join(ROOT, 'imagenes'), { maxAge: '1d' }));
app.use((req, res, next) => {
  const staffPages = ['/admin', '/admin.html', '/projector', '/projector.html', '/qr', '/qr.html', '/wheel', '/wheel.html'];
  if (staffPages.includes(req.path) && !req.session.staffUser) {
    if (req.path === '/wheel' || req.path === '/wheel.html') return res.redirect('/ruleta.html');
    return res.redirect(`/login.html?next=${encodeURIComponent(req.path.endsWith('.html') ? req.path : `${req.path}.html`)}`);
  }
  if (req.path === '/participant' || req.path === '/participant.html') {
    const participant = store.attendees.find((item) => item.id === req.session.participantId);
    if (!participant) return res.redirect('/?registro=1');
  }
  next();
});
app.use(express.static(path.join(ROOT, 'public'), {
  extensions: ['html'],
  maxAge: IS_PRODUCTION ? '10m' : 0,
  setHeaders(res, file) {
    // HTML selects the asset versions. Never retain an old page across deploys.
    if (path.extname(file) === '.html') res.setHeader('Cache-Control', 'private, no-store');
    else if (['.js', '.css'].includes(path.extname(file))) res.setHeader('Cache-Control', 'no-cache');
  }
}));

function requireStaff(req, res, next) {
  if (!req.session.staffUser) return res.status(401).json({ error: 'Inicia sesión como organizador.' });
  next();
}

function requireParticipant(req, res, next) {
  const person = store.attendees.find((item) => item.id === req.session.participantId);
  if (!person) return res.status(401).json({ error: 'Ingresa con tu código de participante.' });
  req.participant = person;
  next();
}

function touchGame() {
  store.game.updatedAt = new Date().toISOString();
  saveStore();
}

function currentQuestion() {
  return store.questions[store.game.currentQuestionIndex] || null;
}

function questionEndsAt(game = store.game) {
  const question = store.questions[game.currentQuestionIndex];
  if (!question || !game.questionStartedAt) return null;
  return new Date(game.questionStartedAt).getTime() + question.duration * 1000;
}

function resultsEndsAt(game = store.game) {
  return game.resultsStartedAt ? new Date(game.resultsStartedAt).getTime() + RESULTS_MS : null;
}

function claimPendingPlayers(round) {
  for (const person of pendingPlayers()) joinRound(person, round);
}

function openNewRound() {
  if (store.game.status !== 'finished' && store.game.status !== 'lobby') return false;
  if (store.game.status === 'finished') {
    store.rounds.push(store.game);
    store.game = newRound(store.rounds.length + 1);
  }
  claimPendingPlayers(store.game);
  return true;
}

function startQuestion(index, now = Date.now()) {
  store.game.status = 'question';
  store.game.currentQuestionIndex = index;
  store.game.questionStartedAt = new Date(now).toISOString();
  store.game.resultsStartedAt = null;
  store.game.revealed = false;
}

function revealQuestion(now = Date.now()) {
  store.game.status = 'results';
  store.game.revealed = true;
  store.game.resultsStartedAt = new Date(now).toISOString();
}

function finishRound(now = Date.now()) {
  const game = store.game;
  game.status = 'finished';
  game.revealed = true;
  game.resultsStartedAt = null;
  game.finishedAt = new Date(now).toISOString();
  // Only the best scores of this game go to the wheel; people who never answered are skipped.
  game.winners = scoreBoard(game)
    .filter((item) => item.answered > 0)
    .slice(0, MAX_WINNERS)
    .map((item, index) => ({ attendeeId: item.id, rank: index + 1, score: item.score }));
}

function goToNext(now = Date.now()) {
  if (store.game.currentQuestionIndex + 1 >= store.questions.length) finishRound(now);
  else startQuestion(store.game.currentQuestionIndex + 1, now);
}

// Time drives the game: questions close by themselves, results last a few seconds
// and the next question (or the end of the game) follows without the host.
function advanceGame(now = Date.now()) {
  let changed = false;
  for (let guard = 0; guard < 4; guard += 1) {
    const game = store.game;
    if (game.status === 'question') {
      const endsAt = questionEndsAt(game);
      if (endsAt === null) { finishRound(now); changed = true; break; }
      const players = roundPlayers(game).length;
      const answered = game.answers.filter((answer) => answer.questionIndex === game.currentQuestionIndex).length;
      if (now >= endsAt + ANSWER_GRACE_MS || (players > 0 && answered >= players)) { revealQuestion(now); changed = true; }
      break;
    }
    if (game.status === 'results' && now >= (resultsEndsAt(game) ?? now)) { goToNext(now); changed = true; continue; }
    break;
  }
  if (changed) touchGame();
}

function safeAdvance() {
  try { advanceGame(); } catch (error) { console.error(error); }
}
setInterval(safeAdvance, 250);

function gameTiming(game = store.game) {
  return {
    serverNow: Date.now(),
    questionEndsAt: game.status === 'question' ? questionEndsAt(game) : null,
    resultsEndsAt: game.status === 'results' ? resultsEndsAt(game) : null
  };
}

function distribution(question, answers) {
  return question ? question.options.map((_, index) => answers.filter((answer) => answer.answerIndex === index).length) : [];
}

function winnerSummary(round) {
  return (round?.winners || []).map((winner) => {
    const person = store.attendees.find((item) => item.id === winner.attendeeId);
    return { attendeeId: winner.attendeeId, name: person?.name || '—', rank: winner.rank, score: winner.score, prizeName: store.prizes.find((prize) => prize.id === person?.prizeId)?.name || null };
  });
}

function lastFinishedRound() {
  if (store.game.status === 'finished') return store.game;
  return store.rounds[store.rounds.length - 1] || null;
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/public', (req, res) => {
  res.json({
    registrationOpen: storage.status.writable,
    gameStatus: store.game.status,
    registered: store.attendees.length,
    maxPlays: MAX_PLAYS_PER_EMAIL,
    participant: publicAttendee(store.attendees.find((person) => person.id === req.session.participantId))
  });
});

app.post('/api/register', (req, res) => {
  const name = cleanText(req.body.name, 80);
  const email = cleanText(req.body.email, 120).toLowerCase();
  const gender = cleanText(req.body.gender, 30);
  const ageRange = cleanText(req.body.ageRange, 10);
  const allowedGenders = ['Femenino', 'Masculino', 'Otro', 'Prefiero no decir'];
  const allowedAges = ['18-25', '26-36', '37-50'];

  const nameParts = name.split(' ').filter(Boolean);
  if (name.length < 5 || nameParts.length < 2 || !/^[\p{L}][\p{L}\s'.-]+$/u.test(name)) {
    return res.status(400).json({ error: 'Escribe tu nombre y apellido válidos.' });
  }
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(email) || email.includes('..')) {
    return res.status(400).json({ error: 'Escribe un correo electrónico válido.' });
  }
  if (!allowedGenders.includes(gender)) return res.status(400).json({ error: 'Selecciona una opción de género.' });
  if (!allowedAges.includes(ageRange)) return res.status(400).json({ error: 'Selecciona tu rango de edad.' });

  const previous = store.attendees.filter((person) => person.email === email);
  let person = previous[previous.length - 1];
  if (person && !registrationFinished(person)) {
    // Scanning again (or from another browser) returns to the same game.
    if (req.session.participantId === person.id || person.name.toLowerCase() === name.toLowerCase()) {
      req.session.participantId = person.id;
      return res.status(200).json({ attendee: publicAttendee(person), resumed: true });
    }
    return res.status(409).json({ error: 'Este correo ya está inscrito en el juego actual.' });
  }
  if (previous.some(hasWon)) {
    return res.status(409).json({ error: 'Este correo ya ganó un premio y no puede volver a jugar.' });
  }
  if (playsUsed(email) >= MAX_PLAYS_PER_EMAIL) {
    return res.status(409).json({ error: 'Este correo ya fue registrado. Para volver a jugar, regístrate con otro correo.' });
  }

  if (person) {
    // Playing again keeps the same row in the list and only raises the counter.
    person.plays += 1;
    person.roundId = null;
  } else {
    person = { id: crypto.randomUUID(), name, email, gender, ageRange, createdAt: new Date().toISOString(), plays: 1, roundId: null, roundIds: [], prizeId: null };
    store.attendees.push(person);
  }
  // Joins the game waiting in the lobby; if one is running, waits for the next one.
  if (store.game.status === 'lobby') joinRound(person, store.game);
  saveStore();
  req.session.participantId = person.id;
  res.status(201).json({ attendee: publicAttendee(person) });
});

app.get('/api/participant/state', requireParticipant, (req, res) => {
  safeAdvance();
  const person = req.participant;
  const round = roundById(person.roundId);
  const attendee = publicAttendee(person);
  if (!round) return res.json({ attendee, game: { status: 'waiting-next', score: 0 } });
  if (round !== store.game || round.status === 'finished') {
    return res.json({ attendee, game: { status: 'finished', roundNumber: round.number, score: attendee.score, isWinner: (round.winners || []).some((winner) => winner.attendeeId === person.id) } });
  }
  const game = store.game;
  const question = currentQuestion();
  const answer = game.answers.find((item) => item.attendeeId === person.id && item.questionIndex === game.currentQuestionIndex);
  res.json({
    attendee,
    game: {
      roundNumber: game.number,
      status: game.status,
      questionIndex: game.currentQuestionIndex,
      questionNumber: game.currentQuestionIndex + 1,
      questionCount: store.questions.length,
      questionStartedAt: game.questionStartedAt,
      ...gameTiming(game),
      revealed: game.revealed,
      question: question && ['question', 'results'].includes(game.status) ? {
        text: question.text,
        options: question.options,
        duration: question.duration
      } : null,
      result: game.revealed && answer ? { correct: answer.correct, points: answer.points, correctIndex: question?.correctIndex } : null,
      correctIndex: game.revealed ? question?.correctIndex ?? null : null,
      answered: Boolean(answer),
      selectedIndex: answer?.answerIndex ?? null,
      score: attendee.score
    }
  });
});

app.post('/api/participant/answer', requireParticipant, (req, res) => {
  safeAdvance();
  const game = store.game;
  if (req.participant.roundId !== game.id) return res.status(409).json({ error: 'Todavía no estás en este juego. Espera el siguiente.' });
  if (game.status !== 'question' || game.revealed) return res.status(409).json({ error: 'El tiempo terminó: la pregunta ya no recibe respuestas.' });
  const question = currentQuestion();
  const answerIndex = Number(req.body.answerIndex);
  if (!question || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) {
    return res.status(400).json({ error: 'Respuesta inválida.' });
  }
  const now = Date.now();
  if (now > questionEndsAt(game) + ANSWER_GRACE_MS) return res.status(409).json({ error: 'El tiempo terminó: la pregunta ya no recibe respuestas.' });
  const alreadyAnswered = game.answers.some((answer) => answer.attendeeId === req.participant.id && answer.questionIndex === game.currentQuestionIndex);
  if (alreadyAnswered) return res.status(409).json({ error: 'Ya respondiste esta pregunta.' });

  const elapsed = Math.max(0, now - new Date(game.questionStartedAt).getTime());
  const correct = answerIndex === question.correctIndex;
  const speedBonus = Math.max(0, 500 - Math.round((elapsed / (question.duration * 1000)) * 500));
  const points = correct ? 500 + speedBonus : 0;
  game.answers.push({
    attendeeId: req.participant.id,
    questionIndex: game.currentQuestionIndex,
    answerIndex,
    correct,
    points,
    answeredAt: new Date(now).toISOString()
  });
  saveStore();
  safeAdvance();
  res.json({ ok: true, selectedIndex: answerIndex });
});

const loginAttempts = new Map();
app.post('/api/auth/login', (req, res) => {
  const username = cleanText(req.body.username, 40).toLowerCase();
  const password = String(req.body.password || '');
  const attemptKey = `${req.ip}:${username}`;
  const attempt = loginAttempts.get(attemptKey) || { count: 0, blockedUntil: 0 };
  if (Date.now() < attempt.blockedUntil) return res.status(429).json({ error: 'Demasiados intentos. Espera un minuto.' });

  if (!staffHashes[username] || !bcrypt.compareSync(password, staffHashes[username])) {
    attempt.count += 1;
    if (attempt.count >= 5) {
      attempt.count = 0;
      attempt.blockedUntil = Date.now() + 60_000;
    }
    loginAttempts.set(attemptKey, attempt);
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  }
  loginAttempts.delete(attemptKey);
  req.session.staffUser = username;
  res.json({ user: username });
});

app.post('/api/auth/logout', requireStaff, (req, res) => {
  delete req.session.staffUser;
  res.json({ ok: true });
});

app.get('/api/admin/state', requireStaff, (req, res) => {
  safeAdvance();
  const question = currentQuestion();
  const currentAnswers = store.game.answers.filter((answer) => answer.questionIndex === store.game.currentQuestionIndex);
  res.json({
    user: req.session.staffUser,
    storage: storage.status,
    minPlayers: MIN_PLAYERS,
    maxPlays: MAX_PLAYS_PER_EMAIL,
    attendees: store.attendees.map(publicAttendee).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    questions: store.questions,
    prizes: store.prizes,
    spins: store.spins.slice(-50).reverse(),
    spinCount: store.spins.length,
    roundsPlayed: store.rounds.length + (store.game.status === 'finished' ? 1 : 0),
    pendingWinners: winnerQueue().length,
    game: {
      ...store.game,
      ...gameTiming(),
      playerCount: roundPlayers(store.game).length,
      waitingCount: pendingPlayers().length,
      currentQuestion: question,
      answerCount: currentAnswers.length,
      distribution: distribution(question, currentAnswers),
      leaderboard: scoreBoard().slice(0, 20),
      winners: winnerSummary(store.game)
    }
  });
});

app.get('/api/projector/state', requireStaff, (req, res) => {
  safeAdvance();
  const question = currentQuestion();
  const currentAnswers = store.game.answers.filter((answer) => answer.questionIndex === store.game.currentQuestionIndex);
  res.json({
    registered: roundPlayers(store.game).length,
    minPlayers: MIN_PLAYERS,
    pendingWinners: winnerQueue().length,
    game: {
      id: store.game.id,
      roundNumber: store.game.number,
      code: store.game.code,
      status: store.game.status,
      questionNumber: store.game.currentQuestionIndex + 1,
      questionCount: store.questions.length,
      questionStartedAt: store.game.questionStartedAt,
      ...gameTiming(),
      revealed: store.game.revealed,
      question,
      answerCount: currentAnswers.length,
      distribution: distribution(question, currentAnswers),
      winners: store.game.status === 'finished' ? winnerSummary(store.game) : []
    }
  });
});

app.get('/api/wheel/state', requireStaff, (req, res) => {
  safeAdvance();
  const recent = lastFinishedRound();
  res.json({
    user: req.session.staffUser,
    // The wheel is projected: it never exposes how many prizes remain.
    prizes: store.prizes.map(({ id, name, image, color }) => ({ id, name, image, color })),
    prizesAvailable: store.prizes.some((prize) => prize.remaining > 0),
    queue: winnerQueue(),
    recentRound: recent ? { id: recent.id, number: recent.number, winners: winnerSummary(recent) } : null,
    game: { id: store.game.id, status: store.game.status, roundNumber: store.game.number },
    spins: store.spins.slice(-50).reverse(),
    spinCount: store.spins.length
  });
});

app.get('/api/admin/qr', requireStaff, async (req, res, next) => {
  try {
    const configured = cleanText(process.env.PUBLIC_URL, 300).replace(/\/$/, '');
    const origin = configured || `${req.protocol}://${req.get('host')}`;
    const url = `${origin}/?registro=1`;
    const dataUrl = await QRCode.toDataURL(url, { width: 700, margin: 2, color: { dark: '#18172A', light: '#FFFFFF' } });
    res.json({ url, dataUrl });
  } catch (error) {
    next(error);
  }
});

// Opens a new game so people who arrive later can play. Finished games stay in the history.
app.post('/api/admin/game/new-round', requireStaff, (_req, res) => {
  if (!openNewRound()) return res.status(409).json({ error: 'Finaliza el juego en curso antes de abrir uno nuevo.' });
  touchGame();
  res.json({ ok: true, roundNumber: store.game.number });
});

app.post('/api/admin/game/start', requireStaff, (_req, res) => {
  if (!store.questions.length) return res.status(409).json({ error: 'Agrega al menos una pregunta.' });
  if (store.game.status === 'finished' || store.game.status === 'lobby') openNewRound();
  else claimPendingPlayers(store.game);
  const players = roundPlayers(store.game).length;
  if (players < MIN_PLAYERS) {
    touchGame();
    return res.status(409).json({ error: `Se necesitan al menos ${MIN_PLAYERS} participantes registrados para iniciar (hay ${players}).` });
  }
  store.game.answers = [];
  store.game.winners = [];
  store.game.startedAt = new Date().toISOString();
  startQuestion(0);
  touchGame();
  res.json({ ok: true });
});

app.post('/api/admin/game/reveal', requireStaff, (_req, res) => {
  if (store.game.status !== 'question') return res.status(409).json({ error: 'No hay una pregunta activa.' });
  revealQuestion();
  touchGame();
  res.json({ ok: true });
});

app.post('/api/admin/game/next', requireStaff, (_req, res) => {
  if (!['question', 'results'].includes(store.game.status)) return res.status(409).json({ error: 'No hay un juego en curso.' });
  goToNext();
  touchGame();
  res.json({ ok: true });
});

app.post('/api/admin/game/finish', requireStaff, (_req, res) => {
  if (!['question', 'results'].includes(store.game.status)) return res.status(409).json({ error: 'No hay un juego en curso.' });
  finishRound();
  touchGame();
  res.json({ ok: true });
});

app.put('/api/admin/questions', requireStaff, (req, res) => {
  const input = Array.isArray(req.body.questions) ? req.body.questions : [];
  if (!input.length || input.length > 50) return res.status(400).json({ error: 'Debe haber entre 1 y 50 preguntas.' });
  const questions = [];
  for (const item of input) {
    const text = cleanText(item.text, 240);
    const options = Array.isArray(item.options) ? item.options.map((option) => cleanText(option, 120)) : [];
    const correctIndex = Number(item.correctIndex);
    const duration = Math.min(90, Math.max(10, Number(item.duration) || 25));
    if (text.length < 5 || options.length !== 4 || options.some((option) => option.length < 1) || !Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      return res.status(400).json({ error: 'Revisa el texto, las cuatro opciones y la respuesta correcta de cada pregunta.' });
    }
    questions.push({ id: cleanText(item.id, 50) || crypto.randomUUID(), text, options, correctIndex, duration });
  }
  store.questions = questions;
  // A game in progress restarts in the lobby; finished games keep their results.
  if (['question', 'results'].includes(store.game.status)) {
    store.game.status = 'lobby';
    store.game.currentQuestionIndex = -1;
    store.game.questionStartedAt = null;
    store.game.resultsStartedAt = null;
    store.game.revealed = false;
    store.game.answers = [];
  }
  touchGame();
  res.json({ questions: store.questions });
});

app.post('/api/admin/wheel/spin', requireStaff, (req, res) => {
  const expected = cleanText(req.body.attendeeId, 60);
  const next = winnerQueue()[0];
  if (!next) return res.status(409).json({ error: 'No hay ganadores pendientes de sorteo.' });
  if (expected && expected !== next.attendeeId) return res.status(409).json({ error: 'La lista de ganadores cambió. La ruleta se actualizó.' });
  const attendee = store.attendees.find((person) => person.id === next.attendeeId);
  const available = store.prizes.filter((prize) => prize.remaining > 0);
  const total = available.reduce((sum, prize) => sum + prize.remaining, 0);
  if (!total) return res.status(409).json({ error: 'Se agotaron todos los premios.' });

  let ticket = crypto.randomInt(0, total);
  let selected = available[0];
  for (const prize of available) {
    if (ticket < prize.remaining) {
      selected = prize;
      break;
    }
    ticket -= prize.remaining;
  }
  selected.remaining -= 1;
  attendee.prizeId = selected.id;
  const spin = {
    id: crypto.randomUUID(),
    attendeeId: attendee.id,
    attendeeName: attendee.name,
    roundNumber: next.roundNumber,
    rank: next.rank,
    prizeId: selected.id,
    prizeName: selected.name,
    createdAt: new Date().toISOString(),
    staffUser: req.session.staffUser
  };
  store.spins.push(spin);
  saveStore();
  const { remaining, initial, ...prize } = selected;
  res.json({ spin, prize, attendee: publicAttendee(attendee) });
});

app.post('/api/admin/wheel/undo', requireStaff, (req, res) => {
  const spinId = cleanText(req.body.spinId, 60);
  const index = store.spins.findIndex((spin) => spin.id === spinId);
  if (index < 0) return res.status(404).json({ error: 'Giro no encontrado.' });
  const [spin] = store.spins.splice(index, 1);
  const prize = store.prizes.find((item) => item.id === spin.prizeId);
  const attendee = store.attendees.find((item) => item.id === spin.attendeeId);
  if (prize) prize.remaining = Math.min(prize.initial, prize.remaining + 1);
  if (attendee?.prizeId === spin.prizeId) attendee.prizeId = null;
  saveStore();
  res.json({ ok: true });
});

// One row per person (email), with how many times they played.
function reportRows(formatDate) {
  const rows = [['Nombre', 'Correo', 'Género', 'Edad', 'Veces que jugó', 'Juegos', 'Mejor puntaje', 'Premio', 'Fecha de registro']];
  for (const person of store.attendees) {
    const info = publicAttendee(person);
    rows.push([info.name, info.email, info.gender, info.ageRange, info.plays, info.games.join(', ') || 'En espera', info.bestScore, info.prizeName || '', formatDate(info.createdAt)]);
  }
  return rows;
}

const reportDate = new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/La_Paz' });

app.get('/api/admin/export.xlsx', requireStaff, (_req, res) => {
  const file = buildXlsx(reportRows((value) => reportDate.format(new Date(value))), { sheetName: 'Participantes', widths: [30, 34, 18, 10, 15, 12, 15, 24, 20] });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="participantes-bbv-${new Date().toISOString().slice(0, 10)}.xlsx"`);
  res.send(file);
});

app.get('/api/admin/export.csv', requireStaff, (_req, res) => {
  const escape = (value) => {
    let text = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const csv = `﻿${reportRows((value) => value).map((row) => row.map(escape).join(',')).join('\r\n')}`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="participantes-bbv-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

app.get('/api/admin/backup.json', requireStaff, (_req, res) => {
  res.setHeader('Content-Disposition', `attachment; filename="respaldo-bbv-${new Date().toISOString().slice(0, 10)}.json"`);
  res.type('application/json').send(JSON.stringify(store, null, 2));
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Ocurrió un error inesperado.' });
});

app.listen(PORT, () => {
  console.log(`Conecta y Participa disponible en http://localhost:${PORT}`);
});
