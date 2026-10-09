import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import { healthRouter } from './routes/health.js';
import { citiesRouter } from './routes/cities.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (port 5173) and production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Generous JSON limit for Base64 compressed media uploads (photos <80KB, voice <40KB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize persistent database schema
initDatabase();

// Mount API routes
app.use('/api/health', healthRouter);
app.use('/api/cities', citiesRouter);

// Root greeting & status
app.get('/', (req, res) => {
  res.json({
    product: 'PulseCity Pune — The Living City Operating System',
    status: 'online',
    docs: '/api/health',
    citiesEndpoint: '/api/cities'
  });
});

app.listen(PORT, () => {
  console.log(`[PulseCity Backend] Server running at http://localhost:${PORT}`);
  console.log(`[PulseCity Backend] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[PulseCity Backend] Cities manifest: http://localhost:${PORT}/api/cities`);
});
