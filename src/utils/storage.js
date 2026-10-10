// API-backed storage with localStorage caching for SmritiCare
// Refactored to use backend Express + SQLite API

import { API_BASE } from './api';
const PATIENT_ID = 1; // Demo patient ID

const STORAGE_KEYS = {
  PATIENT: 'smriticare_patient',
  MEMORIES: 'smriticare_memories',
  ACTIVITIES: 'smriticare_activities',
  NOTES: 'smriticare_notes',
  TIMELINE: 'smriticare_timeline',
  SETTINGS: 'smriticare_settings',
  STATS: 'smriticare_stats',
};

// Helper: Fetch with error handling
async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
}

// Initialize demo data (now pulls from backend)
export const initializeDemoData = async () => {
  try {
    // Fetch patient data from backend
    const patient = await apiFetch(`${API_BASE}/patients/${PATIENT_ID}`);
    localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));

    // Fetch memories
    const memories = await apiFetch(`${API_BASE}/memories?patientId=${PATIENT_ID}`);
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));

    // Fetch timeline
    const timeline = await apiFetch(`${API_BASE}/timeline?patientId=${PATIENT_ID}`);
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));

    // Fetch stats
    const stats = await apiFetch(`${API_BASE}/stats/${PATIENT_ID}`);
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));

    // Fetch settings
    const settings = await apiFetch(`${API_BASE}/settings/${PATIENT_ID}`);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

    // Initialize empty arrays for notes and activities if not present
    if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Failed to initialize data from backend:', error);
    // Fallback to localStorage if backend is unavailable
  }
};

// Get patient (from cache, sync from API in background)
export const getPatient = () => {
  const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENT) || 'null');

  // Background sync
  apiFetch(`${API_BASE}/patients/${PATIENT_ID}`)
    .then(patient => {
      localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));
    })
    .catch(err => console.error('Background patient sync failed:', err));

  return cached;
};

// Get memories (from cache, sync from API in background)
export const getMemories = () => {
  const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMORIES) || '[]');

  // Background sync
  apiFetch(`${API_BASE}/memories?patientId=${PATIENT_ID}`)
    .then(memories => {
      localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    })
    .catch(err => console.error('Background memories sync failed:', err));

  return cached;
};

// Get timeline (from cache, sync from API in background)
export const getTimeline = () => {
  const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.TIMELINE) || '[]');

  // Background sync
  apiFetch(`${API_BASE}/timeline?patientId=${PATIENT_ID}`)
    .then(timeline => {
      localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));
    })
    .catch(err => console.error('Background timeline sync failed:', err));

  return cached;
};

// Get stats (from cache, sync from API in background)
export const getStats = () => {
  const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS) || 'null');

  // Background sync
  apiFetch(`${API_BASE}/stats/${PATIENT_ID}`)
    .then(stats => {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    })
    .catch(err => console.error('Background stats sync failed:', err));

  return cached;
};

// Get settings (from cache, sync from API in background)
export const getSettings = () => {
  const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || 'null');

  // Background sync
  apiFetch(`${API_BASE}/settings/${PATIENT_ID}`)
    .then(settings => {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    })
    .catch(err => console.error('Background settings sync failed:', err));

  return cached;
};

// Get notes (local only for now)
export const getNotes = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES) || '[]');
};

// Get activities (from cache, sync from API in background)
export const getActivities = () => {
  const cached = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');

  // Background sync
  apiFetch(`${API_BASE}/activities?patientId=${PATIENT_ID}`)
    .then(activities => {
      localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    })
    .catch(err => console.error('Background activities sync failed:', err));

  return cached;
};

