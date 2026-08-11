const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

export function createClientFromRequest(_req:any) {
  // In the original db runtime this would create a client scoped to the request.
  // For local/dev we return the global placeholder `db` so downstream helpers continue to work.
  return db as any;
}

export default createClientFromRequest;

