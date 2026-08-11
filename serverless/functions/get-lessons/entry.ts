const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet } from '../../shared/supabase.ts';

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let lessons = [];
    try { lessons = await restGet(db, 'lessons', 'select=slug,title,explanation,challenge_type,question,options,answer,context&order=slug.asc'); } catch (e) {}
    let progress = [];
    try { progress = await restGet(db, 'user_progress', `select=lesson_id,correct&user_id=eq.${user.id}`); } catch (e) {}
    let stats = [];
    try { stats = await restGet(db, 'user_stats', `select=xp,streak&user_id=eq.${user.id}&limit=1`); } catch (e) {}

    const completed = new Set((progress || []).filter((p) => p.correct).map((p) => p.lesson_id));
    const out = (lessons || []).map((l) => ({
      slug: l.slug,
      title: l.title,
      explanation: l.explanation,
      challenge: {
        type: l.challenge_type,
        question: l.question,
        options: l.options,
        answer: l.answer,
        context: l.context
      },
      completed: completed.has(l.slug)
    }));
    return Response.json({
      lessons: out,
      xp: (stats && stats[0] && stats[0].xp) || 0,
      streak: (stats && stats[0] && stats[0].streak) || 0,
      completed_count: completed.size
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
