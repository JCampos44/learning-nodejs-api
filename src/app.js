const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando' });
});

app.get('/api/health', (req, res) => {
  pool
    .query('SELECT 1 AS db_ok')
    .then(() => {
      res.json({
        status: 'ok',
        uptime: process.uptime(),
        database: 'connected',
      });
    })
    .catch(() => {
      res.status(503).json({
        status: 'degraded',
        uptime: process.uptime(),
        database: 'disconnected',
      });
    });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('Conexión a MySQL verificada');
  } catch (error) {
    console.warn(`No se pudo verificar MySQL al arrancar: ${error.message}`);
  }

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

startServer();
