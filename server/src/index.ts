import express from 'express';
import cors from 'cors';
import { ENV } from './env';
import router from './routes'; 
import 'dotenv/config';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log environment status on boot for debugging
console.log('[BOOT] Checking Variables:', {
  HOST: !!ENV.DATABRICKS_HOSTNAME,
  PATH: !!ENV.DATABRICKS_HTTP_PATH,
  TOKEN: !!ENV.DATABRICKS_TOKEN
});

// Routes
app.use('/api', router);
app.get('/health', (_req, res) => res.json({ ok: true, timestamp: new Date() }));

const PORT = Number(process.env.PORT || 8787);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is live on port ${PORT}`);
});
