import * as dotenv from 'dotenv';

// Charger les variables d'environnement AVANT d'importer db/routes
dotenv.config({ path: '.env.local' });
dotenv.config();

import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const PORT = Number(process.env.PORT) || 3005;

async function startServer() {
  // Imports dynamiques après chargement des variables d'env
  const { initDb } = await import('./src/server/db.js');
  const { default: apiRoutes } = await import('./src/server/routes/api.js');
  const { default: adminRoutes } = await import('./src/server/routes/admin.js');
  const { default: authRoutes } = await import('./src/server/routes/auth.js');

  const app = express();

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  initDb();

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use('/uploads', express.static(uploadsDir));

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', apiRoutes);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);

    if (req.path.startsWith('/api/')) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    next(err);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});