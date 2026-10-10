// SerpApi client with a SQLite cache.
// Every live search is stored in serpapi_cache, so repeating a query is free
// and the free plan (250 searches/month) goes a long way.

import { getOne, runQuery } from '../db/database.js';

const serpapiBase = () => process.env.SERPAPI_BASE_URL || 'https://serpapi.com';

export function hasApiKey() {
  return Boolean(process.env.SERPAPI_KEY);
}

function cacheKey(params) {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`);
  return sorted.join('&');
}

// Run a SerpApi search. Returns { data, cached }.
export async function serpSearch(params) {
  const key = cacheKey(params);
  const label = params.search_query || params.q || params.data_id || '';

  const hit = await getOne('SELECT response FROM serpapi_cache WHERE cache_key = ?', [key]);
  if (hit) {
    await runQuery('INSERT INTO serpapi_log (engine, query, cached) VALUES (?, ?, 1)', [params.engine, label]);
    return { data: JSON.parse(hit.response), cached: true };
  }

  if (!hasApiKey()) {
    const err = new Error('SERPAPI_KEY is not set. Add it to the .env file in the project root.');
    err.status = 503;
    throw err;
  }

  const url = new URL('/search.json', serpapiBase());
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set('api_key', process.env.SERPAPI_KEY);

  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) {
    // SerpApi reports "no results" as an error; treat it as an empty result
    if (data.error && /hasn't returned any results/i.test(data.error)) {
      return { data: {}, cached: false };
    }
    const err = new Error(`SerpApi ${params.engine} failed: ${data.error || res.status}`);
    err.status = res.status === 401 ? 401 : 502;
    throw err;
  }

  await runQuery(
    'INSERT OR REPLACE INTO serpapi_cache (cache_key, engine, response) VALUES (?, ?, ?)',
    [key, params.engine, JSON.stringify(data)]
  );
  await runQuery('INSERT INTO serpapi_log (engine, query, cached) VALUES (?, ?, 0)', [params.engine, label]);
  return { data, cached: false };
}

// Account info (plan, searches left). This endpoint does not use credits.
export async function getAccount() {
  if (!hasApiKey()) return null;
  const url = new URL('/account.json', serpapiBase());
  url.searchParams.set('api_key', process.env.SERPAPI_KEY);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const a = await res.json();
    return {
      plan: a.plan_name,
      searchesPerMonth: a.searches_per_month,
      searchesLeft: a.total_searches_left ?? a.plan_searches_left,
      usedThisMonth: a.this_month_usage,
      hourlyLimit: a.account_rate_limit_per_hour,
    };
  } catch {
    return null;
  }
}
