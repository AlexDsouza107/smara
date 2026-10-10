-- SQLite Database Schema for SMARA

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  preferred_language TEXT DEFAULT 'Hindi',
  secondary_language TEXT DEFAULT 'English',
  code_mixing TEXT DEFAULT 'Medium',
  favorite_music TEXT,
  favorite_food TEXT,
  favorite_places TEXT, -- JSON array of strings
  hobbies TEXT, -- JSON array of strings
  bio TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  relation TEXT NOT NULL,
  photo_url TEXT, -- Path to uploaded photo
  voice_url TEXT, -- Path to uploaded audio
  description TEXT, -- Short description/hint
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Memories Table
CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Family', -- Events, Family, Places, People
  description TEXT,
  image_url TEXT,
  people TEXT, -- JSON array of names
  date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Timeline Events Table
CREATE TABLE IF NOT EXISTS timeline_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Activity Sessions Table (for game tracking)
CREATE TABLE IF NOT EXISTS activity_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  game_id TEXT NOT NULL, -- e.g., 'who-is-this', 'guess-the-voice', etc.
  score INTEGER DEFAULT 0,
  total_rounds INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT 1,
  session_data TEXT, -- JSON for game-specific data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL UNIQUE,
  language TEXT DEFAULT 'Hindi',
  font_size TEXT DEFAULT 'normal',
  high_contrast BOOLEAN DEFAULT 0,
  notifications BOOLEAN DEFAULT 1,
  sound BOOLEAN DEFAULT 1,
  reduce_animation BOOLEAN DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Stats Table
CREATE TABLE IF NOT EXISTS stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL UNIQUE,
  activities_completed INTEGER DEFAULT 0,
  memory_interactions INTEGER DEFAULT 0,
  engagement_time INTEGER DEFAULT 0, -- in minutes
  familiarity_score INTEGER DEFAULT 0, -- percentage (0-100)
  last_activity TEXT, -- JSON of recent activities
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- SerpApi response cache: every live SerpApi search is stored here so the
-- same query never spends a second search credit.
CREATE TABLE IF NOT EXISTS serpapi_cache (
  cache_key TEXT PRIMARY KEY, -- engine + sorted params
  engine TEXT NOT NULL,
  response TEXT NOT NULL, -- raw JSON from SerpApi
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- One row per SerpApi lookup, to show credits spent vs. served from cache
CREATE TABLE IF NOT EXISTS serpapi_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  engine TEXT NOT NULL,
  query TEXT,
  cached BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Songs and places found through SerpApi for a patient. The caregiver
-- approves each one before it appears in the patient's activities.
CREATE TABLE IF NOT EXISTS personalized_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  kind TEXT NOT NULL, -- 'song' or 'place'
  external_id TEXT NOT NULL, -- YouTube video_id or Google Maps data_id
  source_query TEXT,
  title TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON details (thumbnail, photos, address, ...)
  approved BOOLEAN DEFAULT 1,
  reactions TEXT DEFAULT '{"yes":0,"unsure":0,"no":0}', -- patient responses
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (patient_id, kind, external_id),
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
