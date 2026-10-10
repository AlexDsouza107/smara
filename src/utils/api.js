// Where the backend lives. Override with VITE_API_URL in .env.
export const API_ORIGIN = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const API_BASE = `${API_ORIGIN}/api`;

// Uploaded files are stored as "/uploads/..." paths on the backend
export const assetUrl = (path) => (path && path.startsWith('/uploads') ? `${API_ORIGIN}${path}` : path);
