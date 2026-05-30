const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const { startWorker } = require('./worker');
require('dotenv').config();

const app = express();

const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'https://induvudualproject.vercel.app',
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
  ]
    .filter(Boolean)
    .flatMap((value) => value.split(',').map((origin) => origin.trim()))
    .filter(Boolean)
)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true)
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true,
  })
)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.json({ status: 'OK' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/ai', require('./routes/ai'));
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  startWorker();
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
};

start();
