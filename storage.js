'use strict';
const fs = require('node:fs');
const path = require('node:path');

function hasPersistentMount(directory, mountInfo) {
  const target = path.posix.resolve(directory);
  return mountInfo.split('\n').some((line) => {
    const mount = line.split(' ')[4]?.replace(/\\([0-7]{3})/g, (_, code) => String.fromCharCode(parseInt(code, 8)));
    return mount && mount !== '/' && (target === mount || target.startsWith(`${mount}/`));
  });
}

function atomicWrite(file, text) {
  const temp = `${file}.tmp`;
  const fd = fs.openSync(temp, 'w', 0o600);
  try { fs.writeFileSync(fd, text); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
  fs.renameSync(temp, file);
  if (process.platform !== 'win32') {
    const dir = fs.openSync(path.dirname(file), 'r');
    try { fs.fsyncSync(dir); } finally { fs.closeSync(dir); }
  }
}

function openStorage({ root, freshStore, normalizeStore, env = process.env }) {
  const onRender = env.RENDER === 'true' || Boolean(env.RENDER_SERVICE_ID);
  const directory = path.resolve(env.DATA_DIR || (onRender ? '/var/data' : path.join(root, 'data')));
  let persistent = false;
  if (onRender && process.platform === 'linux') {
    persistent = hasPersistentMount(directory, fs.readFileSync('/proc/self/mountinfo', 'utf8'));
  }
  const writable = !onRender || persistent;
  const file = path.join(directory, 'store.json');
  const legacy = path.join(root, 'data', 'store.json');
  function read(filePath) {
    const value = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!value || !Array.isArray(value.attendees) || !Array.isArray(value.questions) ||
        !Array.isArray(value.prizes) || !Array.isArray(value.spins) ||
        !value.game || !Array.isArray(value.game.answers) ||
        value.attendees.some((person) => !person.id || typeof person.email !== 'string')) {
      throw new Error(`Datos inválidos en ${filePath}. Se detuvo el inicio para conservar el archivo; restaura una copia verificada.`);
    }
    return normalizeStore(value);
  }
  let initial;
  if (fs.existsSync(file)) initial = read(file);
  else if (fs.existsSync(`${file}.bak`)) {
    throw new Error('Falta store.json pero existe una copia .bak. Restaura la copia antes de iniciar.');
  } else if (directory !== path.dirname(legacy) && fs.existsSync(legacy)) initial = read(legacy);
  else initial = freshStore();
  let committed = JSON.stringify(initial, null, 2);
  let fault = false;
  if (writable) {
    fs.mkdirSync(directory, { recursive: true });
    if (!fs.existsSync(file)) atomicWrite(file, committed);
  } else {
    console.error('REGISTRO BLOQUEADO: configura un disco persistente en /var/data y DATA_DIR=/var/data en Render.');
  }
  return {
    initial,
    get status() { return { writable: writable && !fault, persistent, onRender }; },
    rollback() { return JSON.parse(committed); },
    save(value) {
      if (!writable || fault) throw new Error('El almacenamiento no está disponible para guardar datos.');
      const next = JSON.stringify(value, null, 2);
      try {
        atomicWrite(`${file}.bak`, committed);
        atomicWrite(file, next);
        committed = next;
      } catch (error) {
        fault = true;
        throw error;
      }
    }
  };
}
module.exports = { openStorage, hasPersistentMount };
