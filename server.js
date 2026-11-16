const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const os = require('os');
const QRCode = require('qrcode');
const { questions10, questions20 } = require('./questions');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ----------------------------------------------------
// PERSISTENCIA DE REPORTES EN ARCHIVO JSON (SIN BD EXTERNA)
// ----------------------------------------------------
const DATA_DIR = path.join(__dirname, 'data');
const RESULTS_FILE = path.join(DATA_DIR, 'quiz_results.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

let quizSubmissions = [];

function loadResultsFromFile() {
    try {
        if (fs.existsSync(RESULTS_FILE)) {
            const raw = fs.readFileSync(RESULTS_FILE, 'utf8');
            quizSubmissions = JSON.parse(raw);
            console.log(`[Storage] Cargados ${quizSubmissions.length} resultados guardados desde quiz_results.json`);
        }
    } catch (err) {
        console.error('[Storage Error] No se pudo leer quiz_results.json:', err.message);
        quizSubmissions = [];
    }
}

function saveResultsToFile() {
    try {
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(quizSubmissions, null, 2), 'utf8');
    } catch (err) {
        console.error('[Storage Error] No se pudo guardar quiz_results.json:', err.message);
    }
}

// Cargar al inicio
loadResultsFromFile();

// Detectar IP local para fallback
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();

// Default sugerido para OnRender
const DEFAULT_RENDER_URL = "https://gti-evaluacion-requerimientos.onrender.com";

// ----------------------------------------------------
// SALAS BBVHOO (KAHOOT)
// ----------------------------------------------------
const kahootRooms = {}; // Key: roomPin -> { hostSocketId, set, questions, currentQIndex, state, players, timer, isPaused, ... }

function generatePin() {
    return 'BBV-' + Math.floor(100 + Math.random() * 900);
}

// ----------------------------------------------------
// REST APIS
// ----------------------------------------------------

function isAdminPassword(password) {
    return password === 'BBV@Segura2026*' || password === 'GtiBbv2026!';
}

// Encuesta en vivo aislada (/encuesta y /encuesta/presentador)
require('./encuesta')(app, io, { isAdminPassword });

// Autenticación de Administrador
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Credenciales seguras GTI
    const validUser = (username || '').trim().toLowerCase() === 'administrador';
    const validPass = isAdminPassword(password);

    if (validUser && validPass) {
        return res.json({ success: true, token: 'token-gti-bbv-' + Date.now(), user: 'administrador' });
    }
    return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
});

// Server info y sugerencia de URL OnRender
app.get('/api/server_info', (req, res) => {
    const hostHeader = req.get('host');
    const isRender = hostHeader && hostHeader.includes('onrender.com');
    const protocol = (req.headers['x-forwarded-proto'] || req.protocol);
    
    // Si ya estamos en Render, usar el host real; de lo contrario sugerir la URL OnRender para el QR
    const detectedBase = isRender ? `${protocol}://${hostHeader}` : DEFAULT_RENDER_URL;

    res.json({
        localIP,
        port: PORT,
        isRender,
        detectedBase,
        defaultRenderUrl: DEFAULT_RENDER_URL,
        currentBase: `${protocol}://${hostHeader}`,
        bbvhooUrl: `${detectedBase}/bbvhoo`,
        quizUrl: `${detectedBase}/quiz`
    });
});

// Generación de Códigos QR
app.get('/api/qr', async (req, res) => {
    try {
        const text = req.query.url || DEFAULT_RENDER_URL;
        const qrDataUrl = await QRCode.toDataURL(text, {
            width: 340,
            margin: 2,
            color: {
                dark: '#654388', // Morado BBV
                light: '#FFFFFF'
            }
        });
        res.json({ qr: qrDataUrl, url: text });
    } catch (err) {
        res.status(500).json({ error: 'Error generating QR', details: err.message });
    }
});

// Obtener preguntas (Versión Oficial única de 10 preguntas)
app.get('/api/questions', (req, res) => {
    const list = questions10;

    const safeQuestions = list.map(q => ({
        id: q.id,
        type: q.type,
        title: q.title,
        module: q.module,
        question: q.question,
        template: q.template || null,
        wordBank: q.wordBank || null,
        options: q.options,
        points: q.points,
        timeSeconds: 60
    }));

    res.json({
        set: '10',
        totalQuestions: safeQuestions.length,
        questions: safeQuestions
    });
});

