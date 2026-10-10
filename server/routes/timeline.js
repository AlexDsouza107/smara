import express from 'express';
import { getAll, runQuery } from '../db/database.js';

const router = express.Router();

// Get timeline events for a patient
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const events = await getAll(
      'SELECT * FROM timeline_events WHERE patient_id = ? ORDER BY year ASC',
      [patientId]
    );

    res.json(events);
  } catch (error) {
    console.error('Error fetching timeline:', error);
    res.status(500).json({ error: 'Failed to fetch timeline events' });
  }
});

// Add timeline event
router.post('/', async (req, res) => {
  try {
    const { patientId, year, title, description } = req.body;

    if (!patientId || !year || !title) {
      return res.status(400).json({ error: 'patientId, year, and title are required' });
    }

    const result = await runQuery(
      'INSERT INTO timeline_events (patient_id, year, title, description) VALUES (?, ?, ?, ?)',
      [patientId, year, title, description]
    );

    res.json({
      success: true,
      event: {
        id: result.lastID,
        patientId: parseInt(patientId),
        year: parseInt(year),
        title,
        description
      }
    });
  } catch (error) {
    console.error('Error adding timeline event:', error);
    res.status(500).json({ error: 'Failed to add timeline event' });
  }
});

// Delete timeline event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery('DELETE FROM timeline_events WHERE id = ?', [id]);
    res.json({ success: true, message: 'Timeline event deleted successfully' });
  } catch (error) {
    console.error('Error deleting timeline event:', error);
    res.status(500).json({ error: 'Failed to delete timeline event' });
  }
});

export default router;
