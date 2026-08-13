const cache = new Map();

export function getCache(key) {
  const e = cache.get(key);
  if (!e) return null;
  const { value, expires } = e;
  if (Date.now() > expires) { cache.delete(key); return null; }
  return value;
}

export function setCache(key, value, ttlMs) {
  const expires = Date.now() + (ttlMs || 0);
  cache.set(key, { value, expires });
}

export function delCache(key) { cache.delete(key); }

export function clearCache() { cache.clear(); }

export default { getCache, setCache, delCache, clearCache };