// Set patient (update cache and sync to API)
export const setPatient = async (patient) => {
  localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));

  try {
    await apiFetch(`${API_BASE}/patients/${PATIENT_ID}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    });
  } catch (error) {
    console.error('Failed to sync patient to backend:', error);
  }
};

// Add memory (with photo upload support)
export const addMemory = async (memory, photoFile = null) => {
  try {
    let response;

    if (photoFile) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('patientId', PATIENT_ID);
      formData.append('title', memory.title);
      formData.append('category', memory.category || 'Family');
      formData.append('description', memory.description || '');
      formData.append('date', memory.date || '');
      formData.append('people', JSON.stringify(memory.people || []));
      formData.append('photo', photoFile);

      const res = await fetch(`${API_BASE}/memories`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload memory');
      response = await res.json();
    } else {
      // JSON without file
      response = await apiFetch(`${API_BASE}/memories`, {
        method: 'POST',
        body: JSON.stringify({
          patientId: PATIENT_ID,
          ...memory,
        }),
      });
    }

    const newMemory = response.memory;

    // Update cache
    const memories = getMemories();
    memories.push(newMemory);
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));

    return newMemory;
  } catch (error) {
    console.error('Failed to add memory:', error);
    // Fallback to local-only
    const memories = getMemories();
    const newMemory = { ...memory, id: Date.now() };
    memories.push(newMemory);
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
    return newMemory;
  }
};

// Add timeline event
export const addTimelineEvent = async (event) => {
  try {
    const response = await apiFetch(`${API_BASE}/timeline`, {
      method: 'POST',
      body: JSON.stringify({
        patientId: PATIENT_ID,
        ...event,
      }),
    });

    const newEvent = response.event;

    // Update cache
    const timeline = getTimeline();
    timeline.push(newEvent);
    timeline.sort((a, b) => a.year - b.year);
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));

    return newEvent;
  } catch (error) {
    console.error('Failed to add timeline event:', error);
    // Fallback
    const timeline = getTimeline();
    const newEvent = { ...event, id: Date.now() };
    timeline.push(newEvent);
    timeline.sort((a, b) => a.year - b.year);
    localStorage.setItem(STORAGE_KEYS.TIMELINE, JSON.stringify(timeline));
    return newEvent;
  }
};

// Update stats
export const updateStats = async (updates) => {
  const stats = getStats();
  const updatedStats = { ...stats, ...updates };

  localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));

  try {
    await apiFetch(`${API_BASE}/stats/${PATIENT_ID}`, {
      method: 'PUT',
      body: JSON.stringify(updatedStats),
    });
  } catch (error) {
    console.error('Failed to sync stats to backend:', error);
  }

  return updatedStats;
};

// Set settings
export const setSettings = async (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

  try {
    await apiFetch(`${API_BASE}/settings/${PATIENT_ID}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  } catch (error) {
    console.error('Failed to sync settings to backend:', error);
  }
};

// Add note (local only for now)
export const addNote = (note) => {
  const notes = getNotes();
  const newNote = { id: Date.now(), text: note, timestamp: new Date().toISOString() };
  notes.push(newNote);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  return newNote;
};

// Add activity (sync to backend)
export const addActivity = async (activity) => {
  try {
    const response = await apiFetch(`${API_BASE}/activities`, {
      method: 'POST',
      body: JSON.stringify({
        patientId: PATIENT_ID,
        gameId: activity.gameId,
        score: activity.score || 0,
        totalRounds: activity.totalRounds || 0,
        correctAnswers: activity.correctAnswers || 0,
        durationSeconds: activity.durationSeconds || 0,
        completed: activity.completed !== false,
        sessionData: activity.sessionData || null,
      }),
    });

    const newActivity = response.session;

    // Update cache
    const activities = getActivities();
    activities.push(newActivity);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));

    return newActivity;
  } catch (error) {
    console.error('Failed to record activity:', error);
    // Fallback
    const activities = getActivities();
    const newActivity = { ...activity, id: Date.now(), timestamp: new Date().toISOString() };
    activities.push(newActivity);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    return newActivity;
  }
};

// Reset demo data
export const resetDemoData = () => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeDemoData();
};

// New helper: Add family member with photo and voice
export const addFamilyMember = async (member, photoFile = null, voiceFile = null) => {
  try {
    const formData = new FormData();
    formData.append('name', member.name);
    formData.append('relation', member.relation);
    formData.append('description', member.description || '');

    if (photoFile) {
      formData.append('photo', photoFile);
    }

    if (voiceFile) {
      formData.append('voice', voiceFile);
    }

    const response = await fetch(`${API_BASE}/patients/${PATIENT_ID}/family`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to add family member');

    const result = await response.json();

    // Refresh patient data in cache
    const patient = await apiFetch(`${API_BASE}/patients/${PATIENT_ID}`);
    localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));

    return result.familyMember;
  } catch (error) {
    console.error('Failed to add family member:', error);
    throw error;
  }
};

// New helper: Update family member
export const updateFamilyMember = async (memberId, member, photoFile = null, voiceFile = null) => {
  try {
    const formData = new FormData();
    formData.append('name', member.name);
    formData.append('relation', member.relation);
    formData.append('description', member.description || '');

    if (photoFile) {
      formData.append('photo', photoFile);
    }

    if (voiceFile) {
      formData.append('voice', voiceFile);
    }

    const response = await fetch(`${API_BASE}/patients/${PATIENT_ID}/family/${memberId}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to update family member');

    const result = await response.json();

    // Refresh patient data in cache
    const patient = await apiFetch(`${API_BASE}/patients/${PATIENT_ID}`);
    localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));

    return result.familyMember;
  } catch (error) {
    console.error('Failed to update family member:', error);
    throw error;
  }
};

// New helper: Delete family member
export const deleteFamilyMember = async (memberId) => {
  try {
    await apiFetch(`${API_BASE}/patients/${PATIENT_ID}/family/${memberId}`, {
      method: 'DELETE',
    });

    // Refresh patient data in cache
    const patient = await apiFetch(`${API_BASE}/patients/${PATIENT_ID}`);
    localStorage.setItem(STORAGE_KEYS.PATIENT, JSON.stringify(patient));
  } catch (error) {
    console.error('Failed to delete family member:', error);
    throw error;
  }
};
