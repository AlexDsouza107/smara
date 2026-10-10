import express from 'express';
import { getAll, runQuery, getOne } from '../db/database.js';

const router = express.Router();

// Get activity sessions for a patient
router.get('/', async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    const sessions = await getAll(
      'SELECT * FROM activity_sessions WHERE patient_id = ? ORDER BY created_at DESC',
      [patientId]
    );

    const parsed = sessions.map(s => ({
      id: s.id,
      patientId: s.patient_id,
      gameId: s.game_id,
      score: s.score,
      totalRounds: s.total_rounds,
      correctAnswers: s.correct_answers,
      durationSeconds: s.duration_seconds,
      completed: Boolean(s.completed),
      sessionData: s.session_data ? JSON.parse(s.session_data) : null,
      createdAt: s.created_at
    }));

    res.json(parsed);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get activity statistics (aggregated)
router.get('/stats', async (req, res) => {
  try {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: 'patientId is required' });
    }

    // Get last 7 days of activity breakdown
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateFilter = sevenDaysAgo.toISOString();

    const breakdown = await getAll(`
      SELECT game_id, COUNT(*) as count, SUM(correct_answers) as correct, SUM(total_rounds) as total
      FROM activity_sessions
      WHERE patient_id = ? AND created_at >= ?
      GROUP BY game_id
    `, [patientId, dateFilter]);

    // Get daily counts for last 7 days
    const dailyCounts = await getAll(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM activity_sessions
      WHERE patient_id = ? AND created_at >= ?
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [patientId, dateFilter]);

    // Calculate overall familiarity score (percentage of correct answers)
    const overall = await getOne(`
      SELECT
        SUM(correct_answers) as totalCorrect,
        SUM(total_rounds) as totalRounds
      FROM activity_sessions
      WHERE patient_id = ?
    `, [patientId]);

    const familiarityScore = overall?.totalRounds > 0
      ? Math.round((overall.totalCorrect / overall.totalRounds) * 100)
      : 0;

    res.json({
      breakdown: breakdown.map(b => ({
        gameId: b.game_id,
        sessions: b.count,
        correctAnswers: b.correct || 0,
        totalRounds: b.total || 0,
        accuracy: b.total > 0 ? Math.round((b.correct / b.total) * 100) : 0
      })),
      dailyCounts: dailyCounts.map(d => ({
        date: d.date,
        count: d.count
      })),
      familiarityScore
    });
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ error: 'Failed to fetch activity statistics' });
  }
});

// Record a new activity session
router.post('/', async (req, res) => {
  try {
    const {
      patientId,
      gameId,
      score,
      totalRounds,
      correctAnswers,
      durationSeconds,
      completed,
      sessionData
    } = req.body;

    if (!patientId || !gameId) {
      return res.status(400).json({ error: 'patientId and gameId are required' });
    }

    const result = await runQuery(`
      INSERT INTO activity_sessions (
        patient_id, game_id, score, total_rounds, correct_answers,
        duration_seconds, completed, session_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      patientId,
      gameId,
      score || 0,
      totalRounds || 0,
      correctAnswers || 0,
      durationSeconds || 0,
      completed ? 1 : 0,
      sessionData ? JSON.stringify(sessionData) : null
    ]);

    res.json({
      success: true,
      session: {
        id: result.lastID,
        patientId: parseInt(patientId),
        gameId,
        score: score || 0,
        totalRounds: totalRounds || 0,
        correctAnswers: correctAnswers || 0,
        durationSeconds: durationSeconds || 0,
        completed: Boolean(completed)
      }
    });
  } catch (error) {
    console.error('Error recording activity:', error);
    res.status(500).json({ error: 'Failed to record activity session' });
  }
});

export default router;
