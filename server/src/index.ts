import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url'; // Required for ESM __dirname fix
import { ENV } from './env.js';      // ADDED .js - Fixes the "Module Not Found" error
import router from './routes.js';   // ADDED .js
import 'dotenv/config';

// --- ESM __dirname Fix ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

console.log('[BOOT] Initializing Server...');
console.log('[BOOT] Environment Check:', {
  PORT: process.env.PORT || 8080, // Azure usually uses 8080
  DATABRICKS_HOST: !!ENV.DATABRICKS_HOSTNAME,
  NODE_ENV: process.env.NODE_ENV
});

// 1. API Routes
app.use('/api', router);

// 2. Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  const isConfigured = !!ENV.DATABRICKS_HOSTNAME && !!ENV.DATABRICKS_TOKEN;
  res.status(isConfigured ? 200 : 500).json({
    status: isConfigured ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString()
  });
});

// 3. Serve Static Files
// path.resolve ensures we don't get lost in relative ".." jumps
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// 4. SPA Catch-all
app.get('*', (req, res) => {
  // If the request isn't for an API, send the frontend
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).send("Frontend build not found in " + clientDistPath);
      }
    });
  }
});

// 5. Start Server
// IMPORTANT: Azure requires listening on process.env.PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Serving static files from: ${clientDistPath}`);
});
