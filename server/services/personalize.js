// Turns a patient's profile into personal activity content using SerpApi:
//  - YouTube Search API      -> songs from the patient's youth, in their language
//  - Google Maps API         -> the real places from their life
//  - Google Maps Photos API  -> photos of those places for "Familiar Place"

import { getAll, getOne, runQuery } from '../db/database.js';
import { serpSearch } from './serpapi.js';

const MAX_SONG_QUERIES = 5;
const MAX_PLACE_QUERIES = 5;
const SONGS_PER_QUERY = 3;
const PHOTOS_PER_PLACE = 6;
const MAX_SONG_SECONDS = 10 * 60; // a song must fit inside a 10-minute session

// "Assamese (অসমীয়া)" -> "Assamese"
function plainLanguage(language) {
  return (language || '').split('(')[0].trim();
}

// The decade the patient was a young adult (about age 15-25), e.g. "1970s"
export function youthDecade(age) {
  if (!age) return null;
  const birthYear = new Date().getFullYear() - age;
  return `${Math.floor((birthYear + 18) / 10) * 10}s`;
}

function splitList(text) {
  return (text || '')
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(Boolean);
}

// "Ancestral home in Jorhat" -> "Jorhat", "Dighalipukhuri (Guwahati)" -> "Dighalipukhuri, Guwahati"
function placeSearchText(place) {
  const inMatch = place.match(/\b(?:home|house|village|school)\s+(?:in|at|near)\s+(.+)$/i);
  const text = inMatch ? inMatch[1] : place;
  return text.replace(/\s*\(([^)]+)\)\s*/g, ', $1').replace(/,\s*$/, '').trim();
}

// Default search queries built from the caregiver's profile
export function suggestQueries(patient) {
  const language = plainLanguage(patient.preferredLanguage);
  const songs = splitList(patient.favoriteMusic).slice(0, MAX_SONG_QUERIES).map(item => {
    const hasLanguage = language && item.toLowerCase().includes(language.toLowerCase());
    return `${item}${hasLanguage || !language ? '' : ` ${language}`} old song`;
  });
  const places = (patient.favoritePlaces || []).slice(0, MAX_PLACE_QUERIES).map(placeSearchText);
  return { songs, places, language, decade: youthDecade(patient.age) };
}

// "4:05" or "1:02:10" -> seconds
function lengthToSeconds(length) {
  if (!length) return null;
  return length.split(':').reduce((total, part) => total * 60 + Number(part), 0);
}

