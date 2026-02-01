import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { ENV } from './env.js';
import router from './routes.js';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', router);

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  const isConfigured = !!ENV.DATABRICKS_HOST && !!ENV.DATABRICKS_TOKEN;
  res.status(isConfigured ? 200 : 500).json({
    status: isConfigured ? 'healthy' : 'unhealthy'
  });
});

// Serve Static Files (Vite build output)
const clientDistPath = path.resolve(process.cwd(), 'client/dist');
app.use(express.static(clientDistPath));

// SPA Catch-all (must be after API + static)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  }
});

const PORT = N
