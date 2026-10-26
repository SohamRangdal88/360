require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const facultyRoutes = require('./routes/facultyRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

/* -------- middleware -------- */

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

/* -------- uploads served as static files -------- */

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* -------- routes -------- */

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/faculty', facultyRoutes);
app.use('/api/uploads', uploadRoutes);

/* -------- production: serve the built client -------- */

if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

/* -------- error handler -------- */

app.use(errorHandler);

/* -------- start -------- */

connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`Faculty 360 API running on http://localhost:${PORT}`);
  });
});
