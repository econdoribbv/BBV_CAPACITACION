'use strict';

const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
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

function freshStore() {
  return {
    attendees: [],
    questions: DEFAULT_QUESTIONS,
    prizes: DEFAULT_PRIZES,
    spins: [],
    game: {
      code: makeDigits(6),
      status: 'lobby',
      currentQuestionIndex: -1,
      questionStartedAt: null,
      revealed: false,
      answers: [],
      updatedAt: new Date().toISOString()
    }
  };
}

function normalizeStore(value) {
  const base = freshStore();
  return {
    ...base,
    ...value,
    attendees: Array.isArray(value?.attendees) ? value.attendees : [],
    questions: Array.isArray(value?.questions) && value.questions.length ? value.questions : base.questions,
    prizes: Array.isArray(value?.prizes) && value.prizes.length ? value.prizes : base.prizes,
    spins: Array.isArray(value?.spins) ? value.spins : [],
    game: { ...base.game, ...(value?.game || {}), answers: Array.isArray(value?.game?.answers) ? value.game.answers : [] }
  };
}

fs.mkdirSync(DATA_DIR, { recursive: true });
let store;
try {
  store = normalizeStore(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
} catch {
  store = freshStore();
}

function saveStore() {
  const temp = `${DATA_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(store, null, 2));
  fs.renameSync(temp, DATA_FILE);
}
saveStore();

function makeDigits(length) {
  let result = '';
  while (result.length < length) result += crypto.randomInt(0, 10).toString();
  return result;
}

function cleanText(value, max = 120) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function publicAttendee(person) {
  if (!person) return null;
  return {
    id: person.id,
    name: person.name,
    email: person.email,
    gender: person.gender,
    ageRange: person.ageRange,
    createdAt: person.createdAt,
    prizeId: person.prizeId || null,
    prizeName: store.prizes.find((prize) => prize.id === person.prizeId)?.name || null
  };
}

function scoreBoard() {
  return store.attendees
    .map((person) => {
      const personAnswers = store.game.answers.filter((answer) => answer.attendeeId === person.id);
      return {
        id: person.id,
        name: person.name,
        score: personAnswers.reduce((sum, answer) => sum + answer.points, 0),
        correct: personAnswers.filter((answer) => answer.correct).length
      };
    })
    .sort((a, b) => b.score - a.score || b.correct - a.correct || a.name.localeCompare(b.name, 'es'));
}

const staffPasswords = {
  admin: process.env.ADMIN_PASSWORD || 'AdminFeria2026!',
  cjustiniano: process.env.CJUSTINIANO_PASSWORD || 'Cjustiniano2026!',
  dpinto: process.env.DPINTO_PASSWORD || 'Dpinto2026!'
};
const staffHashes = Object.fromEntries(Object.entries(staffPasswords).map(([user, pass]) => [user, bcrypt.hashSync(pass, 10)]));

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
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
    return res.redirect('/login.html?next=%2Fqr.html');
  }
  if (req.path === '/participant' || req.path === '/participant.html') {
    const participant = store.attendees.find((item) => item.id === req.session.participantId);
    if (!participant) return res.redirect('/?registro=1');
  }
  next();
});
app.use(express.static(path.join(ROOT, 'public'), { extensions: ['html'], maxAge: IS_PRODUCTION ? '10m' : 0 }));

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

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/public', (req, res) => {
  res.json({
    gameStatus: store.game.status,
    registered: store.attendees.length,
    participant: publicAttendee(store.attendees.find((person) => person.id === req.session.participantId))
  });
});

app.post('/api/register', (req, res) => {
  const name = cleanText(req.body.name, 80);
  const email = cleanText(req.body.email, 120).toLowerCase();
  const gender = cleanText(req.body.gender, 30);
  const ageRange = cleanText(req.body.ageRange, 10);
  const allowedGenders = ['Femenino', 'Masculino', 'Otro', 'Prefiero no decir'];
  const allowedAges = ['18-23', '24-28'];

  const nameParts = name.split(' ').filter(Boolean);
  if (name.length < 5 || nameParts.length < 2 || !/^[\p{L}][\p{L}\s'.-]+$/u.test(name)) {
    return res.status(400).json({ error: 'Escribe tu nombre y apellido válidos.' });
  }
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(email) || email.includes('..')) {
    return res.status(400).json({ error: 'Escribe un correo electrónico válido.' });
  }
  if (!allowedGenders.includes(gender)) return res.status(400).json({ error: 'Selecciona una opción de género.' });
  if (!allowedAges.includes(ageRange)) return res.status(400).json({ error: 'Selecciona tu rango de edad.' });

  const existing = store.attendees.find((person) => person.email === email);
  if (existing) {
    return res.status(409).json({ error: 'Este correo ya fue registrado. Solicita ayuda al equipo organizador.' });
  }

  const person = {
    id: crypto.randomUUID(),
    name,
    email,
    gender,
    ageRange,
    createdAt: new Date().toISOString(),
    prizeId: null
  };
  store.attendees.push(person);
  saveStore();
  req.session.participantId = person.id;
  res.status(201).json({ attendee: publicAttendee(person) });
});

app.get('/api/participant/state', requireParticipant, (req, res) => {
  const question = currentQuestion();
  const answer = store.game.answers.find((item) => item.attendeeId === req.participant.id && item.questionIndex === store.game.currentQuestionIndex);
  const rank = scoreBoard().findIndex((item) => item.id === req.participant.id) + 1;
  const personScore = scoreBoard().find((item) => item.id === req.participant.id)?.score || 0;
  res.json({
    attendee: publicAttendee(req.participant),
    game: {
      code: store.game.code,
      status: store.game.status,
      questionIndex: store.game.currentQuestionIndex,
      questionNumber: store.game.currentQuestionIndex + 1,
      questionCount: store.questions.length,
      questionStartedAt: store.game.questionStartedAt,
      revealed: store.game.revealed,
      question: question && ['question', 'results'].includes(store.game.status) ? {
        text: question.text,
        options: question.options,
        duration: question.duration
      } : null,
      result: store.game.revealed && answer ? { correct: answer.correct, points: answer.points, correctIndex: question?.correctIndex } : null,
      answered: Boolean(answer),
      selectedIndex: answer?.answerIndex ?? null,
      score: personScore,
      rank
    }
  });
});

app.post('/api/participant/answer', requireParticipant, (req, res) => {
  if (store.game.status !== 'question' || store.game.revealed) return res.status(409).json({ error: 'La pregunta no está recibiendo respuestas.' });
  const question = currentQuestion();
  const answerIndex = Number(req.body.answerIndex);
  if (!question || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) {
    return res.status(400).json({ error: 'Respuesta inválida.' });
  }
  const alreadyAnswered = store.game.answers.some((answer) => answer.attendeeId === req.participant.id && answer.questionIndex === store.game.currentQuestionIndex);
  if (alreadyAnswered) return res.status(409).json({ error: 'Ya respondiste esta pregunta.' });

  const elapsed = Math.max(0, Date.now() - new Date(store.game.questionStartedAt).getTime());
  const correct = answerIndex === question.correctIndex;
  const speedBonus = Math.max(0, 500 - Math.round((elapsed / (question.duration * 1000)) * 500));
  const points = correct ? 500 + speedBonus : 0;
  store.game.answers.push({
    attendeeId: req.participant.id,
    questionIndex: store.game.currentQuestionIndex,
    answerIndex,
    correct,
    points,
    answeredAt: new Date().toISOString()
  });
  saveStore();
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
  const question = currentQuestion();
  const currentAnswers = store.game.answers.filter((answer) => answer.questionIndex === store.game.currentQuestionIndex);
  res.json({
    user: req.session.staffUser,
    attendees: store.attendees.map(publicAttendee).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    questions: store.questions,
    prizes: store.prizes,
    spins: store.spins.slice(-50).reverse(),
    spinCount: store.spins.length,
    game: {
      ...store.game,
      currentQuestion: question,
      answerCount: currentAnswers.length,
      distribution: question ? question.options.map((_, index) => currentAnswers.filter((answer) => answer.answerIndex === index).length) : [],
      leaderboard: scoreBoard().slice(0, 20)
    }
  });
});

app.get('/api/projector/state', requireStaff, (req, res) => {
  const question = currentQuestion();
  const currentAnswers = store.game.answers.filter((answer) => answer.questionIndex === store.game.currentQuestionIndex);
  res.json({
    registered: store.attendees.length,
    game: {
      code: store.game.code,
      status: store.game.status,
      questionNumber: store.game.currentQuestionIndex + 1,
      questionCount: store.questions.length,
      questionStartedAt: store.game.questionStartedAt,
      revealed: store.game.revealed,
      question,
      answerCount: currentAnswers.length,
      distribution: question ? question.options.map((_, index) => currentAnswers.filter((answer) => answer.answerIndex === index).length) : [],
      leaderboard: scoreBoard().slice(0, 8)
    }
  });
});

app.get('/api/wheel/state', requireStaff, (req, res) => {
  res.json({
    user: req.session.staffUser,
    attendees: store.attendees.map(publicAttendee).sort((a, b) => a.name.localeCompare(b.name, 'es')),
    prizes: store.prizes,
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

app.post('/api/admin/game/lobby', requireStaff, (_req, res) => {
  store.game.status = 'lobby';
  store.game.currentQuestionIndex = -1;
  store.game.questionStartedAt = null;
  store.game.revealed = false;
  touchGame();
  res.json({ ok: true });
});

app.post('/api/admin/game/start', requireStaff, (_req, res) => {
  if (!store.questions.length) return res.status(409).json({ error: 'Agrega al menos una pregunta.' });
  store.game.status = 'question';
  store.game.currentQuestionIndex = 0;
  store.game.questionStartedAt = new Date().toISOString();
  store.game.revealed = false;
  store.game.answers = [];
  touchGame();
  res.json({ ok: true });
});

app.post('/api/admin/game/reveal', requireStaff, (_req, res) => {
  if (store.game.status !== 'question') return res.status(409).json({ error: 'No hay una pregunta activa.' });
  store.game.revealed = true;
  store.game.status = 'results';
  touchGame();
  res.json({ ok: true });
});

app.post('/api/admin/game/next', requireStaff, (_req, res) => {
  if (store.game.currentQuestionIndex + 1 >= store.questions.length) {
    store.game.status = 'finished';
    store.game.revealed = true;
  } else {
    store.game.currentQuestionIndex += 1;
    store.game.status = 'question';
    store.game.questionStartedAt = new Date().toISOString();
    store.game.revealed = false;
  }
  touchGame();
  res.json({ ok: true });
});

app.post('/api/admin/game/finish', requireStaff, (_req, res) => {
  store.game.status = 'finished';
  store.game.revealed = true;
  touchGame();
  res.json({ ok: true });
});

app.post('/api/admin/game/new-code', requireStaff, (_req, res) => {
  store.game.code = makeDigits(6);
  store.game.status = 'lobby';
  store.game.currentQuestionIndex = -1;
  store.game.questionStartedAt = null;
  store.game.revealed = false;
  store.game.answers = [];
  touchGame();
  res.json({ code: store.game.code });
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
  store.game.status = 'lobby';
  store.game.currentQuestionIndex = -1;
  store.game.answers = [];
  touchGame();
  res.json({ questions: store.questions });
});

app.post('/api/admin/wheel/spin', requireStaff, (req, res) => {
  const attendeeId = cleanText(req.body.attendeeId, 60);
  const attendee = store.attendees.find((person) => person.id === attendeeId);
  if (!attendee) return res.status(404).json({ error: 'Selecciona un participante registrado.' });
  if (attendee.prizeId) return res.status(409).json({ error: 'Este participante ya recibió un premio.' });
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
    prizeId: selected.id,
    prizeName: selected.name,
    createdAt: new Date().toISOString(),
    staffUser: req.session.staffUser
  };
  store.spins.push(spin);
  saveStore();
  res.json({ spin, prize: selected, attendee: publicAttendee(attendee) });
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

app.get('/api/admin/export.csv', requireStaff, (_req, res) => {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [['Nombre', 'Correo', 'Género', 'Edad', 'Premio', 'Fecha']];
  for (const person of store.attendees) {
    rows.push([person.name, person.email, person.gender, person.ageRange, store.prizes.find((prize) => prize.id === person.prizeId)?.name || '', person.createdAt]);
  }
  const csv = `\uFEFF${rows.map((row) => row.map(escape).join(',')).join('\r\n')}`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="participantes-feria.csv"');
  res.send(csv);
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Ocurrió un error inesperado.' });
});

app.listen(PORT, () => {
  console.log(`Conecta y Participa disponible en http://localhost:${PORT}`);
  if (IS_PRODUCTION && (!process.env.ADMIN_PASSWORD || !process.env.CJUSTINIANO_PASSWORD || !process.env.DPINTO_PASSWORD)) {
    console.warn('AVISO: configura las tres contraseñas en las variables de entorno de Render.');
  }
});
