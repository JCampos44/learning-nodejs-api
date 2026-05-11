const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { apiReference } = require('@scalar/express-api-reference');
require('dotenv').config();
const pool = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const openapiSpec = require('./config/openapi');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', authRoutes);
app.use('/api', taskRoutes);
app.use(
  '/docs',
  apiReference({
    url: '/openapi.json',
    theme: 'solarized',
  }),
);

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

app.get('/openapi.json', (req, res) => {
  res.json(openapiSpec);
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

if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.startServer = startServer;
