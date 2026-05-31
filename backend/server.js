const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const connectDB = require('./db');
const { startWorker } = require('./worker');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cron = require('node-cron');
const { sendWeeklyReports } = require('./utils/scheduler');

const app = express();

// Auto-create uploads dir (important for Render)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ CORS — specific origins, works with credentials
const allowedOrigins = [
  'http://localhost:5173',
  'https://induvudualproject.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean)
  .flatMap(v => v.split(',').map(o => o.trim()))
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`CORS blocked: ${origin}`))
    }
  },
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/announcements', require('./routes/announcements'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: { origin: allowedOrigins }
    });

    // attach auth middleware for sockets
    const socketAuth = require('./middleware/socketAuth');
    io.use(socketAuth);

    // make io available to routes via app.locals
    app.locals.io = io;

    // connection log with authenticated user info
    io.on('connection', (socket) => {
      console.log('🔌 Socket connected:', socket.id, 'user:', socket.data.user?.email);
      socket.on('disconnect', () => console.log('🔌 Socket disconnected:', socket.id, 'user:', socket.data.user?.email));
    });

    // start background pieces
    startWorker(io);

    // schedule weekly report (runs every Monday at 08:00)
    cron.schedule('0 8 * * 1', () => {
      console.log('🕒 Running weekly report job');
      sendWeeklyReports();
    });

    httpServer.listen(PORT, () => console.log(`🚀 Server + sockets on port ${PORT}`));
  } catch (err) {
    console.error('Start error:', err.message);
    process.exit(1);
  }
};

start();