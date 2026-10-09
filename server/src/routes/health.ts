import { Router } from 'express';
import { db } from '../db/database.js';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  let dbStatus = 'ok';
  try {
    const query = db.prepare('SELECT 1 as alive');
    const result = query.get();
    if (!result) dbStatus = 'error';
  } catch (err) {
    dbStatus = 'unavailable';
  }

  res.json({
    status: 'online',
    product: 'PulseCity Pune — Living City OS',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      engine: 'SQLite (Native node:sqlite)',
      status: dbStatus,
      persistence: 'File-backed persistent storage'
    },
    provenanceEngine: 'Active (Provenance Badges Enforced)'
  });
});
