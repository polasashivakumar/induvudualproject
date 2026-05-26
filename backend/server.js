const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const { startWorker } = require('./worker');
require('dotenv').config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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