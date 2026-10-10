import express from 'express';
import { getOne, getAll, runQuery } from '../db/database.js';

const router = express.Router();

// Get patient by ID (with family members)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get patient data
    const patient = await getOne('SELECT * FROM patients WHERE id = ?', [id]);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Parse JSON fields
    patient.favoritePlaces = JSON.parse(patient.favorite_places || '[]');
    patient.hobbies = JSON.parse(patient.hobbies || '[]');

    // Get family members
    const familyMembers = await getAll('SELECT * FROM family_members WHERE patient_id = ?', [id]);

    // Combine data
    const response = {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      preferredLanguage: patient.preferred_language,
      secondaryLanguage: patient.secondary_language,
      codeMixing: patient.code_mixing,
      favoriteMusic: patient.favorite_music,
      favoriteFood: patient.favorite_food,
      favoritePlaces: patient.favoritePlaces,
      hobbies: patient.hobbies,
      bio: patient.bio,
      familyMembers: familyMembers.map(fm => ({
        id: fm.id,
        name: fm.name,
        relation: fm.relation,
        photo: fm.photo_url,
        voice: fm.voice_url,
        description: fm.description
      }))
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient data' });
  }
});

// Update patient info
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      age,
      gender,
      preferredLanguage,
      secondaryLanguage,
      codeMixing,
      favoriteMusic,
      favoriteFood,
      favoritePlaces,
      hobbies,
      bio
    } = req.body;

    await runQuery(`
      UPDATE patients
      SET name = ?, age = ?, gender = ?, preferred_language = ?, secondary_language = ?,
          code_mixing = ?, favorite_music = ?, favorite_food = ?, favorite_places = ?,
          hobbies = ?, bio = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name,
      age,
      gender,
      preferredLanguage,
      secondaryLanguage,
      codeMixing,
      favoriteMusic,
      favoriteFood,
      JSON.stringify(favoritePlaces || []),
      JSON.stringify(hobbies || []),
      bio,
      id
    ]);

    res.json({ success: true, message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Add family member (with photo and voice upload)
router.post('/:id/family', async (req, res) => {
  const upload = req.app.get('upload');

  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const { name, relation, description } = req.body;

      const photoUrl = req.files?.photo ? `/uploads/photos/${req.files.photo[0].filename}` : null;
      const voiceUrl = req.files?.voice ? `/uploads/voices/${req.files.voice[0].filename}` : null;

      const result = await runQuery(`
        INSERT INTO family_members (patient_id, name, relation, photo_url, voice_url, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, name, relation, photoUrl, voiceUrl, description]);

      res.json({
        success: true,
        familyMember: {
          id: result.lastID,
          name,
          relation,
          photo: photoUrl,
          voice: voiceUrl,
          description
        }
      });
    } catch (error) {
      console.error('Error adding family member:', error);
      res.status(500).json({ error: 'Failed to add family member' });
    }
  });
});

// Update family member (with optional new photo/voice)
router.put('/:id/family/:memberId', async (req, res) => {
  const upload = req.app.get('upload');

  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
  ])(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({ error: err.message });
    }

    try {
      const { memberId } = req.params;
      const { name, relation, description } = req.body;

      // Get existing data
      const existing = await getOne('SELECT * FROM family_members WHERE id = ?', [memberId]);

      if (!existing) {
        return res.status(404).json({ error: 'Family member not found' });
      }

      const photoUrl = req.files?.photo
        ? `/uploads/photos/${req.files.photo[0].filename}`
        : existing.photo_url;

      const voiceUrl = req.files?.voice
        ? `/uploads/voices/${req.files.voice[0].filename}`
        : existing.voice_url;

      await runQuery(`
        UPDATE family_members
        SET name = ?, relation = ?, photo_url = ?, voice_url = ?, description = ?
        WHERE id = ?
      `, [name, relation, photoUrl, voiceUrl, description, memberId]);

      res.json({
        success: true,
        familyMember: {
          id: memberId,
          name,
          relation,
          photo: photoUrl,
          voice: voiceUrl,
          description
        }
      });
    } catch (error) {
      console.error('Error updating family member:', error);
      res.status(500).json({ error: 'Failed to update family member' });
    }
  });
});

// Delete family member
router.delete('/:id/family/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;

    await runQuery('DELETE FROM family_members WHERE id = ?', [memberId]);

    res.json({ success: true, message: 'Family member deleted successfully' });
  } catch (error) {
    console.error('Error deleting family member:', error);
    res.status(500).json({ error: 'Failed to delete family member' });
  }
});

export default router;
