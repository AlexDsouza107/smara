// Client for the SerpApi-powered personalization endpoints
import { API_BASE } from './api';

const PATIENT_ID = 1;

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}/personalize${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
  return body;
}

export const getSerpApiStatus = () => request('/status');
export const getSuggestions = () => request(`/${PATIENT_ID}/suggestions`);
export const getPersonalContent = ({ approvedOnly = false } = {}) =>
  request(`/${PATIENT_ID}/content${approvedOnly ? '?approved=1' : ''}`);
export const runPersonalization = (songQueries, placeQueries) =>
  request(`/${PATIENT_ID}`, { method: 'POST', body: JSON.stringify({ songQueries, placeQueries }) });
export const setContentApproved = (id, approved) =>
  request(`/content/${id}`, { method: 'PATCH', body: JSON.stringify({ approved }) });
export const recordReaction = (id, reaction) =>
  request(`/content/${id}/reaction`, { method: 'POST', body: JSON.stringify({ reaction }) }).catch(() => null);
