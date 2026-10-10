# SMARA: personal memory activities for people living with dementia

**Version 1.0.2 · SerpApi India Hackathon 2026 · Track: Knowledge & Public Interest**

SMARA gives a person living with dementia a short, gentle session each day, 10 minutes at most, built from their own life: the faces of their family, the songs of their youth and the places they lived. Family members and caregivers set it up. The patient just plays.

The hard part of personal memory care has always been content. Families rarely have photos of the patient's childhood town, and nobody has a playlist of the songs their mother sang in 1975. **SMARA uses SerpApi to fill that gap automatically.** A caregiver fills in the profile (language, age, favourite music, places from their life) and with one click SMARA finds the real songs and real place photos, then turns them into activities.

> SMARA supports cognitive engagement and caregiver connection. It is not a medical device and does not diagnose or treat any condition.

---

## How SMARA uses SerpApi

| SerpApi API | What SMARA does with it | Where in the code |
| --- | --- | --- |
| **YouTube Search API** (`engine=youtube`) | Finds songs from the patient's youth in their own language, built from the caregiver's "favourite music" entries (for example *Dr. Bhupen Hazarika songs Assamese old song*). Keeps only videos under 10 minutes so a song fits in a daily session. | `server/services/personalize.js` → `findSongs` |
| **Google Maps API** (`engine=google_maps`) | Resolves each place from the patient's life ("Ancestral home in Jorhat", "Majuli Island") to a real Google Maps place with its address, rating and coordinates. | `server/services/personalize.js` → `findPlace` |
| **Google Maps Photos API** (`engine=google_maps_photos`) | Pulls up to 6 real photos of each place for the **Familiar Place** activity. | `server/services/personalize.js` → `findPlace` |
| **Account API** (`/account.json`) | Shows the plan and searches left in Memory Finder. It does not use search credits. | `server/services/serpapi.js` → `getAccount` |

### The flow

1. **Caregiver: Memory Finder** (`/memory-finder`). SMARA proposes search queries from the profile: the patient's language, the decade they were a young adult (from their age) and their favourite music and places. The caregiver can edit or add queries, then presses **Find songs & places**.
2. **Backend** runs the SerpApi searches, keeps the useful results (short songs, places that have photos) and stores them in SQLite.
3. **Caregiver approves.** Every song and place appears as a card with a "Shown to patient / Hidden" toggle, so nothing reaches the patient without a family member's say.
4. **Patient: Activities.**
   - **Songs from Your Youth** plays the approved songs (YouTube embed) and asks *"Do you remember this song?"*
   - **Familiar Place** shows the Google Maps photos and asks *"Do you remember this place?"*, then reveals the name and a conversation prompt for the caregiver.
5. **Closing the loop.** Each answer (remembered, unsure, not yet) is saved against the song or place, and Memory Finder shows the caregiver which ones spark recognition.

### Built to respect the free plan (250 searches/month)

- **Searches happen once, at setup**, never while the patient plays.
- **Every SerpApi response is cached in SQLite** (`serpapi_cache` table). Running Memory Finder again with the same queries costs 0 credits; the page shows how many searches the cache saved.
- A full personalization for the demo patient uses **11 searches** (3 songs + 4 places × 2).

---

## What's new in v1.0.2

- **SerpApi integration**: YouTube Search, Google Maps and Google Maps Photos, with a local cache and credit tracking.
- **Memory Finder** caregiver page with editable queries, approval toggles and the patient's reactions.
- **Songs from Your Youth** now plays real songs found for the patient (the old lyric quiz remains as a fallback).
- **Familiar Place** now uses real Google Maps photos with a photo carousel and a conversation prompt.
- **Real 10-minute daily session**: a timer during every activity, a gentle "Well done today" screen at 10 minutes, and a caregiver override for 5 more minutes.
- **Fixes**: "Who is this?" crashed and now uses family photos; "Memory Story" now uses the life timeline; the patient's name is no longer hardcoded; the backend URL is configurable.
- **Dashboard** shows how many personal songs and places are in today's activities.

---

## Run it locally

