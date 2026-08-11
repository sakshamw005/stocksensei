const db = globalThis.__STOCKSENSEI_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from '../../shared/serverlessShim';
import { restGet, restUpsert } from '../../shared/supabase.ts';

const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => new Date(Date.now() - 86400000).toISOString().slice(0, 10);

export default async function(req) {
  try {
    const db = createClientFromRequest(req);
    const user = await db.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const lessonId = body.lesson_id;
    const answer = body.answer;
    if (!lessonId) return Response.json({ error: 'lesson_id required' }, { status: 400 });

    const lessons = await restGet(db, 'lessons', `select=answer&slug=eq.${encodeURIComponent(lessonId)}&limit=1`);
    const lesson = (lessons && lessons[0]) || null;
    if (!lesson) return Response.json({ error: 'Lesson not found' }, { status: 404 });

    const correct = String(lesson.answer || '').trim().toLowerCase() === String(answer || '').trim().toLowerCase();

    const existing = await restGet(db, 'user_progress', `select=correct&user_id=eq.${user.id}&lesson_id=eq.${encodeURIComponent(lessonId)}&limit=1`);
    const alreadyCorrect = existing && existing[0] && existing[0].correct === true;

    await restUpsert(db, 'user_progress', {
      user_id: user.id,
      lesson_id: lessonId,
      correct,
      answered_at: new Date().toISOString()
    });

    let xp = 0, streak = 0, lastActive = null;
    let stats = [];
    try { stats = await restGet(db, 'user_stats', `select=xp,streak,last_active_date&user_id=eq.${user.id}&limit=1`); } catch (e) {}
    if (stats && stats[0]) { xp = stats[0].xp || 0; streak = stats[0].streak || 0; lastActive = stats[0].last_active_date; }

    if (!alreadyCorrect && correct) {
      xp += 10;
      const today = todayStr();
      const yest = yesterdayStr();
      if (lastActive === today) {
        // already counted today
      } else if (lastActive === yest) {
        streak = streak + 1;
      } else {
        streak = 1;
      }
      lastActive = today;
      await restUpsert(db, 'user_stats', { user_id: user.id, xp, streak, last_active_date: lastActive });
    }

    const progress = await restGet(db, 'user_progress', `select=lesson_id,correct&user_id=eq.${user.id}`);
    const completedCount = new Set((progress || []).filter((p) => p.correct).map((p) => p.lesson_id)).size;

    return Response.json({ correct, xp, streak, completed_count: completedCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