// Evaluación instantánea de pregunta en Cuestionario
app.post('/api/quiz/submit_answer', (req, res) => {
    const { questionId, selectedAnswers, timeElapsed } = req.body;
    const list = questions10;
    const question = list.find(q => q.id === parseInt(questionId));

    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }

    const correctArray = Array.isArray(question.correct) ? question.correct.sort() : [question.correct];
    const userArray = Array.isArray(selectedAnswers) ? selectedAnswers.sort() : [selectedAnswers];

    let isCorrect = false;
    let earnedPoints = 0;

    if (question.type === 'single' || question.type === 'fill') {
        isCorrect = userArray.length === 1 && userArray[0] === correctArray[0];
        earnedPoints = isCorrect ? question.points : 0;
    } else if (question.type === 'multi') {
        const matched = userArray.filter(ans => correctArray.includes(ans)).length;
        const extra = userArray.filter(ans => !correctArray.includes(ans)).length;

        if (matched === correctArray.length && extra === 0) {
            isCorrect = true;
            earnedPoints = question.points;
        } else if (matched > 0 && extra === 0) {
            isCorrect = false;
            earnedPoints = Math.round((matched / correctArray.length) * question.points * 10) / 10;
        } else {
            isCorrect = false;
            earnedPoints = 0;
        }
    }

    const correctTexts = question.options
        .filter(opt => correctArray.includes(opt.id))
        .map(opt => `${opt.id.toUpperCase()}) ${opt.text}`)
        .join(' | ');

    res.json({
        isCorrect,
        earnedPoints,
        maxPoints: question.points,
        correctAnswers: correctArray,
        correctAnswerText: correctTexts,
        explanation: question.explanation,
        timeElapsed
    });
});

// Guardar y persistir finalización de Cuestionario
app.post('/api/quiz/finish', (req, res) => {
    const {
        participantName,
        area,
        trainingDateTime,
        set,
        totalScore,
        maxScore,
        correctCount,
        totalQuestions,
        answersDetail
    } = req.body;

    const percentage = Math.round((totalScore / maxScore) * 100);
    const passed = percentage >= 70;

    const record = {
        id: 'SUB-' + Date.now(),
        participantName: participantName || 'Anónimo',
        area: area || 'No especificada',
        trainingDateTime: trainingDateTime || 'No indicada',
        set: set || '10',
        totalScore: Math.round(totalScore * 10) / 10,
        maxScore,
        percentage,
        passed,
        correctCount,
        totalQuestions,
        submittedAt: new Date().toISOString(),
        answersDetail
    };

    quizSubmissions.unshift(record);
    saveResultsToFile(); // Guarda en data/quiz_results.json

    console.log(`[Quiz Finish] ${record.participantName} - Score: ${record.totalScore}/${maxScore} (${record.percentage}%) - ${passed ? 'APROBADO' : 'REPROBADO'}`);

    res.json({ success: true, record });
});

// Listar resultados para Admin
app.get('/api/quiz/results', (req, res) => {
    res.json({
        total: quizSubmissions.length,
        submissions: quizSubmissions
    });
});

