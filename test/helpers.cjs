const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const fs = require('node:fs');
const testAdminHash = require('bcryptjs').hashSync('integration-only', 10);

function tempDirectory(prefix) {
  const base = path.resolve(__dirname, '../.test-data');
  fs.mkdirSync(base, { recursive: true });
  return fs.mkdtempSync(path.join(base, prefix));
}
async function startServer(directory, overrides = {}) {
  const reservation = net.createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const child = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'), windowsHide: true,
    env: { ...process.env, NODE_ENV: 'test', RENDER: '', RENDER_SERVICE_ID: '',
      DATA_DIR: directory, PORT: String(port), ADMIN_PASSWORD_HASH: testAdminHash,
      SESSION_SECRET: 'isolated-integration-test-session', ...overrides },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  child.stderr.on('data', (chunk) => { output += chunk; });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error(`Startup timeout: ${output}`)); }, 12000);
    child.stdout.on('data', (chunk) => {
      output += chunk;
      if (output.includes('Conecta y Participa disponible')) { clearTimeout(timer); resolve(); }
    });
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('exit', (code) => { clearTimeout(timer); reject(new Error(`Startup exit ${code}: ${output}`)); });
  });
  return {
    url: `http://127.0.0.1:${port}`,
    async stop() {
      if (child.exitCode !== null || child.signalCode !== null) return;
      const exited = once(child, 'exit'); child.kill(); await exited;
    }
  };
}
module.exports = { startServer, tempDirectory };
