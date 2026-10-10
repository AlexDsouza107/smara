import express from 'express';
import { getOne, runQuery } from '../db/database.js';

const router = express.Router();

// Get settings for a patient
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const settings = await getOne('SELECT * FROM settings WHERE patient_id = ?', [patientId]);

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json({
      id: settings.id,
      patientId: settings.patient_id,
      language: settings.language,
      fontSize: settings.font_size,
      highContrast: Boolean(settings.high_contrast),
      notifications: Boolean(settings.notifications),
      sound: Boolean(settings.sound),
      reduceAnimation: Boolean(settings.reduce_animation),
      updatedAt: settings.updated_at
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings for a patient
router.put('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      language,
      fontSize,
      highContrast,
      notifications,
      sound,
      reduceAnimation
    } = req.body;

    // Check if settings exist
    const existing = await getOne('SELECT * FROM settings WHERE patient_id = ?', [patientId]);

    if (!existing) {
      // Create new settings record
      await runQuery(`
        INSERT INTO settings (patient_id, language, font_size, high_contrast, notifications, sound, reduce_animation)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        patientId,
        language || 'Hindi',
        fontSize || 'normal',
        highContrast ? 1 : 0,
        notifications !== false ? 1 : 0,
        sound !== false ? 1 : 0,
        reduceAnimation ? 1 : 0
      ]);
    } else {
      // Update existing settings
      await runQuery(`
        UPDATE settings
        SET
          language = ?,
          font_size = ?,
          high_contrast = ?,
          notifications = ?,
          sound = ?,
          reduce_animation = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ?
      `, [
        language !== undefined ? language : existing.language,
        fontSize !== undefined ? fontSize : existing.font_size,
        highContrast !== undefined ? (highContrast ? 1 : 0) : existing.high_contrast,
        notifications !== undefined ? (notifications ? 1 : 0) : existing.notifications,
        sound !== undefined ? (sound ? 1 : 0) : existing.sound,
        reduceAnimation !== undefined ? (reduceAnimation ? 1 : 0) : existing.reduce_animation,
        patientId
      ]);
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