// Exportar CSV
app.get('/api/quiz/export_csv', (req, res) => {
    let csv = 'ID,Participante,Area_Cargo,Fecha_Hora_Capacitacion,Set,Puntaje,Puntaje_Max,Porcentaje,Estado,Aciertos,Fecha_Envio\n';
    quizSubmissions.forEach(s => {
        csv += `"${s.id}","${s.participantName.replace(/"/g, '""')}","${s.area.replace(/"/g, '""')}","${s.trainingDateTime}","${s.set} preguntas",${s.totalScore},${s.maxScore},"${s.percentage}%","${s.passed ? 'APROBADO' : 'REPROBADO'}",${s.correctCount}/${s.totalQuestions},"${s.submittedAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Resultados_Evaluacion_Requerimientos_GTI.csv"');
    res.send('\uFEFF' + csv);
});

// Limpiar resultados
app.delete('/api/quiz/results', (req, res) => {
    quizSubmissions.length = 0;
    saveResultsToFile();
    res.json({ success: true, message: 'Resultados reiniciados' });
});

// Rutas de páginas HTML (Soporta /bbvhoo y /kahoot indistintamente)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/bbvhoo', (req, res) => res.sendFile(path.join(__dirname, 'public', 'bbvhoo.html')));
app.get('/kahoot', (req, res) => res.redirect('/bbvhoo'));
app.get('/quiz', (req, res) => res.sendFile(path.join(__dirname, 'public', 'quiz.html')));

// ----------------------------------------------------
// MOTOR BBVHOO (KAHOOT) EN TIEMPO REAL CON SOCKET.IO
// ----------------------------------------------------
io.on('connection', (socket) => {

    // Crear sala (Fijada a los 10 requerimientos oficiales)
    socket.on('host:create_room', (data) => {
        const pin = generatePin();
        const questionsList = questions10;

        kahootRooms[pin] = {
            pin,
            hostSocketId: socket.id,
            set: '10',
            questions: questionsList,
            currentQIndex: -1,
            state: 'LOBBY',
            timePerQuestion: (data && data.timePerQuestion) || 60,
            timer: null,
            timeLeft: 60,
            isPaused: false,
            players: {},
            answersCount: { a: 0, b: 0, c: 0, d: 0, e: 0 }
        };

        socket.join(pin);
        socket.emit('host:room_created', {
            pin,
            set: '10',
            totalQuestions: questionsList.length,
            timePerQuestion: kahootRooms[pin].timePerQuestion
        });

        console.log(`[BBVHoo Room Created] PIN: ${pin} | Set: 10 Qs`);
    });

    // Unirse a sala
    socket.on('player:join', ({ pin, name, area }) => {
        const room = kahootRooms[pin];
        if (!room) {
            return socket.emit('player:join_error', { message: 'El PIN de la sala no existe o la partida ya finalizó.' });
        }
        if (room.state !== 'LOBBY') {
            return socket.emit('player:join_error', { message: 'El juego ya ha comenzado. ¡Espera la próxima partida!' });
        }

        const playerName = (name || '').trim();
        if (!playerName) {
            return socket.emit('player:join_error', { message: 'Por favor ingresa tu nombre completo.' });
        }

        room.players[socket.id] = {
            id: socket.id,
            name: playerName,
            area: area || '',
            score: 0,
            streak: 0,
            answers: {},
            lastCorrect: false,
            lastPointsGained: 0
        };

        socket.join(pin);
        socket.roomPin = pin;

        socket.emit('player:joined_success', {
            pin,
            name: playerName,
            totalQuestions: room.questions.length
        });

        const playerList = Object.values(room.players).map(p => ({ id: p.id, name: p.name, area: p.area }));
        io.to(room.hostSocketId).emit('host:players_updated', {
            count: playerList.length,
            players: playerList
        });

        console.log(`[BBVHoo Player Joined] ${playerName} -> PIN ${pin}`);
    });

    // Iniciar juego
    socket.on('host:start_game', () => {
        const room = findRoomByHost(socket.id);
        if (!room) return;

        room.state = 'STARTING';
        io.to(room.pin).emit('game:starting', { countdown: 3 });

        setTimeout(() => {
            sendNextQuestion(room);
        }, 3000);
    });

    // REQUISITO: PAUSAR Y REANUDAR TEMPORIZADOR POR EL ADMINISTRADOR
    socket.on('host:pause_timer', () => {
        const room = findRoomByHost(socket.id);
        if (!room || room.state !== 'QUESTION') return;

        room.isPaused = true;
        io.to(room.pin).emit('game:timer_paused', {
            timeLeft: room.timeLeft,
            message: 'El administrador ha pausado el temporizador.'
        });
        console.log(`[BBVHoo] Sala ${room.pin} pausada en el segundo ${room.timeLeft}`);
    });

    socket.on('host:resume_timer', () => {
        const room = findRoomByHost(socket.id);
        if (!room || room.state !== 'QUESTION') return;

        room.isPaused = false;
        io.to(room.pin).emit('game:timer_resumed', {
            timeLeft: room.timeLeft
        });
        console.log(`[BBVHoo] Sala ${room.pin} reanudada en el segundo ${room.timeLeft}`);
    });

    // Siguiente pregunta
    socket.on('host:next_question', () => {
        const room = findRoomByHost(socket.id);
        if (!room) return;
        sendNextQuestion(room);
    });

    // Mostrar posiciones
    socket.on('host:show_leaderboard', () => {
        const room = findRoomByHost(socket.id);
        if (!room) return;

        room.state = 'LEADERBOARD';
        const rankedPlayers = getRankedPlayers(room);

        io.to(room.pin).emit('game:leaderboard', {
            qIndex: room.currentQIndex + 1,
            totalQuestions: room.questions.length,
            leaderboard: rankedPlayers.slice(0, 5)
        });
    });

    // Mostrar podio final
    socket.on('host:show_podium', () => {
        const room = findRoomByHost(socket.id);
        if (!room) return;

        room.state = 'PODIUM';
        const rankedPlayers = getRankedPlayers(room);

        io.to(room.pin).emit('game:podium', {
            podium: rankedPlayers.slice(0, 3),
            allPlayers: rankedPlayers
        });
    });

    // Enviar respuesta
    socket.on('player:submit_answer', ({ selectedAnswers }) => {
        const room = kahootRooms[socket.roomPin];
        if (!room || room.state !== 'QUESTION') return;

        const player = room.players[socket.id];
        if (!player) return;

        const q = room.questions[room.currentQIndex];
        if (!q) return;

        if (player.answers[q.id]) {
            return;
        }

        const correctArray = Array.isArray(q.correct) ? q.correct.sort() : [q.correct];
        const userArray = Array.isArray(selectedAnswers) ? selectedAnswers.sort() : [selectedAnswers];

        userArray.forEach(choice => {
            if (room.answersCount[choice] !== undefined) {
                room.answersCount[choice]++;
            }
        });

        let isCorrect = false;
        let pointsEarned = 0;

        if (q.type === 'single' || q.type === 'fill') {
            isCorrect = userArray.length === 1 && userArray[0] === correctArray[0];
        } else if (q.type === 'multi') {
            const matched = userArray.filter(ans => correctArray.includes(ans)).length;
            const extra = userArray.filter(ans => !correctArray.includes(ans)).length;
            isCorrect = (matched === correctArray.length && extra === 0);
        }

        if (isCorrect) {
            player.streak++;
            const speedRatio = Math.max(0, room.timeLeft / room.timePerQuestion);
            const speedBonus = Math.round(speedRatio * 400);
            const streakBonus = Math.min(player.streak * 50, 150);
            pointsEarned = 500 + speedBonus + streakBonus;
            player.score += pointsEarned;
        } else {
            player.streak = 0;
            pointsEarned = 0;
        }

        player.lastCorrect = isCorrect;
        player.lastPointsGained = pointsEarned;
        player.answers[q.id] = {
            selected: userArray,
            isCorrect,
            pointsEarned,
            answeredAtSeconds: room.timePerQuestion - room.timeLeft
        };

        socket.emit('player:answer_received', {
            isCorrect,
            pointsEarned,
            totalScore: player.score,
            streak: player.streak
        });

        const totalPlayers = Object.keys(room.players).length;
        const totalAnswered = Object.values(room.players).filter(p => p.answers[q.id]).length;

        io.to(room.hostSocketId).emit('host:answers_progress', {
            answered: totalAnswered,
            total: totalPlayers
        });

        if (totalAnswered >= totalPlayers && totalPlayers > 0) {
            endCurrentQuestion(room);
        }
    });

    socket.on('disconnect', () => {
        if (socket.roomPin && kahootRooms[socket.roomPin]) {
            const room = kahootRooms[socket.roomPin];
            delete room.players[socket.id];
            const playerList = Object.values(room.players).map(p => ({ id: p.id, name: p.name, area: p.area }));
            io.to(room.hostSocketId).emit('host:players_updated', {
                count: playerList.length,
                players: playerList
            });
        }

        for (const pin in kahootRooms) {
            if (kahootRooms[pin].hostSocketId === socket.id) {
                if (kahootRooms[pin].timer) clearInterval(kahootRooms[pin].timer);
                io.to(pin).emit('game:host_disconnected', { message: 'El anfitrión ha cerrado la sala.' });
                delete kahootRooms[pin];
                console.log(`[BBVHoo Room Closed] Host disconnected for PIN: ${pin}`);
            }
        }
    });
});

function findRoomByHost(hostSocketId) {
    for (const pin in kahootRooms) {
        if (kahootRooms[pin].hostSocketId === hostSocketId) {
            return kahootRooms[pin];
        }
    }
    return null;
}

function getRankedPlayers(room) {
    return Object.values(room.players)
        .sort((a, b) => b.score - a.score)
        .map((p, index) => ({
            rank: index + 1,
            name: p.name,
            score: p.score,
            streak: p.streak
        }));
}

function sendNextQuestion(room) {
    if (room.timer) clearInterval(room.timer);

    room.currentQIndex++;
    if (room.currentQIndex >= room.questions.length) {
        room.state = 'PODIUM';
        const rankedPlayers = getRankedPlayers(room);
        io.to(room.pin).emit('game:podium', {
            podium: rankedPlayers.slice(0, 3),
            allPlayers: rankedPlayers
        });
        return;
    }

    const q = room.questions[room.currentQIndex];
    room.state = 'QUESTION';
    room.timeLeft = room.timePerQuestion;
    room.isPaused = false;
    room.answersCount = { a: 0, b: 0, c: 0, d: 0, e: 0 };

    const questionData = {
        qIndex: room.currentQIndex + 1,
        totalQuestions: room.questions.length,
        type: q.type,
        title: q.title,
        module: q.module,
        question: q.question,
        template: q.template || null,
        wordBank: q.wordBank || null,
        options: q.options,
        timeLimit: room.timePerQuestion
    };

    io.to(room.pin).emit('game:question', questionData);

    room.timer = setInterval(() => {
        // Si está en pausa, no decrementa el tiempo
        if (room.isPaused) {
            return;
        }

        room.timeLeft--;

        io.to(room.pin).emit('game:timer_tick', {
            timeLeft: room.timeLeft,
            isWarning: room.timeLeft <= 30
        });

        if (room.timeLeft <= 0) {
            endCurrentQuestion(room);
        }
    }, 1000);
}

function endCurrentQuestion(room) {
    if (room.timer) clearInterval(room.timer);
    room.state = 'FEEDBACK';

    const q = room.questions[room.currentQIndex];
    const correctArray = Array.isArray(q.correct) ? q.correct : [q.correct];

    Object.values(room.players).forEach(player => {
        const playerAns = player.answers[q.id];
        const isCorrect = playerAns ? playerAns.isCorrect : false;
        const ptsGained = playerAns ? playerAns.pointsEarned : 0;

        io.to(player.id).emit('player:round_result', {
            isCorrect,
            pointsGained: ptsGained,
            totalScore: player.score,
            streak: player.streak,
            correctAnswers: correctArray,
            explanation: q.explanation
        });
    });

    io.to(room.hostSocketId).emit('host:question_summary', {
        qIndex: room.currentQIndex + 1,
        totalQuestions: room.questions.length,
        answersCount: room.answersCount,
        correctAnswers: correctArray,
        explanation: q.explanation,
        options: q.options,
        template: q.template || null
    });
}

// ----------------------------------------------------
// INICIAR SERVIDOR
// ----------------------------------------------------
server.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 BBVHOO & CUESTIONARIO GTI BBV — En ejecución`);
    console.log(`=======================================================`);
    console.log(`📡 Local:            http://localhost:${PORT}`);
    console.log(`☁️ URL OnRender:     ${DEFAULT_RENDER_URL}`);
    console.log(`🎛️ Panel Anfitrión:  http://localhost:${PORT}/admin`);
    console.log(`🎮 Sala BBVHoo:      http://localhost:${PORT}/bbvhoo`);
    console.log(`📝 Cuestionario:     http://localhost:${PORT}/quiz`);
    console.log(`=======================================================`);
});