**Requirements:** Node.js 20.12 or newer, and a free SerpApi key from <https://serpapi.com/manage-api-key>.

```bash
git clone https://github.com/AlexDsouza107/SmritiCare-Ai.git
cd SmritiCare-Ai
npm install

# Add your SerpApi key
cp .env.example .env
# then edit .env and set SERPAPI_KEY=...

# Start the backend (port 3000) and the frontend (port 5173) together
npm start
```

Open <http://localhost:5173>, press **Explore Demo**, then:

1. Open **Memory Finder** in the sidebar and press **Find songs & places**.
2. Open **Activities** and play **Songs from Your Youth** or **Familiar Place**.

The `.env` file is ignored by git, so your key is never committed. Without a key the app still runs, and Memory Finder tells you to add one.

| Variable | Required | Purpose |
| --- | --- | --- |
| `SERPAPI_KEY` | Yes, for Memory Finder | Your SerpApi API key |
| `VITE_API_URL` | No | Backend address for the frontend (default `http://localhost:3000`) |
| `CLIENT_ORIGIN` | No | Frontend address allowed by CORS (default `http://localhost:5173`) |

### Scripts

- `npm start`: backend and frontend together
- `npm run server`: backend only
- `npm run dev`: frontend only
- `npm run build`: production build
- `npm run lint`: lint with oxlint

---

## Features

- **Caregiver dashboard**: daily engagement, notes and the SerpApi personalization summary.
- **Patient profile**: language, favourite music and places, and family members with photos and voice recordings.
- **Memory Library and Memory Journey**: family photos and a life timeline.
- **Six activities**: Who is this?, Memory Match, Songs from Your Youth, Whose Voice Is It?, Familiar Place and Memory Story.
- **Built for India**: the interface is available in English, Assamese and Manipuri; the demo patient is an Assamese retired teacher.
- **Accessibility**: large text, high contrast and reduced animation settings, plus large touch targets.

## Tech stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router, lucide-react
- **Backend:** Express 5, SQLite (`sqlite3`), multer for uploads
- **Search data:** SerpApi (YouTube Search, Google Maps, Google Maps Photos)

## Project structure

```
server/
  index.js                  Express app, loads .env
  db/schema.sql             Tables, including serpapi_cache and personalized_content
  routes/personalize.js     /api/personalize endpoints
  services/serpapi.js       SerpApi client with SQLite cache
  services/personalize.js   Profile -> queries -> songs and places
src/
  pages/MemoryFinder.jsx    Caregiver page for SerpApi personalization
  pages/Activities.jsx      The six activities and the daily session timer
  utils/personalize.js      Frontend client for /api/personalize
  utils/session.js          10-minute daily session tracking
```

### API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/personalize/status` | Key configured, SerpApi plan and searches left, cache savings |
| `GET` | `/api/personalize/:patientId/suggestions` | Search queries suggested from the profile |
| `POST` | `/api/personalize/:patientId` | Run the searches (`songQueries`, `placeQueries` optional) |
| `GET` | `/api/personalize/:patientId/content` | Songs and places found (`?approved=1` for the patient view) |
| `PATCH` | `/api/personalize/content/:id` | Approve or hide an item |
| `POST` | `/api/personalize/content/:id/reaction` | Record the patient's response (`yes`, `unsure`, `no`) |

---

## Hackathon disclosures

- **Existing project.** SMARA started before this hackathon as a Smart India Hackathon prototype (team RuntimeTerror). Everything SerpApi-related, Memory Finder, the real daily session limit and the fixes listed under *What's new in v1.0.2* were built during the SerpApi India Hackathon 2026.
- **AI tools.** v1.0.2 was built with help from Claude Code (Anthropic), which wrote most of the SerpApi integration, the Memory Finder page, the session timer and this README under the team's direction. The team reviewed and tested the result.

## Privacy

Demo data is stored locally in SQLite and in the browser. SMARA sends only search text (song and place names) to SerpApi, never photos, voices or the patient's name. A real deployment would need consent from the patient's family, encryption and access control.

---

Built with care by Team RuntimeTerror.
