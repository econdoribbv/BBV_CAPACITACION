// ----------------------------------------------------
// ENCUESTA EN VIVO (AISLADA): "¿Cuáles cree usted que son los clientes de la BBV?"
// Participante:  /encuesta              (anónimo, por QR)
// Presentador:   /encuesta/presentador  (respuestas en vivo agrupadas)
// Usa su propio namespace de Socket.io (/encuesta) y su propio archivo de datos.
// ----------------------------------------------------
const path = require('path');
const fs = require('fs');

const PREGUNTA = '¿Cuáles cree usted que son los clientes de la Bolsa Boliviana de Valores?';
const MAX_LEN = 80;
const COOLDOWN_MS = 1500;

const DATA_FILE = path.join(__dirname, 'data', 'encuesta_respuestas.json');

// Normaliza para agrupar respuestas "iguales":
// minúsculas, sin tildes, sin signos, sin artículos iniciales, singular aproximado.
function normalizar(texto) {
    const articulos = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas']);
    const palabras = texto
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9ñ\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
    while (palabras.length > 1 && articulos.has(palabras[0])) palabras.shift();
    return palabras.map(p => {
        if (p.length > 3 && p.endsWith('s')) {
            p = p.slice(0, -1);                                   // bancos -> banco
            if (/[rlndz]e$/.test(p) && p.length > 4) p = p.slice(0, -1); // emisores -> emisor
        }
        return p;
    }).join(' ');
}

function capitalizar(t) {
    return t.charAt(0).toUpperCase() + t.slice(1);
}

module.exports = function registrarEncuesta(app, io, { isAdminPassword }) {
    // grupos: key -> { key, label, count, hidden, firstAt }
    let grupos = {};
    let totalRespuestas = 0;

    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            grupos = raw.grupos || {};
            totalRespuestas = raw.totalRespuestas || 0;
        }
    } catch (err) {
        console.error('[Encuesta] No se pudo leer encuesta_respuestas.json:', err.message);
    }

    let saveTimer = null;
    function guardar() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            try {
                fs.writeFileSync(DATA_FILE, JSON.stringify({ grupos, totalRespuestas }, null, 2), 'utf8');
            } catch (err) {
                console.error('[Encuesta] No se pudo guardar:', err.message);
            }
        }, 500);
    }

    function estado() {
        const lista = Object.values(grupos)
            .filter(g => !g.hidden)
            .sort((a, b) => b.count - a.count || a.firstAt - b.firstAt)
            .map(g => ({ key: g.key, label: g.label, count: g.count }));
        return { pregunta: PREGUNTA, totalRespuestas, grupos: lista };
    }

    // Páginas
    app.get('/encuesta', (req, res) => res.sendFile(path.join(__dirname, 'public', 'encuesta.html')));
    app.get('/encuesta/presentador', (req, res) => res.sendFile(path.join(__dirname, 'public', 'encuesta_presentador.html')));

    const nsp = io.of('/encuesta');
    let emitTimer = null;
    function emitirEstado() {
        // agrupa ráfagas de respuestas en una sola actualización
        if (emitTimer) return;
        emitTimer = setTimeout(() => {
            emitTimer = null;
            nsp.emit('estado', estado());
        }, 150);
    }

    nsp.on('connection', (socket) => {
        socket.emit('estado', estado());
        let ultimoEnvio = 0;

        socket.on('respuesta', (data, ack) => {
            const responder = typeof ack === 'function' ? ack : () => {};
            const texto = String((data && data.texto) || '').replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);
            if (!texto) return responder({ ok: false, error: 'Escribe una respuesta.' });

            const ahora = Date.now();
            if (ahora - ultimoEnvio < COOLDOWN_MS) return responder({ ok: false, error: 'Espera un momento antes de enviar otra.' });
            ultimoEnvio = ahora;

            const key = normalizar(texto);
            if (!key) return responder({ ok: false, error: 'Respuesta no válida.' });

            if (!grupos[key]) {
                grupos[key] = { key, label: capitalizar(texto), count: 0, hidden: false, firstAt: ahora };
            }
            grupos[key].count++;
            totalRespuestas++;
            guardar();
            emitirEstado();
            responder({ ok: true });
        });

        // Moderación (requiere contraseña de administrador)
        socket.on('ocultar', ({ key, password } = {}, ack) => {
            const responder = typeof ack === 'function' ? ack : () => {};
            if (!isAdminPassword(password)) return responder({ ok: false, error: 'Contraseña incorrecta.' });
            if (grupos[key]) grupos[key].hidden = true;
            guardar();
            emitirEstado();
            responder({ ok: true });
        });

        socket.on('reiniciar', ({ password } = {}, ack) => {
            const responder = typeof ack === 'function' ? ack : () => {};
            if (!isAdminPassword(password)) return responder({ ok: false, error: 'Contraseña incorrecta.' });
            grupos = {};
            totalRespuestas = 0;
            guardar();
            nsp.emit('estado', estado());
            responder({ ok: true });
        });
    });

    console.log('[Encuesta] Módulo de encuesta en vivo registrado en /encuesta');
};
