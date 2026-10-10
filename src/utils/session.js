// Daily 10-minute session limit. Short sessions keep activities enjoyable and
// avoid fatigue, so play time is tracked per day on this device.
import { useEffect, useState } from 'react';

const KEY = 'smara_daily_session';
export const DAILY_LIMIT_SECONDS = 10 * 60;
const EXTENSION_SECONDS = 5 * 60;

const today = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved?.date === today()) return saved;
  } catch {
    // ignore unreadable storage
  }
  return { date: today(), seconds: 0, extraSeconds: 0 };
}

function write(session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // storage full or blocked: the timer still works for this page view
  }
}

// Counts play time while `active` is true and the tab is visible
export function useDailySession(active) {
  const [session, setSession] = useState(read);

  useEffect(() => {
    if (!active) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      setSession(() => {
        const next = { ...read(), seconds: read().seconds + 1 };
        write(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [active]);

  const limit = DAILY_LIMIT_SECONDS + (session.extraSeconds || 0);

  // Caregiver override: allow five more minutes today
  const extend = () => {
    const next = { ...read(), extraSeconds: (read().extraSeconds || 0) + EXTENSION_SECONDS };
    write(next);
    setSession(next);
  };

  return {
    seconds: session.seconds,
    limit,
    remaining: Math.max(0, limit - session.seconds),
    isOver: session.seconds >= limit,
    extend,
  };
}

export const formatClock = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
