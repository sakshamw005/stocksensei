import db from '@/api/dbClient';

import { useEffect, useState } from 'react';

import { StatCell, StatGrid } from '@/components/ui/StatGrid';

export default function Learn() {
  const [lessons, setLessons] = useState(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [openSlug, setOpenSlug] = useState(null);
  const [draft, setDraft] = useState({});
  const [result, setResult] = useState({});
  const [submitting, setSubmitting] = useState(null);

  const load = async () => {
    try {
      const res = await db.functions.invoke('get-lessons', {});
      setLessons(res.data?.lessons || []);
      setXp(res.data?.xp || 0);
      setStreak(res.data?.streak || 0);
      setCompleted(res.data?.completed_count || 0);
    } catch {
      setLessons([]);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (lesson, answer) => {
    setSubmitting(lesson.slug);
    try {
      const res = await db.functions.invoke('submit-challenge-answer', { lesson_id: lesson.slug, answer });
      setResult((r) => ({ ...r, [lesson.slug]: res.data }));
      setXp(res.data?.xp ?? xp);
      setStreak(res.data?.streak ?? streak);
      setCompleted(res.data?.completed_count ?? completed);
      setLessons((ls) => (ls || []).map((l) => l.slug === lesson.slug ? { ...l, completed: res.data?.correct ? true : l.completed } : l));
    } catch { /* ignore */ }
    setSubmitting(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-semibold text-ink">Fundamentals</h1>
        <p className="font-body text-sm text-ink-soft mt-1">Learn the core ratios that drive stock analysis. Each lesson ends with a real-number challenge.</p>
      </div>

      <StatGrid>
        <StatCell label="Lessons Completed" value={`${completed} / ${lessons?.length || 14}`} />
        <StatCell label="Current Streak" value={`${streak} day${streak === 1 ? '' : 's'}`} note={streak > 0 ? 'Keep it going' : 'Answer one to start'} />
        <StatCell label="Total XP" value={xp} />
        <StatCell label="Progress" value={`${lessons?.length ? Math.round((completed / lessons.length) * 100) : 0}%`} />
      </StatGrid>

      <div className="space-y-3">
        {lessons === null && (
          <div className="border border-line bg-paper-raised rounded-[3px] p-6 font-data text-sm text-ink-faint">Loading lessons…</div>
        )}
        {lessons !== null && lessons.length === 0 && (
          <div className="border border-line bg-paper-raised rounded-[3px] p-6 font-body text-sm text-ink-soft">
            Lessons aren’t available yet. An admin needs to run the one-time schema setup to seed the lesson library.
          </div>
        )}
        {lessons?.map((lesson) => {
          const isOpen = openSlug === lesson.slug;
          const res = result[lesson.slug];
          return (
            <div key={lesson.slug} className="border border-line bg-paper-raised rounded-[3px]">
              <button
                onClick={() => setOpenSlug(isOpen ? null : lesson.slug)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-lg font-semibold text-ink">{lesson.title}</span>
                    {lesson.completed && (
                      <span className="font-data text-[10px] uppercase tracking-wider text-gain border border-gain px-1.5 py-0.5">Done</span>
                    )}
                  </div>
                  {!isOpen && <p className="font-body text-sm text-ink-soft mt-0.5 truncate">{lesson.explanation}</p>}
                </div>
                <span className="font-body text-xs text-ink-faint shrink-0">{isOpen ? 'Close' : 'Start'}</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-line pt-4 space-y-4">
                  <p className="font-body text-sm text-ink-soft leading-relaxed">{lesson.explanation}</p>
                  <div className="border border-line rounded-[3px] p-4">
                    <div className="font-data text-[10px] uppercase tracking-wider text-ink-faint mb-2">Challenge</div>
                    <p className="font-body text-sm text-ink mb-3">{lesson.challenge.question}</p>
                    {lesson.challenge.type === 'mc' && (
                      <div className="space-y-2">
                        {lesson.challenge.options.map((opt) => {
                          const chosen = draft[lesson.slug] === opt;
                          const showRes = res != null;
                          const isAnswer = opt === lesson.challenge.answer;
                          return (
                            <button
                              key={opt}
                              disabled={showRes}
                              onClick={() => setDraft((d) => ({ ...d, [lesson.slug]: opt }))}
                              className={`w-full text-left px-3 py-2 border rounded-[3px] font-data text-sm transition-colors ${
                                showRes && isAnswer ? 'border-gain bg-gain-soft text-gain'
                                : showRes && chosen && !isAnswer ? 'border-loss bg-loss-soft text-loss'
                                : chosen ? 'border-ink bg-secondary text-ink'
                                : 'border-line text-ink-soft hover:border-ink'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {res != null && (
                      <div className={`mt-3 font-body text-sm ${res.correct ? 'text-gain' : 'text-loss'}`}>
                        {res.correct ? 'Correct — +10 XP' : 'Not quite.'} {lesson.challenge.context && (
                          <span className="text-ink-soft"> {lesson.challenge.context}</span>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => submit(lesson, draft[lesson.slug])}
                        disabled={submitting === lesson.slug || draft[lesson.slug] == null || res != null}
                        className="font-body text-sm font-medium text-paper-raised bg-ink px-4 py-2 rounded-[3px] disabled:opacity-40"
                      >
                        {submitting === lesson.slug ? 'Checking…' : 'Submit answer'}
                      </button>
                      {res != null && !res.correct && (
                        <button
                          onClick={() => { setResult((r) => ({ ...r, [lesson.slug]: undefined })); setDraft((d) => ({ ...d, [lesson.slug]: undefined })); }}
                          className="font-body text-sm text-ink-soft px-4 py-2 rounded-[3px] border border-line"
                        >
                          Try again
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}