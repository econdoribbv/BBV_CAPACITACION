'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { startServer, tempDirectory } = require('./helpers.cjs');

test('register, export, award and restart retain every email and inventory change', async (t) => {
  const directory = tempDirectory('api-');
  let server = await startServer(directory);
  t.after(async () => { await server.stop(); fs.rmSync(directory, { recursive: true, force: true }); });
  let cookie = '';
  const request = (route, method = 'GET', body) => fetch(server.url + route, {
    method, headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: body ? JSON.stringify(body) : undefined
  });
  const login = async () => {
    const res = await request('/api/auth/login', 'POST', { username: 'admin', password: 'integration-only' });
    assert.equal(res.status, 200);
    cookie = res.headers.get('set-cookie').split(';')[0];
  };
  assert.equal((await request('/')).headers.get('cache-control'), 'private, no-store');
  assert.equal((await request('/login.html')).headers.get('cache-control'), 'private, no-store');
  assert.equal((await request('/experience.js')).headers.get('cache-control'), 'no-cache');
  assert.equal((await request('/experience.css')).headers.get('cache-control'), 'no-cache');
  assert.equal((await request('/api/admin/export.csv')).status, 401);
  assert.equal((await request('/api/admin/backup.json')).status, 401);
  await login();
  const records = await Promise.all(Array.from({ length: 8 }, (_, i) => request('/api/register', 'POST', {
    name: `María Prueba`, email: `test${i}@example.test`, gender: 'Femenino', ageRange: '26-36'
  })));
  assert.ok(records.every((res) => res.status === 201));
  const attendee = (await records[0].json()).attendee;
  assert.equal((await request('/api/register', 'POST', { name: 'María Prueba', email: 'test0@example.test', gender: 'Femenino', ageRange: '26-36' })).status, 409);
  const before = await (await request('/api/wheel/state')).json();
  const spins = await Promise.all([request('/api/admin/wheel/spin', 'POST', { attendeeId: attendee.id }), request('/api/admin/wheel/spin', 'POST', { attendeeId: attendee.id })]);
  assert.deepEqual(spins.map((res) => res.status).sort(), [200, 409]);
  const csv = await request('/api/admin/export.csv');
  assert.match(csv.headers.get('content-type'), /text\/csv/);
  assert.match(csv.headers.get('content-disposition'), /attachment/);
  assert.equal(csv.headers.get('cache-control'), 'no-store');
  const bytes = Buffer.from(await csv.arrayBuffer());
  assert.equal(bytes.subarray(0, 3).toString('hex'), 'efbbbf');
  const content = bytes.toString('utf8');
  assert.match(content, /María Prueba/);
  for (let i = 0; i < 8; i++) assert.ok(content.includes(`test${i}@example.test`));
  assert.equal(content.split('\r\n').length, 9);
  const backup = await (await request('/api/admin/backup.json')).json();
  assert.equal(backup.attendees.length, 8);
  assert.equal(backup.spins.length, 1);
  await server.stop();
  server = await startServer(directory);
  cookie = ''; await login();
  const after = await (await request('/api/wheel/state')).json();
  assert.equal(after.attendees.length, 8);
  assert.equal(after.spinCount, 1);
  assert.equal(after.prizes.reduce((n, p) => n + p.remaining, 0), before.prizes.reduce((n, p) => n + p.remaining, 0) - 1);
});

test('Render without a disk serves the app but rejects registrations and still allows export', async (t) => {
  const directory = tempDirectory('render-');
  const server = await startServer(directory, { RENDER: 'true' });
  t.after(async () => { await server.stop(); fs.rmSync(directory, { recursive: true, force: true }); });
  const publicState = await (await fetch(server.url + '/api/public')).json();
  assert.equal(publicState.registrationOpen, false);
  assert.equal((await fetch(server.url + '/api/register', { method: 'POST' })).status, 503);
  const login = await fetch(server.url + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'integration-only' }) });
  const report = await fetch(server.url + '/api/admin/export.csv', { headers: { Cookie: login.headers.get('set-cookie').split(';')[0] } });
  assert.equal(report.status, 200);
  assert.equal(fs.existsSync(directory + '/store.json'), false);
});
