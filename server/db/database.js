import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, 'smara.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

// Initialize SQLite database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database at:', DB_PATH);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize schema
export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const schema = readFileSync(SCHEMA_PATH, 'utf8');

    db.exec(schema, (err) => {
      if (err) {
        console.error('Error initializing schema:', err.message);
        reject(err);
      } else {
        console.log('Database schema initialized');

        // Check if we need to seed demo data
        db.get('SELECT COUNT(*) as count FROM patients', (err, row) => {
          if (err) {
            reject(err);
          } else if (row.count === 0) {
            console.log('Seeding demo data...');
            seedDemoData().then(resolve).catch(reject);
          } else {
            console.log('Database already has data, skipping seed');
            resolve();
          }
        });
      }
    });
  });
}

// Seed demo data for Rituparna Saikia
function seedDemoData() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Insert patient
      db.run(`
        INSERT INTO patients (name, age, gender, preferred_language, secondary_language, code_mixing, favorite_music, favorite_food, favorite_places, hobbies, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Rituparna Saikia',
        68,
        'Female',
        'Assamese (অসমীয়া)',
        'English',
        'Medium (Assamese–English mix)',
        'Dr. Bhupen Hazarika songs, Borgeet, Tokari Geet',
        'Masor Tenga with Joha rice, Khar, Til Pitha, Assam Ronga Saah (Black tea)',
        JSON.stringify(['Ancestral home in Jorhat', 'Dighalipukhuri (Guwahati)', 'Majuli Island', 'Kaziranga']),
        JSON.stringify(['Traditional handloom weaving (Tat-xal)', 'Tending Kopou Phool (foxtail orchids)', 'Making Bihu jolpan']),
        'Retired Assamese Literature teacher who treasures family, music, and the traditions of Assam.'
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }

        const patientId = this.lastID;

        // Insert family members
        const familyMembers = [
          { name: 'Nandini', relation: 'Daughter', description: 'Professor in Guwahati; lives nearby and manages daily care.', photo: '/uploads/photos/nandini-saikia.png' },
          { name: 'Anirban', relation: 'Son', description: 'Works in Bangalore and visits every year during Bohag Bihu.', photo: '/uploads/photos/anirban-saikia.png' },
          { name: 'Diganta', relation: 'Grandson', description: '8 years old; loves learning Bihu dhol rhythms and drawing riverboats.', photo: '/uploads/photos/diganta-saikia.png' },
          { name: 'Maitali', relation: 'Granddaughter', description: '9 years old; loves making traditional Assamese art.', photo: '/uploads/photos/maitali-saikia.png' }
        ];

        const familyStmt = db.prepare(`
          INSERT INTO family_members (patient_id, name, relation, photo_url, description)
          VALUES (?, ?, ?, ?, ?)
        `);

        familyMembers.forEach(member => {
          familyStmt.run(patientId, member.name, member.relation, member.photo, member.description);
        });
        familyStmt.finalize();

        // Insert memories
        const memories = [
          {
            title: 'Bohag Bihu at Home',
            category: 'Events',
            description: 'Preparing traditional Bihu jolpan with the family in Jorhat',
            people: JSON.stringify(['Nandini', 'Anirban', 'Diganta', 'Maitali']),
            date: '2024'
          },
          {
            title: 'Kopou Phool in Bloom',
            category: 'People',
            description: 'Tending the foxtail orchids in the ancestral home garden',
            people: JSON.stringify(['Nandini', 'Maitali']),
            date: '2023'
          },
          {
            title: 'Majuli Island Visit',
            category: 'Places',
            description: 'A peaceful family trip to the river island and satras of Majuli',
            people: JSON.stringify(['Nandini', 'Diganta']),
            date: '2019'
          }
        ];

        const memoryStmt = db.prepare(`
          INSERT INTO memories (patient_id, title, category, description, people, date)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        memories.forEach(memory => {
          memoryStmt.run(patientId, memory.title, memory.category, memory.description, memory.people, memory.date);
        });
        memoryStmt.finalize();

        // Insert timeline events
        const timelineEvents = [
          { year: 1958, title: 'Born in Jorhat', description: 'Early childhood near the tea estates, swimming in the local pukhuri (pond).' },
          { year: 1980, title: 'Married', description: 'Married to Biren Saikia at Kamakhya Temple in Guwahati.' },
          { year: 1983, title: 'First Teaching Job', description: 'Began career as an Assamese Literature teacher at Cotton Collegiate School.' },
          { year: 1986, title: 'Birth of Nandini', description: 'Welcomed firstborn daughter in Guwahati during the autumn Durga Puja.' },
          { year: 1990, title: 'Birth of Anirban', description: 'Birth of son; celebrated with traditional Mukhe-bhat (annaprashan) in Jorhat.' },
          { year: 2018, title: 'Retirement', description: 'Retired after 35 years of dedicated government school teaching.' },
          { year: 2018, title: 'Diganta Born', description: 'First grandson born; naming ceremony celebrated during Bohag Bihu.' }
        ];

        const timelineStmt = db.prepare(`
          INSERT INTO timeline_events (patient_id, year, title, description)
          VALUES (?, ?, ?, ?)
        `);

        timelineEvents.forEach(event => {
          timelineStmt.run(patientId, event.year, event.title, event.description);
        });
        timelineStmt.finalize();

        // Insert settings
        db.run(`
          INSERT INTO settings (patient_id, language, font_size, high_contrast, notifications, sound, reduce_animation)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [patientId, 'Assamese (অসমীয়া)', 'normal', 0, 1, 1, 0]);

        // Insert stats
        db.run(`
          INSERT INTO stats (patient_id, activities_completed, memory_interactions, engagement_time, familiarity_score, last_activity)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [patientId, 3, 12, 24, 82, JSON.stringify([])], (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Demo data seeded successfully');
            resolve();
          }
        });
      });
    });
  });
}

// Helper: Run a query with promise
export function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper: Get a single row
export function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper: Get all rows
export function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export { db };
