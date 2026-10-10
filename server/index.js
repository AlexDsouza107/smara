import { existsSync } from 'fs';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeDatabase } from './db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load SERPAPI_KEY and other settings from .env in the project root
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Allow any localhost/127.0.0.1 port in dev, since Vite picks the next free
// port (5174, 5175, ...) if 5173 is already taken by another running instance.
const DEFAULT_DEV_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || DEFAULT_DEV_ORIGIN_RE,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadType = file.fieldname === 'voice' ? 'voices' : 'photos';
    cb(null, join(__dirname, 'uploads', uploadType));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter: function (req, file, cb) {
    // Accept images and audio files
    if (file.fieldname === 'photo') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for photos'));
      }
    } else if (file.fieldname === 'voice') {
      if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/mp4') {
        cb(null, true);
      } else {
        cb(new Error('Only audio files are allowed for voice recordings'));
      }
    } else if (file.fieldname === 'image') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Make upload middleware available to routes
app.set('upload', upload);

// API Routes
import patientsRouter from './routes/patients.js';
import memoriesRouter from './routes/memories.js';
import timelineRouter from './routes/timeline.js';
import activitiesRouter from './routes/activities.js';
import statsRouter from './routes/stats.js';
import settingsRouter from './routes/settings.js';
import reportsRouter from './routes/reports.js';
import personalizeRouter from './routes/personalize.js';

app.use('/api/patients', patientsRouter);
app.use('/api/memories', memoriesRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/personalize', personalizeRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🚀 SMARA Backend Server running on http://localhost:${PORT}`);
      console.log(`   API endpoints available at http://localhost:${PORT}/api`);
      console.log(`   Uploads served from http://localhost:${PORT}/uploads`);
      console.log(process.env.SERPAPI_KEY
        ? '   SerpApi: key loaded ✓\n'
        : '   SerpApi: no SERPAPI_KEY in .env, Memory Finder searches are disabled\n');
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
