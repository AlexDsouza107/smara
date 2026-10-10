import express from 'express';
import { getOne, runQuery } from '../db/database.js';

const router = express.Router();

// Get stats for a patient
router.get('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    const stats = await getOne('SELECT * FROM stats WHERE patient_id = ?', [patientId]);

    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }

    res.json({
      id: stats.id,
      patientId: stats.patient_id,
      activitiesCompleted: stats.activities_completed,
      memoryInteractions: stats.memory_interactions,
      engagementTime: stats.engagement_time,
      familiarityScore: stats.familiarity_score,
      lastActivity: stats.last_activity ? JSON.parse(stats.last_activity) : [],
      updatedAt: stats.updated_at
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Update stats for a patient
router.put('/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      activitiesCompleted,
      memoryInteractions,
      engagementTime,
      familiarityScore,
      lastActivity
    } = req.body;

    // Check if stats exist
    const existing = await getOne('SELECT * FROM stats WHERE patient_id = ?', [patientId]);

    if (!existing) {
      // Create new stats record
      await runQuery(`
        INSERT INTO stats (patient_id, activities_completed, memory_interactions, engagement_time, familiarity_score, last_activity)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        patientId,
        activitiesCompleted || 0,
        memoryInteractions || 0,
        engagementTime || 0,
        familiarityScore || 0,
        lastActivity ? JSON.stringify(lastActivity) : '[]'
      ]);
    } else {
      // Update existing stats
      await runQuery(`
        UPDATE stats
        SET
          activities_completed = ?,
          memory_interactions = ?,
          engagement_time = ?,
          familiarity_score = ?,
          last_activity = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = ?
      `, [
        activitiesCompleted !== undefined ? activitiesCompleted : existing.activities_completed,
        memoryInteractions !== undefined ? memoryInteractions : existing.memory_interactions,
        engagementTime !== undefined ? engagementTime : existing.engagement_time,
        familiarityScore !== undefined ? familiarityScore : existing.familiarity_score,
        lastActivity ? JSON.stringify(lastActivity) : existing.last_activity,
        patientId
      ]);
    }

    res.json({ success: true, message: 'Stats updated successfully' });
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

export default router;
