'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { startServer, tempDirectory } = require('./helpers.cjs');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function client(server) {
  let cookie = '';
  return async (route, method = 'GET', body) => {
    const res = await fetch(server.url + route, {
      method, headers: { 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    const type = res.headers.get('content-type') || '';
    return { status: res.status, data: type.includes('json') ? await res.json() : await res.text() };
  };
}

async function staffClient(server) {
  const staff = client(server);
  assert.equal((await staff('/api/auth/login', 'POST', { username: 'admin', password: 'integration-only' })).status, 200);
  return staff;
}

async function register(server, index, extra = {}) {
  const player = client(server);
  const res = await player('/api/register', 'POST', { name: `Jugador Prueba${'abcdefgh'[index]}`, email: `p${index}@example.test`, gender: 'Otro', ageRange: '18-25', ...extra });
  return { player, res };
}

async function waitFor(check, timeout = 15000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const value = await check();
    if (value) return value;
    await wait(150);
  }
  throw new Error('Tiempo de espera agotado');
}

test('a full game needs 3 players, advances by itself and sends the top scores to the wheel', async (t) => {
  const directory = tempDirectory('game-');
  const server = await startServer(directory, { RESULTS_SECONDS: '2' });
  t.after(async () => { await server.stop(); fs.rmSync(directory, { recursive: true, force: true }); });
  const staff = await staffClient(server);

  const first = await register(server, 0);
  const second = await register(server, 1);
  assert.equal(first.res.status, 201);
  const blocked = await staff('/api/admin/game/start', 'POST');
  assert.equal(blocked.status, 409);
  assert.match(blocked.data.error, /al menos 3/);

  const third = await register(server, 2);
  const players = [first.player, second.player, third.player];
  // The same person scanning again returns to their game instead of creating a duplicate.
  assert.equal((await register(server, 0)).res.status, 200);
  assert.equal((await register(server, 0, { name: 'Otra Persona' })).res.status, 409);

  assert.equal((await staff('/api/admin/game/start', 'POST')).status, 200);
  const late = await register(server, 3);
  assert.equal(late.res.status, 201);
  assert.equal((await late.player('/api/participant/state')).data.game.status, 'waiting-next');

  const questionCount = (await staff('/api/admin/state')).data.questions.length;
  for (let index = 0; index < questionCount; index += 1) {
    const state = await waitFor(async () => {
      const res = await players[0]('/api/participant/state');
      return res.data.game.status === 'question' && res.data.game.questionIndex === index ? res.data : null;
    });
    assert.equal(state.game.rank, undefined, 'the player view never shows a position');
    assert.equal(typeof state.game.questionEndsAt, 'number');
    // Everyone answers: the question closes early and the next one follows without the host.
    for (const [position, player] of players.entries()) {
      assert.equal((await player('/api/participant/answer', 'POST', { answerIndex: position === 2 ? 3 : 1 })).status, 200);
    }
  }

  const finished = await waitFor(async () => {
    const res = await staff('/api/admin/state');
    return res.data.game.status === 'finished' ? res.data : null;
  });
  assert.equal(finished.game.winners.length, 3);
  const finishedView = (await players[0]('/api/participant/state')).data;
  assert.equal(finishedView.game.status, 'finished');
  assert.equal(finishedView.game.rank, undefined);
  assert.equal(finishedView.attendee.playsLeft, 2);

  const wheel = (await staff('/api/wheel/state')).data;
  assert.equal(wheel.queue.length, 3);
  assert.ok(wheel.prizes.every((prize) => prize.remaining === undefined && prize.initial === undefined), 'the wheel never exposes prize counts');
  const head = wheel.queue[0].attendeeId;
  assert.equal((await staff('/api/admin/wheel/spin', 'POST', { attendeeId: wheel.queue[1].attendeeId })).status, 409);
  const spins = await Promise.all([staff('/api/admin/wheel/spin', 'POST', { attendeeId: head }), staff('/api/admin/wheel/spin', 'POST', { attendeeId: head })]);
  assert.deepEqual(spins.map((res) => res.status).sort(), [200, 409]);
  assert.equal((await staff('/api/wheel/state')).data.queue.length, 2);

  // A new game picks up whoever arrived while the previous one was running.
  assert.equal((await staff('/api/admin/game/new-round', 'POST')).status, 200);
  const lobby = (await late.player('/api/participant/state')).data;
  assert.equal(lobby.game.status, 'lobby');
  assert.equal(lobby.game.roundNumber, 2);

  const csv = (await staff('/api/admin/export.csv')).data;
  assert.match(csv, /"Juego","Puntaje","Posición"/);
  for (let i = 0; i < 4; i += 1) assert.ok(csv.includes(`p${i}@example.test`));
});

test('answers are rejected after the timer ends and the game moves on without the host', async (t) => {
  const directory = tempDirectory('timer-');
  const server = await startServer(directory, { RESULTS_SECONDS: '2', MIN_PLAYERS: '1' });
  t.after(async () => { await server.stop(); fs.rmSync(directory, { recursive: true, force: true }); });
  const staff = await staffClient(server);
  const questions = (await staff('/api/admin/state')).data.questions.slice(0, 2).map((question) => ({ ...question, duration: 10 }));
  assert.equal((await staff('/api/admin/questions', 'PUT', { questions })).status, 200);
  const { player } = await register(server, 0);
  assert.equal((await staff('/api/admin/game/start', 'POST')).status, 200);
  await wait(11200);
  const late = await player('/api/participant/answer', 'POST', { answerIndex: 1 });
  assert.equal(late.status, 409);
  const state = await waitFor(async () => {
    const res = await player('/api/participant/state');
    return res.data.game.questionIndex === 1 && res.data.game.status === 'question' ? res.data : null;
  }, 5000);
  assert.equal(state.game.questionNumber, 2);
});

test('the same email can play at most three games', async (t) => {
  const directory = tempDirectory('plays-');
  const server = await startServer(directory, { MIN_PLAYERS: '1' });
  t.after(async () => { await server.stop(); fs.rmSync(directory, { recursive: true, force: true }); });
  const staff = await staffClient(server);
  const player = client(server);
  const body = { name: 'Persona Repetida', email: 'repite@example.test', gender: 'Femenino', ageRange: '26-36' };
  for (let game = 1; game <= 3; game += 1) {
    assert.equal((await player('/api/register', 'POST', body)).status, 201, `registro ${game}`);
    assert.equal((await staff('/api/admin/game/start', 'POST')).status, 200);
    assert.equal((await staff('/api/admin/game/finish', 'POST')).status, 200);
  }
  const fourth = await player('/api/register', 'POST', body);
  assert.equal(fourth.status, 409);
  assert.match(fourth.data.error, /3 veces/);
  const backup = (await staff('/api/admin/backup.json')).data;
  assert.equal(JSON.parse(typeof backup === 'string' ? backup : JSON.stringify(backup)).attendees.length, 3);
});
