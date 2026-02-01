import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { ENV } from './env.js';   // REQUIRED .js extension
import router from './routes.js'; // REQUIRED .js extension
import 'dotenv/config';

// ESM __dirname Fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

console.log('[BOOT] Initializing Server...');

// 1. API Routes
app.use('/api', router);

// 2. Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  const isConfigured = !!ENV.DATABRICKS_HOST && !!ENV.DATABRICKS_TOKEN;
  res.status(isConfigured ? 200 : 500).json({
    status: isConfigured ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString()
  });
});

// 3. Serve Static Files 
// In Azure, the server runs from /server/dist, but we need to reach /client/dist
const clientDistPath = path.resolve(process.cwd(), 'client/dist');
app.use(express.static(clientDistPath));

// 4. SPA Catch-all
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).send("Frontend build not found. Looked in: " + clientDistPath);
      }
    });
  }
});

// 5. Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Serving static files from: ${clientDistPath}`);
});
