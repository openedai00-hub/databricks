import express from 'express';
import { runQuery } from './databricks';

const router = express.Router();

// This route allows you to test the connection directly from a browser/Postman
router.get('/test-connection', async (req, res) => {
  try {
    const rows = await runQuery('SELECT 1 as test');
    res.json({ success: true, message: 'Databricks connected!', data: rows });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
});

router.post('/query', async (req, res) => {
  const { sql } = req.body;
  
  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  try {
    console.log(`[EXECUTING]: ${sql}`);
    const rows = await runQuery(sql);
    res.json({ rows });
  } catch (error: any) {
    console.error('[QUERY FAIL]:', error.message);
    res.status(500).json({ 
      error: 'Query failed', 
      details: error.message 
    });
  }
});

export default router;
