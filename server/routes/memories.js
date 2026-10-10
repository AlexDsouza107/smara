import express from 'express';
import { getOne, getAll, runQuery } from '../db/database.js';

const router = express.Router();

// Get memories for a patient
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const memories = await getAll('SELECT * FROM memories WHERE patient_id = ? ORDER BY date DESC, created_at DESC', [patientId]);

    // Parse JSON fields
    const parsedMemories = memories.map(m => ({
      id: m.id,
      patientId: m.patient_id,
      title: m.title,
      category: m.category,
      description: m.description,
      image: m.image_url,
      people: JSON.parse(m.people || '[]'),
      date: m.date
    }));

    res.json(parsedMemories);
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Add a memory (with image upload)
router.post('/', async (req, res) => {
  const upload = req.app.get('upload');

  upload.single('photo')(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { patientId, title, category, description, date, people, imageUrl: pastedImageUrl } = req.body;
      const imageUrl = req.file ? `/uploads/photos/${req.file.filename}` : (pastedImageUrl || null);

      if (!patientId || !title) {
        return res.status(400).json({ error: 'patientId and title are required' });
      }

      // Handle people parsing (can be dynamic array or string)
      let parsedPeople = [];
      if (people) {
        try {
          parsedPeople = typeof people === 'string' ? JSON.parse(people) : people;
        } catch (e) {
          parsedPeople = people.split(',').map(p => p.trim());
        }
      }

      const result = await runQuery(`
        INSERT INTO memories (patient_id, title, category, description, image_url, people, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [patientId, title, category || 'Family', description, imageUrl, JSON.stringify(parsedPeople), date]);

      res.json({
        success: true,
        memory: {
          id: result.lastID,
          patientId: parseInt(patientId),
          title,
          category: category || 'Family',
          description,
          image: imageUrl,
          people: parsedPeople,
          date
        }
      });
    } catch (error) {
      console.error('Error saving memory:', error);
      res.status(500).json({ error: 'Failed to save memory' });
    }
  });
});

// Update a memory
router.put('/:id', async (req, res) => {
  const upload = req.app.get('upload');

  upload.single('photo')(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const { title, category, description, date, people } = req.body;

      const existing = await getOne('SELECT * FROM memories WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({ error: 'Memory not found' });
      }

      const imageUrl = req.file
        ? `/uploads/photos/${req.file.filename}`
        : existing.image_url;

      let parsedPeople = [];
      if (people) {
        try {
          parsedPeople = typeof people === 'string' ? JSON.parse(people) : people;
        } catch (e) {
          parsedPeople = people.split(',').map(p => p.trim());
        }
      } else {
        parsedPeople = JSON.parse(existing.people || '[]');
      }

      await runQuery(`
        UPDATE memories
        SET title = ?, category = ?, description = ?, image_url = ?, people = ?, date = ?
        WHERE id = ?
      `, [title, category, description, imageUrl, JSON.stringify(parsedPeople), date, id]);

      res.json({
        success: true,
        memory: {
          id: parseInt(id),
          patientId: existing.patient_id,
          title,
          category,
          description,
          image: imageUrl,
          people: parsedPeople,
          date
        }
      });
    } catch (error) {
      console.error('Error updating memory:', error);
      res.status(500).json({ error: 'Failed to update memory' });
    }
  });
});

// Delete a memory
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await runQuery('DELETE FROM memories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

export default router;
