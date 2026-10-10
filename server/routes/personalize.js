import express from 'express';
import { getOne } from '../db/database.js';
import { getAccount, hasApiKey } from '../services/serpapi.js';
import {
  addReaction,
  getContent,
  personalize,
  setApproved,
  suggestQueries,
  usageSummary,
} from '../services/personalize.js';

const router = express.Router();

async function loadPatient(id) {
  const row = await getOne('SELECT * FROM patients WHERE id = ?', [id]);
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    preferredLanguage: row.preferred_language,
    favoriteMusic: row.favorite_music,
    favoritePlaces: JSON.parse(row.favorite_places || '[]'),
  };
}

// SerpApi connection status, credits left, and searches saved by the cache
router.get('/status', async (req, res, next) => {
  try {
    res.json({
      configured: hasApiKey(),
      account: await getAccount(),
      usage: await usageSummary(),
    });
  } catch (err) {
    next(err);
  }
});

// Search queries suggested from the patient's profile
router.get('/:patientId/suggestions', async (req, res, next) => {
  try {
    const patient = await loadPatient(req.params.patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(suggestQueries(patient));
  } catch (err) {
    next(err);
  }
});

// Personal songs and places found so far (?approved=1 for the patient's view)
router.get('/:patientId/content', async (req, res, next) => {
  try {
    const approvedOnly = req.query.approved === '1';
    res.json(await getContent(req.params.patientId, { approvedOnly }));
  } catch (err) {
    next(err);
  }
});

// Run SerpApi searches for the patient and save what they find
router.post('/:patientId', async (req, res, next) => {
  try {
    const patient = await loadPatient(req.params.patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const defaults = suggestQueries(patient);
    const clean = (list) => (Array.isArray(list) ? list.map(q => String(q).trim()).filter(Boolean) : null);
    const songQueries = clean(req.body.songQueries) ?? defaults.songs;
    const placeQueries = clean(req.body.placeQueries) ?? defaults.places;

    const result = await personalize(patient.id, { songQueries, placeQueries });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Caregiver approves or hides a song or place
router.patch('/content/:id', async (req, res, next) => {
  try {
    const item = await setApproved(req.params.id, Boolean(req.body.approved));
    if (!item) return res.status(404).json({ error: 'Content not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// Record how the patient responded to a song or place
router.post('/content/:id/reaction', async (req, res, next) => {
  try {
    const { reaction } = req.body;
    if (!['yes', 'unsure', 'no'].includes(reaction)) {
      return res.status(400).json({ error: 'reaction must be yes, unsure or no' });
    }
    const item = await addReaction(req.params.id, reaction);
    if (!item) return res.status(404).json({ error: 'Content not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

export default router;
