'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { openStorage, hasPersistentMount } = require('../storage');

const freshStore = () => ({ attendees: [], questions: [], prizes: [], spins: [], game: { answers: [] } });
function fixture(t) {
  const base = path.resolve(__dirname, '../.test-data');
  fs.mkdirSync(base, { recursive: true });
  const root = fs.mkdtempSync(path.join(base, 'storage-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const open = (env = {}) => openStorage({ root, env, freshStore, normalizeStore: (v) => v });
  return { root, file: path.join(root, 'data/store.json'), open };
}
test('registrations survive reopening and the previous acknowledged state is backed up', (t) => {
  const { open, file } = fixture(t);
  const db = open();
  db.initial.attendees.push({ id: 'one', email: 'one@example.test' });
  db.save(db.initial);
  db.initial.attendees.push({ id: 'two', email: 'two@example.test' });
  db.save(db.initial);
  assert.equal(open().initial.attendees.length, 2);
  assert.equal(JSON.parse(fs.readFileSync(`${file}.bak`)).attendees.length, 1);
});
test('invalid JSON and malformed structures are preserved instead of overwritten', (t) => {
  const { open, file } = fixture(t);
  open();
  for (const content of ['{broken', '{}', '{"attendees":null}']) {
    fs.writeFileSync(file, content);
    assert.throws(() => open());
    assert.equal(fs.readFileSync(file, 'utf8'), content);
  }
});
test('missing primary with a backup refuses empty initialization', (t) => {
  const { open, file } = fixture(t);
  const db = open(); db.save(db.initial);
  fs.unlinkSync(file);
  assert.throws(() => open(), /copia/);
  assert.equal(fs.existsSync(file), false);
});
test('failed disk writes preserve the acknowledged memory state and block further writes', (t) => {
  const { open, file } = fixture(t);
  const db = open();
  fs.mkdirSync(`${file}.bak.tmp`);
  db.initial.attendees.push({ id: 'one', email: 'one@example.test' });
  assert.throws(() => db.save(db.initial));
  assert.equal(db.rollback().attendees.length, 0);
  assert.equal(db.status.writable, false);
  assert.equal(open().initial.attendees.length, 0);
});
test('Render free allows registration in temporary storage and identifies it honestly', (t) => {
  const { open, root } = fixture(t);
  const db = open({ RENDER: 'true', DATA_DIR: path.join(root, 'unmounted') });
  assert.equal(db.status.writable, true);
  assert.equal(db.status.temporary, true);
  assert.equal(db.status.persistent, false);
  db.initial.attendees.push({ id: 'test', email: 'test@example.test' });
  db.save(db.initial);
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'data/store.json'))).attendees.length, 1);
});
test('mount recognition requires containment, ignores root and handles encoded paths', () => {
  const mounts = '1 0 0:1 / / rw - overlay overlay rw\n2 1 8:1 / /var/data rw - ext4 disk rw\n3 1 8:2 / /my\\040disk rw - ext4 disk rw';
  assert.equal(hasPersistentMount('/var/data', mounts), true);
  assert.equal(hasPersistentMount('/var/data/nested', mounts), true);
  assert.equal(hasPersistentMount('/var/database', mounts), false);
  assert.equal(hasPersistentMount('/opt/render/project/src/data', mounts), false);
  assert.equal(hasPersistentMount('/my disk/data', mounts), true);
});
