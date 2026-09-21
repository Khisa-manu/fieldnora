import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { initPostgresDatabase, getPostgresConnectionStatus } from './server/postgres';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize PostgreSQL + Drizzle ORM if DATABASE_URL is provided
  initPostgresDatabase().catch(err => {
    console.warn('[PostgreSQL] Database init notice:', err.message || err);
  });

  // Cross-Origin Resource Sharing for Android Native App, Emulators & Web
  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-org-id', 'x-user-name'],
      credentials: false,
    })
  );

  // Body parsers
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'fieldnora-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API router FIRST
  app.use('/api', apiRouter);

  // 404 handler for unmatched /api requests to prevent falling through to HTML SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`fieldnora server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