// Strip YouTube noise like "| Full Video Song" or "(Official Audio)" from titles
export function cleanSongTitle(title) {
  return title
    .replace(/\s*[([](official|full|lyrical|lyric|audio|video|hd|4k|remastered)[^)\]]*[)\]]/gi, '')
    .replace(/\s*\|.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function findSongs(query, stats) {
  const { data, cached } = await serpSearch({ engine: 'youtube', search_query: query, gl: 'in', hl: 'en' });
  stats[cached ? 'cached' : 'live']++;

  return (data.video_results || [])
    .filter(v => v.video_id)
    .filter(v => {
      const seconds = lengthToSeconds(v.length);
      return seconds && seconds <= MAX_SONG_SECONDS;
    })
    .slice(0, SONGS_PER_QUERY)
    .map(v => ({
      externalId: v.video_id,
      title: cleanSongTitle(v.title),
      data: {
        videoId: v.video_id,
        originalTitle: v.title,
        link: v.link,
        channel: v.channel?.name,
        length: v.length,
        views: v.views,
        thumbnail: v.thumbnail?.static,
      },
    }));
}

function biggerPhoto(url, size = 'w1200-h800') {
  return url ? url.replace(/=w\d+-h\d+(-k-no)?/, `=${size}-k-no`) : url;
}

async function findPlace(query, stats) {
  const { data, cached } = await serpSearch({ engine: 'google_maps', type: 'search', q: query, hl: 'en' });
  stats[cached ? 'cached' : 'live']++;

  // A specific place returns place_results; a broader query returns a list
  const place = data.place_results || data.local_results?.[0];
  if (!place?.data_id) return null;

  const photosRes = await serpSearch({ engine: 'google_maps_photos', data_id: place.data_id, hl: 'en' });
  stats[photosRes.cached ? 'cached' : 'live']++;

  const photos = (photosRes.data.photos || [])
    .slice(0, PHOTOS_PER_PLACE)
    .map(p => ({ image: biggerPhoto(p.image || p.thumbnail), thumbnail: p.thumbnail }));
  if (place.thumbnail && photos.length === 0) {
    photos.push({ image: biggerPhoto(place.thumbnail), thumbnail: place.thumbnail });
  }
  if (photos.length === 0) return null;

  const gps = place.gps_coordinates;
  const description = typeof place.description === 'string' ? place.description : place.description?.snippet;
  return {
    externalId: place.data_id,
    title: place.title,
    data: {
      dataId: place.data_id,
      address: place.address,
      type: place.type || place.types?.[0],
      rating: place.rating,
      reviews: place.reviews,
      description,
      gps,
      mapsLink: gps
        ? `https://www.google.com/maps/search/?api=1&query=${gps.latitude},${gps.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.title)}`,
      photos,
    },
  };
}

async function saveItem(patientId, kind, sourceQuery, item) {
  // Keep the caregiver's approval and the patient's reactions on a re-run
  await runQuery(
    `INSERT INTO personalized_content (patient_id, kind, external_id, source_query, title, data)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (patient_id, kind, external_id)
     DO UPDATE SET source_query = excluded.source_query, title = excluded.title, data = excluded.data`,
    [patientId, kind, item.externalId, sourceQuery, item.title, JSON.stringify({ ...item.data, query: sourceQuery })]
  );
}

export async function personalize(patientId, { songQueries = [], placeQueries = [] }) {
  const stats = { live: 0, cached: 0 };
  const errors = [];

  for (const query of songQueries.slice(0, MAX_SONG_QUERIES)) {
    try {
      const songs = await findSongs(query, stats);
      for (const song of songs) await saveItem(patientId, 'song', query, song);
    } catch (err) {
      if (err.status === 503 || err.status === 401) throw err;
      errors.push(`${query}: ${err.message}`);
    }
  }

  for (const query of placeQueries.slice(0, MAX_PLACE_QUERIES)) {
    try {
      const place = await findPlace(query, stats);
      if (place) await saveItem(patientId, 'place', query, place);
      else errors.push(`${query}: no matching place with photos`);
    } catch (err) {
      if (err.status === 503 || err.status === 401) throw err;
      errors.push(`${query}: ${err.message}`);
    }
  }

  return { stats, errors, content: await getContent(patientId) };
}

function rowToContent(row) {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    sourceQuery: row.source_query,
    approved: Boolean(row.approved),
    reactions: JSON.parse(row.reactions || '{}'),
    ...JSON.parse(row.data),
  };
}

export async function getContent(patientId, { approvedOnly = false } = {}) {
  const rows = await getAll(
    `SELECT * FROM personalized_content WHERE patient_id = ? ${approvedOnly ? 'AND approved = 1' : ''}
     ORDER BY kind, source_query, id`,
    [patientId]
  );
  return rows.map(rowToContent);
}

export async function setApproved(id, approved) {
  await runQuery('UPDATE personalized_content SET approved = ? WHERE id = ?', [approved ? 1 : 0, id]);
  const row = await getOne('SELECT * FROM personalized_content WHERE id = ?', [id]);
  return row ? rowToContent(row) : null;
}

export async function addReaction(id, reaction) {
  const row = await getOne('SELECT * FROM personalized_content WHERE id = ?', [id]);
  if (!row) return null;
  const reactions = { yes: 0, unsure: 0, no: 0, ...JSON.parse(row.reactions || '{}') };
  reactions[reaction] = (reactions[reaction] || 0) + 1;
  await runQuery('UPDATE personalized_content SET reactions = ? WHERE id = ?', [JSON.stringify(reactions), id]);
  return rowToContent({ ...row, reactions: JSON.stringify(reactions) });
}

export async function usageSummary() {
  const row = await getOne(
    `SELECT SUM(CASE WHEN cached = 0 THEN 1 ELSE 0 END) AS live,
            SUM(CASE WHEN cached = 1 THEN 1 ELSE 0 END) AS cached
     FROM serpapi_log`
  );
  return { live: row?.live || 0, cached: row?.cached || 0 };
}
