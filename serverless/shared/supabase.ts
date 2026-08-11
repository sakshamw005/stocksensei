const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

// Use local shim to avoid direct dependency on @db/sdk
import { createClientFromRequest } from './serverlessShim';

const MGMT = 'https://api.supabase.com/v1';

let _ref = null;
let _serviceKey = null;
let _token = null;

async function getToken(db) {
  if (_token) return _token;
  const conn = await db.asServiceRole.connectors.getConnection('supabase');
  _token = conn.accessToken;
  return _token;
}

export async function getProjectRef(db) {
  if (_ref) return _ref;
  const token = await getToken(db);
  const res = await fetch(`${MGMT}/projects`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Supabase list projects ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const proj = (data || []).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))[0];
  if (!proj) throw new Error('No Supabase project found for this account');
  _ref = proj.id;
  return _ref;
}

export async function getServiceRoleKey(db) {
  if (_serviceKey) return _serviceKey;
  const ref = await getProjectRef(db);
  const token = await getToken(db);
  const res = await fetch(`${MGMT}/projects/${ref}/api-keys`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Supabase api-keys ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const entry = (data || []).find((k) => k.name === 'service_role');
  if (!entry) throw new Error('service_role key not found');
  _serviceKey = entry.api_key;
  return _serviceKey;
}

export async function rest(db, method, table, query, body, prefer) {
  const ref = await getProjectRef(db);
  const key = await getServiceRoleKey(db);
  const qs = query ? `?${query}` : '';
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json'
  };
  if (prefer) headers['Prefer'] = prefer;
  const res = await fetch(`https://${ref}.supabase.co/rest/v1/${table}${qs}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (!res.ok) throw new Error(`PostgREST ${res.status}: ${text}`);
  return json;
}

export async function restGet(db, table, query) {
  return rest(db, 'GET', table, query, null, null);
}

export async function restUpsert(db, table, body) {
  return rest(db, 'POST', table, null, body, 'return=representation,resolution=merge-duplicates');
}

export async function restInsert(db, table, body) {
  return rest(db, 'POST', table, null, body, 'return=representation');
}

export async function runSql(db, sql, write) {
  const ref = await getProjectRef(db);
  const token = await getToken(db);
  const endpoint = write
    ? `${MGMT}/projects/${ref}/database/query`
    : `${MGMT}/projects/${ref}/database/query/read-only`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`SQL ${res.status}: ${text}`);
  try { return JSON.parse(text); } catch { return text; }
}
